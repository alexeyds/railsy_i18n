import test from "tape";
import I18nBase from "i18n/base";

test("I18nBase#t", function(t) {
  t.test("string translations", function(t) {
    let result = new I18nBase({foo: {bar: "translation"}}).t("foo.bar");

    t.equal(result.translation, "translation");
    t.equal(result.isTranslated, true);

    t.equal(result.paths.original, "foo.bar");
    t.equal(result.paths.scoped, "foo.bar");
    t.equal(result.paths.stoppedAt, "foo.bar");

    t.same(result.interpolation, {});
    
    t.end();
  });

  t.test("missing translations", function(t) {
    let result = new I18nBase({foo: {}}).t("foo.bar");

    t.equal(result.translation, undefined, "returns translation: undefined");
    t.equal(result.isTranslated, false, "returns isTranslated: false");
    t.same(result.interpolation, {});
    
    t.end();
  });

  t.test("string interpolation", function(t) {
    let result = new I18nBase({a: "foo %{bar}"}).t("a", {bar: "bar"});

    t.equal(result.translation, "foo bar", "replaces placeholders in string");
    
    t.end();
  });

  t.test("without placeholder replacements", function(t) {
    let result = new I18nBase({a: "foo %{bar}"}).t("a");

    t.equal(result.translation, "foo %{bar}");
    t.same(result.interpolation.remainingPlaceholders, ["bar"]);
    
    t.end();
  });

  t.end();
});

test("I18n#t pluralization rules", function(t) {
  t.test("default rule: 0", function(t) {
    let result = new I18nBase({a: {zero: "Zero"}}).t("a", {count: 0});

    t.equal(result.translation, "Zero");
    t.equal(result.interpolation.unusedReplacements, undefined, "doesnt include count into unusedReplacements");
    
    t.end();
  });

  t.test("no 'count' placeholder in string", function(t) {
    let result = new I18nBase({a: ""}).t("a", {count: 0});

    t.same(result.interpolation.unusedReplacements, ["count"]);
    
    t.end();
  });

  t.test("default rule: 0 as other", function(t) {
    let result = new I18nBase({a: {other: "%{count} other"}}).t("a", {count: 0});

    t.equal(result.translation, "0 other");
    
    t.end();
  });

  t.test("default rule: 1", function(t) {
    let result = new I18nBase({a: {one: "one"}}).t("a", {count: 1});

    t.equal(result.translation, "one");
    
    t.end();
  });

  t.test("default rule: other", function(t) {
    let result = new I18nBase({a: {other: "other"}}).t("a", {count: 2});

    t.equal(result.translation, "other");
    
    t.end();
  });

  t.test("custom rule: 'zero' as other", function(t) {
    let rule = () => "zero";
    let result = new I18nBase({a: {other: "other"}}, {pluralizationRule: rule}).t("a", {count: 0});

    t.equal(result.translation, "other", "fallbacks to 'other'");
    
    t.end();
  });

  t.test("custom rule: something else as other", function(t) {
    let rule = () => "foo";
    let result = new I18nBase({a: {other: "other"}}, {pluralizationRule: rule}).t("a", {count: 0});

    t.equal(result.isTranslated, false, "doesn't fallback to 'other'");

    t.end();
  });
  
  t.end();
});

test("I18nBase config", function(t) {
  t.test("scope option", function(t) {
    let result = new I18nBase({foo: {bar: "translation"}}, {scope: "foo"}).t("bar");

    t.equal(result.translation, "translation", "searches for translation in provided scope");

    t.end();
  });

  t.test("fallbackI18n option", function(t) {
    let fallbackI18n = new I18nBase({foo: "foo%{bar}"});
    let result = new I18nBase({}, {fallbackI18n}).t("foo", {bar: "bar"});

    t.equal(result.translation, "foobar", "uses fallbackI18n to provide missing translations");

    t.end();
  });

  t.test("pluralizationRule option", function(t) {
    let rule = () => "custom_counter";
    let result = new I18nBase({a: {custom_counter: "123"}}, {pluralizationRule: rule}).t("a", {count: 3});

    t.equal(result.translation, "123");
    
    t.end();
  });

  t.end();
});

test("I18nBase fallbackI18n option with subclassing", function(t) {
  class SimpleI18n extends I18nBase { t() { return super.t(...arguments).translation; } }

  t.test("delegates t to subclass", function(t) {
    let fallbackI18n = new SimpleI18n({foo: "foobar"});
    let result = new SimpleI18n({}, {fallbackI18n}).t("foo");

    t.equal(result, "foobar");
    
    t.end();
  });

  t.end();
});

test("I18nBase#scoped", function(t) {
  let i = new I18nBase({a: {b: {c: "foo %{a}"}}});
  let scopedT = i.scoped("a.b");

  t.equal(scopedT("c", {a: 123}).translation, "foo 123", "returns wrapper function");

  t.end();
});