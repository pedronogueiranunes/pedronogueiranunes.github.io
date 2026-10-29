// Blog categories. Each maps to the service a reader of that topic most likely needs,
// so the end-of-post and category CTAs deep link into the matching contact route.
export const categories = [
  {
    slug: "design",
    label: "Design",
    description: "Design systems, UI and the decisions that keep a brand consistent as it grows.",
    cta: {
      title: "Need a design system your team will actually use?",
      body: "I design the identity, turn it into a system and ship it in the platform you already run.",
      label: "Talk about a design system",
      href: `/contact?service=${encodeURIComponent("Brand identity and design systems")}`,
    },
  },
  {
    slug: "motion",
    label: "Motion",
    description: "Animation and interaction that earn their place on a page, measured against conversion.",
    cta: {
      title: "Want motion that helps the page sell?",
      body: "I design and build interaction for marketing sites, tested against the goal of the page.",
      label: "Plan a website project",
      href: `/contact?service=${encodeURIComponent("Website design and build")}`,
    },
  },
  {
    slug: "career",
    label: "Career",
    description: "Notes on freelancing, remote work and partnering with agencies across time zones.",
    cta: {
      title: "Looking for a senior partner for your agency?",
      body: "Design, build or both, white-label and in your hours. One person from brief to launch.",
      label: "Talk about a partnership",
      href: "/contact?route=agency",
    },
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];
export const categoryBySlug = (slug: string) => categories.find((category) => category.slug === slug);

// ponytail: words / 225 per minute, rounded up; good enough for a meta line.
export const readingMinutes = (body: string) =>
  Math.max(1, Math.ceil(body.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length / 225));
