/**
 * Cron scheduler - wires all 5 jobs using node-cron.
 * All jobs are gated by AUTO_GEN_ENABLED=true.
 *
 * NOTE: In production (DigitalOcean), crons are registered by
 * scripts/start-with-cron.mjs. This file is used in development
 * and as the canonical schedule reference.
 *
 * Phase 1/Phase 2 article publisher:
 *   Phase 1 (published < 60): 5x/day every day at 07,10,13,16,19 UTC
 *   Phase 2 (published >= 60): 1x/weekday at 08:00 UTC (Mon-Fri)
 *
 * Other schedules:
 *   Job 2: Product spotlight      - Saturday 08:00 UTC
 *   Job 3: Monthly refresh        - 1st of month 03:00 UTC
 *   Job 4: Quarterly refresh      - Jan/Apr/Jul/Oct 1st 04:00 UTC
 *   Job 5: ASIN health check      - Sunday 05:00 UTC
 */
import cron from 'node-cron';
import mysql from 'mysql2/promise';
import { generateNewArticle } from './generate-article.mjs';
import { generateProductSpotlight } from './product-spotlight.mjs';
import { refreshMonthly } from './refresh-monthly.mjs';
import { refreshQuarterly } from './refresh-quarterly.mjs';
import { runAsinHealthCheck } from './asin-health-check.mjs';

async function getPublishedCount() {
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.execute("SELECT COUNT(*) as cnt FROM articles WHERE status = 'published'");
    await conn.end();
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}

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

  console.log('[scheduler] Starting all cron jobs (Phase 1/Phase 2 adaptive)...');

  // Job 1: Phase 1 - 5x/day every day (07,10,13,16,19 UTC)
  const PHASE1_TIMES = ['0 7 * * *', '0 10 * * *', '0 13 * * *', '0 16 * * *', '0 19 * * *'];
  for (const cronExpr of PHASE1_TIMES) {
    cron.schedule(cronExpr, async () => {
      const published = await getPublishedCount();
      if (published >= 60) {
        console.log(`[scheduler] Phase 1 slot skipped (published=${published}, Phase 2 active)`);
        return;
      }
      await safeRun('generate-article [Phase 1]', generateNewArticle)();
    }, { timezone: 'UTC' });
  }

  // Job 1: Phase 2 - 1x/weekday at 08:00 UTC
  cron.schedule('0 8 * * 1-5', async () => {
    const published = await getPublishedCount();
    if (published < 60) {
      console.log(`[scheduler] Phase 2 slot skipped (published=${published}, Phase 1 active)`);
      return;
    }
    await safeRun('generate-article [Phase 2]', generateNewArticle)();
  }, { timezone: 'UTC' });

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

  console.log('[scheduler] All cron jobs registered');
  console.log('[scheduler] Phase 1 (<60 published): 5x/day at 07,10,13,16,19 UTC');
  console.log('[scheduler] Phase 2 (>=60 published): 1x/weekday at 08:00 UTC Mon-Fri');
}
