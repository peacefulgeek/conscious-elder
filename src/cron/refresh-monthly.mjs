/**
 * Cron job 3: Monthly content refresh - 1st of month 03:00 UTC.
 * Refreshes articles older than 30 days.
 * AUTO_GEN_ENABLED must be "true" to run.
 */
import { query } from '../lib/db.mjs';
import { generateArticle } from '../lib/anthropic-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';

export async function refreshMonthly() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[refresh-monthly] Skipped: AUTO_GEN_ENABLED != true');
    return;
  }

  const { rows } = await query(
    `SELECT id, slug, title, category, tags, asinsUsed FROM articles
     WHERE status = 'published'
     AND (lastRefreshed30d IS NULL OR lastRefreshed30d < DATE_SUB(NOW(), INTERVAL 30 DAY))
     ORDER BY COALESCE(lastRefreshed30d, createdAt) ASC
     LIMIT 10`
  );

  console.log(`[refresh-monthly] Found ${rows.length} articles to refresh`);

  for (const article of rows) {
    try {
      console.log(`[refresh-monthly] Refreshing: "${article.title}"`);

      const refreshed = await generateArticle({
        topic: article.title,
        includeKaleshBacklink: Math.random() < 0.23,
        faqCount: 0,
      });

      const gate = runQualityGate(refreshed.body);
      if (!gate.passed) {
        console.warn(`[refresh-monthly] Quality gate failed for "${article.title}":`, gate.failures);
        continue;
      }

      await query(
        `UPDATE articles SET body = ?, wordCount = ?, updatedAt = NOW(), lastRefreshed30d = NOW() WHERE id = ?`,
        [refreshed.body, gate.wordCount, article.id]
      );

      console.log(`[refresh-monthly] Refreshed: "${article.title}" (${gate.wordCount} words)`);
    } catch (err) {
      console.error(`[refresh-monthly] Error refreshing "${article.title}":`, err);
    }
  }

  console.log('[refresh-monthly] Complete');
}
