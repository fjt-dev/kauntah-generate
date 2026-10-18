export const themes = {
  "normal-150": { width: 68, height: 150 },
  "blue2-150": { width: 68, height: 150 },
  "blue2-100": { width: 45, height: 100 },
  "green-100": { width: 45, height: 100 },
  rule34: { width: 45, height: 100 },
} as const;
export type Theme = keyof typeof themes;
export type Settings = { asset: Theme; offset: number; padding: number };
export type Format = "html" | "url";
export const endpoint = "https://counter.fjtd.dev/counter";

export function validateSettings(
  asset: string,
  offset: string,
  padding: string,
) {
  const validInteger = (value: string, min: number, max: number) =>
    /^\d+$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) >= min &&
    Number(value) <= max;
  const errors = {
    offset: offset !== "" && !validInteger(offset, 0, 1_000_000),
    padding: padding !== "" && !validInteger(padding, 1, 16),
  };
  if (!Object.hasOwn(themes, asset) || errors.offset || errors.padding) {
    return { valid: false as const, errors };
  }
  return {
    valid: true as const,
    errors,
    settings: {
      asset: asset as Theme,
      offset: Number(offset),
      padding: Number(padding),
    },
  };
}

export function counterUrl(settings: Settings): string {
  const params = new URLSearchParams();
  if (settings.asset !== "normal-150") params.set("asset", settings.asset);
  if (settings.offset) params.set("offset", String(settings.offset));
  if (settings.padding) params.set("padding", String(settings.padding));
  return endpoint + (params.size ? `?${params}` : "");
}

export function embedCode(
  settings: Settings,
  format: Format,
  alt: string,
): string {
  const url = counterUrl(settings);
  if (format === "url") return url;
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return `<img src="${escape(url)}" alt="${escape(alt)}" referrerpolicy="origin" />`;
}

// Local preview of a counter with zero recorded hits; no live request is made.
export function previewDigits(settings: Settings): string {
  return String(settings.offset).padStart(settings.padding, "0");
}
