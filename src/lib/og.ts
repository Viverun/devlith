// Renders 1200×630 social-preview cards (og:image) at build time, in the site's paper/ink style.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const font = (weight: number) =>
  readFile(require.resolve(`@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${weight}-normal.woff`));

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 800; style: 'normal' }[]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([font(400), font(800)]).then(([regular, bold]) => [
    { name: 'JetBrains Mono', data: regular, weight: 400, style: 'normal' },
    { name: 'JetBrains Mono', data: bold, weight: 800, style: 'normal' },
  ]));

const PAPER = '#f4efe6';
const INK = '#111111';
const MUTED = '#66625a';

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

interface Card {
  /** small line above the title, e.g. "VIVERUN / 003" */
  kicker: string;
  title: string;
  /** one-line subtitle under the title (the post's description) */
  subtitle?: string;
  /** small line at the bottom, e.g. date and topic */
  footer: string;
  /** address shown bottom-right */
  site?: string;
}

export async function renderCard({ kicker, title, subtitle, footer, site = 'viverun.dev/devlith' }: Card): Promise<Buffer> {
  // Shrink long titles so they still fit in four lines.
  const size = title.length > 60 ? 56 : title.length > 32 ? 72 : 88;
  const label = { fontSize: 26, letterSpacing: 2, textTransform: 'uppercase' };

  // Ink outer box + paper inner box draws the frame without padding/border overflowing the canvas.
  const page = el(
    'div',
    {
      // satori sizes the content box: 1176×606 minus the 60/52px padding
      width: 1056,
      height: 502,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '52px 60px',
      background: PAPER,
      color: INK,
      fontFamily: 'JetBrains Mono',
    },
    [
      el('div', { ...label, display: 'flex', fontWeight: 800 }, kicker),
      el('div', { display: 'flex', flexDirection: 'column', gap: 24 }, [
        el(
          'div',
          { display: 'flex', fontSize: size, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2, textTransform: 'uppercase' },
          title,
        ),
        ...(subtitle
          ? [el('div', { display: 'flex', fontSize: 34, lineHeight: 1.3, color: MUTED }, subtitle)]
          : []),
      ]),
      el(
        'div',
        { ...label, display: 'flex', justifyContent: 'space-between', color: MUTED, borderTop: `3px solid ${INK}`, paddingTop: 24 },
        [el('span', {}, footer), el('span', { color: INK, fontWeight: 800 }, site)],
      ),
    ],
  );
  const tree = el('div', { width: 1200, height: 630, display: 'flex', padding: 12, background: INK }, [page]);

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: await loadFonts() });
  return sharp(Buffer.from(svg)).png().toBuffer();
}
