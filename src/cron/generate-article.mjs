/**
 * Cron job 1: Generate a new article (Mon-Fri 06:00 UTC).
 * AUTO_GEN_ENABLED must be "true" to run.
 */
import { generateArticle } from '../lib/anthropic-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsinBatch, buildAmazonUrl } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';

const MAX_RETRIES = 3;

// 30-topic queue - rotates through topics
const TOPIC_QUEUE = [
  'How to Build a Morning Ritual That Actually Fits Your Age',
  'The TCM Herbs That Support Longevity After 60',
  'Why Lion\'s Mane Mushroom Is Worth Considering for Brain Health',
  'What Conscious Aging Really Means and Why It Matters',
  'The Art of Letting Go: Downsizing Without Losing Yourself',
  'How Meditation Changes the Aging Brain',
  'Legacy Letters: How to Write What You Actually Want to Leave Behind',
  'The Quiet Power of Intergenerational Friendship',
  'What Ram Dass Taught Me About Getting Older',
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
  'Why Your Sleep Changes After 60 and What Helps',
  'Astragalus and the Longevity Herbs of Traditional Chinese Medicine',
  'The Art of Mentoring: Passing What You Know to the Next Generation',
  'How to Write Your Memoir When You Think You Have Nothing to Say',
  'The Spiritual Dimension of Physical Decline',
  'What Happens When You Stop Fighting Your Age',
  'The Financial Wisdom Nobody Teaches You Before Retirement',
  'How to Stay Curious When the World Feels Like It\'s Moving Too Fast',
  'The Gift of Limitations: What Constraint Teaches Conscious Elders',
];

async function getNextTopic() {
  // Check which topics have already been used
  const { rows } = await query('SELECT title FROM articles WHERE status = "published"');
  const usedTitles = new Set(rows.map(r => r.title.toLowerCase()));
  const unused = TOPIC_QUEUE.filter(t => !usedTitles.has(t.toLowerCase()));
  if (unused.length === 0) {
    // All topics used - generate a variation
    return `${TOPIC_QUEUE[Math.floor(Math.random() * TOPIC_QUEUE.length)]} (Revisited)`;
  }
  return unused[0];
}

export async function generateNewArticle() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate-article] Skipped: AUTO_GEN_ENABLED != true');
    return;
  }

  const topic = await getNextTopic();
  console.log(`[generate-article] Topic: "${topic}"`);

  // Determine backlink (23% of articles)
  const includeKaleshBacklink = Math.random() < 0.23;
  // FAQ count (varies)
  const faqCounts = [0, 0, 0, 3, 5];
  const faqCount = faqCounts[Math.floor(Math.random() * faqCounts.length)];

  let attempts = 0;
  let lastGateResult = null;

  while (attempts < MAX_RETRIES) {
    attempts++;
    console.log(`[generate-article] Attempt ${attempts}/${MAX_RETRIES}`);

    try {
      const article = await generateArticle({
        topic,
        includeKaleshBacklink,
        faqCount,
      });

      // Run quality gate
      const gate = runQualityGate(article.body);
      lastGateResult = gate;

      if (!gate.passed) {
        console.warn(`[generate-article] Quality gate failed (attempt ${attempts}):`, gate.failures);
        if (attempts < MAX_RETRIES) continue;
        console.error('[generate-article] All retries exhausted. Skipping article.');
        return;
      }

      // Verify ASINs
      const asinResults = await verifyAsinBatch(gate.asins, {
        delayMs: 2500,
        onProgress: (i, total, r) => {
          console.log(`[generate-article] ASIN ${i}/${total}: ${r.asin} = ${r.valid ? 'valid' : 'INVALID: ' + r.reason}`);
        }
      });

      const deadAsins = asinResults.filter(r => !r.valid).map(r => r.asin);
      if (deadAsins.length > 0) {
        console.warn(`[generate-article] Dead ASINs found: ${deadAsins.join(', ')} - skipping article`);
        if (attempts < MAX_RETRIES) continue;
        return;
      }

      // Store in database
      const wordCount = gate.wordCount;
      const readingTime = Math.ceil(wordCount / 200);

      await query(
        `INSERT INTO articles (slug, title, metaDescription, ogTitle, ogDescription, category, tags, body, wordCount, readingTime, author, asinsUsed, openerType, conclusionType, hasKaleshBacklink, faqCount, status, publishedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW())
         ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), updatedAt=NOW()`,
        [
          article.slug,
          article.title,
          article.metaDescription || '',
          article.ogTitle || article.title,
          article.ogDescription || article.metaDescription || '',
          article.category,
          JSON.stringify(article.tags || []),
          article.body,
          wordCount,
          readingTime,
          'Kalesh',
          JSON.stringify(gate.asins),
          article.openerType,
          article.conclusionType,
          includeKaleshBacklink ? 1 : 0,
          faqCount,
        ]
      );

      console.log(`[generate-article] SUCCESS: "${article.title}" (${wordCount} words, ${gate.amazonLinks} links)`);
      return;
    } catch (err) {
      console.error(`[generate-article] Error on attempt ${attempts}:`, err);
      if (attempts >= MAX_RETRIES) throw err;
    }
  }
}
