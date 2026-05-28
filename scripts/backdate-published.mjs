/**
 * backdate-published.mjs
 *
 * Spreads the 30 published articles across the prior 3 months
 * with realistic publishing cadence (Mon-Fri, 6am-10am UTC).
 * Updates both the Bunny CDN per-slug JSON and the articles-index.json.
 *
 * Run: node scripts/backdate-published.mjs
 */

const BUNNY_STORAGE = 'https://ny.storage.bunnycdn.com/conscious-elder';
const BUNNY_KEY = process.env.BUNNY_STORAGE_KEY || 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const CDN_BASE = 'https://conscious-elder.b-cdn.net/data';

async function bunnyGet(path) {
  const res = await fetch(`${CDN_BASE}${path}`, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) throw new Error(`GET ${path} failed: HTTP ${res.status}`);
  return res.json();
}

async function bunnyPut(path, body) {
  const res = await fetch(`${BUNNY_STORAGE}${path}`, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_KEY, 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: HTTP ${res.status}`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Generate a realistic publish date: Mon-Fri, 6am-10am UTC, within past 90 days */
function generatePublishDate(index, total) {
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  // Spread evenly across 90 days
  const spread = (now - ninetyDaysAgo) / total;
  let ts = ninetyDaysAgo + spread * index + Math.random() * spread * 0.5;

  // Adjust to a weekday
  const d = new Date(ts);
  const dow = d.getUTCDay(); // 0=Sun, 6=Sat
  if (dow === 0) ts += 24 * 60 * 60 * 1000; // Sun -> Mon
  if (dow === 6) ts += 2 * 24 * 60 * 60 * 1000; // Sat -> Mon

  // Set time to 6am-10am UTC
  const hour = 6 + Math.floor(Math.random() * 4);
  const min = Math.floor(Math.random() * 60);
  const pub = new Date(ts);
  pub.setUTCHours(hour, min, 0, 0);
  return pub.toISOString();
}

async function main() {
  console.log('Fetching articles-index.json...');
  const index = await bunnyGet('/articles-index.json');

  const published = index.filter(a => a.status === 'published');
  const queued = index.filter(a => a.status === 'queued');
  console.log(`Found ${published.length} published, ${queued.length} queued`);

  // Sort published by their current publishedAt (oldest first) to maintain relative order
  published.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return da - db;
  });

  console.log('Backdating published articles...');
  const updatedIndex = [...index];

  for (let i = 0; i < published.length; i++) {
    const article = published[i];
    const newPublishedAt = generatePublishDate(i, published.length);
    const newUpdatedAt = new Date(new Date(newPublishedAt).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

    // Update in index
    const idxPos = updatedIndex.findIndex(a => a.slug === article.slug);
    if (idxPos >= 0) {
      updatedIndex[idxPos] = { ...updatedIndex[idxPos], publishedAt: newPublishedAt, updatedAt: newUpdatedAt };
    }

    // Fetch and update per-slug JSON
    try {
      const fullArticle = await bunnyGet(`/articles/${article.slug}.json`);
      fullArticle.publishedAt = newPublishedAt;
      fullArticle.updatedAt = newUpdatedAt;
      await bunnyPut(`/data/articles/${article.slug}.json`, JSON.stringify(fullArticle, null, 2));
      console.log(`  [${i + 1}/${published.length}] ${article.slug} -> ${newPublishedAt.split('T')[0]}`);
    } catch (err) {
      console.error(`  FAILED: ${article.slug} - ${err.message}`);
    }

    await sleep(55);
  }

  // Save updated index
  console.log('\nSaving updated articles-index.json...');
  await bunnyPut('/data/articles-index.json', JSON.stringify(updatedIndex, null, 2));

  console.log('\nBackdating complete!');
  console.log(`  ${published.length} articles spread across prior 3 months`);
  console.log(`  Oldest: ${generatePublishDate(0, published.length).split('T')[0]}`);
}

main().catch(err => {
  console.error('Backdating failed:', err);
  process.exit(1);
});
