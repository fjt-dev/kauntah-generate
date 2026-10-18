import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseCommand, defaultCommandState } from "../src/lib/commands.ts";
import { completeCommand } from "../src/lib/completion.ts";

test("the hidden command works without changing counter settings", () => {
  const state = {
    ...defaultCommandState,
    asset: "rule34",
    offset: "42",
    padding: "6",
  };
  const before = { ...state };
  assert.deepEqual(parseCommand("meow", state), { kind: "cat" });
  assert.deepEqual(state, before);
  assert.deepEqual(parseCommand("meow unexpected", state), {
    kind: "error",
    error: "unknownOption",
  });
});
test("the hidden command is absent from help, the introduction, and completion suggestions", () => {
  assert.equal(completeCommand("").candidates.includes("meow"), false);
  assert.equal(completeCommand("").candidates.includes("uuid"), false);
  assert.deepEqual(completeCommand("uu").candidates, []);
  assert.equal(completeCommand("").candidates.includes("sl"), false);
  assert.deepEqual(completeCommand("sl").candidates, []);
  assert.deepEqual(completeCommand("me").candidates, []);
  const source = readFileSync(
    new URL("../src/components/GeneratorPage.astro", import.meta.url),
    "utf8",
  );
  const publicText = [
    ...source.matchAll(/command(?:Usage|Intro): "((?:\\.|[^"\\])*)"/g),
  ];
  assert.equal(publicText.length, 4);
  for (const [, text] of publicText) {
    assert.equal(text.includes("meow"), false);
    assert.equal(text.includes("uuid"), false);
    assert.equal(/\bsl\b/.test(text), false);
  }
});

test("hidden UUID generation and optional copying do not change counter settings", () => {
  const state = {
    ...defaultCommandState,
    asset: "green-100",
    offset: "1000",
    padding: "8",
  };
  const before = { ...state };
  assert.deepEqual(parseCommand("uuid", state), { kind: "uuid", copy: false });
  assert.deepEqual(parseCommand("uuid --copy", state), {
    kind: "uuid",
    copy: true,
  });
  assert.deepEqual(parseCommand("uuid --copy unexpected", state), {
    kind: "error",
    error: "unknownOption",
  });
  assert.deepEqual(parseCommand("uuid --count 10", state), {
    kind: "error",
    error: "unknownOption",
  });
  assert.deepEqual(state, before);
});

test("sl is a hidden effect without counter mutations or unsupported options", () => {
  const state = { ...defaultCommandState, offset: "42" };
  assert.deepEqual(parseCommand("sl", state), { kind: "steamTrain" });
  assert.deepEqual(parseCommand("sl --help", state), {
    kind: "error",
    error: "unknownOption",
  });
  assert.equal(state.offset, "42");
});
