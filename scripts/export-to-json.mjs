/**
 * export-to-json.mjs
 * Exports all articles (published + queued) and products from TiDB to JSON files,
 * then uploads them to Bunny CDN at:
 *   https://conscious-elder.b-cdn.net/data/articles.json
 *   https://conscious-elder.b-cdn.net/data/products.json
 */
import mysql from 'mysql2/promise';
import fs from 'fs';
import https from 'https';
import http from 'http';

const BUNNY_KEY = 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const BUNNY_STORAGE = 'ny.storage.bunnycdn.com';
const BUNNY_ZONE = 'conscious-elder';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ── Export articles ──────────────────────────────────────────────────────────
const [articles] = await conn.execute(
  `SELECT 
    id, slug, title, metaDescription, ogTitle, ogDescription, category, tags,
    imageUrl, imageAlt, heroImageUrl, body, wordCount, readingTime, author,
    ctaPrimary, asinsUsed, openerType, conclusionType, hasKaleshBacklink, faqCount,
    status, createdAt, updatedAt, publishedAt, queuedAt
   FROM articles 
   ORDER BY FIELD(status,'published','queued'), publishedAt DESC, createdAt DESC`
);

console.log(`Exported ${articles.length} articles (${articles.filter(a=>a.status==='published').length} published, ${articles.filter(a=>a.status==='queued').length} queued)`);

// ── Export products ──────────────────────────────────────────────────────────
const [products] = await conn.execute(
  `SELECT id, asin, name, category, tags, verifiedAt, lastChecked, status,
          lastSpotlightedAt, createdAt, description, imageUrl
   FROM products ORDER BY category, name`
);

console.log(`Exported ${products.length} products`);

await conn.end();

// ── Serialize dates to ISO strings ──────────────────────────────────────────
function serializeDates(rows) {
  return rows.map(row => {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
      out[k] = v instanceof Date ? v.toISOString() : v;
    }
    return out;
  });
}

const articlesJson = JSON.stringify(serializeDates(articles), null, 2);
const productsJson = JSON.stringify(serializeDates(products), null, 2);

fs.writeFileSync('/tmp/articles.json', articlesJson);
fs.writeFileSync('/tmp/products.json', productsJson);
console.log(`articles.json: ${(articlesJson.length / 1024 / 1024).toFixed(1)} MB`);
console.log(`products.json: ${(productsJson.length / 1024).toFixed(0)} KB`);

// ── Upload to Bunny CDN ──────────────────────────────────────────────────────
async function uploadToBunny(localPath, remotePath, contentType = 'application/json') {
  const data = fs.readFileSync(localPath);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BUNNY_STORAGE,
      path: `/${BUNNY_ZONE}/${remotePath}`,
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_KEY,
        'Content-Type': contentType,
        'Content-Length': data.length,
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

console.log('\nUploading to Bunny CDN...');

const r1 = await uploadToBunny('/tmp/articles.json', 'data/articles.json');
console.log(`articles.json uploaded: HTTP ${r1.status}`);

const r2 = await uploadToBunny('/tmp/products.json', 'data/products.json');
console.log(`products.json uploaded: HTTP ${r2.status}`);

// ── Verify ───────────────────────────────────────────────────────────────────
async function verify(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let size = 0;
      res.on('data', d => size += d.length);
      res.on('end', () => resolve({ status: res.statusCode, size }));
    }).on('error', (e) => resolve({ status: 0, error: e.message }));
  });
}

const v1 = await verify('https://conscious-elder.b-cdn.net/data/articles.json');
console.log(`\nVerify articles.json: HTTP ${v1.status}, ${(v1.size/1024/1024).toFixed(1)} MB`);

const v2 = await verify('https://conscious-elder.b-cdn.net/data/products.json');
console.log(`Verify products.json: HTTP ${v2.status}, ${(v2.size/1024).toFixed(0)} KB`);

console.log('\nDone. CDN URLs:');
console.log('  https://conscious-elder.b-cdn.net/data/articles.json');
console.log('  https://conscious-elder.b-cdn.net/data/products.json');
