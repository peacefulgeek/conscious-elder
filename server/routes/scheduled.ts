/**
 * scheduled.ts - Heartbeat cron handlers
 *
 * /api/scheduled/quarterly-refresh
 *   - Triggered quarterly (Jan/Apr/Jul/Oct 1st at 04:00 UTC)
 *   - Rewrites the body of the 20 oldest published articles using Claude
 *   - Enforces quality gate (no em-dashes, no banned words, word count 1800+)
 *   - Updates Bunny CDN per-slug JSON and articles-index.json
 *
 * /api/scheduled/monthly-refresh
 *   - Triggered monthly (1st of month at 03:00 UTC)
 *   - Rewrites 5 oldest articles (lighter version of quarterly)
 */

import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getArticlesForRefresh90d, getArticlesForRefresh30d, updateArticleBody } from '../db';

export const scheduledRouter = express.Router();

const BUNNY_PULL_ZONE = 'https://conscious-elder.b-cdn.net';
const BUNNY_STORAGE_ZONE = 'https://ny.storage.bunnycdn.com/conscious-elder';
const BUNNY_KEY_IMG = process.env.BUNNY_STORAGE_KEY || 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';

/** Assign a hero image from the Bunny library (/library/lib-01..40.webp) */
async function assignHeroImage(slug: string): Promise<string> {
  const libNum = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${libNum}.webp`;
  try {
    const downloadRes = await fetch(`${BUNNY_PULL_ZONE}/library/${sourceFile}`);
    if (!downloadRes.ok) throw new Error(`Download failed: ${downloadRes.status}`);
    const imageBuffer = await downloadRes.arrayBuffer();
    const uploadRes = await fetch(`${BUNNY_STORAGE_ZONE}/images/${slug}.webp`, {
      method: 'PUT',
      headers: { AccessKey: BUNNY_KEY_IMG, 'Content-Type': 'image/webp' },
      body: imageBuffer,
    });
    if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
    return `${BUNNY_PULL_ZONE}/images/${slug}.webp`;
  } catch (err) {
    // Fallback to direct library URL
    console.warn(`[promote] Hero copy failed for "${slug}", using library fallback:`, (err as Error).message);
    return `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
  }
}

// ── Promote: publish 1 queued article per trigger ────────────────────────────
scheduledRouter.post('/promote-article', async (_req, res) => {
  try {
    const { getNextQueuedArticle, publishQueuedArticle, getQueuedArticleCount } = await import('../bunny-store');
    const queuedCount = await getQueuedArticleCount();
    if (queuedCount === 0) {
      console.log('[promote] Queue empty — nothing to publish.');
      return res.json({ success: true, published: false, reason: 'queue_empty' });
    }
    const article = await getNextQueuedArticle();
    if (!article) {
      return res.json({ success: true, published: false, reason: 'queue_empty' });
    }
    console.log(`[promote] Publishing queued article: "${article.title}" (id=${article.id})`);
    const heroImageUrl = await assignHeroImage(article.slug);
    await publishQueuedArticle(article.id, heroImageUrl);
    console.log(`[promote] SUCCESS: "${article.title}" -> ${heroImageUrl}`);
    return res.json({
      success: true,
      published: true,
      slug: article.slug,
      title: article.title,
      heroImageUrl,
      remainingInQueue: queuedCount - 1,
    });
  } catch (err) {
    console.error('[promote] Error:', err);
    return res.status(500).json({ success: false, error: (err as Error).message });
  }
});


const QUALITY_GATE_BANNED = [
  'as we age', 'in today\'s world', 'in conclusion', 'it\'s important to note',
  'it is important to', 'it\'s worth noting', 'needless to say', 'at the end of the day',
  'when it comes to', 'in terms of', 'moving forward', 'going forward',
  'it goes without saying', 'the fact of the matter', 'all things considered',
  'at this point in time', 'due to the fact that', 'in light of the fact',
  'for all intents and purposes', 'in the final analysis', 'it should be noted',
  'it is worth mentioning', 'it is essential to', 'it is crucial to',
  'it is vital to', 'it is necessary to', 'it is important that',
  'in order to', 'in order for', 'in order that',
  'paul wagner', 'shrikrishna', 'cloudfront', 'manus',
];

function passesQualityGate(body: string): { pass: boolean; reason?: string } {
  if (body.includes('—') || body.includes('\u2014')) {
    return { pass: false, reason: 'Contains em-dash' };
  }
  const lower = body.toLowerCase();
  for (const banned of QUALITY_GATE_BANNED) {
    if (lower.includes(banned)) {
      return { pass: false, reason: `Contains banned phrase: "${banned}"` };
    }
  }
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 1400) {
    return { pass: false, reason: `Too short: ${wordCount} words` };
  }
  return { pass: true };
}

