// One preview card per post at /og/<slug>.png, plus /og/site.png for every other page.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, fmtDate } from '../../lib/posts';
import { renderCard } from '../../lib/og';
import { SITE } from '../../site';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  return [
    {
      params: { slug: 'site' },
      props: { kicker: `${SITE.name} / journal`, title: SITE.hero.join(' '), subtitle: SITE.description, footer: `by ${SITE.author}` },
    },
    ...posts.map((post) => ({
      params: { slug: post.id },
      props: {
        kicker: `${SITE.name} / ${post.no}`,
        title: post.data.title,
        subtitle: post.data.description,
        footer: `${fmtDate(post.data.date)} · ${post.data.topic}`,
      },
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderCard(props as Parameters<typeof renderCard>[0])), {
    headers: { 'Content-Type': 'image/png' },
  });
