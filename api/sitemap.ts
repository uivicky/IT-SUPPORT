import { ALL_ISSUES } from '../src/data/issuesIndex';

const STATIC_ROUTES = [
  '/',
  '/beginners',
  '/learning-lab',
  '/challenges',
  '/simulator',
  '/issues',
  '/quick-desk',
  '/ai-assistant',
  '/windows-troubleshooting',
  '/networking-solutions',
  '/active-directory-guide',
  '/microsoft-365-guide',
  '/windows-server-guide',
  '/linux-troubleshooting',
  '/azure-cloud-guide',
  '/commands',
  '/networking-tools',
  '/interview-questions',
  '/roadmap',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
];

export default function handler(req: any, res: any) {
  const proto = req.headers?.['x-forwarded-proto'] || 'https';
  const host = req.headers?.host || 'itsupport.vercel.app';
  const baseUrl =
    process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
      ? process.env.APP_URL.replace(/\/$/, '')
      : `${proto}://${host}`;
  const today = new Date().toISOString().split('T')[0];

  const staticEntries = STATIC_ROUTES.map(
    (route) =>
      `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
  );

  const issueEntries = ALL_ISSUES.map(
    (issue) =>
      `  <url>\n    <loc>${baseUrl}/issues/${issue.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticEntries,
    ...issueEntries,
  ].join('\n')}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  return res.status(200).send(xml);
}
