import {
  themes,
  validateSettings,
  type Format,
  type Theme,
} from "./generator.ts";

export type CommandState = {
  asset: Theme;
  offset: string;
  padding: string;
  format: Format;
};
export type CommandError =
  | "unknownCommand"
  | "unknownOption"
  | "missingValue"
  | "duplicateOption"
  | "invalidTheme"
  | "invalidOffset"
  | "invalidPadding"
  | "invalidFormat"
  | "tooLong";
export type CommandResult =
  | { kind: "help" | "themes" | "show" | "clear" | "copy" | "history" }
  | { kind: "cat" }
  | { kind: "steamTrain" }
  | { kind: "uuid"; copy: boolean }
  | { kind: "update"; state: CommandState }
  | { kind: "error"; error: CommandError };

export const defaultCommandState: CommandState = {
  asset: "normal-150",
  offset: "0",
  padding: "",
  format: "html",
};

/** Parse only counter UI commands. No shell, evaluation, or network execution. */
export function parseCommand(
  input: string,
  current: CommandState,
): CommandResult {
  if (input.length > 1024) return { kind: "error", error: "tooLong" };
  const [command = "", ...args] = input.trim().split(/\s+/);
  if (
    ["help", "themes", "show", "clear", "copy", "history"].includes(command)
  ) {
    return args.length
      ? { kind: "error", error: "unknownOption" }
      : {
          kind: command as
            "help" | "themes" | "show" | "clear" | "copy" | "history",
        };
  }
  if (command === "uuid")
    return args.length === 0 || (args.length === 1 && args[0] === "--copy")
      ? { kind: "uuid", copy: args.length === 1 }
      : { kind: "error", error: "unknownOption" };
  if (command === "sl")
    return args.length
      ? { kind: "error", error: "unknownOption" }
      : { kind: "steamTrain" };
  if (command === "meow")
    return args.length
      ? { kind: "error", error: "unknownOption" }
      : { kind: "cat" };
  if (command === "reset")
    return args.length
      ? { kind: "error", error: "unknownOption" }
      : { kind: "update", state: { ...defaultCommandState } };
  if (command === "kauntah" && args.length === 1 && args[0] === "--help")
    return { kind: "help" };
  if (command === "kauntah" && args.length === 0) return { kind: "show" };
  const next = { ...current };
  const updates = new Map<string, string>();
  if (["theme", "offset", "padding", "format"].includes(command)) {
    if (args.length === 0) return { kind: "error", error: "missingValue" };
    if (args.length !== 1) return { kind: "error", error: "unknownOption" };
    updates.set(command === "theme" ? "asset" : command, args[0]);
  } else if (command === "kauntah") {
    for (let i = 0; i < args.length; i++) {
      const match = /^--(asset|offset|padding|format)(?:=(.*))?$/.exec(args[i]);
      if (!match) return { kind: "error", error: "unknownOption" };
      const key = match[1];
      if (updates.has(key)) return { kind: "error", error: "duplicateOption" };
      const value = match[2] ?? args[++i];
      if (!value || value.startsWith("--"))
        return { kind: "error", error: "missingValue" };
      updates.set(key, value);
    }
  } else return { kind: "error", error: "unknownCommand" };

  for (const [key, value] of updates) {
    if (key === "asset") {
      if (!Object.hasOwn(themes, value))
        return { kind: "error", error: "invalidTheme" };
      next.asset = value as Theme;
    } else if (key === "format") {
      if (value !== "html" && value !== "url")
        return { kind: "error", error: "invalidFormat" };
      next.format = value;
    } else if (key === "padding") next.padding = value === "auto" ? "" : value;
    else if (key === "offset") next.offset = value;
  }
  const validation = validateSettings(next.asset, next.offset, next.padding);
  if (validation.errors.offset)
    return { kind: "error", error: "invalidOffset" };
  if (validation.errors.padding)
    return { kind: "error", error: "invalidPadding" };
  if (!validation.valid) return { kind: "error", error: "invalidTheme" };
  return { kind: "update", state: next };
}

export function describeCommandState(state: CommandState): string {
  return `kauntah --asset ${state.asset} --offset ${state.offset || "0"} --padding ${state.padding || "auto"} --format ${state.format}`;
}
