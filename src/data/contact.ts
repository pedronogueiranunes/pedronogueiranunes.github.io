// First form step. Values are sent to Web3Forms as `route` and match the `?route=` query.
export const routes = [
  ["A project for my company", "project"],
  ["Agency partnership or white-label", "agency"],
  ["A full-time or contract role", "role"],
] as const;
export const needs = [
  "Website design + build",
  "Brand identity",
  "Design system",
  "CRO audit or redesign",
  "Something else",
];
export const agencyNeeds = ["Design", "Development", "Both"];
export const platforms = [
  ["WordPress", "wordpress"],
  ["Webflow", "webflow"],
  ["Framer", "framer"],
  ["Shopify", "shopify"],
  ["React / Next.js", "react"],
  ["Help me choose", ""],
];
export const budgets = ["$5k to $10k", "$10k to $20k", "$20k to $40k", "$40k+", "Not sure yet"];
export const agencyBudgets = ["Per project", "Monthly capacity", "Not sure yet"];
export const startDates = ["ASAP", "This month", "Next quarter"];
export const nextSteps = [
  ["Within one business day", "I reply by email with a couple of quick questions."],
  ["A 30-minute call", "We go through your goals on a screen share, in US or European hours."],
  [
    "You decide",
    "You get a written scope and price range. Hire me or take it elsewhere, no pressure.",
  ],
];

// Placeholder until Pedro has an authorized client quote; the page hides this block while the quote contains "[".
export const testimonial = {
  quote: '"[Short client quote.]"',
  rating: "5/5",
  attribution: "[Name] · [Company]",
};
