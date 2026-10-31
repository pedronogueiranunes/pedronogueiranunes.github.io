import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    category: z.string(),
    year: z.string(),
    country: z.string().optional(),
    image: z.string(),
    color: z.string().optional(),
    featured: z.boolean().default(false),
    collection: z.boolean().default(false),
    trail: z.string().optional(),
    order: z.number(),
    summary: z.string().default(""),
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    tools: z.array(z.string()).default([]),
    cover: z.string().optional(),
    tint: z.string().optional(),
    location: z.string().optional(),
    caseSlug: z.string().optional(),
    strategyTitle: z.string().optional(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string() })).default([]),
    designSystem: z.object({
      colors: z.array(z.object({ name: z.string(), value: z.string().regex(/^#[0-9a-fA-F]{6}$/) })),
      fontFamily: z.string(),
      headingWeight: z.number().default(700),
      radius: z.number().min(0).max(64),
      buttonLabel: z.string(),
    }).optional(),
    architecture: z.array(z.object({ title: z.string(), body: z.string(), icon: z.string() })).default([]),
  }),
});

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    tag: z.string(),
    category: z.enum(["design", "motion", "career"]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    image: z.string(),
    cover: z.string(),
    // Layout fixtures: the body renders in dev only and the page is noindex until replaced.
    mock: z.boolean().default(false),
  }),
});

export const collections = { projects, posts };