async function refreshArticleWithClaude(article: { id: number; slug: string; title: string; body: string | null; category: string }): Promise<boolean> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('[quarterly-refresh] CLAUDE_API_KEY not set');
    return false;
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are the voice of The Conscious Elder — a publication for people aging with awareness, written by Kalesh.

HARD RULES (never break these):
- NO em-dashes (— or –). Use commas, periods, or colons instead.
- NO banned phrases: "as we age", "in today's world", "in conclusion", "it's important to note", "needless to say", "at the end of the day", "when it comes to", "moving forward", "going forward", "it goes without saying", "for all intents and purposes"
- NO references to Paul Wagner, Shrikrishna, CloudFront, or Manus
- NO generic AI-sounding language
- Write in first person (I, we, my) with warmth and authority
- Include a TL;DR block near the top: <section data-tldr="ai-overview"><p><strong>TL;DR:</strong> [2-3 sentence summary]</p></section>
- Include at least 3 internal links to other articles on consciouselder.com/articles/
- Include at least 1 outbound link to a .gov, .edu, NIH, or PubMed source
- Every Amazon affiliate link must use tag=spankyspinola-20 and be labeled "(paid link)"
- Word count: 1800-2400 words
- Use HTML formatting (h2, h3, p, ul, ol, blockquote, strong, em)
- End with a warm, personal conclusion that references Kalesh's own journey

ARTICLE TO REFRESH:
Title: ${article.title}
Category: ${article.category}
Current body (rewrite this, keeping the core ideas but improving quality, E-E-A-T signals, and structure):

${article.body?.slice(0, 3000) || ''}

Write the complete refreshed HTML body now. Start directly with the TL;DR section.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const newBody = response.content[0].type === 'text' ? response.content[0].text : '';
    if (!newBody || newBody.length < 500) {
      console.error(`[quarterly-refresh] Empty response for ${article.slug}`);
      return false;
    }

    const gate = passesQualityGate(newBody);
    if (!gate.pass) {
      console.error(`[quarterly-refresh] Quality gate failed for ${article.slug}: ${gate.reason}`);
      return false;
    }

    const wordCount = newBody.split(/\s+/).filter(Boolean).length;
    await updateArticleBody(article.id, newBody, [], wordCount);
    console.log(`[quarterly-refresh] Refreshed ${article.slug} (${wordCount} words)`);
    return true;
  } catch (err) {
    console.error(`[quarterly-refresh] Claude error for ${article.slug}:`, err);
    return false;
  }
}

// ── Quarterly refresh handler ─────────────────────────────────────────────────

scheduledRouter.post('/quarterly-refresh', async (_req, res) => {
  console.log('[quarterly-refresh] Triggered at', new Date().toISOString());
  try {
    // Process 3 articles per cron trigger to stay within Cloud Run 180s request timeout
    // Cron fires quarterly; 3 articles * ~15s each = ~45s, well within timeout
    const articles = await getArticlesForRefresh90d(3);
    console.log(`[quarterly-refresh] Refreshing ${articles.length} articles`);
    let success = 0;
    for (const article of articles) {
      const ok = await refreshArticleWithClaude(article as Parameters<typeof refreshArticleWithClaude>[0]);
      if (ok) success++;
      // Brief pause between Claude calls
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log(`[quarterly-refresh] Done: ${success}/${articles.length} refreshed`);
    res.json({ ok: true, refreshed: success, total: articles.length });
  } catch (err) {
    console.error('[quarterly-refresh] Fatal error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ── Monthly refresh handler ───────────────────────────────────────────────────

scheduledRouter.post('/monthly-refresh', async (_req, res) => {
  console.log('[monthly-refresh] Triggered at', new Date().toISOString());
  try {
    // Process 2 articles per cron trigger to stay within Cloud Run 180s request timeout
    const articles = await getArticlesForRefresh30d(2);
    console.log(`[monthly-refresh] Refreshing ${articles.length} articles`);
    let success = 0;
    for (const article of articles) {
      const ok = await refreshArticleWithClaude(article as Parameters<typeof refreshArticleWithClaude>[0]);
      if (ok) success++;
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log(`[monthly-refresh] Done: ${success}/${articles.length} refreshed`);
    res.json({ ok: true, refreshed: success, total: articles.length });
  } catch (err) {
    console.error('[monthly-refresh] Fatal error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
