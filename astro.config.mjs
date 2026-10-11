// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import desk from './integrations/desk.mjs';

export default defineConfig({
  site: 'https://devlith.vercel.app',
  // The writing desk only exists while running `npm run dev` on your machine.
  integrations: [sitemap(), desk({ path: '/viverun-desk' })],
  markdown: {
    shikiConfig: { theme: 'vitesse-light', wrap: false },
  },
});
