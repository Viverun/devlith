// Usage: npm run new -- "My post title"
import { writeFileSync, existsSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new -- "My post title"');
  process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const file = `src/content/writing/${slug}.md`;
if (existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${date}
topic: Thoughts
draft: true
---

Start writing here.
`,
);
console.log(`Created ${file} (draft: true — flip to false to publish)`);
