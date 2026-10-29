// TODO: confirm real number. Offer prices and durations are conservative examples pending Pedro's approval.
export const offers = [
  {
    title: "Website design and build",
    description: "For brands that need a site as good as the work they do.",
    items: [
      "UX, UI and a small design system in Figma",
      "Built on Webflow, WordPress, React or Shopify",
      "CMS your team edits without breaking layouts",
      "Forms, tracking and integrations wired in",
    ],
    duration: "6 to 10 weeks", // TODO: confirm with Pedro before publishing
    price: "From $9,000", // TODO: confirm real number
    featured: true,
  },
  {
    title: "Brand identity and design systems",
    description:
      "For companies whose look no longer matches where they are going.",
    items: [
      "Logo system, color and type",
      "Guidelines your team and vendors can follow",
      "Design tokens and components in Figma",
      "Ready to carry into the website",
    ],
    duration: "3 to 6 weeks", // TODO: confirm with Pedro before publishing
    price: "From $5,000", // TODO: confirm real number
  },
  {
    title: "CRO audit and redesign",
    description: "For sites with traffic that is not turning into calls.",
    items: [
      "Review of up to 5 key pages, desktop and mobile",
      "Analytics and heatmap read-out",
      "Prioritized fix list with effort",
      "Redesign of your most important page in Figma",
    ],
    duration: "2 to 3 weeks", // TODO: confirm with Pedro before publishing
    price: "From $1,800", // TODO: confirm real number
  },
];
// TODO: confirm real number. Bundle price shown under the offer cards.
export const bundleNote = "Brand and website together start at $13,000.";
export const capabilities = [
  {
    title: "Websites & CMS",
    body: "Marketing sites your team can edit on their own, without breaking the layout.",
    tools: ["Webflow", "WordPress", "Framer"],
  },
  {
    title: "Brand identity",
    body: "Logos, color, type and guidelines with a clear point of view.",
    tools: ["Illustrator", "Figma"],
  },
  {
    title: "Design systems",
    body: "Tokens and components in Figma that developers build without guessing.",
    // TODO: confirm with Pedro before publishing (Storybook only if he uses it).
    tools: ["Figma", "Variables", "Storybook"],
  },
  {
    title: "CRO & analytics",
    body: "Find where visitors drop off, then fix the pages that bring in revenue first.",
    tools: ["GA4", "GTM", "Clarity", "Hotjar"],
  },
  {
    title: "Custom front end & e-commerce",
    body: "React, Next.js and Shopify Hydrogen for when a page builder is not enough.",
    tools: ["React", "Next.js", "Shopify Hydrogen"],
  },
  {
    title: "Illustration, motion & sound",
    body: "Custom illustration, interface animation and original sound, so the brand never looks generic.",
    tools: ["Illustrator", "After Effects", "GSAP", "Ableton"],
  },
];
export const deliverables = [
  [
    "Conversion audit",
    "I dig into your analytics and heatmaps to see where visitors drop off and why.",
    "Week 1",
  ],
  [
    "Sitemap and wireframes",
    "We plan each page around the questions your buyers ask before they reach out.",
    "Week 1 to 2",
  ],
  [
    "UI design in Figma",
    "Desktop and mobile designs you approve before anything gets built, plus a small design system your team can reuse.",
    "Week 2 to 4",
  ],
  [
    "Build + CMS",
    "Built on the platform that fits your team, with a CMS you can edit without calling me.",
    "Week 4 to 7",
  ],
  [
    "Tracking and integrations",
    "Forms, CRM and analytics wired up, so from day one you know where every lead came from.",
    "Week 6 to 7",
  ],
  [
    "Launch + handover",
    // TODO: confirm with Pedro before publishing (30 days of fixes).
    "I launch, record a walkthrough video for your team and stay around for 30 days to fix anything that comes up.",
    "Week 8",
  ],
];
export const schedule = [
  [
    "Week 1",
    "Discovery",
    "I review your site, analytics and competitors, and send a written plan.",
  ],
  [
    "Week 2 to 4",
    "Design",
    "Wireframes, then UI in Figma. You approve before anything gets built.",
  ],
  [
    "Week 4 to 7",
    "Build + launch",
    "Built on your stack, then tracking and QA. Forms and calls are recorded from day one.",
  ],
  [
    "Month 2+",
    "Measure + improve",
    "A monthly report and the next round of tests, if you want to keep going.",
  ],
];
export const faq = [
  {
    question: "What does a project usually cost?",
    // TODO: confirm real number
    answer:
      "Websites start at $9,000, brand identity at $5,000 and CRO audits at $1,800. After the first call you get a fixed price range in writing, before any commitment.",
  },
  {
    question: "Which platforms do you work with?",
    answer:
      "Webflow, WordPress, Framer, Shopify and React or Next.js. I recommend one based on who will run the site after launch.",
  },
  {
    question: "Do you work white-label with agencies?",
    answer:
      "Yes. I have worked as a subcontractor for agencies and inside agency teams. Rates depend on scope and monthly capacity, so we agree them on a call.",
  },
  {
    question: "Do you sign NDAs?",
    answer: "Yes, before we look at any files.", // TODO: confirm with Pedro before publishing
  },
  {
    question: "What time zone do you work in?",
    // TODO: confirm with Pedro before publishing (call hours)
    answer:
      "Brasília time (UTC−3). Calls from 11 am to 4 pm Eastern, async the rest of the day. Europe gets late-afternoon calls.",
  },
  {
    question: "Who owns the work?",
    answer:
      "You do. Files, accounts and code are yours after the final payment.", // TODO: confirm with Pedro before publishing
  },
  {
    question: "How fast can we start?",
    answer: "Usually within two weeks. Ask for the current availability.", // TODO: confirm with Pedro before publishing
  },
];

