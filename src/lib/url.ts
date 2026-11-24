// Prefix a root path with the deploy base ('/' on Vercel, '/devlith' on GitHub Pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

// Sections that viverun.dev serves at the domain root instead of under /devlith.
// viverun.dev's vercel.json proxies /model-testing/* to this site's /devlith/model-testing/*,
// so these links skip the base and the address bar stays at viverun.dev/model-testing/.
const ROOT_SECTIONS = ['/model-testing'];
const atRoot = (path: string) => ROOT_SECTIONS.some((s) => path === s || path.startsWith(`${s}/`));

export const url = (path: string) => (path === '/' ? `${base}/` : atRoot(path) ? path : `${base}${path}`);

// Strip the base back off, for comparing against nav hrefs.
export const unbase = (pathname: string) => pathname.slice(base.length) || '/';

/** The public path a page is reached at, for canonical links. */
export const publicPath = (pathname: string) => {
  const p = unbase(pathname);
  return atRoot(p) ? p : pathname;
};
