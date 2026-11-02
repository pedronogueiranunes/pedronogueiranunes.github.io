import { defineConfig } from "astro/config";
import devtoolsJson from "vite-plugin-devtools-json";

// English remains unprefixed; translated routes preserve the same page paths.
export default defineConfig({
  vite: { plugins: [devtoolsJson()] },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  site: "https://pedronogueiranunes.github.io",
  // "auto" inlines only small sheets; the big global CSS becomes a cached file.
  build: { inlineStylesheets: "auto" },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-br"],
    routing: { prefixDefaultLocale: false },
  },
});
