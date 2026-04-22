/**
 * Cron job 5: ASIN health check - Sundays 05:00 UTC.
 * Verifies all ASINs in the products table.
 * AUTO_GEN_ENABLED must be "true" to run.
 */
import { verifyAsin } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';

const DELAY_MS = 3000; // 3 seconds between checks to avoid throttling

export async function runAsinHealthCheck() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[asin-health-check] Skipped: AUTO_GEN_ENABLED != true');
    return;
  }

  const { rows: products } = await query(
    `SELECT asin, name FROM products WHERE status != 'invalid'
     ORDER BY COALESCE(lastChecked, '1970-01-01') ASC
     LIMIT 100`
  );

  console.log(`[asin-health-check] Checking ${products.length} ASINs`);

  let valid = 0;
  let invalid = 0;
  const deadAsins = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const result = await verifyAsin(product.asin);

      if (result.valid) {
        await query(
          'UPDATE products SET status = "valid", lastChecked = NOW() WHERE asin = ?',
          [product.asin]
        );
        valid++;
      } else {
        await query(
          'UPDATE products SET status = "invalid", lastChecked = NOW() WHERE asin = ?',
          [product.asin]
        );
        invalid++;
        deadAsins.push({ asin: product.asin, name: product.name, reason: result.reason });
        console.warn(`[asin-health-check] DEAD: ${product.asin} (${product.name}) - ${result.reason}`);
      }

      console.log(`[asin-health-check] ${i + 1}/${products.length}: ${product.asin} = ${result.valid ? 'OK' : 'DEAD'}`);
    } catch (err) {
      console.error(`[asin-health-check] Error checking ${product.asin}:`, err.message);
    }

    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`[asin-health-check] Complete: ${valid} valid, ${invalid} invalid`);

  // If dead ASINs found, log them for review
  if (deadAsins.length > 0) {
    console.warn('[asin-health-check] Dead ASINs requiring attention:');
    for (const d of deadAsins) {
      console.warn(`  - ${d.asin}: ${d.name} (${d.reason})`);
    }
  }

  return { valid, invalid, deadAsins };
}
