// Structured data shared across pages. Every page points at the same person
// through PERSON_ID so search and AI engines treat them as one entity.
import { site } from "./site";

export const ORIGIN = "https://pedronogueiranunes.github.io";
export const PERSON_ID = `${ORIGIN}/about/#person`;
export const WEBSITE_ID = `${ORIGIN}/#website`;
export const SERVICE_ID = `${ORIGIN}/#service`;

export const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Pedro Nogueira",
  alternateName: "Pedro José Nogueira Nunes",
  jobTitle: "Design Engineer",
  description:
    "Design engineer in Bahia, Brazil. Designs and builds brands, design systems and websites on Webflow, WordPress and React for agencies and companies in North America and Europe.",
  image: `${ORIGIN}/assets/head-about.png`,
  url: `${ORIGIN}/about/`,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressRegion: "Bahia", addressCountry: "BR" },
  worksFor: { "@type": "Organization", name: "BT Marketing", address: { "@type": "PostalAddress", addressLocality: "Toronto", addressCountry: "CA" } },
  knowsLanguage: ["pt", "en"],
  knowsAbout: [
    "Web design",
    "Webflow",
    "WordPress",
    "React",
    "Brand identity",
    "Design systems",
    "Conversion rate optimization",
    "Motion design",
    "Illustration",
  ],
  sameAs: Object.values(site.socials).filter((url) => url.startsWith("http")),
};

// ponytail: no prices here; offer prices in data/services.ts are still unconfirmed.
export const homeGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${ORIGIN}/`,
      name: "Pedro Nogueira",
      inLanguage: ["en", "pt-BR", "es-ES", "fr-CA"],
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfessionalService",
      "@id": SERVICE_ID,
      name: "Pedro Nogueira, design engineer",
      url: `${ORIGIN}/services/`,
      image: `${ORIGIN}/assets/og/default.jpg`,
      founder: { "@id": PERSON_ID },
      address: { "@type": "PostalAddress", addressRegion: "Bahia", addressCountry: "BR" },
      areaServed: ["United States", "Canada", "Europe", "Brazil"],
      serviceType: [
        "Website design and development",
        "Brand identity and design systems",
        "CRO audit and redesign",
        "White-label design and development for agencies",
      ],
      knowsLanguage: ["en", "pt"],
    },
    person,
  ],
};

export const jsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
