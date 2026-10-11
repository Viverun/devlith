# viverun.dev

A personal journal. Astro + Markdown, set entirely in JetBrains Mono on warm paper.

## Commands

```sh
npm install
npm run dev                      # http://localhost:4321
npm run new -- "My post title"   # creates a draft in src/content/writing/
npm run build                    # static output in dist/
```

## Writing

Each entry is a Markdown file in `src/content/writing/`:

```md
---
title: Learning to Be Slow
description: One or two sentences — shown on the index and in RSS.
date: 2026-09-27
topic: Thoughts        # groups entries on /writing
draft: true            # visible in dev only; remove to publish
---
```

Issue numbers (`No. 001`, `002`…) are assigned automatically by date.
Site name, hero headline, and links live in `src/site.ts`.
Colors and type scale live at the top of `src/styles/global.css`.

## Deploy (Vercel)

Push to GitHub, import the repo in Vercel — it detects Astro, no config needed.
Then add `viverun.dev` under Project → Settings → Domains.
