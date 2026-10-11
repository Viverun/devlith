// Prefix a root path with the deploy base ('/' on Vercel, '/devlith' on GitHub Pages).
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string) => (path === '/' ? `${base}/` : `${base}${path}`);

// Strip the base back off, for comparing against nav hrefs.
export const unbase = (pathname: string) => pathname.slice(base.length) || '/';
