/**
 * Pre-build script to generate public/sitemap.xml
 * Ensures Vercel and any static hosting deploy with a complete, pre-rendered sitemap
 * containing all 325+ IT troubleshooting runbooks and 23 canonical static routes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_ISSUES } from '../src/data/issuesIndex.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANONICAL_ORIGIN = 'https://it-support-engg.vercel.app';

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

export function buildSitemapXml(origin: string = CANONICAL_ORIGIN): string {
  const today = new Date().toISOString().split('T')[0];

  const staticEntries = STATIC_ROUTES.map((route) => {
    const priority = route === '/' ? '1.0' : route.includes('troubleshooting') || route === '/issues' ? '0.9' : '0.8';
    return `  <url>\n    <loc>${origin}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
  });

  const issueEntries = ALL_ISSUES.map((issue) => {
    return `  <url>\n    <loc>${origin}/issues/${issue.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticEntries,
    ...issueEntries,
  ].join('\n')}\n</urlset>`;
}

export function run(): void {
  const xml = buildSitemapXml(CANONICAL_ORIGIN);
  const outPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Generated public/sitemap.xml with ${STATIC_ROUTES.length + ALL_ISSUES.length} URLs (Origin: ${CANONICAL_ORIGIN})`);
}

// Execute if run directly as CLI entrypoint
const isMain = process.argv[1] && process.argv[1].endsWith('generate-sitemap.ts');
if (isMain) {
  run();
}
