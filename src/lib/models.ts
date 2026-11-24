// The models listed under /model-testing. Each one gets a page at /model-testing/<id>,
// and its write-ups live in src/content/model-testing/<id>/.
// Marks are drawn in the site's ink-on-paper style (64×64 viewBox, inner markup only);
// they are simplified tributes, not the vendors' official logos.

export interface Model {
  id: string;
  name: string;
  maker: string;
  /** one line under the name on the index */
  blurb: string;
  /** inner SVG markup for a 64×64 viewBox, drawn in currentColor */
  mark: string;
}

/** n tapered rays around the centre, for the Claude spark */
const burst = (n: number, inner: number, outer: number, half: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const p = (r: number, da: number) =>
      `${(32 + r * Math.cos(a + da)).toFixed(2)} ${(32 + r * Math.sin(a + da)).toFixed(2)}`;
    return `M${p(inner, -half)} L${p(outer, 0)} L${p(inner, half)} Z`;
  }).join(' ');

/** six capsules turned 60° apart, for the GPT knot */
const knot = Array.from(
  { length: 6 },
  (_, i) =>
    `<rect x="33" y="10" width="11" height="20" rx="5.5" transform="rotate(${i * 60} 32 32)" fill="none" stroke="currentColor" stroke-width="2.6"/>`,
).join('');

export const MODELS: Model[] = [
  {
    id: 'inkling',
    name: 'Inkling',
    maker: 'Thinking Machines Lab',
    blurb: 'Open-weight looped mixture-of-experts. Tested squeezed to 2 bits on a laptop CPU.',
    mark:
      '<path d="M32 9C32 9 15 29 15 40a17 17 0 0 0 34 0C49 29 32 9 32 9Z" fill="currentColor"/>' +
      '<path d="M39.5 40a7.5 7.5 0 1 1-2.2-5.3" fill="none" stroke="#f4efe6" stroke-width="2.8" stroke-linecap="square"/>' +
      '<path d="M40.5 31.5v5h-5" fill="none" stroke="#f4efe6" stroke-width="2.8" stroke-linecap="square"/>',
  },
  {
    id: 'claude',
    name: 'Claude',
    maker: 'Anthropic',
    blurb: 'Frontier assistant model. Write-ups coming.',
    mark: `<path d="${burst(12, 5, 24, 0.17)}" fill="currentColor"/><circle cx="32" cy="32" r="5.5" fill="currentColor"/>`,
  },
  {
    id: 'gpt',
    name: 'GPT',
    maker: 'OpenAI',
    blurb: 'Frontier assistant model. Write-ups coming.',
    mark: knot,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    maker: 'DeepSeek',
    blurb: 'Open-weight reasoning models. Write-ups coming.',
    mark:
      '<path d="M8 35c0-9 11-15 23-14 10 1 17 5 20 11l7-6-2 10 5 6-9-2c-4 7-13 11-23 10C17 49 8 43 8 35Z" fill="currentColor"/>' +
      '<circle cx="21" cy="32" r="2.2" fill="#f4efe6"/>' +
      '<path d="M15 40c6 3 14 3 21 0" fill="none" stroke="#f4efe6" stroke-width="2" stroke-linecap="round"/>',
  },
];

export const getModel = (id: string) => MODELS.find((m) => m.id === id);
