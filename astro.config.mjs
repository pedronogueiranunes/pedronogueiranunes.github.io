import { defineConfig } from "astro/config";
import devtoolsJson from "vite-plugin-devtools-json";

// ponytail: i18n routing decided now (cheap, avoids a URL-scheme rewrite later) but only
// English content exists — add pt-br/es content under src/content when it's ready.
export default defineConfig({
  vite: { plugins: [devtoolsJson()] },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  site: "https://pedronogueiranunes.github.io",
  build: { inlineStylesheets: "always" },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-br", "es"],
    routing: { prefixDefaultLocale: false },
  },
});
