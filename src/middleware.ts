import { defineMiddleware } from "astro:middleware";
import { parse, parseFragment, serialize, type DefaultTreeAdapterMap } from "parse5";
import { dictionaries, translateText } from "./i18n/translate";
import { localeFromPath, localizePath, locales } from "./i18n/locales";
type Node = DefaultTreeAdapterMap["node"];
type Element = DefaultTreeAdapterMap["element"];
const translatedAttributes = new Set(["alt", "title", "placeholder", "aria-label"]);
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html") || response.status !== 200) return response;
  const locale = localeFromPath(context.url.pathname);
  const messages = locale === "en" ? {} : dictionaries[locale];
  const tree = parse(await response.text());
  function visit(node: Node) {
    if (node.nodeName === "#text") {
      const text = node as DefaultTreeAdapterMap["textNode"];
      text.value = translateText(text.value, messages);
      return;
    }
    if ("tagName" in node) {
      const element = node as Element;
      if (["script", "style", "svg", "pre", "code"].includes(element.tagName)) return;
      if (element.tagName === "html") element.attrs.find(a => a.name === "lang")!.value = locale;
      for (const attr of element.attrs) {
        if (translatedAttributes.has(attr.name)) attr.value = translateText(attr.value, messages);
        if (element.tagName === "a" && attr.name === "href") attr.value = localizePath(attr.value, locale);
        if (element.tagName === "meta" && attr.name === "content" && element.attrs.some(a => a.name === "name" && a.value === "description")) attr.value = translateText(attr.value, messages);
      }
      if (element.tagName === "head") {
        const links = locales.map(lang => `<link rel="alternate" hreflang="${lang}" href="${new URL(localizePath(context.url.pathname, lang), context.site || context.url.origin)}">`).join("");
        const nodes = parseFragment(links + `<link rel="alternate" hreflang="x-default" href="${new URL(localizePath(context.url.pathname, "en"), context.site || context.url.origin)}">`).childNodes;
        for (const child of nodes) { child.parentNode = element; element.childNodes.push(child); }
      }
    }
    if ("childNodes" in node) for (const child of node.childNodes) visit(child);
  }
  visit(tree);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("Content-Language", locale);
  return new Response(serialize(tree), { status: response.status, headers });
});
