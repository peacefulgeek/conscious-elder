/**
 * bunny-store.ts
 * In-memory data store backed by Bunny CDN JSON files.
 *
 * Architecture:
 * - articles-index.json  → metadata only (no body), used for list/search/sitemap
 * - articles/{slug}.json → full article with body, fetched on demand
 * - products.json        → product catalog
 * - herbs.json           → herb/supplement catalog
 *
 * Refreshes index every 5 minutes. Individual article bodies are fetched
 * on demand and cached in memory until the next index refresh.
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
  bunnyUrl?: string | null;
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

export interface HerbProduct {
  id: string;
  name: string;
  brand: string;
  asin: string;
  category: string;
  subcategory: string;
  description: string;
  tags: string[];
  tradition: string;
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

// Index holds metadata only (no body). Body is fetched on demand.
let _index: Omit<Article, 'body'>[] = [];
let _products: Product[] = [];
let _herbs: HerbProduct[] = [];
let _lastFetch = 0;
let _loading = false;

// Per-slug body cache (cleared on index refresh)
const _bodyCache = new Map<string, string | null>();

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
    const [idx, prods, herbs] = await Promise.all([
      // Try new per-slug index first, fall back to old monolithic file
      fetchJson<Omit<Article, 'body'>[]>(`${CDN_BASE}/articles-index.json`).catch(() =>
        fetchJson<Article[]>(`${CDN_BASE}/articles.json`).then(arts =>
          arts.map(({ body: _b, ...meta }) => meta)
        )
      ),
      fetchJson<Product[]>(`${CDN_BASE}/products.json`),
      fetchJson<HerbProduct[]>(`${CDN_BASE}/herbs.json`).catch(() => [] as HerbProduct[]),
    ]);
    _index = idx;
    _products = prods;
    _herbs = herbs;
    _bodyCache.clear();
    _lastFetch = Date.now();
    console.log(`[BunnyStore] Loaded ${_index.length} articles (index), ${_products.length} products, ${_herbs.length} herbs`);
  } catch (err) {
    console.error('[BunnyStore] Failed to load data:', err);
    // Keep stale data if available
  } finally {
    _loading = false;
  }
}

// Ensure store is loaded before any query
async function ensureLoaded() {
  if (_index.length === 0) await loadStore(true);
}

// ── Body fetch (on-demand, cached) ───────────────────────────────────────────

async function fetchArticleBody(slug: string): Promise<string | null> {
  if (_bodyCache.has(slug)) return _bodyCache.get(slug) ?? null;
  try {
    const art = await fetchJson<Article>(`${CDN_BASE}/articles/${slug}.json`);
    const body = art.body ?? null;
    _bodyCache.set(slug, body);
    return body;
  } catch {
    _bodyCache.set(slug, null);
    return null;
  }
}

// ── Write helpers ─────────────────────────────────────────────────────────────

async function bunnyPut(path: string, body: string, contentType = 'application/json'): Promise<void> {
  const res = await fetch(`${BUNNY_STORAGE}${path}`, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_KEY, 'Content-Type': contentType },
    body,
  });
  if (!res.ok) throw new Error(`Bunny PUT ${path} failed: HTTP ${res.status}`);
}

/** Save a single article's JSON file to Bunny CDN */
async function saveArticleFile(article: Article): Promise<void> {
  await bunnyPut(`/data/articles/${article.slug}.json`, JSON.stringify(article, null, 2));
  _bodyCache.set(article.slug, article.body ?? null);
}

/** Rebuild and save the metadata-only index to Bunny CDN */
async function saveIndex(): Promise<void> {
  await bunnyPut('/data/articles-index.json', JSON.stringify(_index, null, 2));
  _lastFetch = Date.now();
}

export async function saveProducts(prods: Product[]): Promise<void> {
  await bunnyPut('/data/products.json', JSON.stringify(prods, null, 2));
  _products = prods;
  _lastFetch = Date.now();
}

// ── Article read helpers ─────────────────────────────────────────────────────

function toCard(a: Omit<Article, 'body'>): ArticleCard {
  return {
    id: a.id, slug: a.slug, title: a.title, metaDescription: a.metaDescription,
    category: a.category, tags: a.tags, imageUrl: a.imageUrl, heroImageUrl: a.heroImageUrl,
    imageAlt: a.imageAlt, wordCount: a.wordCount, readingTime: a.readingTime,
    author: a.author, publishedAt: a.publishedAt, createdAt: a.createdAt,
  };
}

function sortByPublished(arr: Omit<Article, 'body'>[]): Omit<Article, 'body'>[] {
  return [...arr].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db2 = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db2 - da;
  });
}

export async function getPublishedArticles(limit = 20, offset = 0): Promise<ArticleCard[]> {
  await ensureLoaded();
  const published = sortByPublished(_index.filter(a => a.status === 'published'));
  return published.slice(offset, offset + limit).map(toCard);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await ensureLoaded();
  const meta = _index.find(a => a.slug === slug && a.status === 'published');
  if (!meta) return null;
  const body = await fetchArticleBody(slug);
  return { ...meta, body } as Article;
}

export async function searchArticles(query: string, category?: string, limit = 20, offset = 0): Promise<ArticleCard[]> {
  await ensureLoaded();
  let results = _index.filter(a => a.status === 'published');
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
  return _index.filter(a => a.status === 'published').length;
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: string | null; publishedAt: string | null }[]> {
  await ensureLoaded();
  return sortByPublished(_index.filter(a => a.status === 'published'))
    .map(a => ({ slug: a.slug, updatedAt: a.updatedAt, publishedAt: a.publishedAt }));
}

