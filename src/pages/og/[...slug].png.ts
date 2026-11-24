// One preview card per post at /og/<slug>.png, plus /og/site.png for every other page.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPosts, fmtDate } from '../../lib/posts';
import { renderCard } from '../../lib/og';
import { SITE } from '../../site';
import { getTests } from '../../lib/tests';
import { getModel } from '../../lib/models';

export const getStaticPaths = (async () => {
  const posts = await getPosts();
  const tests = await getTests();
  return [
    {
      params: { slug: 'site' },
      props: { kicker: `${SITE.name} / journal`, title: SITE.hero.join(' '), subtitle: SITE.description, footer: `by ${SITE.author}` },
    },
    {
      params: { slug: 'model-testing' },
      props: {
        kicker: `${SITE.name} / lab`,
        title: 'Model testing',
        subtitle: 'Hands-on tests of AI models: what they get right, where they break, and how they think.',
        footer: `by ${SITE.author}`,
        site: 'viverun.dev/model-testing',
      },
    },
    ...tests.map((t) => ({
      params: { slug: `model-testing/${t.model}/${t.slug}` },
      props: {
        kicker: `${SITE.name} / model testing / ${getModel(t.model)?.name ?? t.model}`,
        title: t.data.title,
        subtitle: t.data.description,
        footer: fmtDate(t.data.date),
        site: 'viverun.dev/model-testing',
      },
    })),
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
