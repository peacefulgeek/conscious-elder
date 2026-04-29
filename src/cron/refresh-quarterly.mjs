/**
 * Cron job 4: Quarterly content refresh - Jan/Apr/Jul/Oct 1st at 04:00 UTC.
 * Deep refresh of articles older than 90 days.
 * AUTO_GEN_ENABLED must be "true" to run.
 */
import { query } from '../lib/db.mjs';
import { generateArticle } from '../lib/deepseek-generate.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsinBatch } from '../lib/amazon-verify.mjs';

export async function refreshQuarterly() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[refresh-quarterly] Skipped: AUTO_GEN_ENABLED != true');
    return;
  }

  const { rows } = await query(
    `SELECT id, slug, title, category, tags, asinsUsed FROM articles
     WHERE status = 'published'
     AND (lastRefreshed90d IS NULL OR lastRefreshed90d < DATE_SUB(NOW(), INTERVAL 90 DAY))
     ORDER BY COALESCE(lastRefreshed90d, createdAt) ASC
     LIMIT 20`
  );

  console.log(`[refresh-quarterly] Found ${rows.length} articles for deep refresh`);

  for (const article of rows) {
    try {
      console.log(`[refresh-quarterly] Deep refreshing: "${article.title}"`);

      // Verify existing ASINs
      const existingAsins = JSON.parse(article.asinsUsed || '[]');
      if (existingAsins.length > 0) {
        const asinResults = await verifyAsinBatch(existingAsins, { delayMs: 2500 });
        const deadAsins = asinResults.filter(r => !r.valid).map(r => r.asin);
        if (deadAsins.length > 0) {
          console.warn(`[refresh-quarterly] Dead ASINs in "${article.title}": ${deadAsins.join(', ')}`);
          // Mark dead ASINs in products table
          for (const asin of deadAsins) {
            await query('UPDATE products SET isValid = 0, lastChecked = NOW() WHERE asin = ?', [asin]);
          }
        }
      }

      const refreshed = await generateArticle(article.title, article.category || 'Conscious Aging');

      const gate = runQualityGate(refreshed.body);
      if (!gate.passed) {
        console.warn(`[refresh-quarterly] Quality gate failed for "${article.title}":`, gate.failures);
        continue;
      }

      await query(
        `UPDATE articles SET body = ?, wordCount = ?, asinsUsed = ?, updatedAt = NOW(), lastRefreshed90d = NOW() WHERE id = ?`,
        [refreshed.body, gate.wordCount, JSON.stringify(gate.asins), article.id]
      );

      console.log(`[refresh-quarterly] Deep refreshed: "${article.title}" (${gate.wordCount} words)`);
    } catch (err) {
      console.error(`[refresh-quarterly] Error deep refreshing "${article.title}":`, err);
    }
  }

  console.log('[refresh-quarterly] Complete');
}
