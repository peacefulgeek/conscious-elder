/**
 * seed-retry.mjs
 * Re-generates the 7 articles that failed the quality gate.
 * Uses a stricter system prompt that explicitly lists the banned words.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const AMAZON_TAG = 'spankyspinola-20';
const BASE_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://api.manus.im';
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const DB_URL = process.env.DATABASE_URL;

if (!API_KEY) { console.error('BUILT_IN_FORGE_API_KEY not set'); process.exit(1); }
if (!DB_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

const PRODUCTS = [
  { asin: 'B00JGCBGZQ', name: "Host Defense Lion's Mane Capsules", category: 'cognitive-health' },
  { asin: 'B0013OXKHC', name: 'Life Extension Cognitex Elite', category: 'cognitive-health' },
  { asin: 'B07BNVWXKZ', name: 'Jarrow Formulas Phosphatidylserine', category: 'cognitive-health' },
  { asin: 'B00CAZAU62', name: 'NOW Supplements Bacopa Extract', category: 'cognitive-health' },
  { asin: 'B07L9PJQHW', name: 'Bulletproof Unfair Advantage CoQ10', category: 'cognitive-health' },
  { asin: 'B00YOAFLWY', name: 'Pure Encapsulations Magnesium Glycinate', category: 'supplements' },
  { asin: 'B07CHNMKK1', name: 'Thorne ResveraCel NAD+ Precursor', category: 'supplements' },
  { asin: 'B00CAZAU80', name: 'NOW Supplements CoQ10 400mg', category: 'supplements' },
  { asin: 'B01MUDGBFP', name: 'Life Extension Super Omega-3', category: 'supplements' },
  { asin: '0385349947', name: 'Being Mortal by Atul Gawande', category: 'books' },
  { asin: '0062457713', name: 'When Breath Becomes Air by Paul Kalanithi', category: 'books' },
  { asin: '0062878816', name: 'The Art of Dying Well by Katy Butler', category: 'books' },
  { asin: '1400064740', name: 'Still Here by Ram Dass', category: 'books' },
  { asin: '0062887599', name: 'Falling into Grace by Adyashanti', category: 'books' },
  { asin: 'B00CAZAU44', name: 'Gaiam Yoga Block Set', category: 'movement' },
  { asin: 'B00YOAFLWY', name: 'Natrol Melatonin 5mg Time Release', category: 'sleep' },
  { asin: 'B07CHNMKK1', name: 'Life Extension Melatonin 300mcg', category: 'sleep' },
];

const FAILED_ARTICLES = [
  { title: "How to Build a Morning Ritual That Actually Fits Your Age", category: "practice", kaleshBacklink: true, faq: 0 },
  { title: "Grief Is Not a Problem to Solve", category: "grief", kaleshBacklink: true, faq: 0 },
  { title: "What Tai Chi Actually Does for the Aging Body", category: "movement", kaleshBacklink: false, faq: 5 },
  { title: "The Art of Mentoring: Passing What You Know to the Next Generation", category: "legacy", kaleshBacklink: true, faq: 0 },
  { title: "How to Write Your Memoir When You Think You Have Nothing to Say", category: "legacy", kaleshBacklink: false, faq: 0 },
  { title: "The Financial Wisdom Nobody Teaches You Before Retirement", category: "financial", kaleshBacklink: false, faq: 3 },
  { title: "The Gift of Limitations: What Constraint Teaches Conscious Elders", category: "conscious-aging", kaleshBacklink: true, faq: 0 },
];

function slugify(title) {
  return title.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function pickProducts(category, count = 3) {
  const catProducts = PRODUCTS.filter(p => p.category === category);
  const fallback = PRODUCTS.filter(p => ['supplements', 'books', 'cognitive-health'].includes(p.category));
  const pool = catProducts.length >= count ? catProducts : [...catProducts, ...fallback];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

async function callLLM(messages) {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', messages, max_tokens: 4096, temperature: 0.9 }),
  });
  if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function buildStrictSystemPrompt() {
  return `You are Kalesh, a consciousness teacher and writer. You write about conscious aging from direct personal experience.

CRITICAL WORD PROHIBITION - you will be automatically rejected if you use ANY of these words or phrases:
BANNED LIST: delve, tapestry, nuanced, multifaceted, "comprehensive guide", "in conclusion", "it's important to note", "as an ai", "i cannot", "certainly,", "absolutely,", "i'd be happy", "navigate the", "realm of", foster, leverage, utilize, "embark on", "beacon of", "testament to", pivotal, paramount, revolutionize, "game-changer", "cutting-edge", "paul wagner", shrikrishna, manus

ALSO BANNED: em-dashes (the character or unicode). Use commas or periods instead.

VOICE RULES:
- First person throughout. Use "I", "me", "my", "we" naturally.
- Contractions everywhere: I've, you're, it's, don't, can't, that's, there's, I'll, I'd.
- Vary sentence length. Short punchy sentences. Then longer ones that breathe.
- No bullet points. Write in prose paragraphs.
- Warm, direct, honest. Not preachy.

AMAZON AFFILIATE RULES:
- Include exactly 3-4 Amazon affiliate links in the body using: [Product Name](https://www.amazon.com/dp/ASIN?tag=spankyspinola-20)
- After EVERY affiliate link, add the text: (paid link)
- End with "## Wisdom Library" section with 3-4 products as: [Name](URL) (paid link) - description.

STRUCTURE:
- Title as H1
- "META: " line for meta description
- Body: 1200-2000 words
- Insert [AUTHOR_BIO_PLACEHOLDER] roughly halfway through
- End with "## Wisdom Library"`;
}

function runQualityGate(body) {
  const failures = [];
  if (/\u2014|--/.test(body)) failures.push('Contains em-dash');
  const banned = ['delve', 'tapestry', 'nuanced', 'multifaceted', 'comprehensive guide',
    'in conclusion', "it's important to note", 'as an ai', 'i cannot', 'certainly,',
    'absolutely,', "i'd be happy", 'navigate the', 'realm of', 'foster', 'leverage',
    'utilize', 'embark on', 'beacon of', 'testament to', 'pivotal', 'paramount',
    'revolutionize', 'game-changer', 'cutting-edge', 'paul wagner', 'shrikrishna', 'manus'];
  for (const word of banned) {
    if (body.toLowerCase().includes(word)) failures.push(`Contains banned word: "${word}"`);
  }
  const amazonLinks = (body.match(/amazon\.com\/dp\//g) || []).length;
  if (amazonLinks < 3) failures.push(`Only ${amazonLinks} Amazon links (need 3+)`);
  const paidLinkCount = (body.match(/\(paid link\)/gi) || []).length;
  if (paidLinkCount < amazonLinks) failures.push(`Missing (paid link) labels: ${paidLinkCount}/${amazonLinks}`);
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 1000) failures.push(`Too short: ${wordCount} words`);
  if (!body.includes('[AUTHOR_BIO_PLACEHOLDER]')) failures.push('Missing [AUTHOR_BIO_PLACEHOLDER]');
  return { passed: failures.length === 0, failures, wordCount, amazonLinks };
}

function parseArticle(raw, topic, category) {
  const lines = raw.split('\n');
  let title = topic, metaDescription = '', bodyLines = [], parsingBody = false;
  for (const line of lines) {
    if (line.startsWith('# ')) { title = line.replace(/^# /, '').trim(); parsingBody = true; }
    else if (line.startsWith('META: ')) { metaDescription = line.replace(/^META: /, '').trim(); }
    else if (parsingBody) { bodyLines.push(line); }
  }
  const body = bodyLines.join('\n').trim();
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
  const slug = slugify(title);
  const asinRegex = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const asins = []; let m;
  while ((m = asinRegex.exec(body)) !== null) { if (!asins.includes(m[1])) asins.push(m[1]); }
  return { title, slug, metaDescription, body, wordCount, readingTime, category, asins };
}

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log('[retry] Connected to database');

  let success = 0, failed = 0;

  for (let i = 0; i < FAILED_ARTICLES.length; i++) {
    const { title, category, kaleshBacklink, faq } = FAILED_ARTICLES[i];
    console.log(`\n[retry] ${i + 1}/${FAILED_ARTICLES.length}: "${title}"`);

    // Check if already exists
    const [existing] = await conn.execute('SELECT id FROM articles WHERE slug = ?', [slugify(title)]);
    if (existing.length > 0) { console.log('  [skip] Already exists'); success++; continue; }

    const selectedProducts = pickProducts(category, 4);
    const productList = selectedProducts.map(p => `- ${p.name} (ASIN: ${p.asin}) - URL: ${buildAmazonUrl(p.asin)}`).join('\n');
    const kaleshInstruction = kaleshBacklink ? '\nNaturally mention and link to https://kalesh.love using varied anchor text.' : '';
    const faqInstruction = faq > 0 ? `\nInclude a "## Frequently Asked Questions" section with exactly ${faq} Q&As.` : '';

    let attempts = 0, generated = false;
    while (attempts < 5 && !generated) {
      attempts++;
      try {
        const raw = await callLLM([
          { role: 'system', content: buildStrictSystemPrompt() },
          { role: 'user', content: `Write a 1400-word article titled: "${title}"\n\nCategory: ${category}\n\nUse these Amazon products:\n${productList}${kaleshInstruction}${faqInstruction}\n\nRemember: Start with H1 title, then META: line, then body. NO banned words. NO em-dashes.` },
        ]);

        const parsed = parseArticle(raw, title, category);
        const gate = runQualityGate(parsed.body);

        if (!gate.passed) {
          console.warn(`  [gate] FAILED (attempt ${attempts}):`, gate.failures);
          if (attempts < 5) { await new Promise(r => setTimeout(r, 2000)); continue; }
          console.error(`  [gate] All retries exhausted for "${title}"`);
          failed++;
          break;
        }

        console.log(`  [gate] PASSED: ${gate.wordCount} words, ${gate.amazonLinks} Amazon links`);

        await conn.execute(
          `INSERT INTO articles (slug, title, metaDescription, ogTitle, ogDescription, category, tags, body, wordCount, readingTime, author, asinsUsed, openerType, conclusionType, hasKaleshBacklink, faqCount, status, publishedAt, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW(), NOW())
           ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), updatedAt=NOW()`,
          [parsed.slug, parsed.title, parsed.metaDescription, parsed.title, parsed.metaDescription,
           category, JSON.stringify([category]), parsed.body, parsed.wordCount, parsed.readingTime,
           'Kalesh', JSON.stringify(parsed.asins), 'story', 'reflection', kaleshBacklink ? 1 : 0, faq]
        );

        console.log(`  [db] Inserted: "${parsed.title}"`);
        success++;
        generated = true;
        if (i < FAILED_ARTICLES.length - 1) await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        console.error(`  [error] Attempt ${attempts}:`, err.message);
        if (attempts < 5) await new Promise(r => setTimeout(r, 5000));
        else { failed++; break; }
      }
    }
  }

  await conn.end();
  console.log(`\n[retry] Complete: ${success} inserted/skipped, ${failed} failed`);
}

main().catch(err => { console.error('[retry] Fatal:', err); process.exit(1); });
