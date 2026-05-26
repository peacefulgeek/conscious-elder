/**
 * db.ts — thin shim that re-exports all helpers from bunny-store.ts
 * All article/product data is now stored as JSON on Bunny CDN.
 * No database connection required.
 */
export {
  loadStore,
  getPublishedArticles,
  getArticleBySlug,
  searchArticles,
  getArticleCount,
  getAllPublishedSlugs,
  getPublishedArticleCount,
  getQueuedArticleCount,
  getNextQueuedArticle,
  publishQueuedArticle,
  getArticlesForRefresh30d,
  getArticlesForRefresh90d,
  updateArticleBody,
  getArticlesContainingAsins,
  insertArticle,
  getValidProducts,
  getProductsForSpotlight,
  upsertProduct,
  markProductInvalid,
  markProductValid,
  markProductSpotlighted,
} from './bunny-store';

// ── User helpers (kept for OAuth session support) ─────────────────────────────
// Users are not persisted — sessions are JWT-only, no DB needed.
// We return a minimal in-memory User object so the OAuth flow type-checks.

import type { User } from '../drizzle/schema';

const _userCache = new Map<string, User>();

export async function upsertUser(user: { openId: string; name?: string | null; email?: string | null; loginMethod?: string | null; lastSignedIn?: Date; role?: 'user' | 'admin' }): Promise<void> {
  const existing = _userCache.get(user.openId);
  const now = new Date();
  _userCache.set(user.openId, {
    id: existing?.id ?? Math.abs(hashCode(user.openId)),
    openId: user.openId,
    name: user.name ?? existing?.name ?? null,
    email: user.email ?? existing?.email ?? null,
    loginMethod: user.loginMethod ?? existing?.loginMethod ?? null,
    role: user.role ?? existing?.role ?? 'user',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastSignedIn: user.lastSignedIn ?? now,
  });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  return _userCache.get(openId);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h || 1;
}

// ── Quiz result helpers (results shown on screen, not saved) ──────────────────

interface QuizResult {
  id: number;
  userId: number;
  quizId: string;
  domain: string;
  score: number;
  maxScore: number;
  tier: string;
  answers: string;
  createdAt: Date;
}

export async function saveQuizResult(_result: unknown): Promise<void> {
  // No-op: quiz results are not persisted per user request
}

export async function getQuizHistory(_userId: number, _limit = 20): Promise<QuizResult[]> {
  return [];
}

export async function getLatestQuizResultByDomain(_userId: number, _quizId: string): Promise<QuizResult | null> {
  return null;
}
