// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import desk from './integrations/desk.mjs';

// GitHub Pages builds set SITE_URL/BASE_PATH; Vercel builds use the defaults.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://devlith.vercel.app',
  base: process.env.BASE_PATH ?? '/',
  // The writing desk only exists while running `npm run dev` on your machine.
  integrations: [sitemap(), desk({ path: '/viverun-desk' })],
  markdown: {
    shikiConfig: { theme: 'vitesse-light', wrap: false },
  },
});
