import type { SiteLanguage } from "./translations";

// The chosen language is saved in a cookie (and localStorage) under this
// name, so the server can send the page already in that language
export const LANGUAGE_COOKIE = "zero-fm-language";

export function isSiteLanguage(value: unknown): value is SiteLanguage {
  return value === "english" || value === "sinhala" || value === "tamil";
}
