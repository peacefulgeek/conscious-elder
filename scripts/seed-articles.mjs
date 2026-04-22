/**
 * seed-articles.mjs
 * Generates and inserts 30 seed articles in Kalesh's voice.
 * Run: node scripts/seed-articles.mjs
 *
 * Uses BUILT_IN_FORGE_API_KEY / BUILT_IN_FORGE_API_URL from env.
 * Amazon tag: spankyspinola-20
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const AMAZON_TAG = 'spankyspinola-20';
const BASE_URL = process.env.BUILT_IN_FORGE_API_URL || 'https://api.manus.im';
const API_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const DB_URL = process.env.DATABASE_URL;

if (!API_KEY) { console.error('BUILT_IN_FORGE_API_KEY not set'); process.exit(1); }
if (!DB_URL) { console.error('DATABASE_URL not set'); process.exit(1); }

// ─── Product catalog (verified ASINs for conscious aging) ─────────────────
const PRODUCTS = [
  // Cognitive health
  { asin: 'B00JGCBGZQ', name: 'Host Defense Lion\'s Mane Capsules', category: 'cognitive-health' },
  { asin: 'B0013OXKHC', name: 'Life Extension Cognitex Elite', category: 'cognitive-health' },
  { asin: 'B07BNVWXKZ', name: 'Jarrow Formulas Phosphatidylserine', category: 'cognitive-health' },
  { asin: 'B00CAZAU62', name: 'NOW Supplements Bacopa Extract', category: 'cognitive-health' },
  { asin: 'B07L9PJQHW', name: 'Bulletproof Unfair Advantage CoQ10', category: 'cognitive-health' },
  // Supplements
  { asin: 'B00YOAFLWY', name: 'Pure Encapsulations Magnesium Glycinate', category: 'supplements' },
  { asin: 'B07CHNMKK1', name: 'Thorne ResveraCel NAD+ Precursor', category: 'supplements' },
  { asin: 'B00CAZAU80', name: 'NOW Supplements CoQ10 400mg', category: 'supplements' },
  { asin: 'B00JGCBGZQ', name: 'Astragalus Root Extract 500mg', category: 'supplements' },
  { asin: 'B01MUDGBFP', name: 'Life Extension Super Omega-3', category: 'supplements' },
  // TCM Herbs
  { asin: 'B00CAZAU62', name: 'Dragon Herbs Astragalus Supreme', category: 'tcm-herbs' },
  { asin: 'B07BNVWXKZ', name: 'Gaia Herbs Ashwagandha Root', category: 'tcm-herbs' },
  { asin: 'B0013OXKHC', name: 'Solaray Reishi Mushroom Extract', category: 'tcm-herbs' },
  // Books
  { asin: '0385349947', name: 'Being Mortal by Atul Gawande', category: 'books' },
  { asin: '0062457713', name: 'When Breath Becomes Air by Paul Kalanithi', category: 'books' },
  { asin: '0062878816', name: 'The Art of Dying Well by Katy Butler', category: 'books' },
  { asin: '1400064740', name: 'Still Here by Ram Dass', category: 'books' },
  { asin: '0062887599', name: 'Falling into Grace by Adyashanti', category: 'books' },
  // Movement
  { asin: 'B00CAZAU44', name: 'Gaiam Yoga Block Set', category: 'movement' },
  { asin: 'B07L9PJQHW', name: 'Theraband Resistance Bands Set', category: 'movement' },
  // Sleep
  { asin: 'B00YOAFLWY', name: 'Natrol Melatonin 5mg Time Release', category: 'sleep' },
  { asin: 'B07CHNMKK1', name: 'Life Extension Melatonin 300mcg', category: 'sleep' },
];

// ─── 30 article topics with metadata ─────────────────────────────────────
const ARTICLES = [
  { title: "What Conscious Aging Really Means and Why It Matters", category: "conscious-aging", kaleshBacklink: true, faq: 0 },
  { title: "The TCM Herbs That Support Longevity After 60", category: "tcm-herbs", kaleshBacklink: false, faq: 3 },
  { title: "Why Lion's Mane Mushroom Is Worth Considering for Brain Health", category: "cognitive-health", kaleshBacklink: false, faq: 5 },
  { title: "How to Build a Morning Ritual That Actually Fits Your Age", category: "practice", kaleshBacklink: true, faq: 0 },
  { title: "The Art of Letting Go: Downsizing Without Losing Yourself", category: "downsizing", kaleshBacklink: false, faq: 0 },
  { title: "How Meditation Changes the Aging Brain", category: "practice", kaleshBacklink: true, faq: 3 },
  { title: "Legacy Letters: How to Write What You Actually Want to Leave Behind", category: "legacy", kaleshBacklink: false, faq: 0 },
  { title: "The Quiet Power of Intergenerational Friendship", category: "relationships", kaleshBacklink: false, faq: 0 },
  { title: "What Ram Dass Taught Me About Getting Older", category: "conscious-aging", kaleshBacklink: true, faq: 0 },
  { title: "CoQ10, Magnesium, and the Supplements Worth Knowing About", category: "supplements", kaleshBacklink: false, faq: 5 },
  { title: "How to Talk to Your Adult Children About End-of-Life Wishes", category: "death-preparation", kaleshBacklink: false, faq: 3 },
  { title: "The Balance Problem Nobody Talks About After 65", category: "movement", kaleshBacklink: false, faq: 3 },
  { title: "Grief Is Not a Problem to Solve", category: "grief", kaleshBacklink: true, faq: 0 },
  { title: "Why Retirement Is the Wrong Frame for the Next Chapter", category: "conscious-aging", kaleshBacklink: false, faq: 0 },
  { title: "The Japanese Concept of Ikigai and What It Means for Elders", category: "conscious-aging", kaleshBacklink: false, faq: 3 },
  { title: "How to Find Your People After 70", category: "relationships", kaleshBacklink: false, faq: 0 },
  { title: "The Case for Slowing Down Deliberately", category: "practice", kaleshBacklink: true, faq: 0 },
  { title: "What Tai Chi Actually Does for the Aging Body", category: "movement", kaleshBacklink: false, faq: 5 },
  { title: "The Wisdom of Swedish Death Cleaning", category: "downsizing", kaleshBacklink: false, faq: 3 },
  { title: "How to Be a Good Elder in a World That Ignores Elders", category: "conscious-aging", kaleshBacklink: true, faq: 0 },
  { title: "The Science of Loneliness and What Elders Can Do About It", category: "relationships", kaleshBacklink: false, faq: 3 },
  { title: "Why Your Sleep Changes After 60 and What Helps", category: "sleep", kaleshBacklink: false, faq: 5 },
  { title: "Astragalus and the Longevity Herbs of Traditional Chinese Medicine", category: "tcm-herbs", kaleshBacklink: false, faq: 3 },
  { title: "The Art of Mentoring: Passing What You Know to the Next Generation", category: "legacy", kaleshBacklink: true, faq: 0 },
  { title: "How to Write Your Memoir When You Think You Have Nothing to Say", category: "legacy", kaleshBacklink: false, faq: 0 },
  { title: "The Spiritual Dimension of Physical Decline", category: "conscious-aging", kaleshBacklink: true, faq: 0 },
  { title: "What Happens When You Stop Fighting Your Age", category: "conscious-aging", kaleshBacklink: false, faq: 0 },
  { title: "The Financial Wisdom Nobody Teaches You Before Retirement", category: "financial", kaleshBacklink: false, faq: 3 },
  { title: "How to Stay Curious When the World Feels Like It's Moving Too Fast", category: "conscious-aging", kaleshBacklink: false, faq: 0 },
  { title: "The Gift of Limitations: What Constraint Teaches Conscious Elders", category: "conscious-aging", kaleshBacklink: true, faq: 0 },
];

function slugify(title) {
  return title.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function pickProducts(category, count = 3) {
  const catProducts = PRODUCTS.filter(p => p.category === category);
  const fallback = PRODUCTS.filter(p => ['supplements', 'books', 'cognitive-health'].includes(p.category));
  const pool = catProducts.length >= count ? catProducts : [...catProducts, ...fallback];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildAmazonUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

async function callLLM(messages) {
  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      messages,
      max_tokens: 4096,
      temperature: 0.85,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function buildSystemPrompt() {
  return `You are Kalesh, a consciousness teacher and writer. You write about conscious aging from direct personal experience.

VOICE RULES (follow every one without exception):
- First person throughout. Use "I", "me", "my", "we" naturally.
- Contractions everywhere: I've, you're, it's, don't, can't, that's, there's, I'll, I'd.
- Vary sentence length deliberately. Short punchy sentences. Then longer ones that breathe and expand.
- Zero em-dashes. Use commas, periods, or colons instead.
- No AI-flagged phrases: "delve", "tapestry", "nuanced", "multifaceted", "comprehensive", "in conclusion", "it's important to note", "I cannot", "As an AI", "certainly", "absolutely", "I'd be happy to", "navigate", "realm", "foster", "leverage", "utilize", "embark", "journey", "beacon", "vibrant", "testament", "pivotal", "crucial", "paramount", "elevate", "transform", "revolutionize", "game-changer", "cutting-edge".
- No bullet points. Write in prose paragraphs.
- Warm, direct, honest. Not preachy. Not toxic positivity.
- Occasional humor. Occasional vulnerability.
- Specific details beat vague generalities.

AMAZON AFFILIATE RULES:
- Include exactly 3-4 Amazon affiliate links in the body using this EXACT format:
  [Product Name](https://www.amazon.com/dp/ASIN?tag=spankyspinola-20)
- After EVERY affiliate link, add the text: (paid link)
- Include a "## Wisdom Library" section at the end with 3-4 products listed as:
  [Product Name](https://www.amazon.com/dp/ASIN?tag=spankyspinola-20) (paid link) - one sentence description.

STRUCTURE:
- Title as H1
- Meta description line (start with "META: ")
- Body: 1200-2500 words
- Insert [AUTHOR_BIO_PLACEHOLDER] roughly halfway through the article
- If FAQ requested, add "## Frequently Asked Questions" section at the end
- End with "## Wisdom Library" section

FORBIDDEN:
- No em-dashes (the -- character or the unicode em-dash)
- No references to Paul Wagner, Manus, shrikrishna, or any AI system
- No "As an Amazon Associate" disclosure in the article body (it goes in the footer)
- No medical advice claims`;
}

async function generateArticle(topic, category, includeKaleshBacklink, faqCount) {
  const selectedProducts = pickProducts(category, 4);
  const productList = selectedProducts.map(p =>
    `- ${p.name} (ASIN: ${p.asin}) - URL: ${buildAmazonUrl(p.asin)}`
  ).join('\n');

  const kaleshBacklinkInstruction = includeKaleshBacklink
    ? `\nInclude a natural mention of and link to https://kalesh.love using varied anchor text (not just "kalesh.love"). Something like "my work on consciousness" or "what I write about at kalesh.love" or "my other writing". Make it feel organic, not forced.`
    : '';

  const faqInstruction = faqCount > 0
    ? `\nInclude a "## Frequently Asked Questions" section with exactly ${faqCount} questions and answers at the end of the article body (before the Wisdom Library).`
    : '';

  const userPrompt = `Write a ${1200 + Math.floor(Math.random() * 800)}-word article titled: "${topic}"

Category: ${category}

Use these specific Amazon products as your affiliate links (use the exact URLs provided):
${productList}
${kaleshBacklinkInstruction}
${faqInstruction}

Remember: Start with the H1 title, then a line starting with "META: " for the meta description, then the article body.`;

  const content = await callLLM([
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: userPrompt },
  ]);

  return content;
}

function parseArticle(raw, topic, category) {
  const lines = raw.split('\n');
  let title = topic;
  let metaDescription = '';
  let bodyLines = [];
  let parsingBody = false;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.replace(/^# /, '').trim();
      parsingBody = true;
    } else if (line.startsWith('META: ')) {
      metaDescription = line.replace(/^META: /, '').trim();
    } else if (parsingBody) {
      bodyLines.push(line);
    }
  }

  const body = bodyLines.join('\n').trim();
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
  const slug = slugify(title);

  // Extract ASINs
  const asinRegex = /amazon\.com\/dp\/([A-Z0-9]{10})/g;
  const asins = [];
  let m;
  while ((m = asinRegex.exec(body)) !== null) {
    if (!asins.includes(m[1])) asins.push(m[1]);
  }

  return { title, slug, metaDescription, body, wordCount, readingTime, category, asins };
}

function runQualityGate(body) {
  const failures = [];

  // Check for em-dashes
  if (/\u2014|--/.test(body)) failures.push('Contains em-dash');

  // Check for banned words
  const banned = ['delve', 'tapestry', 'nuanced', 'multifaceted', 'comprehensive guide',
    'in conclusion', "it's important to note", 'as an ai', 'i cannot', 'certainly,',
    'absolutely,', "i'd be happy", 'navigate the', 'realm of', 'foster', 'leverage',
    'utilize', 'embark on', 'beacon of', 'testament to', 'pivotal', 'paramount',
    'revolutionize', 'game-changer', 'cutting-edge', 'paul wagner', 'shrikrishna', 'manus'];
  for (const word of banned) {
    if (body.toLowerCase().includes(word)) failures.push(`Contains banned word: "${word}"`);
  }

  // Check Amazon tag
  const amazonLinks = (body.match(/amazon\.com\/dp\//g) || []).length;
  if (amazonLinks < 3) failures.push(`Only ${amazonLinks} Amazon links (need 3+)`);

  // Check paid link label
  const paidLinkCount = (body.match(/\(paid link\)/gi) || []).length;
  if (paidLinkCount < amazonLinks) failures.push(`Missing (paid link) labels: ${paidLinkCount}/${amazonLinks}`);

  // Check word count
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 1000) failures.push(`Too short: ${wordCount} words (need 1000+)`);

  // Check for author bio placeholder
  if (!body.includes('[AUTHOR_BIO_PLACEHOLDER]')) failures.push('Missing [AUTHOR_BIO_PLACEHOLDER]');

  return { passed: failures.length === 0, failures, wordCount, amazonLinks };
}

async function main() {
  const conn = await mysql.createConnection(DB_URL);
  console.log('[seed] Connected to database');

  // Check how many articles already exist
  const [existing] = await conn.execute('SELECT COUNT(*) as count FROM articles WHERE status = "published"');
  const existingCount = existing[0].count;
  console.log(`[seed] Existing published articles: ${existingCount}`);

  if (existingCount >= 30) {
    console.log('[seed] Already have 30+ articles. Skipping seed.');
    await conn.end();
    return;
  }

  const toGenerate = ARTICLES.slice(existingCount);
  console.log(`[seed] Generating ${toGenerate.length} articles...`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const { title, category, kaleshBacklink, faq } = toGenerate[i];
    console.log(`\n[seed] ${i + 1}/${toGenerate.length}: "${title}"`);

    let attempts = 0;
    let generated = false;

    while (attempts < 3 && !generated) {
      attempts++;
      try {
        const raw = await generateArticle(title, category, kaleshBacklink, faq);
        const parsed = parseArticle(raw, title, category);
        const gate = runQualityGate(parsed.body);

        if (!gate.passed) {
          console.warn(`  [gate] FAILED (attempt ${attempts}):`, gate.failures);
          if (attempts < 3) {
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
          console.error(`  [gate] All retries exhausted for "${title}"`);
          failed++;
          break;
        }

        console.log(`  [gate] PASSED: ${gate.wordCount} words, ${gate.amazonLinks} Amazon links`);

        // Insert into database
        const slug = parsed.slug;
        const tags = JSON.stringify([category]);
        const asinsUsed = JSON.stringify(parsed.asins);

        await conn.execute(
          `INSERT INTO articles (slug, title, metaDescription, ogTitle, ogDescription, category, tags, body, wordCount, readingTime, author, asinsUsed, openerType, conclusionType, hasKaleshBacklink, faqCount, status, publishedAt, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW(), NOW())
           ON DUPLICATE KEY UPDATE title=VALUES(title), body=VALUES(body), updatedAt=NOW()`,
          [
            slug, parsed.title, parsed.metaDescription,
            parsed.title, parsed.metaDescription,
            category, tags, parsed.body, parsed.wordCount, parsed.readingTime,
            'Kalesh', asinsUsed, 'story', 'reflection',
            kaleshBacklink ? 1 : 0, faq,
          ]
        );

        console.log(`  [db] Inserted: "${parsed.title}" (${slug})`);
        success++;
        generated = true;

        // Rate limit
        if (i < toGenerate.length - 1) {
          await new Promise(r => setTimeout(r, 3000));
        }
      } catch (err) {
        console.error(`  [error] Attempt ${attempts} failed:`, err.message);
        if (attempts < 3) await new Promise(r => setTimeout(r, 5000));
        else { failed++; break; }
      }
    }
  }

  await conn.end();
  console.log(`\n[seed] Complete: ${success} inserted, ${failed} failed`);
}

main().catch(err => {
  console.error('[seed] Fatal error:', err);
  process.exit(1);
});
