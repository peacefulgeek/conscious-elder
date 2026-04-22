import express from 'express';
import { getAllPublishedSlugs } from '../db';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (_req, res) => {
  try {
    const slugs = await getAllPublishedSlugs();
    const baseUrl = 'https://consciouselder.com';
    const now = new Date().toISOString().split('T')[0];

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/articles', priority: '0.9', changefreq: 'daily' },
      { loc: '/recommended', priority: '0.8', changefreq: 'weekly' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
    ];

    const articleEntries = slugs.map(({ slug, updatedAt }) => ({
      loc: `/articles/${slug}`,
      lastmod: updatedAt ? new Date(updatedAt).toISOString().split('T')[0] : now,
      priority: '0.8',
      changefreq: 'monthly',
    }));

    const allEntries = [...staticPages.map(p => ({ ...p, lastmod: now })), ...articleEntries];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(e => `  <url>
    <loc>${baseUrl}${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('[sitemap] error:', err);
    res.status(500).send('Error generating sitemap');
  }
});
