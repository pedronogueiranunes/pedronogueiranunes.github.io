import { defineConfig } from 'astro/config';

// ponytail: i18n routing decided now (cheap, avoids a URL-scheme rewrite later) but only
// English content exists — add pt-br/es content under src/content when it's ready.
export default defineConfig({
  site: 'https://pedronogueiranunes.github.io',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt-br', 'es'],
    routing: { prefixDefaultLocale: false },
  },
});
