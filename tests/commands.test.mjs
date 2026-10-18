import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseCommand,
  defaultCommandState,
  describeCommandState,
} from "../src/lib/commands.ts";
const current = {
  asset: "blue2-100",
  offset: "42",
  padding: "6",
  format: "url",
};

test("counter flags update atomically and preserve unspecified settings", () => {
  assert.deepEqual(
    parseCommand("kauntah --asset rule34 --padding=8", current),
    {
      kind: "update",
      state: { ...current, asset: "rule34", padding: "8" },
    },
  );
  assert.deepEqual(current, {
    asset: "blue2-100",
    offset: "42",
    padding: "6",
    format: "url",
  });
});
test("short commands support themes, numeric limits, optional padding and output format", () => {
  for (const [input, field, value] of [
    ["theme normal-150", "asset", "normal-150"],
    ["offset 1000000", "offset", "1000000"],
    ["padding 16", "padding", "16"],
    ["padding auto", "padding", ""],
    ["format html", "format", "html"],
  ])
    assert.deepEqual(parseCommand(input, current), {
      kind: "update",
      state: { ...current, [field]: value },
    });
});
test("help and utility commands do not mutate settings", () => {
  for (const name of ["help", "themes", "show", "clear", "copy", "history"])
    assert.deepEqual(parseCommand(name, current), { kind: name });
  assert.deepEqual(parseCommand("kauntah --help", current), { kind: "help" });
  assert.deepEqual(parseCommand("kauntah", current), { kind: "show" });
  assert.deepEqual(parseCommand("reset", current), {
    kind: "update",
    state: defaultCommandState,
  });
});
test("invalid commands and service values fail without modifying the current state", () => {
  for (const [input, error] of [
    ["offset -1", "invalidOffset"],
    ["offset 1000001", "invalidOffset"],
    ["offset 1.2", "invalidOffset"],
    ["padding 0", "invalidPadding"],
    ["padding 17", "invalidPadding"],
    ["theme unknown", "invalidTheme"],
    ["format markdown", "invalidFormat"],
    ["kauntah --asset rule34 --offset 1000001", "invalidOffset"],
    ["kauntah --offset 1 --offset 2", "duplicateOption"],
    ["kauntah --padding", "missingValue"],
    ["kauntah --padding --offset 1", "missingValue"],
    ["kauntah --animation 1", "unknownOption"],
    ["help unexpected", "unknownOption"],
    ["offset", "missingValue"],
    ["rm -rf /", "unknownCommand"],
    ["offset 1;alert(1)", "invalidOffset"],
    ["x".repeat(1025), "tooLong"],
  ])
    assert.deepEqual(parseCommand(input, current), { kind: "error", error });
});
test("an invalid form state can be repaired but is never silently discarded", () => {
  const invalid = { ...current, padding: "17" };
  assert.deepEqual(parseCommand("theme rule34", invalid), {
    kind: "error",
    error: "invalidPadding",
  });
  assert.deepEqual(parseCommand("padding auto", invalid), {
    kind: "update",
    state: { ...invalid, padding: "" },
  });
});
test("show output can be pasted back to reproduce the settings", () => {
  for (const state of [current, defaultCommandState])
    assert.deepEqual(
      parseCommand(describeCommandState(state), defaultCommandState),
      { kind: "update", state },
    );
});
