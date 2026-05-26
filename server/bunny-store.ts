/**
 * bunny-store.ts
 * In-memory data store backed by Bunny CDN JSON files.
 * Replaces all database calls for articles and products.
 * Refreshes every 5 minutes from CDN.
 */

const CDN_BASE = 'https://conscious-elder.b-cdn.net/data';
const BUNNY_STORAGE = 'https://ny.storage.bunnycdn.com/conscious-elder';
const BUNNY_KEY = process.env.BUNNY_STORAGE_KEY || 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const REFRESH_MS = 5 * 60 * 1000; // 5 minutes

// ── Types ────────────────────────────────────────────────────────────────────

export interface Article {
  id: number;
  slug: string;
  title: string;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  category: string;
  tags: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  heroImageUrl: string | null;
  body: string | null;
  wordCount: number | null;
  readingTime: number | null;
  author: string | null;
  ctaPrimary: string | null;
  asinsUsed: string | null;
  status: 'published' | 'queued';
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  queuedAt: string | null;
}

// Card-level article (safe subset returned by list/search queries)
export interface ArticleCard {
  id: number;
  slug: string;
  title: string;
  metaDescription: string | null;
  category: string;
  tags: string | null;
  imageUrl: string | null;
  heroImageUrl: string | null;
  imageAlt: string | null;
  wordCount: number | null;
  readingTime: number | null;
  author: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  asin: string;
  name: string;
  category: string | null;
  tags: string | null;
  status: string;
  description: string | null;
  imageUrl: string | null;
  verifiedAt: string | null;
  lastChecked: string | null;
  lastSpotlightedAt: string | null;
  createdAt: string;
}

// ── In-memory store ──────────────────────────────────────────────────────────

let _articles: Article[] = [];
let _products: Product[] = [];
let _lastFetch = 0;
let _loading = false;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function loadStore(force = false): Promise<void> {
  const now = Date.now();
  if (!force && _lastFetch > 0 && now - _lastFetch < REFRESH_MS) return;
  if (_loading) return;
  _loading = true;
  try {
    const [arts, prods] = await Promise.all([
      fetchJson<Article[]>(`${CDN_BASE}/articles.json`),
      fetchJson<Product[]>(`${CDN_BASE}/products.json`),
    ]);
    _articles = arts;
    _products = prods;
    _lastFetch = Date.now();
    console.log(`[BunnyStore] Loaded ${_articles.length} articles, ${_products.length} products`);
  } catch (err) {
    console.error('[BunnyStore] Failed to load data:', err);
    // Keep stale data if available
  } finally {
    _loading = false;
  }
}

// Ensure store is loaded before any query
async function ensureLoaded() {
  if (_articles.length === 0) await loadStore(true);
}

// ── Write helpers (update JSON on Bunny CDN) ─────────────────────────────────

export async function saveArticles(arts: Article[]): Promise<void> {
  const body = JSON.stringify(arts, null, 2);
  const res = await fetch(`${BUNNY_STORAGE}/data/articles.json`, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_KEY,
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!res.ok) throw new Error(`Failed to save articles.json: HTTP ${res.status}`);
  _articles = arts;
  _lastFetch = Date.now();
}

export async function saveProducts(prods: Product[]): Promise<void> {
  const body = JSON.stringify(prods, null, 2);
  const res = await fetch(`${BUNNY_STORAGE}/data/products.json`, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_KEY,
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!res.ok) throw new Error(`Failed to save products.json: HTTP ${res.status}`);
  _products = prods;
  _lastFetch = Date.now();
}

// ── Article read helpers ─────────────────────────────────────────────────────

function toCard(a: Article): ArticleCard {
  return {
    id: a.id, slug: a.slug, title: a.title, metaDescription: a.metaDescription,
    category: a.category, tags: a.tags, imageUrl: a.imageUrl, heroImageUrl: a.heroImageUrl,
    imageAlt: a.imageAlt, wordCount: a.wordCount, readingTime: a.readingTime,
    author: a.author, publishedAt: a.publishedAt, createdAt: a.createdAt,
  };
}

function sortByPublished(arr: Article[]): Article[] {
  return [...arr].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db2 = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db2 - da;
  });
}

export async function getPublishedArticles(limit = 20, offset = 0): Promise<ArticleCard[]> {
  await ensureLoaded();
  const published = sortByPublished(_articles.filter(a => a.status === 'published'));
  return published.slice(offset, offset + limit).map(toCard);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await ensureLoaded();
  return _articles.find(a => a.slug === slug && a.status === 'published') ?? null;
}

export async function searchArticles(query: string, category?: string, limit = 20, offset = 0): Promise<ArticleCard[]> {
  await ensureLoaded();
  let results = _articles.filter(a => a.status === 'published');
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.metaDescription ?? '').toLowerCase().includes(q)
    );
  }
  if (category) {
    results = results.filter(a => a.category === category);
  }
  return sortByPublished(results).slice(offset, offset + limit).map(toCard);
}

export async function getArticleCount(): Promise<number> {
  await ensureLoaded();
  return _articles.filter(a => a.status === 'published').length;
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: string | null }[]> {
  await ensureLoaded();
  return _articles
    .filter(a => a.status === 'published')
    .map(a => ({ slug: a.slug, updatedAt: a.updatedAt }));
}

// ── Queue helpers ─────────────────────────────────────────────────────────────

export async function getPublishedArticleCount(): Promise<number> {
  await ensureLoaded();
  return _articles.filter(a => a.status === 'published').length;
}

