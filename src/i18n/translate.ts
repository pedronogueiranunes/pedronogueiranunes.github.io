import pt from "./pt-br.json";
import es from "./es.json";
import fr from "./fr.json";
import type { Locale } from "./locales";
export type Messages = Record<string, string>;
export const dictionaries: Record<Exclude<Locale, "en">, Messages> = { "pt-br": pt, es, fr };
export function translateText(value: string, messages: Messages): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  let translated = messages[normalized];
  if (!translated) {
    const count = normalized.match(/^(\d+) projects$/);
    if (count && messages.Projects) translated = `${count[1]} ${messages.Projects.toLocaleLowerCase()}`;
  }
  if (!translated) return value;
  const before = value.match(/^\s*/)?.[0] || "";
  const after = value.match(/\s*$/)?.[0] || "";
  return before + translated + after;
}
