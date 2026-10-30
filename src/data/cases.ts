// TODO: confirm real number. Sample results and baseline placeholders come from Figma 488:8450.
export const bsaCase = {
  title: "+40% qualified contacts in three months.",
  summary:
    "How a corporate law firm went from an outdated site with no lead flow to a Webflow build that brings in the right clients, on its own.",
  client: "BSA Legal · Molina Chambô",
  industry: "Corporate law",
  market: "Brazil",
  services: "UI/UX, Webflow build, integrations",
  timeline: "[X] weeks",
  stack: ["Webflow", "HubSpot", "Zapier", "Figma"],
  heroMetrics: [
    {
      value: "+40%",
      label: "qualified contacts",
      baseline: "[before] / [after] / month",
    },
    { value: "-30%", label: "response time", baseline: "[before] / [after]" },
    {
      value: "3.2x",
      label: "organic traffic",
      baseline: "[before] / [after] / month",
    },
  ],
  challengeTitle: "A respected firm with a site that didn't show it.",
  challenge:
    "BSA Legal needed a website that reflected the firm's sophistication and brought in qualified contacts. The old site was outdated, hard to update and generated no real leads.",
  strategy: [
    [
      "Discovery and wireframes",
      "Requirements gathering, navigation built around the questions clients ask before they call.",
    ],
    [
      "UI and prototyping",
      "A restrained visual system with serif type for authority, and a contact path on every page.",
    ],
    [
      "Build and QA",
      "Webflow with CMS for the legal blog, automated forms, performance and accessibility testing.",
    ],
  ],
  results: [
    ["Qualified contacts / month", "[X]", "[X]", "+40%"],
    ["Response time to leads", "[X h]", "[X h]", "-30%"],
    ["Organic traffic / month", "[X]", "[X]", "3.2x"],
    ["Lighthouse performance", "[X]", "98", "[+X]"],
  ],
  quote:
    "[Client quote about working together and the result. Two or three lines.]",
  quoteAttribution: "[Name], [Role] · BSA Legal",
  integrations: [
    "Webflow",
    "Next.js",
    "Framer Motion",
    "HubSpot",
    "Zapier",
    "Figma",
  ],
};
export const featuredMetrics = [
  { value: "+40%", label: "qualified contacts" },
  { value: "3.2x", label: "organic traffic" },
  { value: "-30%", label: "response time" },
];
