// Private writing desk. Exists ONLY under `astro dev` (on your machine);
// it is never part of `astro build`, so the live site has no editor, no API, no login.
import { readFile, writeFile, readdir, mkdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { parse, stringify } from 'yaml';

const run = promisify(execFile);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** @param {{ path?: string }} [opts] */
export default function desk(opts = {}) {
  const route = opts.path ?? '/desk';
  const api = `${route}/api`;

  return {
    name: 'viverun-desk',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, logger }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: route, entrypoint: './src/desk/Desk.astro', prerender: true });
        logger.info(`Writing desk → http://localhost:4321${route}`);
      },

      'astro:server:setup': ({ server }) => {
        const root = server.config.root;
        const dir = path.join(root, 'src/content/writing');
        const imgDir = path.join(root, 'public/images');
        const fileFor = (slug) => path.join(dir, `${slug}.md`);

        const readPost = async (slug) => {
          const raw = await readFile(fileFor(slug), 'utf8');
          const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
          const data = m ? parse(m[1]) ?? {} : {};
          const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
          return { slug, ...data, date, draft: Boolean(data.draft), body: (m ? m[2] : raw).replace(/^\s*\n/, '') };
        };

        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url ?? '/', 'http://localhost');
          if (!url.pathname.startsWith(api)) return next();

          // Only accept requests from this machine.
          const ip = req.socket.remoteAddress ?? '';
          if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(ip)) {
            res.statusCode = 403;
            return res.end('forbidden');
          }

          const send = (status, body) => {
            res.statusCode = status;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify(body));
          };
          const body = async () => {
            let s = '';
            for await (const chunk of req) s += chunk;
            return s ? JSON.parse(s) : {};
          };
          const action = url.pathname.slice(api.length);

          try {
            if (req.method === 'GET' && action === '/list') {
              const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
              const posts = await Promise.all(files.map((f) => readPost(f.slice(0, -3))));
              posts.sort((a, b) => b.date.localeCompare(a.date));
              return send(200, posts.map(({ body: _b, ...meta }) => meta));
            }

            if (req.method === 'GET' && action === '/post') {
              const slug = url.searchParams.get('slug') ?? '';
              if (!SLUG.test(slug) || !existsSync(fileFor(slug))) return send(404, { error: 'Not found' });
              return send(200, await readPost(slug));
            }

            if (req.method === 'POST' && action === '/save') {
              const p = await body();
              if (!SLUG.test(p.slug ?? '')) return send(400, { error: 'URL slug may only use a-z, 0-9 and dashes.' });
              if (!p.title?.trim()) return send(400, { error: 'Title is required.' });
              if (p.slug !== p.originalSlug && existsSync(fileFor(p.slug)))
                return send(409, { error: `A post called "${p.slug}" already exists.` });

              const front = {
                title: p.title.trim(),
                description: (p.description ?? '').trim(),
                date: p.date || new Date().toISOString().slice(0, 10),
                topic: (p.topic ?? '').trim() || 'Thoughts',
                draft: Boolean(p.draft),
              };
              const md = `---\n${stringify(front).trim()}\n---\n\n${(p.body ?? '').trim()}\n`;
              await writeFile(fileFor(p.slug), md);
              // Slug was renamed: keep the file on disk tidy (git sees it as a rename).
              if (p.originalSlug && p.originalSlug !== p.slug && SLUG.test(p.originalSlug)) {
                await unlink(fileFor(p.originalSlug)).catch(() => {});
              }
              return send(200, { ok: true, slug: p.slug });
            }

            if (req.method === 'POST' && action === '/upload') {
              const name = (url.searchParams.get('name') ?? 'image').toLowerCase().replace(/[^a-z0-9.]+/g, '-');
              if (!/\.(png|jpe?g|gif|webp|avif|svg)$/.test(name)) return send(400, { error: 'Images only.' });
              const chunks = [];
              for await (const chunk of req) chunks.push(chunk);
              await mkdir(imgDir, { recursive: true });
              const file = `${Date.now().toString(36)}-${name}`;
              await writeFile(path.join(imgDir, file), Buffer.concat(chunks));
              return send(200, { url: `/images/${file}` });
            }

            if (req.method === 'POST' && action === '/push') {
              const { slug, message } = await body();
              if (!SLUG.test(slug ?? '')) return send(400, { error: 'Save the post first.' });
              const git = (...args) => run('git', args, { cwd: root });
              const log = [];
              await git('add', '-A', 'src/content/writing', 'public/images').catch(() => git('add', '-A', 'src/content/writing'));
              const { stdout: staged } = await git('diff', '--cached', '--name-only');
              if (staged.trim()) {
                const r = await git('commit', '-m', message || `Writing: ${slug}`);
                log.push(r.stdout.trim());
              } else log.push('Nothing new to commit.');
              const { stdout: remotes } = await git('remote');
              if (!remotes.trim()) {
                log.push('No git remote yet — committed locally. Add GitHub + Vercel, then Push will publish.');
                return send(200, { ok: true, log: log.join('\n') });
              }
              const r = await git('push');
              log.push((r.stdout + r.stderr).trim() || 'Pushed.');
              return send(200, { ok: true, log: log.join('\n') });
            }

            return send(404, { error: 'Unknown action' });
          } catch (err) {
            return send(500, { error: err.stderr?.toString() || err.message });
          }
        });
      },
    },
  };
}
