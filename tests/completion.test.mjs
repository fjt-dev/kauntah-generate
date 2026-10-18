import assert from "node:assert/strict";
import { test } from "node:test";
import { completeCommand, insertCompletion } from "../src/lib/completion.ts";

test("a unique command or option completes with a trailing space", () => {
  assert.equal(completeCommand("ka").value, "kauntah ");
  assert.equal(completeCommand("kauntah --as").value, "kauntah --asset ");
  assert.equal(completeCommand("kauntah --pa").value, "kauntah --padding ");
});
test("theme completion expands the common prefix and exposes ambiguous matches", () => {
  const result = completeCommand("theme bl");
  assert.equal(result.value, "theme blue2-1");
  assert.deepEqual(result.candidates, ["blue2-150", "blue2-100"]);
  assert.equal(completeCommand("theme blue2-1").value, "theme blue2-1");
  assert.equal(completeCommand("theme blue2-15").value, "theme blue2-150 ");
  assert.equal(
    completeCommand("kauntah --asset ru").value,
    "kauntah --asset rule34 ",
  );
});
test("equals syntax, formats and optional padding values are completed", () => {
  assert.equal(
    completeCommand("kauntah --asset=ru").value,
    "kauntah --asset=rule34 ",
  );
  assert.equal(
    completeCommand("kauntah --format=h").value,
    "kauntah --format=html ",
  );
  assert.equal(completeCommand("format u").value, "format url ");
  assert.equal(completeCommand("padding au").value, "padding auto ");
  assert.equal(
    completeCommand("kauntah --padding a").value,
    "kauntah --padding auto ",
  );
});
test("used options are not suggested again and numeric fields do not invent values", () => {
  assert.deepEqual(
    completeCommand("kauntah --asset rule34 --as").candidates,
    [],
  );
  assert.deepEqual(
    completeCommand("kauntah --asset=rule34 --as").candidates,
    [],
  );
  assert.deepEqual(completeCommand("kauntah --offset ").candidates, []);
  assert.deepEqual(completeCommand("offset 42").candidates, []);
});
test("completion at the cursor preserves following flags and uses the correct caret position", () => {
  const input = "kauntah --as --padding 6";
  const cursor = "kauntah --as".length;
  const result = completeCommand(input, cursor);
  assert.equal(result.value, "kauntah --asset --padding 6");
  assert.equal(result.cursor, "kauntah --asset".length);
  const chosen = insertCompletion("theme blue2-", 12, "blue2-100");
  assert.equal(chosen.value, "theme blue2-100 ");
  assert.equal(chosen.cursor, chosen.value.length);
});
test("unknown input remains literal and empty input offers the command list", () => {
  assert.deepEqual(completeCommand("$(id)").candidates, []);
  assert.ok(completeCommand("").candidates.includes("help"));
  assert.ok(completeCommand("").candidates.includes("history"));
});

test("options after the caret are excluded without excluding the current token", () => {
  for (const suffix of ["--padding 6", "--padding=6"]) {
    const input = `kauntah --pa ${suffix}`;
    const result = completeCommand(input, "kauntah --pa".length);
    assert.deepEqual(result.candidates, []);
    assert.equal(result.value, input);
  }
  const input = "kauntah  --asset=rule34 --format html";
  const result = completeCommand(input, "kauntah ".length);
  assert.ok(!result.candidates.includes("--asset"));
  assert.ok(!result.candidates.includes("--format"));
  assert.ok(result.candidates.includes("--padding"));
  const current = "kauntah --padding=au --format html";
  assert.equal(
    completeCommand(current, "kauntah --padding=au".length).value,
    "kauntah --padding=auto --format html",
  );
  const middle = "kauntah --padding=auto --format html";
  assert.equal(
    completeCommand(middle, "kauntah --padding=au".length).value,
    middle,
  );
});
