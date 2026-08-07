import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    year: z.string(),
    image: z.string(),
    color: z.string().optional(),
    featured: z.boolean().default(false),
    trail: z.string().optional(),
    order: z.number(),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    tag: z.string(),
    date: z.coerce.date(),
    image: z.string(),
  }),
});

export const collections = { projects, posts };
