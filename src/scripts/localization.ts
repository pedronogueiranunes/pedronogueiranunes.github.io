import { onPageLoad } from "./page-lifecycle";
import { localeFromPath, localizePath } from "../i18n/locales";
type Messages = Record<string, string>;
const loaders = {
  "pt-br": () => import("../i18n/pt-br.json"),
  es: () => import("../i18n/es.json"),
  fr: () => import("../i18n/fr.json"),
};
onPageLoad(async (scope) => {
  const locale = localeFromPath(location.pathname);
  if (locale === "en") return;
  const messages: Messages = (await loaders[locale]()).default;
  if (scope.signal.aborted) return;
  const translate = (value: string) => {
    const key = value.replace(/\s+/g, " ").trim();
    let result = messages[key];
    const count = key.match(/^(\d+) projects$/);
    if (!result && count) result = `${count[1]} ${messages.Projects.toLocaleLowerCase()}`;
    return result ? (value.match(/^\s*/)?.[0] || "") + result + (value.match(/\s*$/)?.[0] || "") : value;
  };
  const skip = "script, style, svg, pre, code, .eyebrow-typed, [data-person-name]";
  const translateNode = (node: Node) => {
    if (node instanceof Text) {
      if (node.parentElement?.closest(skip)) return;
      const value = translate(node.data);
      if (value !== node.data) node.data = value;
    } else if (node instanceof Element) {
      if (node.matches(skip)) return;
      for (const attribute of ["aria-label", "alt", "title", "placeholder"]) {
        const value = node.getAttribute(attribute);
        if (value) { const result = translate(value); if (result !== value) node.setAttribute(attribute, result); }
      }
      if (node instanceof HTMLAnchorElement) {
        const href = node.getAttribute("href");
        if (href && href.startsWith("/") && !href.startsWith("//")) {
          const result = localizePath(href, locale);
          if (result !== href) node.setAttribute("href", result);
        }
      }
      node.childNodes.forEach(translateNode);
    }
  };
  translateNode(document.body);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "characterData" || record.type === "attributes") translateNode(record.target);
      else record.addedNodes.forEach(translateNode);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "alt", "title", "placeholder"] });
  scope.cleanup(() => observer.disconnect());
});
