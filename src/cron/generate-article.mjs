/**
 * Cron job 1: Article publisher with Phase 1 / Phase 2 release logic.
 *
 * Phase 1 (published < 60): fires 5x/day (07:00, 10:00, 13:00, 16:00, 19:00 UTC) every day.
 * Phase 2 (published >= 60): fires 1x/weekday (08:00 UTC, Mon-Fri only).
 *
 * Each run:
 *   1. Check the queue. If a queued article exists, publish it (assign hero image, set status=published).
 *   2. If the queue is empty, generate a fresh article via DeepSeek V4-Pro, pass it through the
 *      quality gate, and insert it directly as published.
 *
 * AUTO_GEN_ENABLED must be "true" to run.
 */

import { generateArticle } from '../lib/deepseek-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { assignHeroImage } from '../lib/bunny-image-library.mjs';
import {
  getPublishedArticleCount,
  getNextQueuedArticle,
  publishQueuedArticle,
  insertArticle,
} from '../lib/db.mjs';

const MAX_RETRIES = 4;

async function getPublishedCount() {
  return getPublishedArticleCount();
}

async function getNextQueued() {
  return getNextQueuedArticle();
}

async function publishQueued(id, heroImageUrl) {
  return publishQueuedArticle(id, heroImageUrl);
}

// ── Fresh generation fallback ────────────────────────────────────────────────

const FALLBACK_TOPICS = [
  'How to Build a Morning Ritual That Actually Fits Your Age',
  'The TCM Herbs That Support Longevity After 60',
  'Why Lion\'s Mane Mushroom Is Worth Considering for Brain Health',
  'What Conscious Aging Really Means and Why It Matters',
  'The Art of Letting Go: Downsizing Without Losing Yourself',
  'How Meditation Changes the Aging Brain',
  'Legacy Letters: How to Write What You Actually Want to Leave Behind',
  'The Quiet Power of Intergenerational Friendship',
  'CoQ10, Magnesium, and the Supplements Worth Knowing About',
  'How to Talk to Your Adult Children About End-of-Life Wishes',
  'The Balance Problem Nobody Talks About After 65',
  'Grief Is Not a Problem to Solve',
  'Why Retirement Is the Wrong Frame for the Next Chapter',
  'The Japanese Concept of Ikigai and What It Means for Elders',
  'How to Find Your People After 70',
  'The Case for Slowing Down Deliberately',
  'What Tai Chi Actually Does for the Aging Body',
  'The Wisdom of Swedish Death Cleaning',
  'How to Be a Good Elder in a World That Ignores Elders',
  'The Science of Loneliness and What Elders Can Do About It',
];

async function getUnusedFallbackTopic() {
  const { loadData } = await import('../lib/db.mjs');
  await loadData();
  // Use fallback list directly - titles are unique enough
  const used = new Set();
  const unused = FALLBACK_TOPICS.filter(t => !used.has(t.toLowerCase()));
  if (unused.length === 0) {
    return `${FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)]} (Revisited)`;
  }
  return unused[0];
}

async function generateAndPublishFresh() {
  const topic = await getUnusedFallbackTopic();
  console.log(`[generate-article] Fresh generation for topic: "${topic}"`);

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    attempts++;
    console.log(`[generate-article] Attempt ${attempts}/${MAX_RETRIES}`);
    try {
      const article = await generateArticle(topic);
      const gate = runQualityGate(article.body);

      if (!gate.passed) {
        console.warn(`[generate-article] Quality gate failed (attempt ${attempts}):`, gate.failures);
        if (attempts < MAX_RETRIES) continue;
        console.error('[generate-article] All retries exhausted. Skipping.');
        return;
      }

      const heroImageUrl = await assignHeroImage(article.slug);
      const wordCount = gate.wordCount;
      const readingTime = Math.ceil(wordCount / 200);

      await insertArticle({
        slug: article.slug,
        title: article.title,
        metaDescription: article.excerpt || '',
        ogTitle: article.title,
        ogDescription: article.excerpt || '',
        category: article.category || 'Conscious Aging',
        tags: JSON.stringify(article.tags || []),
        body: article.body,
        wordCount,
        readingTime,
        asinsUsed: JSON.stringify(gate.asins || []),
        heroImageUrl,
        imageUrl: heroImageUrl,
        status: 'published',
        publishedAt: new Date().toISOString(),
      });

      console.log(`[generate-article] SUCCESS (fresh): "${article.title}" (${wordCount} words)`);
      return;
    } catch (err) {
      console.error(`[generate-article] Error on attempt ${attempts}:`, err);
      if (attempts >= MAX_RETRIES) throw err;
    }
  }
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function generateNewArticle() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate-article] Skipped: AUTO_GEN_ENABLED != true');
    return;
  }

  // Try to publish from queue first
  const queued = await getNextQueued();
  if (queued) {
    console.log(`[generate-article] Publishing queued article: "${queued.title}" (id=${queued.id})`);
    try {
      const heroImageUrl = await assignHeroImage(queued.slug);
      await publishQueued(queued.id, heroImageUrl);
      console.log(`[generate-article] SUCCESS (queue): "${queued.title}" -> ${heroImageUrl}`);
    } catch (err) {
      console.error('[generate-article] Failed to publish queued article:', err);
    }
    return;
  }

  // Queue empty - generate fresh
  console.log('[generate-article] Queue empty. Generating fresh article.');
  await generateAndPublishFresh();
}
