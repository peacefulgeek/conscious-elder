/**
 * Cron job 2: Generate a product spotlight article (Saturday 08:00 UTC).
 * AUTO_GEN_ENABLED must be "true" to run.
 */
import { generateArticle } from '../lib/deepseek-generate.mjs';
import { assignHeroImage } from '../lib/bunny-image-library.mjs';
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { verifyAsin } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';

const MAX_RETRIES = 4;

export async function generateProductSpotlight() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[product-spotlight] Skipped: AUTO_GEN_ENABLED != true');
    return;
  }

  // Get a product that hasn't been spotlighted recently
  const { rows } = await query(
    `SELECT * FROM products WHERE isValid = 1
     ORDER BY COALESCE(lastSpotlightedAt, '1970-01-01') ASC
     LIMIT 1`
  );

  if (rows.length === 0) {
    console.log('[product-spotlight] No valid products to spotlight');
    return;
  }

  const product = rows[0];
  const topic = `A Closer Look at ${product.name}: Is It Worth It for Conscious Elders?`;

  console.log(`[product-spotlight] Spotlighting: ${product.name} (ASIN: ${product.asin})`);

  // Verify the ASIN is still live
  const verification = await verifyAsin(product.asin);
  if (!verification.valid) {
    console.warn(`[product-spotlight] ASIN ${product.asin} is no longer valid: ${verification.reason}`);
    await query('UPDATE products SET isValid = 0, lastChecked = NOW() WHERE asin = ?', [product.asin]);
    return;
  }

  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    attempts++;
    try {
      const article = await generateArticle(topic, product.category || 'Practical Wisdom');

      const gate = runQualityGate(article.body);
      if (!gate.passed) {
        console.warn(`[product-spotlight] Quality gate failed (attempt ${attempts}):`, gate.failures);
        if (attempts < MAX_RETRIES) continue;
        return;
      }

      const wordCount = gate.wordCount;
      const readingTime = Math.ceil(wordCount / 200);

      const heroImageUrl = await assignHeroImage(article.slug);

      await query(
        `INSERT INTO articles
          (slug, title, metaDescription, ogTitle, ogDescription, category, tags, body,
           wordCount, readingTime, author, asinsUsed, heroImageUrl, imageUrl, status, publishedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Kalesh', ?, ?, ?, 'published', NOW(), NOW(), NOW())
         ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), updatedAt=NOW()`,
        [
          article.slug,
          article.title,
          article.excerpt || '',
          article.title,
          article.excerpt || '',
          article.category || 'Practical Wisdom',
          JSON.stringify(article.tags || []),
          article.body,
          wordCount,
          readingTime,
          JSON.stringify(gate.asins || []),
          heroImageUrl,
          heroImageUrl,
        ]
      );

      // Mark product as spotlighted
      await query('UPDATE products SET lastSpotlightedAt = NOW() WHERE asin = ?', [product.asin]);

      console.log(`[product-spotlight] SUCCESS: "${article.title}" (${wordCount} words) -> ${heroImageUrl}`);
      return;
    } catch (err) {
      console.error(`[product-spotlight] Error on attempt ${attempts}:`, err);
      if (attempts >= MAX_RETRIES) throw err;
    }
  }
}