export async function getQueuedArticleCount(): Promise<number> {
  await ensureLoaded();
  return _articles.filter(a => a.status === 'queued').length;
}

export async function getNextQueuedArticle(): Promise<Article | null> {
  await ensureLoaded();
  const queued = [..._articles.filter(a => a.status === 'queued')].sort((a, b) => {
    const da = a.queuedAt ? new Date(a.queuedAt).getTime() : 0;
    const db2 = b.queuedAt ? new Date(b.queuedAt).getTime() : 0;
    return da - db2;
  });
  return queued[0] ?? null;
}

export async function publishQueuedArticle(id: number, heroImageUrl: string): Promise<void> {
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
  await saveArticles(_articles);
}

export async function getArticlesForRefresh30d(limit = 10): Promise<Article[]> {
  await ensureLoaded();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return [..._articles.filter(a => a.status === 'published')]
    .filter(a => !a.updatedAt || new Date(a.updatedAt).getTime() < thirtyDaysAgo)
    .sort((a, b) => {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const db2 = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return da - db2;
    })
    .slice(0, limit);
}

export async function getArticlesForRefresh90d(limit = 20): Promise<Article[]> {
  await ensureLoaded();
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return [..._articles.filter(a => a.status === 'published')]
    .filter(a => !a.updatedAt || new Date(a.updatedAt).getTime() < ninetyDaysAgo)
    .sort((a, b) => {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const db2 = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return da - db2;
    })
    .slice(0, limit);
}

export async function updateArticleBody(id: number, body: string, asinsUsed: string[], wordCount: number): Promise<void> {
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
  await saveArticles(_articles);
}

export async function getArticlesContainingAsins(deadAsins: string[]): Promise<Article[]> {
  await ensureLoaded();
  if (deadAsins.length === 0) return [];
  return _articles.filter(a =>
    a.status === 'published' &&
    deadAsins.some(asin => (a.asinsUsed ?? '').includes(asin))
  );
}

// ── Product helpers ───────────────────────────────────────────────────────────

export async function getValidProducts(limit = 200): Promise<Product[]> {
  await ensureLoaded();
  return _products.filter(p => p.status === 'valid').slice(0, limit);
}

export async function getProductsForSpotlight(limit = 10): Promise<Product[]> {
  await ensureLoaded();
  return [..._products.filter(p => p.status === 'valid')]
    .sort((a, b) => {
      const da = a.lastSpotlightedAt ? new Date(a.lastSpotlightedAt).getTime() : 0;
      const db2 = b.lastSpotlightedAt ? new Date(b.lastSpotlightedAt).getTime() : 0;
      return da - db2;
    })
    .slice(0, limit);
}

export async function upsertProduct(product: Partial<Product> & { asin: string }): Promise<void> {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === product.asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], ...product } as Product;
  } else {
    _products.push({
      id: Date.now(),
      name: product.name ?? '',
      category: product.category ?? null,
      tags: product.tags ?? null,
      status: product.status ?? 'valid',
      description: product.description ?? null,
      imageUrl: product.imageUrl ?? null,
      verifiedAt: product.verifiedAt ?? null,
      lastChecked: product.lastChecked ?? null,
      lastSpotlightedAt: product.lastSpotlightedAt ?? null,
      createdAt: new Date().toISOString(),
      ...product,
    } as Product);
  }
  await saveProducts(_products);
}

export async function markProductInvalid(asin: string): Promise<void> {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], status: 'invalid', lastChecked: new Date().toISOString() };
    await saveProducts(_products);
  }
}

export async function markProductValid(asin: string, title?: string): Promise<void> {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === asin);
  if (idx >= 0) {
    _products[idx] = {
      ..._products[idx],
      status: 'valid',
      lastChecked: new Date().toISOString(),
      ...(title ? { name: title } : {}),
    };
    await saveProducts(_products);
  }
}

export async function markProductSpotlighted(asin: string): Promise<void> {
  await ensureLoaded();
  const idx = _products.findIndex(p => p.asin === asin);
  if (idx >= 0) {
    _products[idx] = { ..._products[idx], lastSpotlightedAt: new Date().toISOString() };
    await saveProducts(_products);
  }
}

// ── Insert a brand-new article (from cron generation) ────────────────────────

export async function insertArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & { id?: number; createdAt?: string; updatedAt?: string }): Promise<void> {
  await ensureLoaded();
  const newArticle: Article = {
    id: article.id ?? Date.now(),
    slug: article.slug,
    title: article.title,
    metaDescription: article.metaDescription ?? null,
    ogTitle: article.ogTitle ?? null,
    ogDescription: article.ogDescription ?? null,
    category: article.category ?? 'conscious-aging',
    tags: article.tags ?? null,
    imageUrl: article.imageUrl ?? null,
    imageAlt: article.imageAlt ?? null,
    heroImageUrl: article.heroImageUrl ?? null,
    body: article.body ?? null,
    wordCount: article.wordCount ?? null,
    readingTime: article.readingTime ?? null,
    author: article.author ?? 'Kalesh',
    ctaPrimary: article.ctaPrimary ?? null,
    asinsUsed: article.asinsUsed ?? null,
    status: article.status ?? 'queued',
    createdAt: article.createdAt ?? new Date().toISOString(),
    updatedAt: article.updatedAt ?? new Date().toISOString(),
    publishedAt: article.publishedAt ?? null,
    queuedAt: article.queuedAt ?? new Date().toISOString(),
  };
  _articles.push(newArticle);
  await saveArticles(_articles);
}
