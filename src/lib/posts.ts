import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'writing'> & { no: string; minutes: number };

/** Published posts, newest first, each with a stable issue number (oldest = 001). */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('writing', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries
    .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf())
    .map((entry, i) => ({
      ...entry,
      no: String(i + 1).padStart(3, '0'),
      minutes: Math.max(1, Math.round((entry.body ?? '').split(/\s+/).filter(Boolean).length / 200)),
    }))
    .reverse();
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const fmtDate = (d: Date) =>
  `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
