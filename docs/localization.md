# Site languages

The site has 56 statically generated pages: the 14 existing routes in English, Brazilian Portuguese, Spanish and French. English URLs have no prefix; the others use `/pt-br`, `/es` and `/fr`. French wording uses Canadian conventions where appropriate (courriel, pigiste, témoins).

The language selector preserves the current path, query string and hash, and saves the explicit choice to localStorage under `language`. Opening an unprefixed URL restores that preference. Selecting English saves `en` and returns to the unprefixed equivalent. Language switching performs a full navigation so persisted headers, menus and cookie dialogs cannot retain the previous language. Ordinary navigation within a language retains Astro transitions.

## Translation source

`src/i18n/translations.tsv` contains reviewed source strings and translations in the order English / Portuguese / Spanish / French. Use literal tabs between fields and one string per line. `scripts/build-translations.mjs` validates row shape and duplicate keys, adds systematic project-title/metadata variants and emits the three JSON catalogs. It runs before dev/build; after changing the TSV during an already-running dev session, run `npm run i18n:generate`.

`src/pages/[locale]/[...path].astro` reuses the original page components and content collections. `src/middleware.ts` translates the parsed rendered HTML at build time, including text, accessible labels, image alternatives and metadata, and localizes internal links. It sets document language and adds canonical/language-alternate metadata. Scripts, styles, SVGs and code samples are left intact. Client dictionaries load only for the current non-English locale and handle text inserted dynamically by forms, project counts, the portrait cursor and cookie dialogs. User-entered names and form values are not translated.

Client names, tools, URLs, code, metrics and original currency values are preserved. No external machine-translation service or tracking script is used. The existing three article files have no body content; their existing titles, excerpts, categories and metadata are translated, without inventing article bodies. Dates are formatted per locale using UTC to avoid a one-day timezone shift.

## Verification

- `npm run build`: generates all 56 routes.
- `npm run i18n:check`: checks all 42 translated routes for document language, localized internal links, canonical URLs and alternate-language metadata.
- `node node_modules/typescript/bin/tsc --noEmit`: type verification.
- Browser checks: translated navigation in 320px, 390px, 1025px and 1440px viewports; URL/query/hash preservation in the selector; English restoration; translated form validation and cookie panel; localized case/article titles; no browser errors. Narrow translated header labels and French CTA lettering receive scoped layout adjustments.
