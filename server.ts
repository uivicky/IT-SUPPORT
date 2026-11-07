import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleTroubleshootRequest, isGeminiConfigured } from './api/ai/troubleshoot.ts';
import { handleInlineAiRequest } from './api/ai.ts';
import { ALL_ISSUES } from './src/data/issuesIndex.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      aiConfigured: isGeminiConfigured(),
      issueCount: ALL_ISSUES.length,
    });
  });

  app.post('/api/ai', async (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.ip ||
      'anonymous';

    const result = await handleInlineAiRequest({
      clientIp,
      body: req.body || {},
    });

    if (result.headers) {
      for (const [k, v] of Object.entries(result.headers)) {
        res.setHeader(k, v);
      }
    }
    res.status(result.status).json(result.payload);
  });

  app.post('/api/ai/troubleshoot', async (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '') ||
      req.ip ||
      'anonymous';

    const result = await handleTroubleshootRequest({
      clientIp,
      body: req.body || {},
    });

    if (result.headers) {
      for (const [k, v] of Object.entries(result.headers)) {
        res.setHeader(k, v);
      }
    }
    res.status(result.status).json(result.payload);
  });

  app.get('/robots.txt', (req, res) => {
    const baseUrl =
      (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
        ? process.env.APP_URL
        : `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl =
      (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
        ? process.env.APP_URL
        : `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
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

    res.type('application/xml').send(xml);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IT SUPPORT server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
