// Current Figma Services, not the older prices in the original brief.
// TODO: confirm real number. All offer prices, durations and sample results require approval.
export const offers = [
  {
    title: "CRO audit",
    description: "For sites with traffic but not enough calls.",
    items: [
      "Full review of your key pages",
      "Heatmaps and analytics read-out",
      "Prioritized fix list with effort",
      "Two quick wins shipped",
    ],
    duration: "1 to 2 weeks",
    price: "From $1,000",
  },
  {
    title: "Website design and build",
    description:
      "For sites that look dated, load slowly or are painful to update, on any platform.",
    items: [
      "Conversion-first UX and UI in Figma",
      "Built on WordPress, Webflow, Framer, Shopify or React",
      "Forms, tracking and integrations",
      "30 days of post-launch support",
    ],
    duration: "6 to 8 weeks",
    price: "From $7,000",
    featured: true,
  },
  {
    title: "White-label for agencies",
    description:
      "For agencies with more design and dev work than senior hands.",
    items: [
      "Design, dev or both, under your brand",
      "Joins your Slack, Jira or Asana",
      "Clean, documented handover",
      "Flexible monthly capacity",
    ],
    duration: "Starts in 2 weeks",
    price: "From $4,000 / month",
  },
];
export const capabilities = [
  {
    title: "Websites & CMS",
    body: "Marketing sites your team can edit on their own, without breaking the layout.",
    tools: ["WordPress", "Webflow", "Framer"],
  },
  {
    title: "Headless & e-commerce",
    body: "Custom front ends and Hydrogen stores for when a page builder is not enough.",
    tools: ["React", "Next.js", "Shopify Hydrogen"],
  },
  {
    title: "CRO & analytics",
    body: "Find where visitors drop off, then fix the pages that bring in revenue first.",
    tools: ["GA4", "GTM", "Hotjar"],
  },
  {
    title: "UX/UI & design systems",
    body: "Wireframes, UI and small design systems in Figma that developers build without guessing.",
    tools: ["Figma", "FigJam", "Prototypes"],
  },
  {
    title: "Illustration & art direction",
    body: "Custom illustration and a clear visual direction, so the site never looks like a template.",
    tools: ["Illustrator", "Photoshop", "Procreate"],
  },
  {
    title: "Motion, video & sound",
    body: "Interface animation, edited launch videos and original sound for brands that move.",
    tools: ["GSAP", "After Effects", "DaVinci", "Ableton"],
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
    "I launch, record a walkthrough video for your team and stay around for 30 days to fix anything that comes up.",
    "Week 8",
  ],
];
export const schedule = [
  [
    "Week 1",
    "Free plan",
    "I review your site, analytics and three competitors, and send a written plan.",
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
// Only the first FAQ answer is authored in the visible Figma. Remaining answers are editorial TODOs.
export const faq = [
  {
    question: "What does a project usually cost?",
    answer:
      "It depends on scope. After the first call you get a fixed price range in writing, before any commitment.",
  },
  {
    question: "Which platforms do you work with?",
    answer: "WordPress, Webflow, Framer, Shopify and React.",
  },
  {
    question: "Do you work white-label with agencies?",
    answer:
      "Design, dev or both, under your brand. Joins your Slack, Jira or Asana. Clean, documented handover. Flexible monthly capacity.",
  },
  { question: "How fast can we start?", answer: "Starts in 2 weeks." },
  // TODO: provide the NDA policy; do not publish an invented commitment.
  {
    question: "Do you sign NDAs?",
    answer: "Ask me by email: pedronogueiranunes@gmail.com.",
  },
  {
    question: "Just have a quick question?",
    answer: "Email pedronogueiranunes@gmail.com.",
  },
];

// TODO: confirm real number. Services hero case headline.
export const resultHeadline =
  "BSA Legal went from no lead flow to +40% qualified contacts.";

export interface CaseResult {
  slug: string;
  category: string;
  image?: string;
  alt: string;
  headline: string;
  metrics: [string, string, string][];
}

// Slides for the Services hero client-result carousel.
// Slide 1 keeps the approved Figma result. The other five are MOCK placeholders
// so the carousel can be reviewed before Pedro supplies verified numbers.
// TODO: replace mock case results and headlines with approved copy and real data.
export const caseResults: CaseResult[] = [
  {
    slug: "bsa-legal",
    category: "Client result · Web build",
    image: "/assets/figma/488-10049-imgImageBsaLegal.webp",
    alt: "BSA Legal website",
    headline: resultHeadline,
    metrics: [
      ["Qualified leads / mo", "15", "+40%"],
      ["Organic traffic / mo", "1,100", "3.2x"],
      ["Lighthouse performance", "54", "98"],
    ],
  },
  {
    slug: "pinelake-broken-bow",
    category: "Client result · Web build",
    alt: "",
    headline: "PineLake Broken Bow turned app bookings into direct ones.",
    metrics: [
      ["Booking requests / mo", "24", "+38%"],
      ["Mobile load time", "3.6s", "1.4s"],
      ["Lighthouse performance", "61", "96"],
    ],
  },
  {
    slug: "green-nation-collective",
    category: "Client result · Web build",
    alt: "",
    headline: "Green Nation launched a campaign site their own team runs.",
    metrics: [
      ["Newsletter sign-ups", "180", "+52%"],
      ["Organic traffic / mo", "1,400", "2.1x"],
      ["Lighthouse performance", "58", "97"],
    ],
  },
  {
    slug: "molina-chambo",
    category: "Client result · Web build",
    alt: "",
    headline: "Molina Chambô turned local searches into consultations.",
    metrics: [
      ["Practice area pages", "6", "14"],
      ["Organic traffic / mo", "2,300", "2.4x"],
      ["Lighthouse performance", "49", "95"],
    ],
  },
  {
    slug: "waipono-farms",
    category: "Client result · Web build",
    alt: "",
    headline: "Waipono Farms brought the farm stand online.",
    metrics: [
      ["Online orders / mo", "0", "120"],
      ["Mobile load time", "4.2s", "1.6s"],
      ["Lighthouse performance", "55", "97"],
    ],
  },
  {
    slug: "lemmbra-olympiad",
    category: "Client result · Web build",
    alt: "",
    headline: "Lemmbra Olympiad made registration work in two countries.",
    metrics: [
      ["Registration sign-ups", "300", "1,100"],
      ["Organic traffic / mo", "700", "3.1x"],
      ["Lighthouse performance", "60", "98"],
    ],
  },
];
