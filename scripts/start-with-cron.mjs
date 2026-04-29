/**
 * start-with-cron.mjs
 * Production entrypoint for DigitalOcean App Platform.
 * Spawns the compiled Express server, then registers all 5 node-cron jobs.
 *
 * Phase 1/Phase 2 article publisher logic:
 *   Phase 1 (published < 60): 5x/day, every day (07:00, 10:00, 13:00, 16:00, 19:00 UTC)
 *   Phase 2 (published >= 60): 1x/weekday (08:00 UTC, Mon-Fri only)
 *
 * The scheduler re-evaluates the phase at each fire time by querying the DB,
 * so the transition from Phase 1 to Phase 2 is automatic.
 */

import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ── Start web server ─────────────────────────────────────────────────────────

const server = spawn('node', ['dist/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('[start-with-cron] Server process error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`[start-with-cron] Server exited with code ${code}`);
  process.exit(code ?? 0);
});

// ── Phase detection helper ───────────────────────────────────────────────────

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

// ── Register cron schedules ──────────────────────────────────────────────────

const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

if (!AUTO_GEN) {
  console.log('[start-with-cron] AUTO_GEN_ENABLED not "true" - cron disabled');
} else {
  try {
    const [genMod, spotMod, rmMod, rqMod, ahcMod] = await Promise.all([
      import('../src/cron/generate-article.mjs'),
      import('../src/cron/product-spotlight.mjs'),
      import('../src/cron/refresh-monthly.mjs'),
      import('../src/cron/refresh-quarterly.mjs'),
      import('../src/cron/asin-health-check.mjs')
    ]);

    /**
     * Job 1: Article publisher - Phase 1/Phase 2 adaptive schedule.
     *
     * We register BOTH schedules at startup. Each handler checks the current
     * phase before running, so only the appropriate phase fires.
     *
     * Phase 1: 5x/day every day at 07:00, 10:00, 13:00, 16:00, 19:00 UTC
     * Phase 2: 1x/weekday at 08:00 UTC (Mon-Fri)
     */

    // Phase 1 times: 07:00, 10:00, 13:00, 16:00, 19:00 UTC - every day
    const PHASE1_TIMES = ['0 7 * * *', '0 10 * * *', '0 13 * * *', '0 16 * * *', '0 19 * * *'];
    for (const cronExpr of PHASE1_TIMES) {
      cron.schedule(cronExpr, async () => {
        const published = await getPublishedCount();
        if (published >= 60) {
          console.log(`[cron] Phase 1 slot skipped (published=${published}, Phase 2 active)`);
          return;
        }
        console.log(`[cron] generate-article [Phase 1] ${new Date().toISOString()} (published=${published})`);
        try { await genMod.generateNewArticle(); }
        catch (e) { console.error('[cron] generate-article failed:', e); }
      }, { timezone: 'UTC' });
    }

    // Phase 2: 08:00 UTC Mon-Fri only
    cron.schedule('0 8 * * 1-5', async () => {
      const published = await getPublishedCount();
      if (published < 60) {
        console.log(`[cron] Phase 2 slot skipped (published=${published}, Phase 1 active)`);
        return;
      }
      console.log(`[cron] generate-article [Phase 2] ${new Date().toISOString()} (published=${published})`);
      try { await genMod.generateNewArticle(); }
      catch (e) { console.error('[cron] generate-article failed:', e); }
    }, { timezone: 'UTC' });

    // 2. Product spotlight - Saturday 08:00 UTC
    cron.schedule('0 8 * * 6', async () => {
      console.log(`[cron] product-spotlight ${new Date().toISOString()}`);
      try { await spotMod.generateProductSpotlight(); }
      catch (e) { console.error('[cron] product-spotlight failed:', e); }
    }, { timezone: 'UTC' });

    // 3. Monthly content refresh - 1st of month 03:00 UTC
    cron.schedule('0 3 1 * *', async () => {
      console.log(`[cron] refresh-monthly ${new Date().toISOString()}`);
      try { await rmMod.refreshMonthly(); }
      catch (e) { console.error('[cron] refresh-monthly failed:', e); }
    }, { timezone: 'UTC' });

    // 4. Quarterly content refresh - Jan/Apr/Jul/Oct 1st at 04:00 UTC
    cron.schedule('0 4 1 1,4,7,10 *', async () => {
      console.log(`[cron] refresh-quarterly ${new Date().toISOString()}`);
      try { await rqMod.refreshQuarterly(); }
      catch (e) { console.error('[cron] refresh-quarterly failed:', e); }
    }, { timezone: 'UTC' });

    // 5. ASIN health check - Sundays 05:00 UTC
    cron.schedule('0 5 * * 0', async () => {
      console.log(`[cron] asin-health-check ${new Date().toISOString()}`);
      try { await ahcMod.runAsinHealthCheck(); }
      catch (e) { console.error('[cron] asin-health-check failed:', e); }
    }, { timezone: 'UTC' });

    console.log('[start-with-cron] All cron schedules registered (AUTO_GEN_ENABLED=true)');
    console.log('[start-with-cron] Phase 1 (<60 published): 5x/day at 07,10,13,16,19 UTC');
    console.log('[start-with-cron] Phase 2 (>=60 published): 1x/weekday at 08:00 UTC Mon-Fri');
  } catch (err) {
    console.error('[start-with-cron] Cron registration failed:', err);
    // Server continues to run even if cron fails
  }
}

/**
 * Cron schedule reference:
 * | # | Phase 1 (<60 pub)             | Phase 2 (>=60 pub)      | Job                         |
 * | 1 | 07,10,13,16,19 UTC every day  | 08:00 UTC Mon-Fri       | Article publisher           |
 * | 2 | Saturday 08:00 UTC            | (same)                  | Product spotlight           |
 * | 3 | 1st of month 03:00 UTC        | (same)                  | Monthly content refresh     |
 * | 4 | Jan/Apr/Jul/Oct 1st 04:00 UTC | (same)                  | Quarterly content refresh   |
 * | 5 | Sunday 05:00 UTC              | (same)                  | ASIN health check           |
 */

const shutdown = (sig) => {
  console.log(`[start-with-cron] ${sig} received, shutting down`);
  server.kill(sig);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
