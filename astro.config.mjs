import { defineConfig } from "astro/config";
import devtoolsJson from "vite-plugin-devtools-json";

// English remains unprefixed; translated routes preserve the same page paths.
export default defineConfig({
  vite: { plugins: [devtoolsJson()] },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  site: "https://pedronogueiranunes.github.io",
  build: { inlineStylesheets: "always" },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "pt-br", "es", "fr"],
    routing: { prefixDefaultLocale: false },
  },
});
