import assert from "node:assert/strict";
import { test } from "node:test";
import {
  themes,
  validateSettings,
  counterUrl,
  embedCode,
  previewDigits,
} from "../src/lib/generator.ts";
const defaults = { asset: "normal-150", offset: 0, padding: 0 };

test("default HTML includes the upstream-required referrer policy", () => {
  assert.equal(counterUrl(defaults), "https://counter.fjtd.dev/counter");
  assert.equal(
    embedCode(defaults, "html", "Visitor counter"),
    '<img src="https://counter.fjtd.dev/counter" alt="Visitor counter" referrerpolicy="origin" />',
  );
});
test("all five upstream themes produce valid URLs and HTML with escaped attributes", () => {
  for (const asset of Object.keys(themes)) {
    const settings = { asset, offset: 1000, padding: 6 };
    const url = new URL(counterUrl(settings));
    assert.equal(
      url.searchParams.get("asset"),
      asset === "normal-150" ? null : asset,
    );
    assert.equal(url.searchParams.get("offset"), "1000");
    assert.equal(url.searchParams.get("padding"), "6");
    assert.equal(url.searchParams.has("animation"), false);
    assert.match(
      embedCode(settings, "html", "Counter"),
      /referrerpolicy="origin"/,
    );
    assert.match(embedCode(settings, "html", "Counter"), /&amp;padding=6/);
    assert.equal(embedCode(settings, "url", "Counter"), counterUrl(settings));
  }
});
test("offset and padding match upstream limits, including optional empty values", () => {
  assert.deepEqual(validateSettings("normal-150", "", "").settings, defaults);
  assert.equal(validateSettings("rule34", "1000000", "16").valid, true);
  for (const value of ["-1", "1000001", "1.5", "abc"])
    assert.equal(validateSettings("normal-150", value, "").valid, false);
  for (const value of ["0", "-1", "17", "1.5", "abc"])
    assert.equal(validateSettings("normal-150", "0", value).valid, false);
  assert.equal(validateSettings("unknown", "0", "").valid, false);
});
test("preview represents zero recorded hits plus offset, with minimum rather than fixed digits", () => {
  assert.equal(previewDigits(defaults), "0");
  assert.equal(previewDigits({ ...defaults, padding: 6 }), "000000");
  assert.equal(
    previewDigits({ ...defaults, offset: 42, padding: 6 }),
    "000042",
  );
  assert.equal(
    previewDigits({ ...defaults, offset: 1000, padding: 2 }),
    "1000",
  );
  assert.equal(previewDigits({ ...defaults, padding: 16 }).length, 16);
});
test("theme dimensions reflect the actual counter service output", () => {
  assert.deepEqual(themes["normal-150"], { width: 68, height: 150 });
  assert.deepEqual(themes["blue2-150"], { width: 68, height: 150 });
  for (const asset of ["blue2-100", "green-100", "rule34"])
    assert.deepEqual(themes[asset], { width: 45, height: 100 });
});
