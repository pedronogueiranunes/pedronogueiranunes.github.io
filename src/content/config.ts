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
    archivedWebsite: z.boolean().default(false),
    studio: z.string().optional(),
    filmType: z.string().optional(),
    practice: z.enum(["Professional work", "Personal project"]).optional(),
    films: z.array(z.object({
      youtubeId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
      title: z.string(),
      duration: z.string(),
      poster: z.string(),
      credits: z.string().optional(),
    })).default([]),
    releases: z.array(z.object({
      title: z.string(),
      type: z.string(),
      year: z.string(),
      cover: z.string(),
      spotifyId: z.string().regex(/^[a-zA-Z0-9]{22}$/),
    })).default([]),
    listenOn: z.array(z.object({ platform: z.string(), url: z.string().url() })).default([]),
    kinds: z.array(z.string()).optional(),
    trail: z.string().optional(),
    order: z.number(),
    summary: z.string().default(""),
    metrics: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
    tools: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    duration: z.string().optional(),
    cover: z.string().optional(),
    tint: z.string().optional(),
    location: z.string().optional(),
    caseSlug: z.string().optional(),
    strategyTitle: z.string().optional(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string(), video: z.string().optional() })).default([]),
    designSystem: z.object({
      colors: z.array(z.object({ name: z.string(), value: z.string().regex(/^#[0-9a-fA-F]{6}$/) })),
      fontFamily: z.string(),
      headingWeight: z.number().default(700),
      radius: z.number().min(0).max(64),
      buttonLabel: z.string(),
    }).optional(),
    brand: z.object({
      rationale: z.string().default(""),
      references: z.array(z.object({ title: z.string(), url: z.string().url().optional(), note: z.string().default("") })).default([]),
      comments: z.string().default(""),
      groups: z.array(z.object({
        id: z.string(), title: z.string(), cols: z.number().default(2),
        rationale: z.string().default(""),
        references: z.array(z.object({ title: z.string(), url: z.string().url().optional(), note: z.string().default("") })).default([]),
        comments: z.string().default(""),
        palette: z.array(z.object({ name: z.string(), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) })).default([]),
        fonts: z.array(z.object({ name: z.string(), note: z.string().default("") })).default([]),
        items: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string(), bg: z.string().optional() })).default([]),
      })),
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