export interface CaseResult {
  slug: string;
  image?: string;
  alt: string;
  headline: string;
  rows: [string, string][];
}

// Slides for the Services hero carousel. Facts only (role, stack, link) until verified metrics exist.
export const caseResults: CaseResult[] = [
  {
    slug: "bsa-legal",
    image: "/assets/figma/488-10049-imgImageBsaLegal.webp",
    alt: "BSA Legal website",
    headline: "BSA Legal: brand and website for an entertainment law firm.",
    rows: [
      ["Role", "Brand, design system, Webflow build"],
      ["Stack", "Webflow, GSAP, n8n, Mailchimp"],
      ["Live", "bsa.legal"],
    ],
  },
  {
    slug: "molina-chambo",
    alt: "",
    headline: "Molina Chambô: from brand to live site in 2.5 months.",
    rows: [
      ["Role", "Brand, design system, Webflow build"],
      ["Stack", "Webflow, n8n, Clarity"],
      ["Live", "molinachambo.com.br"],
    ],
  },
  {
    slug: "pinelake-broken-bow",
    alt: "",
    headline: "PineLake Broken Bow: direct booking for luxury cabins.",
    rows: [
      ["Role", "Website design and build, part of the brand"],
      ["Stack", "WordPress, ACF Pro, Hostfully API"],
      ["Live", "pinelakebrokenbow.com"],
    ],
  },
  {
    slug: "lemmbra-olympiad",
    alt: "",
    headline: "Lemmbra Olympiad: a platform for a language olympiad.",
    rows: [
      ["Role", "Brand, design system, Webflow build"],
      ["Stack", "Webflow, Memberstack, API integration"],
      // TODO: confirm with Pedro before publishing (permission to name the backers)
      ["Backed by", "German Embassy in Brazil, UFF, UFPR"],
    ],
  },
  {
    slug: "green-nation-collective",
    alt: "",
    headline: "Green Nation Collective: a site for an impact ecosystem.",
    rows: [
      ["Role", "Design, design system, Webflow build"],
      ["Engagement", "Subcontractor for Qodeture"],
      ["Stack", "Webflow, GA4, GTM"],
    ],
  },
  {
    slug: "waipono-farms",
    alt: "",
    headline: "Waipono Farms: a regenerative farm community in Maui.",
    rows: [
      ["Role", "Design, design system, Webflow build"],
      ["Engagement", "Subcontractor for Qodeture"],
      ["Stack", "Webflow, GA4, GTM"],
    ],
  },
];
