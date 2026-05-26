/**
 * One-time export: dump all articles + products from TiDB → Bunny CDN JSON
 * Run from project root: node scripts/export-and-upload.mjs
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) throw new Error('DATABASE_URL not set');

const BUNNY_KEY = 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const BUNNY_STORAGE = 'https://ny.storage.bunnycdn.com/conscious-elder';

async function uploadToBunny(path, data) {
  const body = JSON.stringify(data, null, 2);
  const url = `${BUNNY_STORAGE}/${path}`;
  console.log(`Uploading ${path} (${(body.length / 1024).toFixed(1)} KB)...`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body).toString(),
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny upload failed ${res.status}: ${text}`);
  }
  console.log(`✓ Uploaded ${path} → HTTP ${res.status}`);
}

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log('Connected to database');

  // Export all articles
  const [articles] = await conn.execute(`
    SELECT id, slug, title, metaDescription, ogTitle, ogDescription,
           category, tags, imageUrl, imageAlt, heroImageUrl, body,
           wordCount, readingTime, author, ctaPrimary, asinsUsed,
           status, createdAt, updatedAt, publishedAt, queuedAt
    FROM articles
    ORDER BY CASE WHEN status='published' THEN 0 ELSE 1 END, publishedAt DESC, createdAt DESC
  `);
  console.log(`Fetched ${articles.length} articles (${articles.filter(a=>a.status==='published').length} published, ${articles.filter(a=>a.status==='queued').length} queued)`);

  // Normalize camelCase
  // Columns are already camelCase in TiDB
  const normalizedArticles = articles;

  // Export all products
  const [products] = await conn.execute(`
    SELECT id, asin, name, category, tags, status, description,
           imageUrl, verifiedAt, lastChecked, lastSpotlightedAt, createdAt
    FROM products
    ORDER BY createdAt DESC
  `);
  console.log(`Fetched ${products.length} products`);

  // Columns are already camelCase in TiDB
  const normalizedProducts = products;

  await conn.end();

  // Upload to Bunny CDN
  await uploadToBunny('data/articles.json', normalizedArticles);
  await uploadToBunny('data/products.json', normalizedProducts);

  console.log('\n✓ All done. Bunny CDN updated with:');
  console.log(`  - ${normalizedArticles.length} articles (${normalizedArticles.filter(a=>a.status==='published').length} published, ${normalizedArticles.filter(a=>a.status==='queued').length} queued)`);
  console.log(`  - ${normalizedProducts.length} products`);
}

main().catch(err => { console.error(err); process.exit(1); });
