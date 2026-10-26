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
  }),
});

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    tag: z.string(),
    date: z.coerce.date(),
    image: z.string(),
  }),
});

export const collections = { projects, posts };
