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
        : 'https://it-support-engg.vercel.app').replace(/\/$/, '');
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl =
      (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
        ? process.env.APP_URL
        : 'https://it-support-engg.vercel.app').replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const staticEntries = STATIC_ROUTES.map((route) => {
      const priority = route === '/' ? '1.0' : route.includes('troubleshooting') || route === '/issues' ? '0.9' : '0.8';
      return `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    });

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

  // Secure Server-Side IndexNow API route for Bing & Yandex instant indexing
  app.post('/api/indexnow', async (req, res) => {
    const indexNowApiKey = process.env.INDEXNOW_API_KEY;
    if (!indexNowApiKey) {
      res.status(503).json({
        error: 'IndexNow is not configured. Add INDEXNOW_API_KEY in environment variables.',
      });
      return;
    }

    const { urlList, host = 'it-support-engg.vercel.app' } = req.body || {};
    if (!Array.isArray(urlList) || urlList.length === 0) {
      res.status(400).json({ error: 'urlList must be a non-empty array of URLs.' });
      return;
    }

    try {
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host,
          key: indexNowApiKey,
          keyLocation: `https://${host}/${indexNowApiKey}.txt`,
          urlList: urlList.slice(0, 1000),
        }),
      });

      res.status(response.status).json({
        status: response.status,
        statusText: response.statusText,
        submittedUrls: urlList.length,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      res.status(502).json({ error: 'Failed to submit URLs to IndexNow', details: errorMsg });
    }
  });

  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));

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
