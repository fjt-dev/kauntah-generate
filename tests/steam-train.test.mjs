import assert from "node:assert/strict";
import { test } from "node:test";
import { d51Frames } from "../src/data/sl-art.ts";
import { steamTrainFrame } from "../src/lib/steam-train.ts";

test("D51 artwork contains six distinct wheel phases with fixed train dimensions", () => {
  assert.equal(d51Frames.length, 6);
  assert.equal(new Set(d51Frames.map((frame) => frame.join("\n"))).size, 6);
  for (const frame of d51Frames) {
    assert.equal(frame.length, 10);
    assert.ok(frame.every((row) => row.length === 83));
  }
});
test("smoke and wheels animate without changing the overlay dimensions", () => {
  for (const frame of [0, 1, 5, 6, 15, 30, 100]) {
    const lines = steamTrainFrame(frame).split("\n");
    assert.equal(lines.length, 16);
    assert.ok(lines.every((line) => line.length === 83));
    assert.deepEqual(lines.slice(6), d51Frames[frame % 6]);
  }
  assert.notEqual(steamTrainFrame(0), steamTrainFrame(1));
  assert.notEqual(
    steamTrainFrame(0).split("\n").slice(0, 6).join("\n"),
    steamTrainFrame(4).split("\n").slice(0, 6).join("\n"),
  );
});
