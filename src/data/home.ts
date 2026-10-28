// Copy transcribed from visible nodes on Current / Home, Figma 488:6602.
export const problems = [
  {
    title: '"People visit, but nobody books."',
    body: "Traffic is there, trust is not. The page does not answer the questions a buyer has before they reach out.",
    image: "img3DConversionTarget1",
    mask: "img3DConversionTargetFade",
    tools: ["CRO audit", "Landing page redesign"],
    outcome: "First fixes live in 2 weeks",
  },
  {
    title: '"Our site is slow and a pain to update."',
    body: "Every change needs a developer, pages load slowly and the CMS fights your team. The fix might be Webflow, a cleaner WordPress, Shopify or React.",
    image: "img3DFastWebsite1",
    mask: "img3DFastWebsite",
    tools: ["Rebuild on the right stack", "CMS setup"],
    outcome: "Launch in 6 to 8 weeks",
  },
  {
    title: '"Our agency has more work than senior hands."',
    body: "You have the clients and the strategy. You need someone who designs and builds in whatever the client already runs, Shopify included.",
    image: "img3DAgencyPartnership1",
    mask: "img3DAgencyPartnership",
    tools: ["White-label dev, any stack", "Design + build"],
    outcome: "Starts within 2 weeks",
  },
];
export const comparison = [
  [
    "Who does the work",
    "Me, from first call to launch",
    "Whoever is free",
    "A junior, after the sales pitch",
  ],
  ["Focus", "Conversion first, then looks", "Looks first", "Process first"],
  [
    "Platform range",
    "WordPress, Webflow, Framer, Shopify and React. Picked for your team",
    "The one tool they know",
    "Their house stack, fit or not",
  ],
  ["Time to start", "Within 2 weeks", "Unclear", "4 to 8 weeks"],
  [
    "Communication",
    "Async daily, overlap with US and Canada hours",
    "When they reply",
    "Account manager in the middle",
  ],
  [
    "After launch",
    "You own everything, documented",
    "Hand-off and goodbye",
    "Retainer lock-in",
  ],
  [
    "Next step",
    "Book a 30 min call",
    "Post a job and sort through bids",
    "Fill a form, wait for a sales call",
  ],
];
export const process = [
  {
    label: "01 / RESEARCH",
    title: "Start from data, not guesses.",
    body: "Analytics, reviews and competitor sites, with AI helping sort the patterns faster. I decide what is worth fixing first.",
    tools: ["GA4", "Hotjar", "Claude"],
  },
  {
    label: "02 / EXPERIMENT",
    title: "Test ideas before you commit.",
    body: "Variants and quick prototypes in Figma and code, fast enough to try more than one direction. The winner is the one that moves the number.",
    tools: ["Figma", "Framer", "Claude"],
  },
  {
    label: "03 / DESIGN",
    title: "From wireframe to polished UI.",
    body: "Layouts and copy explored in Figma, with AI speeding up the rounds of options. Brand fit, hierarchy and taste stay hand-made.",
    tools: ["Figma", "Claude"],
  },
  {
    label: "04 / BUILD",
    title: "Shipped on the stack you already use.",
    body: "Webflow, WordPress, Framer, React or Shopify Hydrogen. Claude Code pairs on the build while I own the architecture and review every line.",
    tools: ["Webflow", "WordPress", "React", "Claude Code"],
  },
];
// TODO: confirm real number. Illustration data supplied by Figma, not measured site results.
export const researchIllustration = [
  { label: "Pricing is unclear", value: 72 },
  { label: "Not enough proof", value: 48 },
  { label: "Slow on mobile", value: 26 },
];
export const toolkit = [
  "Figma",
  "Webflow",
  "WordPress",
  "Framer",
  "React",
  "Shopify Hydrogen",
  "JavaScript",
  "Claude",
  "Claude Code",
];
export const logoFor = (tool: string) =>
  (
    ({
      "Shopify Hydrogen": "shopify",
      "HTML/CSS/JS": "javascript",
      "AI-assisted workflows": "claude",
      "Claude Code": "claude-code",
      DaVinci: "davinci-resolve",
      "DaVinci Resolve": "davinci-resolve",
    }) as Record<string, string>
  )[tool] ||
  ([
    "Figma",
    "Webflow",
    "WordPress",
    "Framer",
    "React",
    "JavaScript",
    "Claude",
    "Photoshop",
    "Illustrator",
    "Premiere",
    "After Effects",
    "Final Cut Pro",
    "Krita",
    "Pixelmator Pro",
    "Google Lighthouse",
    "Semrush",
  ].includes(tool)
    ? tool.toLowerCase().replaceAll(" ", "-")
    : undefined);

// TODO: confirm real number. Build illustration from Figma, illustrative status only.
export const buildIllustration = {
  status: "Build passed · 0 errors",
  score: "98 / 100",
};
