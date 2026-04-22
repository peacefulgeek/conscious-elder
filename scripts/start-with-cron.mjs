import cron from 'node-cron';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Start web server as child process
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

// Register cron schedules
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

    // 1. Article generation - Mon-Fri 06:00 UTC (5/week)
    cron.schedule('0 6 * * 1-5', async () => {
      console.log(`[cron] generate-article ${new Date().toISOString()}`);
      try { await genMod.generateNewArticle(); }
      catch (e) { console.error('[cron] generate-article failed:', e); }
    }, { timezone: 'UTC' });

    // 2. Product spotlight - Saturday 08:00 UTC (1/week)
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

    console.log('[start-with-cron] All 5 cron schedules registered (AUTO_GEN_ENABLED=true)');
  } catch (err) {
    console.error('[start-with-cron] Cron registration failed:', err);
    // Server continues to run even if cron fails
  }
}

/**
 * Cron schedule reference:
 * | # | Schedule                      | Cron Expression         | Job                         |
 * | 1 | Mon-Fri 06:00 UTC             | 0 6 * * 1-5             | Article generation (5/week) |
 * | 2 | Saturday 08:00 UTC            | 0 8 * * 6               | Product spotlight (1/week)  |
 * | 3 | 1st of month 03:00 UTC        | 0 3 1 * *               | Monthly content refresh     |
 * | 4 | Jan/Apr/Jul/Oct 1st 04:00 UTC | 0 4 1 1,4,7,10 *        | Quarterly content refresh   |
 * | 5 | Sunday 05:00 UTC              | 0 5 * * 0               | ASIN health check           |
 *
 * No Manus. No external dispatcher. No forge.manus.im calls. All in-process node-cron.
 */

const shutdown = (sig) => {
  console.log(`[start-with-cron] ${sig} received, shutting down`);
  server.kill(sig);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
