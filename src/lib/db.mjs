/**
 * db.mjs — Bunny CDN JSON data store for cron jobs.
 * Replaces MySQL with in-memory JSON backed by Bunny CDN.
 * No DATABASE_URL required.
 */

const CDN_BASE = 'https://conscious-elder.b-cdn.net/data';
const BUNNY_STORAGE = 'https://ny.storage.bunnycdn.com/conscious-elder';
const BUNNY_KEY = process.env.BUNNY_STORAGE_KEY || 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';

let _articles = null;
let _products = null;
let _lastFetch = 0;
const REFRESH_MS = 5 * 60 * 1000;

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  return res.json();
}

export async function loadData(force = false) {
  const now = Date.now();
  if (!force && _lastFetch > 0 && now - _lastFetch < REFRESH_MS) return;
  const [arts, prods] = await Promise.all([
    fetchJson(`${CDN_BASE}/articles.json`),
    fetchJson(`${CDN_BASE}/products.json`),
  ]);
  _articles = arts;
  _products = prods;
  _lastFetch = Date.now();
  console.log(`[db.mjs] Loaded ${_articles.length} articles, ${_products.length} products`);
}

async function ensureLoaded() {
  if (!_articles) await loadData(true);
}

async function putJson(path, data) {
  const body = JSON.stringify(data, null, 2);
  const res = await fetch(`${BUNNY_STORAGE}/${path}`, {
    method: 'PUT',
    headers: { 'AccessKey': BUNNY_KEY, 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`Failed to PUT ${path}: HTTP ${res.status}`);
}

export async function getPublishedArticleCount() {
  await ensureLoaded();
  return _articles.filter(a => a.status === 'published').length;
}

export async function getQueuedArticleCount() {
  await ensureLoaded();
  return _articles.filter(a => a.status === 'queued').length;
}

export async function getNextQueuedArticle() {
  await ensureLoaded();
  const queued = _articles
    .filter(a => a.status === 'queued')
    .sort((a, b) => {
      const da = a.queuedAt ? new Date(a.queuedAt).getTime() : 0;
      const db = b.queuedAt ? new Date(b.queuedAt).getTime() : 0;
      return da - db;
    });
  return queued[0] ?? null;
}

export async function publishQueuedArticle(id, heroImageUrl) {
  await ensureLoaded();
  const idx = _articles.findIndex(a => a.id === id);
  if (idx === -1) throw new Error(`Article ${id} not found`);
  _articles[idx] = {
    ..._articles[idx],
    status: 'published',
    publishedAt: new Date().toISOString(),
    heroImageUrl,
    imageUrl: heroImageUrl,
    updatedAt: new Date().toISOString(),
  };
  await putJson('data/articles.json', _articles);
}

export async function insertArticle(article) {
  await ensureLoaded();
  const newArticle = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    queuedAt: new Date().toISOString(),
    publishedAt: null,
    status: 'queued',
    author: 'Kalesh',
    ...article,
  };
  _articles.push(newArticle);
  await putJson('data/articles.json', _articles);
  return newArticle;
}

export async function updateArticleBody(id, body, asinsUsed, wordCount) {
  await ensureLoaded();
  const idx = _articles.findIndex(a => a.id === id);
  if (idx === -1) throw new Error(`Article ${id} not found`);
  _articles[idx] = {
    ..._articles[idx],
    body,
    asinsUsed: JSON.stringify(asinsUsed),
    wordCount,
    updatedAt: new Date().toISOString(),
  };
  await putJson('data/articles.json', _articles);
}

export async function getArticlesForRefresh30d(limit = 10) {
  await ensureLoaded();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return _articles
    .filter(a => a.status === 'published')
    .filter(a => !a.updatedAt || new Date(a.updatedAt).getTime() < thirtyDaysAgo)
    .sort((a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime())
    .slice(0, limit);
}

export async function getArticlesForRefresh90d(limit = 20) {
  await ensureLoaded();
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return _articles
    .filter(a => a.status === 'published')
    .filter(a => !a.updatedAt || new Date(a.updatedAt).getTime() < ninetyDaysAgo)
    .sort((a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime())
    .slice(0, limit);
}

export async function getArticlesContainingAsins(deadAsins) {
  await ensureLoaded();
  if (!deadAsins.length) return [];
  return _articles.filter(a =>
    a.status === 'published' &&
    deadAsins.some(asin => (a.asinsUsed ?? '').includes(asin))
  );
}

export async function getAllPublishedSlugs() {
  await ensureLoaded();
  return _articles
    .filter(a => a.status === 'published')
    .map(a => ({ slug: a.slug, updatedAt: a.updatedAt }));
}

export async function getValidProducts(limit = 200) {
  await ensureLoaded();
  return _products.filter(p => p.status === 'valid').slice(0, limit);
}

export async function getProductsForSpotlight(limit = 10) {
  await ensureLoaded();
  return [..._products.filter(p => p.status === 'valid')]
    .sort((a, b) => {
      const da = a.lastSpotlightedAt ? new Date(a.lastSpotlightedAt).getTime() : 0;
      const db = b.lastSpotlightedAt ? new Date(b.lastSpotlightedAt).getTime() : 0;
      return da - db;
    })
    .slice(0, limit);
}

export async function upsertProduct(product) {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === product.asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], ...product };
  } else {
    _products.push({ id: Date.now(), createdAt: new Date().toISOString(), ...product });
  }
  await putJson('data/products.json', _products);
}

export async function markProductInvalid(asin) {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], status: 'invalid', lastChecked: new Date().toISOString() };
    await putJson('data/products.json', _products);
  }
}

export async function markProductValid(asin, title) {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], status: 'valid', lastChecked: new Date().toISOString(), ...(title ? { name: title } : {}) };
    await putJson('data/products.json', _products);
  }
}

export async function markProductSpotlighted(asin) {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], lastSpotlightedAt: new Date().toISOString() };
    await putJson('data/products.json', _products);
  }
}

// Legacy shim — crons should use named helpers above
export async function query(_sql, _params = []) {
  console.warn('[db.mjs] query() called — use named helpers instead');
  return { rows: [] };
}

export async function close() {
  // No-op
}
