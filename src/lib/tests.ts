import { getCollection, type CollectionEntry } from 'astro:content';

export type Test = CollectionEntry<'tests'> & { model: string; slug: string; minutes: number };

/** Published model-testing write-ups, newest first. `model` comes from the folder name. */
export async function getTests(model?: string): Promise<Test[]> {
  const entries = await getCollection('tests', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries
    .map((entry) => {
      const [m, ...rest] = entry.id.split('/');
      return {
        ...entry,
        model: m,
        slug: rest.join('/'),
        minutes: Math.max(1, Math.round((entry.body ?? '').split(/\s+/).filter(Boolean).length / 200)),
      };
    })
    .filter((t) => !model || t.model === model)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
