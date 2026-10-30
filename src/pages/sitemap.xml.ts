import { getCollection } from "astro:content";
import { locales, localizePath } from "../i18n/locales";
import { ORIGIN } from "../data/seo";

// Every page in every locale, each listing its language alternates.
export async function GET() {
  const projects = await getCollection("projects");
  const paths = ["/", "/projects/", "/about/", "/services/", "/contact/",
    ...projects.map((p) => `/work/${p.data.caseSlug || p.slug}/`)];
  const alternates = (path: string) =>
    [...locales.map((l) => [l, localizePath(path, l)]), ["x-default", path]]
      .map(([l, href]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}${href}"/>`).join("");
  const urls = paths.flatMap((path) => locales.map((l) =>
    `<url><loc>${ORIGIN}${localizePath(path, l)}</loc>${alternates(path)}</url>`));
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join("")}</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } },
  );
}
