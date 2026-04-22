/**
 * Cron scheduler - wires all 5 jobs using node-cron.
 * All jobs are gated by AUTO_GEN_ENABLED=true.
 *
 * Schedule summary:
 *   Job 1: Generate article      - Mon-Fri 06:00 UTC
 *   Job 2: Product spotlight     - Saturday 08:00 UTC
 *   Job 3: Monthly refresh       - 1st of month 03:00 UTC
 *   Job 4: Quarterly refresh     - Jan/Apr/Jul/Oct 1st 04:00 UTC
 *   Job 5: ASIN health check     - Sunday 05:00 UTC
 */
import cron from 'node-cron';
import { generateNewArticle } from './generate-article.mjs';
import { generateProductSpotlight } from './product-spotlight.mjs';
import { refreshMonthly } from './refresh-monthly.mjs';
import { refreshQuarterly } from './refresh-quarterly.mjs';
import { runAsinHealthCheck } from './asin-health-check.mjs';

function safeRun(name, fn) {
  return async () => {
    console.log(`[scheduler] Starting: ${name}`);
    const start = Date.now();
    try {
      await fn();
      console.log(`[scheduler] Completed: ${name} (${Date.now() - start}ms)`);
    } catch (err) {
      console.error(`[scheduler] Error in ${name}:`, err);
    }
  };
}

export function startScheduler() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[scheduler] AUTO_GEN_ENABLED != true - all cron jobs disabled');
    return;
  }

  console.log('[scheduler] Starting all cron jobs...');

  // Job 1: Generate new article - Mon-Fri 06:00 UTC
  cron.schedule('0 6 * * 1-5', safeRun('generate-article', generateNewArticle), {
    timezone: 'UTC',
  });

  // Job 2: Product spotlight - Saturday 08:00 UTC
  cron.schedule('0 8 * * 6', safeRun('product-spotlight', generateProductSpotlight), {
    timezone: 'UTC',
  });

  // Job 3: Monthly refresh - 1st of month 03:00 UTC
  cron.schedule('0 3 1 * *', safeRun('refresh-monthly', refreshMonthly), {
    timezone: 'UTC',
  });

  // Job 4: Quarterly refresh - Jan/Apr/Jul/Oct 1st 04:00 UTC
  cron.schedule('0 4 1 1,4,7,10 *', safeRun('refresh-quarterly', refreshQuarterly), {
    timezone: 'UTC',
  });

  // Job 5: ASIN health check - Sunday 05:00 UTC
  cron.schedule('0 5 * * 0', safeRun('asin-health-check', runAsinHealthCheck), {
    timezone: 'UTC',
  });

  console.log('[scheduler] All 5 cron jobs registered');
}
