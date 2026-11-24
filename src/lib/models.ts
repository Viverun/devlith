// The models listed under /model-testing. Each one gets a page at /model-testing/<id>,
// and its write-ups live in src/content/model-testing/<id>/.
import { LOGOS } from './logos';

export interface Model {
  id: string;
  name: string;
  maker: string;
  /** one line under the name on the index */
  blurb: string;
  /** the maker's logo as inner SVG markup for a 24×24 viewBox, drawn in currentColor */
  logo: string;
}

export const MODELS: Model[] = [
  {
    id: 'inkling',
    name: 'Inkling',
    maker: 'Thinking Machines Lab',
    blurb: 'Open-weight looped mixture-of-experts. Tested squeezed to 2 bits on a laptop CPU.',
    logo: LOGOS.thinkingmachines,
  },
  {
    id: 'claude',
    name: 'Claude',
    maker: 'Anthropic',
    blurb: 'Frontier assistant model. Write-ups coming.',
    logo: LOGOS.claude,
  },
  {
    id: 'gpt',
    name: 'GPT',
    maker: 'OpenAI',
    blurb: 'Frontier assistant model. Write-ups coming.',
    logo: LOGOS.openai,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    maker: 'DeepSeek',
    blurb: 'Open-weight reasoning models. Write-ups coming.',
    logo: LOGOS.deepseek,
  },
];

export const getModel = (id: string) => MODELS.find((m) => m.id === id);
