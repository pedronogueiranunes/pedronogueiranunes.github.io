export const locales = ["en", "pt-br", "es", "fr"] as const;
export type Locale = typeof locales[number];
export const languageNames = { en: "English", "pt-br": "Português", es: "Español", fr: "Français" };
export const languageCodes = { en: "EN", "pt-br": "PT", es: "ES", fr: "FR" };
export function localeFromPath(path: string): Locale {
  const first = path.split("/")[1];
  return locales.includes(first as Locale) ? first as Locale : "en";
}
export function localizePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (/^\/(assets|_astro|\.well-known)(\/|$)/.test(path)) return path;
  const base = path.replace(/^\/(pt-br|es|fr)(?=\/|[?#]|$)/, "") || "/";
  return locale === "en" ? base : `/${locale}${base === "/" ? "/" : base}`;
}
