import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, products, quizResults, Article, InsertArticle, Product, InsertProduct, InsertQuizResult } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Article helpers ──────────────────────────────────────────────

export async function getPublishedArticles(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: articles.id, slug: articles.slug, title: articles.title,
    metaDescription: articles.metaDescription, category: articles.category,
    tags: articles.tags, imageUrl: articles.imageUrl, heroImageUrl: articles.heroImageUrl,
    imageAlt: articles.imageAlt, wordCount: articles.wordCount, readingTime: articles.readingTime,
    author: articles.author, publishedAt: articles.publishedAt, createdAt: articles.createdAt,
  }).from(articles)
    .where(eq(articles.status, 'published'))
    .orderBy(desc(articles.publishedAt))
    .limit(limit).offset(offset);
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(and(eq(articles.slug, slug), eq(articles.status, 'published'))).limit(1);
  return result[0] ?? null;
}

export async function searchArticles(query: string, category?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(articles.status, 'published')];
  if (query) conditions.push(or(like(articles.title, `%${query}%`), like(articles.metaDescription, `%${query}%`)) as any);
  if (category) conditions.push(eq(articles.category, category));
  return db.select({
    id: articles.id, slug: articles.slug, title: articles.title,
    metaDescription: articles.metaDescription, category: articles.category,
    tags: articles.tags, imageUrl: articles.imageUrl, heroImageUrl: articles.heroImageUrl,
    imageAlt: articles.imageAlt, wordCount: articles.wordCount, readingTime: articles.readingTime,
    author: articles.author, publishedAt: articles.publishedAt,
  }).from(articles).where(and(...conditions)).orderBy(desc(articles.publishedAt)).limit(limit).offset(offset);
}

export async function getArticleCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'published'));
  return result[0]?.count ?? 0;
}

export async function insertArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(articles).values(article);
  return result;
}

export async function updateArticleBody(id: number, body: string, asinsUsed: string[], wordCount: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(articles).set({ body, asinsUsed: JSON.stringify(asinsUsed), wordCount, updatedAt: new Date() }).where(eq(articles.id, id));
}

export async function getArticlesForRefresh30d(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles)
    .where(and(
      eq(articles.status, 'published'),
      or(sql`${articles.lastRefreshed30d} IS NULL`, sql`${articles.lastRefreshed30d} < DATE_SUB(NOW(), INTERVAL 30 DAY)`) as any
    ))
    .orderBy(sql`COALESCE(${articles.lastRefreshed30d}, ${articles.createdAt}) ASC`)
    .limit(limit);
}

export async function getArticlesForRefresh90d(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles)
    .where(and(
      eq(articles.status, 'published'),
      or(sql`${articles.lastRefreshed90d} IS NULL`, sql`${articles.lastRefreshed90d} < DATE_SUB(NOW(), INTERVAL 90 DAY)`) as any
    ))
    .orderBy(sql`COALESCE(${articles.lastRefreshed90d}, ${articles.createdAt}) ASC`)
    .limit(limit);
}

export async function getArticlesContainingAsins(deadAsins: string[]) {
  const db = await getDb();
  if (!db) return [];
  if (deadAsins.length === 0) return [];
  const conditions = deadAsins.map(asin => like(articles.asinsUsed, `%${asin}%`));
  return db.select().from(articles).where(and(eq(articles.status, 'published'), or(...conditions) as any));
}

export async function getAllPublishedSlugs() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.status, 'published'));
}

// ─── Queue helpers ──────────────────────────────────────────────

export async function getPublishedArticleCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'published'));
  return Number(result[0]?.count ?? 0);
}

export async function getQueuedArticleCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, 'queued'));
  return Number(result[0]?.count ?? 0);
}

export async function getNextQueuedArticle() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles)
    .where(eq(articles.status, 'queued'))
    .orderBy(articles.queuedAt)
    .limit(1);
  return result[0] ?? null;
}

export async function publishQueuedArticle(id: number, heroImageUrl: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.update(articles).set({
    status: 'published',
    publishedAt: new Date(),
    heroImageUrl,
    imageUrl: heroImageUrl,
    updatedAt: new Date(),
  }).where(eq(articles.id, id));
}

// ─── Product helpers ──────────────────────────────────────────────

export async function getValidProducts(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.status, 'valid')).limit(limit);
}

export async function upsertProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  return db.insert(products).values(product).onDuplicateKeyUpdate({
    set: { name: product.name, category: product.category, tags: product.tags, status: product.status, verifiedAt: product.verifiedAt, lastChecked: product.lastChecked }
  });
}

export async function markProductInvalid(asin: string) {
  const db = await getDb();
  if (!db) return;
  return db.update(products).set({ status: 'invalid', lastChecked: new Date() }).where(eq(products.asin, asin));
}

export async function markProductValid(asin: string, title?: string) {
  const db = await getDb();
  if (!db) return;
  const set: Partial<Product> = { status: 'valid', lastChecked: new Date() };
  if (title) set.name = title;
  return db.update(products).set(set).where(eq(products.asin, asin));
}

export async function getProductsForSpotlight() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(eq(products.status, 'valid'))
    .orderBy(sql`COALESCE(${products.lastSpotlightedAt}, '1970-01-01') ASC`)
    .limit(10);
}

// ─── Quiz result helpers ──────────────────────────────────────────

export async function saveQuizResult(result: InsertQuizResult) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const inserted = await db.insert(quizResults).values(result);
  return inserted;
}

export async function getQuizHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizResults)
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.createdAt))
    .limit(limit);
}

export async function getLatestQuizResultByDomain(userId: number, quizId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(quizResults)
    .where(and(eq(quizResults.userId, userId), eq(quizResults.quizId, quizId)))
    .orderBy(desc(quizResults.createdAt))
    .limit(1);
  return result[0] ?? null;
}
