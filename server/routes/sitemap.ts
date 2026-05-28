import express from 'express';
import { getAllPublishedSlugs } from '../db';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (_req, res) => {
  try {
    // Returns newest first (sorted by publishedAt desc in getAllPublishedSlugs)
    const slugs = await getAllPublishedSlugs();
    const baseUrl = 'https://consciouselder.com';
    const now = new Date().toISOString();

    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily', lastmod: now },
      { loc: '/articles', priority: '0.9', changefreq: 'daily', lastmod: now },
      { loc: '/recommended', priority: '0.8', changefreq: 'weekly', lastmod: now },
      { loc: '/herbs', priority: '0.8', changefreq: 'weekly', lastmod: now },
      { loc: '/assessments', priority: '0.7', changefreq: 'monthly', lastmod: now },
      { loc: '/about', priority: '0.7', changefreq: 'monthly', lastmod: now },
      { loc: '/privacy', priority: '0.5', changefreq: 'yearly', lastmod: now },
    ];

    // Articles sorted newest first, ISO-8601 lastmod
    const articleEntries = slugs.map(({ slug, updatedAt, publishedAt }) => ({
      loc: `/articles/${slug}`,
      lastmod: (updatedAt || publishedAt)
        ? new Date(updatedAt ?? publishedAt!).toISOString()
        : now,
      priority: '0.8',
      changefreq: 'monthly',
    }));

    const allEntries = [...staticPages, ...articleEntries];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allEntries.map(e => `  <url>
    <loc>${baseUrl}${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('[sitemap] error:', err);
    res.status(500).send('Error generating sitemap');
  }
});
