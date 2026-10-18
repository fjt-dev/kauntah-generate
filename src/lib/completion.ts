import { themes } from "./generator.ts";

export const commandNames = [
  "kauntah",
  "help",
  "themes",
  "theme",
  "offset",
  "padding",
  "format",
  "show",
  "copy",
  "reset",
  "clear",
  "history",
];
const options = ["--asset", "--offset", "--padding", "--format", "--help"];
const values: Record<string, string[]> = {
  asset: Object.keys(themes),
  format: ["html", "url"],
  padding: [
    "auto",
    ...Array.from({ length: 16 }, (_, index) => String(index + 1)),
  ],
};
function wordAt(input: string, cursor: number) {
  const position = Math.max(0, Math.min(input.length, cursor));
  const start = input.slice(0, position).search(/\S*$/);
  const rest = input.slice(position).search(/\s/);
  return {
    start,
    end: rest === -1 ? input.length : position + rest,
    prefix: input.slice(start, position),
  };
}
export function insertCompletion(
  input: string,
  cursor: number,
  candidate: string,
  finished = true,
) {
  const { start, end } = wordAt(input, cursor);
  const suffix = input.slice(end);
  const space = finished && suffix === "" ? " " : "";
  return {
    value: input.slice(0, start) + candidate + space + suffix,
    cursor: start + candidate.length + space.length,
  };
}

/** Complete only known Kauntah commands and values; never inspect the filesystem. */
export function completeCommand(input: string, cursor = input.length) {
  const { start, prefix } = wordAt(input, cursor);
  const before = input.slice(0, start).trim().split(/\s+/).filter(Boolean);
  let pool: string[] = [];
  if (!before.length) pool = commandNames;
  else if (before[0] === "kauntah") {
    const used = new Set<string>();
    let expected: string | undefined;
    for (const token of before.slice(1)) {
      if (expected) {
        expected = undefined;
        continue;
      }
      const match = /^--(asset|offset|padding|format|help)(?:=(.*))?$/.exec(
        token,
      );
      if (!match) continue;
      used.add(`--${match[1]}`);
      if (match[1] !== "help" && match[2] === undefined) expected = match[1];
    }
    const equal = /^--(asset|format|padding)=(.*)$/.exec(prefix);
    if (expected) pool = values[expected] ?? [];
    else if (equal && !used.has(`--${equal[1]}`))
      pool = (values[equal[1]] ?? []).map((value) => `--${equal[1]}=${value}`);
    else pool = options.filter((option) => !used.has(option));
  } else if (before.length === 1) {
    const key = before[0] === "theme" ? "asset" : before[0];
    pool = values[key] ?? [];
  }
  const candidates = pool.filter((candidate) => candidate.startsWith(prefix));
  if (!candidates.length) return { value: input, cursor, candidates };
  let common = candidates[0];
  for (const candidate of candidates.slice(1)) {
    while (!candidate.startsWith(common)) common = common.slice(0, -1);
  }
  const completed =
    candidates.length === 1 || common.length > prefix.length
      ? insertCompletion(input, cursor, common, candidates.length === 1)
      : { value: input, cursor };
  return { ...completed, candidates };
}
