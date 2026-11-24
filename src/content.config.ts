import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    topic: z.string().default('Thoughts'),
    draft: z.boolean().default(false),
  }),
});

// Model-testing write-ups live in src/content/model-testing/<model-id>/<slug>.md,
// separate from the journal. The folder name must match a model id in src/lib/models.ts.
const tests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/model-testing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    /** the exact build that was tested, e.g. a GGUF file name */
    build: z.string(),
    /** short hardware line, e.g. "Laptop · Intel Core 5 120U · 15 GB RAM · no GPU" */
    rig: z.string(),
    /** one-line result shown on the model page */
    verdict: z.string(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing, tests };