export async function getAllPublishedArticlesForLlms(): Promise<{ slug: string; title: string; category: string; metaDescription: string | null }[]> {
  await ensureLoaded();
  return sortByPublished(_index.filter(a => a.status === 'published'))
    .map(a => ({ slug: a.slug, title: a.title, category: a.category, metaDescription: a.metaDescription }));
}

// ── Queue helpers ─────────────────────────────────────────────────────────────

export async function getPublishedArticleCount(): Promise<number> {
  await ensureLoaded();
  return _index.filter(a => a.status === 'published').length;
}

export async function getQueuedArticleCount(): Promise<number> {
  await ensureLoaded();
  return _index.filter(a => a.status === 'queued').length;
}

export async function getNextQueuedArticle(): Promise<Article | null> {
  await ensureLoaded();
  const queued = [..._index.filter(a => a.status === 'queued')].sort((a, b) => {
    const da = a.queuedAt ? new Date(a.queuedAt).getTime() : 0;
    const db2 = b.queuedAt ? new Date(b.queuedAt).getTime() : 0;
    return da - db2;
  });
  if (!queued[0]) return null;
  const body = await fetchArticleBody(queued[0].slug);
  return { ...queued[0], body } as Article;
}

export async function publishQueuedArticle(id: number, heroImageUrl: string): Promise<void> {
  await ensureLoaded();
  const idx = _index.findIndex(a => a.id === id);
  if (idx === -1) throw new Error(`Article ${id} not found`);
  const now = new Date().toISOString();
  _index[idx] = {
    ..._index[idx],
    status: 'published',
    publishedAt: now,
    heroImageUrl,
    imageUrl: heroImageUrl,
    updatedAt: now,
  };
  // Fetch body and save full article file
  const body = await fetchArticleBody(_index[idx].slug);
  const fullArticle: Article = { ..._index[idx], body } as Article;
  await saveArticleFile(fullArticle);
  await saveIndex();
}

export async function getArticlesForRefresh30d(limit = 10): Promise<Article[]> {
  await ensureLoaded();
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const metas = [..._index.filter(a => a.status === 'published')]
    .filter(a => !a.updatedAt || new Date(a.updatedAt).getTime() < thirtyDaysAgo)
    .sort((a, b) => {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const db2 = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return da - db2;
    })
    .slice(0, limit);
  return Promise.all(metas.map(async m => {
    const body = await fetchArticleBody(m.slug);
    return { ...m, body } as Article;
  }));
}

export async function getArticlesForRefresh90d(limit = 20): Promise<Article[]> {
  await ensureLoaded();
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const metas = [..._index.filter(a => a.status === 'published')]
    .filter(a => !a.updatedAt || new Date(a.updatedAt).getTime() < ninetyDaysAgo)
    .sort((a, b) => {
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : new Date(a.createdAt).getTime();
      const db2 = b.updatedAt ? new Date(b.updatedAt).getTime() : new Date(b.createdAt).getTime();
      return da - db2;
    })
    .slice(0, limit);
  return Promise.all(metas.map(async m => {
    const body = await fetchArticleBody(m.slug);
    return { ...m, body } as Article;
  }));
}

export async function updateArticleBody(id: number, body: string, asinsUsed: string[], wordCount: number): Promise<void> {
  await ensureLoaded();
  const idx = _index.findIndex(a => a.id === id);
  if (idx === -1) throw new Error(`Article ${id} not found`);
  const now = new Date().toISOString();
  _index[idx] = {
    ..._index[idx],
    asinsUsed: JSON.stringify(asinsUsed),
    wordCount,
    updatedAt: now,
  };
  const fullArticle: Article = { ..._index[idx], body } as Article;
  await saveArticleFile(fullArticle);
  await saveIndex();
}

export async function getArticlesContainingAsins(deadAsins: string[]): Promise<Article[]> {
  await ensureLoaded();
  if (deadAsins.length === 0) return [];
  const metas = _index.filter(a =>
    a.status === 'published' &&
    deadAsins.some(asin => (a.asinsUsed ?? '').includes(asin))
  );
  return Promise.all(metas.map(async m => {
    const body = await fetchArticleBody(m.slug);
    return { ...m, body } as Article;
  }));
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

// ── Herb/Supplement helpers ─────────────────────────────────────────────────

export async function getHerbs(opts?: {
  category?: string;
  tradition?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<HerbProduct[]> {
  await ensureLoaded();
  let results = [..._herbs];
  if (opts?.category && opts.category !== 'All') {
    results = results.filter(h => h.category === opts.category);
  }
  if (opts?.tradition) {
    results = results.filter(h => h.tradition === opts.tradition);
  }
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    results = results.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.brand.toLowerCase().includes(q) ||
      h.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  const offset = opts?.offset ?? 0;
  const limit = opts?.limit ?? 200;
  return results.slice(offset, offset + limit);
}

export async function getHerbCategories(): Promise<string[]> {
  await ensureLoaded();
  const cats = new Set(_herbs.map(h => h.category));
  return Array.from(cats).sort();
}

// ── Insert a brand-new article (from cron generation) ────────────────────────

export async function insertArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'> & { id?: number; createdAt?: string; updatedAt?: string }): Promise<void> {
  await ensureLoaded();
  const now = new Date().toISOString();
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
    createdAt: article.createdAt ?? now,
    updatedAt: article.updatedAt ?? now,
    publishedAt: article.publishedAt ?? null,
    queuedAt: article.queuedAt ?? now,
    bunnyUrl: `${CDN_BASE}/articles/${article.slug}.json`,
  };
  // Save full article file to Bunny
  await saveArticleFile(newArticle);
  // Add to index (no body)
  const { body: _b, ...meta } = newArticle;
  _index.push(meta);
  await saveIndex();
}
