/**
 * migrate-to-per-slug-bunny.mjs
 *
 * Reads all articles from the DB and:
 * 1. Uploads each article as /articles/{slug}.json to Bunny CDN
 * 2. Builds a lightweight articles-index.json (no body) and uploads it
 * 3. Keeps the existing articles.json intact as a fallback
 *
 * Run: node scripts/migrate-to-per-slug-bunny.mjs
 */

import mysql from 'mysql2/promise';

const BUNNY_STORAGE = 'https://ny.storage.bunnycdn.com/conscious-elder';
const BUNNY_KEY = process.env.BUNNY_STORAGE_KEY || 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const CDN_BASE = 'https://conscious-elder.b-cdn.net/data';

async function bunnyPut(path, body, contentType = 'application/json') {
  const res = await fetch(`${BUNNY_STORAGE}${path}`, {
    method: 'PUT',
    headers: {
      AccessKey: BUNNY_KEY,
      'Content-Type': contentType,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny PUT ${path} failed: HTTP ${res.status} - ${text}`);
  }
  return res;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Connecting to DB...');
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  // Fetch all articles
  const [rows] = await conn.execute(
    `SELECT id, slug, title, metaDescription, ogTitle, ogDescription, category, tags,
            imageUrl, imageAlt, heroImageUrl, body, wordCount, readingTime, author,
            ctaPrimary, asinsUsed, openerType, conclusionType, hasKaleshBacklink,
            faqCount, status, queuedAt, lastRefreshed30d, lastRefreshed90d,
            createdAt, updatedAt, publishedAt
     FROM articles ORDER BY status, publishedAt DESC`
  );
  await conn.end();

  console.log(`Fetched ${rows.length} articles from DB`);

  const index = [];
  let uploaded = 0;
  let failed = 0;

  for (const row of rows) {
    const article = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      metaDescription: row.metaDescription,
      ogTitle: row.ogTitle,
      ogDescription: row.ogDescription,
      category: row.category,
      tags: row.tags,
      imageUrl: row.imageUrl,
      imageAlt: row.imageAlt,
      heroImageUrl: row.heroImageUrl,
      body: row.body,
      wordCount: row.wordCount,
      readingTime: row.readingTime,
      author: row.author,
      ctaPrimary: row.ctaPrimary,
      asinsUsed: row.asinsUsed,
      openerType: row.openerType,
      conclusionType: row.conclusionType,
      hasKaleshBacklink: row.hasKaleshBacklink,
      faqCount: row.faqCount,
      status: row.status,
      queuedAt: row.queuedAt ? new Date(row.queuedAt).toISOString() : null,
      lastRefreshed30d: row.lastRefreshed30d ? new Date(row.lastRefreshed30d).toISOString() : null,
      lastRefreshed90d: row.lastRefreshed90d ? new Date(row.lastRefreshed90d).toISOString() : null,
      createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
      publishedAt: row.publishedAt ? new Date(row.publishedAt).toISOString() : null,
      bunnyUrl: `${CDN_BASE}/articles/${row.slug}.json`,
    };

    // Upload individual article JSON
    try {
      await bunnyPut(`/data/articles/${row.slug}.json`, JSON.stringify(article, null, 2));
      uploaded++;
      if (uploaded % 50 === 0) console.log(`  Uploaded ${uploaded}/${rows.length}...`);
    } catch (err) {
      console.error(`  FAILED: ${row.slug} - ${err.message}`);
      failed++;
    }

    // Add to index (no body)
    const { body: _body, ...meta } = article;
    index.push(meta);

    // Rate limit: 20 req/s max
    await sleep(55);
  }

  console.log(`\nUploaded ${uploaded} articles, ${failed} failed`);

  // Upload the metadata-only index
  console.log('Uploading articles-index.json...');
  await bunnyPut('/data/articles-index.json', JSON.stringify(index, null, 2));
  console.log('articles-index.json uploaded');

  console.log('\nMigration complete!');
  console.log(`  Per-article files: ${CDN_BASE}/articles/{slug}.json`);
  console.log(`  Metadata index: ${CDN_BASE}/articles-index.json`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
