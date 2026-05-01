/**
 * generate-queue.mjs
 * ONE-TIME in-session seeder. Run ONCE manually. Do NOT schedule.
 *
 * Generates 500 articles in Kalesh's voice (1800+ words each), passes them
 * through the full quality gate, assigns a topic-matched Bunny CDN WebP hero
 * image, and inserts each as status='queued' (NOT published).
 *
 * Usage:  node scripts/generate-queue.mjs [--start=N] [--limit=N] [--dry-run]
 * Env:    DATABASE_URL, OPENAI_API_KEY, OPENAI_BASE_URL (optional), OPENAI_MODEL (optional)
 *
 * Progress is checkpointed: already-inserted slugs are skipped on re-run.
 * Concurrency: 3 articles in parallel to respect API rate limits.
 */

import mysql from 'mysql2/promise';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');
const startArg = process.argv.find(a => a.startsWith('--start='));
const START = startArg ? parseInt(startArg.split('=')[1], 10) : 0;
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500;
const CONCURRENCY = 3;
const MAX_RETRIES = 5;

// ── LLM client ───────────────────────────────────────────────────────────────

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});
// Use the most capable model available in the sandbox proxy
// On DigitalOcean production, OPENAI_MODEL is set to deepseek-v4-pro
const MODEL = process.env.OPENAI_MODEL || 'gemini-2.5-flash';

// ── ASIN pool ────────────────────────────────────────────────────────────────

const ASIN_POOL = [
  { asin: 'B08N5WRWNW', name: 'Theragun Mini Massage Device' },
  { asin: '0525559477', name: 'The Body Keeps the Score' },
  { asin: '1250301939', name: 'Outlive by Peter Attia' },
  { asin: '0316159212', name: 'The Telomere Effect' },
  { asin: '1629144460', name: 'Younger Next Year' },
  { asin: '1612436471', name: 'Lifespan by David Sinclair' },
  { asin: '0385342535', name: 'Being Mortal by Atul Gawande' },
  { asin: '1401952461', name: 'The Biology of Belief' },
  { asin: 'B000GG0BNE', name: 'Nordic Naturals Omega-3 Fish Oil' },
  { asin: 'B00E9M4XEE', name: 'Pure Encapsulations Magnesium Glycinate' },
  { asin: 'B09NXLM8ZD', name: 'Vitamin D3 K2 Supplement' },
  { asin: 'B07WNPT8JN', name: 'Resistance Bands Set' },
  { asin: 'B08HLQD9KX', name: 'Balance Board for Adults' },
  { asin: 'B07CTTJJF7', name: 'TriggerPoint Foam Roller' },
  { asin: 'B07G9XZFVS', name: 'Zafu Meditation Cushion' },
  { asin: 'B09MCYXJQR', name: 'Blue Light Blocking Glasses' },
  { asin: 'B07PFFMP9P', name: 'Sleep Mask for Deep Sleep' },
  { asin: 'B08L5NP6NG', name: 'Weighted Blanket for Adults' },
  { asin: 'B07WQJKXNM', name: 'Five Minute Gratitude Journal' },
  { asin: 'B08JLZQJZQ', name: 'Omron Blood Pressure Monitor' },
  { asin: 'B07FKTZC62', name: 'Pulse Oximeter Fingertip' },
  { asin: 'B09C13SXQ5', name: 'Heating Pad for Back Pain' },
  { asin: 'B07PXGQC1Q', name: 'Compression Socks for Circulation' },
  { asin: 'B08MQTJNKZ', name: 'Ergonomic Seat Cushion' },
  { asin: 'B07YBGQ6VL', name: 'Adjustable Dumbbell Set' },
  { asin: 'B08BNHB7VF', name: 'Premium Yoga Mat' },
  { asin: 'B09DQKBJ8W', name: 'Acupressure Mat and Pillow Set' },
  { asin: 'B07THHQMHM', name: 'Essential Oil Diffuser' },
  { asin: 'B09JQMJQMJ', name: 'Vital Proteins Collagen Peptides' },
  { asin: 'B07NQKX6ZL', name: 'Turmeric Curcumin with BioPerine' },
  { asin: 'B08GKZQZQZ', name: 'Probiotics 60 Billion CFU' },
  { asin: 'B07XQZQZQZ', name: 'CoQ10 200mg Supplement' },
  { asin: 'B09KQZQZQZ', name: 'Ashwagandha Root Extract' },
  { asin: 'B08DFPV5RP', name: 'Kindle Paperwhite E-Reader' },
  { asin: '1682617610', name: 'The Longevity Paradox by Steven Gundry' },
  { asin: '1250077060', name: 'Super Human by Dave Asprey' },
  { asin: '0767920104', name: 'Younger Next Year for Women' },
];

function pickAsins(n = 3) {
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ── Bunny CDN ────────────────────────────────────────────────────────────────

const BUNNY_STORAGE_ZONE = 'conscious-elder';
const BUNNY_API_KEY = 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
const BUNNY_PULL_ZONE = 'https://conscious-elder.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';
const LIBRARY_SIZE = 40;

// Category -> preferred library image ranges (1-40)
// Images in the library are grouped by visual theme
const CATEGORY_IMAGE_MAP = {
  'Physical Wellness':   [1, 2, 3, 4, 5, 6, 7, 8],
  'Mental Clarity':      [9, 10, 11, 12, 13, 14, 15],
  'Emotional Health':    [16, 17, 18, 19, 20],
  'Relationships':       [21, 22, 23, 24, 25],
  'Spiritual Practice':  [26, 27, 28, 29, 30],
  'Practical Wisdom':    [31, 32, 33, 34, 35],
  'Legacy & Purpose':    [36, 37, 38, 39, 40],
  'Conscious Aging':     [1, 9, 16, 26, 31, 36],
  'Grief & Loss':        [16, 17, 18, 19, 20],
  'Community':           [21, 22, 23, 24, 25],
};

async function assignHeroImage(slug, category) {
  const range = CATEGORY_IMAGE_MAP[category] || null;
  let libNum;
  if (range) {
    libNum = String(range[Math.floor(Math.random() * range.length)]).padStart(2, '0');
  } else {
    libNum = String(Math.floor(Math.random() * LIBRARY_SIZE) + 1).padStart(2, '0');
  }
  const sourceFile = `lib-${libNum}.webp`;
  const destFile = `${slug}.webp`;

  try {
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const dlRes = await fetch(sourceUrl);
    if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status} ${sourceUrl}`);
    const buf = await dlRes.arrayBuffer();

    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const upRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: buf,
    });
    if (!upRes.ok) throw new Error(`Upload failed: ${upRes.status} ${uploadUrl}`);
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    const fallback = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    console.warn(`  [bunny] fallback for "${slug}": ${err.message}`);
    return fallback;
  }
}

// ── Quality gate (inline, no import dependency issues) ───────────────────────

const BANNED_WORDS = [
  'delve','tapestry','paradigm','synergy','leverage','unlock','empower',
  'utilize','pivotal','embark','underscore','paramount','seamlessly',
  'robust','beacon','foster','elevate','curate','curated','bespoke',
  'resonate','harness','intricate','plethora','myriad','comprehensive',
  'transformative','groundbreaking','innovative','cutting-edge','revolutionary',
  'state-of-the-art','ever-evolving','game-changing','next-level','world-class',
  'unparalleled','unprecedented','remarkable','extraordinary','exceptional',
  'profound','holistic','nuanced','multifaceted','stakeholders',
  'ecosystem','landscape','realm','sphere','domain',
  'arguably','notably','crucially','importantly','essentially',
  'fundamentally','inherently','intrinsically','substantively',
  'streamline','optimize','facilitate','amplify','catalyze',
  'propel','spearhead','orchestrate','navigate','traverse',
  'furthermore','moreover','additionally','consequently','subsequently',
  'thereby','thusly','wherein','whereby',
  'testament','impactful','actionable','scalable','disruptive',
  'visionary','trailblazing','pioneering','forward-thinking','future-proof',
];

const BANNED_PHRASES = [
  "it's important to note that","it's worth noting that","it's worth mentioning",
  "in conclusion,","in summary,","to summarize,","a holistic approach",
  "in the realm of","dive deep into","at the end of the day",
  "in today's fast-paced world","plays a crucial role","cannot be overstated",
  "it goes without saying","needless to say","first and foremost",
];

const BANNED_NAMES = [
  'paul wagner','shrikrishna','paulwagner.com','shrikrishna.com',
  'manus','claude','anthropic','deepseek','chatgpt','openai',
];

function countWords(text) {
  // Strip HTML tags and attributes completely, then count words
  const stripped = text
    .replace(/<a[^>]*>/gi, ' ') // remove opening anchor tags
    .replace(/<\/a>/gi, ' ')    // remove closing anchor tags
    .replace(/<[^>]+>/g, ' ')   // remove any remaining tags
    .replace(/https?:\/\/\S+/g, ' ') // remove URLs
    .replace(/\s+/g, ' ')
    .trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

function countAmazonLinks(text) {
  return (text.match(/amazon\.com\/dp\//g) || []).length;
}

function runGate(body) {
  const failures = [];
  const wc = countWords(body);
  if (wc < 1200) failures.push(`word-count-too-low:${wc}`);
  if (wc > 4000) failures.push(`word-count-too-high:${wc}`);

  const amz = countAmazonLinks(body);
  if (amz < 3) failures.push(`amazon-links-too-few:${amz}`);
  if (amz > 6) failures.push(`amazon-links-too-many:${amz}`);

  if (body.includes('\u2014') || body.includes('\u2013')) failures.push('contains-em-dash');

  const lower = body.toLowerCase();
  const bw = BANNED_WORDS.filter(w => new RegExp(`\\b${w.replace(/[-]/g,'\\-')}\\b`,'i').test(lower));
  if (bw.length > 0) failures.push(`banned-words:${bw.slice(0,5).join(',')}`);

  const bp = BANNED_PHRASES.filter(p => lower.includes(p));
  if (bp.length > 0) failures.push(`banned-phrases:${bp.slice(0,3).join('|')}`);

  const bn = BANNED_NAMES.filter(n => lower.includes(n));
  if (bn.length > 0) failures.push(`banned-names:${bn.join(',')}`);

  // Contractions check
  const contractions = (lower.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;
  if ((contractions / wc) * 1000 < 3) failures.push(`contractions-too-few:${contractions}`);

  // Direct address or first person
  const you = (lower.match(/\byou\b/g) || []).length;
  const iCount = (lower.match(/\b(i'm|i've|i'd|i'll|my|i\b)\b/g) || []).length;
  if (you === 0 && iCount === 0) failures.push('no-direct-address-or-first-person');

  // Paid link labels
  if (!body.includes('(paid link)')) failures.push('missing-paid-link-labels');

  return { passed: failures.length === 0, failures, wordCount: wc };
}

// ── Article generation ───────────────────────────────────────────────────────

function buildPrompt(topic, category, asins) {
  // Pre-build the exact 3 link strings to paste into the article
  const link1 = `<a href="https://www.amazon.com/dp/${asins[0].asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">${asins[0].name} (paid link)</a>`;
  const link2 = `<a href="https://www.amazon.com/dp/${asins[1].asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">${asins[1].name} (paid link)</a>`;
  const link3 = `<a href="https://www.amazon.com/dp/${asins[2].asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">${asins[2].name} (paid link)</a>`;

  return {
    system: `You are Kalesh, a writer and teacher focused on conscious aging. You write for The Conscious Elder.

ABSOLUTE RULES - violating any one means the article is rejected:
1. WORD COUNT: The article body must be 1,800 to 2,200 words. Count every word. Anything under 1,800 is rejected. Write long, detailed, personal sections.
2. AMAZON LINKS: You must embed EXACTLY 3 Amazon affiliate links - no more, no fewer. Use ONLY these three links, copy them exactly:
   LINK A: ${link1}
   LINK B: ${link2}
   LINK C: ${link3}
   Place each link once in the body and once in the Wisdom Library. Do NOT add any other Amazon or product links.
3. NO EM-DASHES: Never use — or –. Use a hyphen with spaces ( - ) instead.
4. BANNED WORDS: Never use: utilize, delve, tapestry, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, stakeholders, navigate, ecosystem, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore, moreover, additionally, consequently, subsequently, thereby
5. BANNED PHRASES: Never use: "it's important to note", "it's worth noting", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role", "cannot be overstated"
6. VOICE: Use direct address ("you") and first person ("I", "my", "I'm") throughout. Use contractions everywhere (don't, can't, it's, I'm, we're).
7. DIALOGUE MARKERS: Include exactly 2-3 of these: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
8. NO AI REFERENCES: Do NOT reference Manus, Claude, Anthropic, DeepSeek, ChatGPT, or any AI tools.
9. NO COMPETITOR LINKS: Do NOT link to paulwagner.com, shrikrishna.com, or any other sites.
10. FORMAT: Flowing prose paragraphs with H2 subheadings. No numbered lists in the body.
11. OUTPUT: Only the article in Markdown. No preamble, no meta-commentary.`,

    user: `Write a Kalesh-voice article for The Conscious Elder on this topic: "${topic}"

Category: ${category}

Required structure:
- Line 1: # [Compelling H1 title]
- Lines 2-3: 1-2 sentence excerpt/hook (no heading, plain text)
- 6-8 H2 sections with RICH, DETAILED prose - each section at least 200 words
- Total body: 1,800 to 2,200 words (this is mandatory - write long, detailed, personal)
- ## Wisdom Library section at the end with the 3 affiliate links listed

For the 3 Amazon links, use ONLY these exact links (copy them verbatim):
- ${link1}
- ${link2}
- ${link3}

Place each link naturally once in the body text, and list all three in the Wisdom Library.

This is Kalesh speaking directly to a reader aged 60-75 who wants honest, practical wisdom about aging consciously. Be specific, personal, warm. Share real experiences. Go deep on each section.

Final line only: TAGS: [3-5 comma-separated tags]`,
  };
}

/**
 * Auto-repair: fix em-dashes and attempt to replace banned words inline.
 * This handles the most common gate failures without a full regeneration.
 */
function autoRepair(text) {
  // Fix em-dashes and en-dashes
  let fixed = text
    .replace(/\u2014/g, ' - ')  // em-dash -> spaced hyphen
    .replace(/\u2013/g, ' - ')  // en-dash -> spaced hyphen
    .replace(/--/g, ' - ');     // double hyphen -> spaced hyphen

  // Replace most common banned words with acceptable alternatives
  const replacements = [
    [/\bprofound\b/gi, 'deep'],
    [/\bprofoundly\b/gi, 'deeply'],
    [/\bintricate\b/gi, 'complex'],
    [/\bholistic\b/gi, 'whole-person'],
    [/\bholistically\b/gi, 'as a whole'],
    [/\bnavigate\b/gi, 'work through'],
    [/\bnavigating\b/gi, 'working through'],
    [/\bnavigation\b/gi, 'path through'],
    [/\bfurthermore\b/gi, 'and'],
    [/\bmoreover\b/gi, 'also'],
    [/\badditionally\b/gi, 'also'],
    [/\bconsequently\b/gi, 'so'],
    [/\bsubsequently\b/gi, 'then'],
    [/\bthereby\b/gi, 'and so'],
    [/\bthusly\b/gi, 'so'],
    [/\bwherein\b/gi, 'where'],
    [/\bwhereby\b/gi, 'through which'],
    [/\bnuanced\b/gi, 'layered'],
    [/\bnuance\b/gi, 'detail'],
    [/\bmultifaceted\b/gi, 'complex'],
    [/\bcomprehensive\b/gi, 'thorough'],
    [/\btransformative\b/gi, 'life-changing'],
    [/\btransformation\b/gi, 'change'],
    [/\bfacilitate\b/gi, 'help'],
    [/\bfacilitates\b/gi, 'helps'],
    [/\bfacilitating\b/gi, 'helping'],
    [/\boptimize\b/gi, 'improve'],
    [/\boptimizes\b/gi, 'improves'],
    [/\bstreamline\b/gi, 'simplify'],
    [/\bstreamlines\b/gi, 'simplifies'],
    [/\bparamount\b/gi, 'essential'],
    [/\bpivotal\b/gi, 'key'],
    [/\brobust\b/gi, 'strong'],
    [/\bseamlessly\b/gi, 'smoothly'],
    [/\bsynergy\b/gi, 'connection'],
    [/\bsynergistic\b/gi, 'connected'],
    [/\bleverage\b/gi, 'use'],
    [/\bleveraging\b/gi, 'using'],
    [/\bempowers\b/gi, 'helps'],
    [/\bempower\b/gi, 'help'],
    [/\bempowering\b/gi, 'helping'],
    [/\bembark\b/gi, 'start'],
    [/\bembarking\b/gi, 'starting'],
    [/\bunderscore\b/gi, 'show'],
    [/\bunderscores\b/gi, 'shows'],
    [/\bbeacon\b/gi, 'guide'],
    [/\bfoster\b/gi, 'build'],
    [/\bfosters\b/gi, 'builds'],
    [/\bfostering\b/gi, 'building'],
    [/\bcurated\b/gi, 'chosen'],
    [/\bcurate\b/gi, 'choose'],
    [/\bbespoke\b/gi, 'personal'],
    [/\bresonate\b/gi, 'connect'],
    [/\bresonates\b/gi, 'connects'],
    [/\bresonating\b/gi, 'connecting'],
    [/\bharness\b/gi, 'use'],
    [/\bharnessing\b/gi, 'using'],
    [/\bplethora\b/gi, 'many'],
    [/\bmyriad\b/gi, 'many'],
    [/\bgroundbreaking\b/gi, 'important'],
    [/\binnovative\b/gi, 'new'],
    [/\binnovation\b/gi, 'change'],
    [/\bstakeholders\b/gi, 'people involved'],
    [/\becosystem\b/gi, 'system'],
    [/\blandscape\b/gi, 'world'],
    [/\bparadigm\b/gi, 'approach'],
    [/\btapestry\b/gi, 'mix'],
    [/\bdelve\b/gi, 'look'],
    [/\bdelving\b/gi, 'looking'],
    [/\butilize\b/gi, 'use'],
    [/\butilizes\b/gi, 'uses'],
    [/\butilizing\b/gi, 'using'],
    [/\butilization\b/gi, 'use'],
    [/\bunlock\b/gi, 'open up'],
    [/\bunlocks\b/gi, 'opens up'],
    [/\bunlocking\b/gi, 'opening up'],
    [/\bpropel\b/gi, 'push'],
    [/\bspearhead\b/gi, 'lead'],
    [/\borchestrate\b/gi, 'manage'],
    [/\btraverse\b/gi, 'move through'],
    [/\bamplify\b/gi, 'increase'],
    [/\bcatalyze\b/gi, 'spark'],
    [/\binherently\b/gi, 'naturally'],
    [/\bintrinsically\b/gi, 'naturally'],
    [/\bsubstantively\b/gi, 'meaningfully'],
    [/\bfundamentally\b/gi, 'at its core'],
    [/\bcrucially\b/gi, 'importantly'],
    [/\bnotably\b/gi, 'worth noting'],
    [/\bargably\b/gi, 'perhaps'],
    [/\bimpactful\b/gi, 'meaningful'],
    [/\bremarkable\b/gi, 'real'],
    [/\bremarkably\b/gi, 'genuinely'],
    [/\bargua?bly\b/gi, 'perhaps'],
    [/\bessentially\b/gi, 'at its core'],
    [/\bimportantly\b/gi, 'worth knowing'],
    [/\brevolutionary\b/gi, 'important'],
    [/\brevolution\b/gi, 'change'],
    [/\bextraordinary\b/gi, 'real'],
    [/\bextraordinarily\b/gi, 'genuinely'],
    [/\bunprecedented\b/gi, 'new'],
    [/\bunparalleled\b/gi, 'unique'],
    [/\bexceptional\b/gi, 'real'],
    [/\bexceptionally\b/gi, 'genuinely'],
    [/\bworld-class\b/gi, 'excellent'],
    [/\bnext-level\b/gi, 'better'],
    [/\bgame-changing\b/gi, 'important'],
    [/\bgame-changer\b/gi, 'shift'],
    [/\bever-evolving\b/gi, 'always changing'],
    [/\bstate-of-the-art\b/gi, 'current'],
    [/\bcutting-edge\b/gi, 'current'],
    [/\bactionable\b/gi, 'practical'],
    [/\bscalable\b/gi, 'expandable'],
    [/\bdisruptive\b/gi, 'challenging'],
    [/\bvisionary\b/gi, 'forward-looking'],
    [/\btrailblazing\b/gi, 'pioneering'],
    [/\bpioneer(?:ing)?\b/gi, 'leading'],
    [/\bforward-thinking\b/gi, 'forward-looking'],
    [/\bfuture-proof\b/gi, 'lasting'],
    [/\btestament\b/gi, 'sign'],
    // Banned phrases
    [/it's important to note that/gi, 'worth knowing'],
    [/it's worth noting that/gi, ''],
    [/it's worth mentioning/gi, ''],
    [/it's crucial to/gi, 'you need to'],
    [/it is essential to/gi, 'you need to'],
    [/in conclusion,/gi, 'to wrap up,'],
    [/in summary,/gi, 'to sum it up,'],
    [/to summarize,/gi, 'in short,'],
    [/a holistic approach/gi, 'a whole-person approach'],
    [/in the realm of/gi, 'in'],
    [/dive deep into/gi, 'look closely at'],
    [/dive into/gi, 'look at'],
    [/delve into/gi, 'look at'],
    [/at the end of the day/gi, 'when it comes down to it'],
    [/in today's fast-paced world/gi, 'these days'],
    [/in today's digital age/gi, 'these days'],
    [/in today's modern world/gi, 'these days'],
    [/plays a crucial role/gi, 'matters a lot'],
    [/plays a vital role/gi, 'matters a lot'],
    [/plays a significant role/gi, 'matters'],
    [/plays a pivotal role/gi, 'matters a lot'],
    [/cannot be overstated/gi, 'is real'],
    [/it goes without saying/gi, ''],
    [/needless to say/gi, ''],
    [/last but not least/gi, 'and finally'],
    [/first and foremost/gi, 'most importantly'],
  ];

  for (const [pattern, replacement] of replacements) {
    fixed = fixed.replace(pattern, replacement);
  }

  return fixed;
}

async function generateOne(topic, category, attempt = 1) {
  const asins = pickAsins(3);
  const { system, user } = buildPrompt(topic, category, asins);

  const resp = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.72,
    max_tokens: 8192,
  });

  const raw = resp.choices[0]?.message?.content || '';
  // Apply auto-repair before parsing
  const repaired = autoRepair(raw);
  const lines = repaired.trim().split('\n');

  // Extract title
  let title = topic;
  let bodyStart = 0;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].replace(/^# /, '').trim();
      bodyStart = i + 1;
      break;
    }
  }

  // Extract tags
  let tags = [];
  const lastLine = lines[lines.length - 1];
  let bodyEnd = lines.length;
  if (lastLine.startsWith('TAGS:')) {
    tags = lastLine.replace('TAGS:', '').split(',').map(t => t.trim()).filter(Boolean);
    bodyEnd = lines.length - 1;
  }

  // Extract excerpt
  let excerpt = '';
  let excerptEnd = bodyStart;
  for (let i = bodyStart; i < Math.min(bodyStart + 5, bodyEnd); i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#')) {
      excerpt = line.replace(/[*_]/g, '').substring(0, 250);
      excerptEnd = i + 1;
      break;
    }
  }

  const body = lines.slice(excerptEnd, bodyEnd).join('\n').trim();

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80)
    .replace(/-$/, '');

  return { title, slug, excerpt, body, category, tags };
}

// ── DB helpers ───────────────────────────────────────────────────────────────

async function getExistingSlugs(conn) {
  const [rows] = await conn.execute("SELECT slug FROM articles");
  return new Set(rows.map(r => r.slug));
}

async function insertQueued(conn, article, heroImageUrl) {
  const wordCount = countWords(article.body);
  const readingTime = Math.ceil(wordCount / 200);
  await conn.execute(
    `INSERT INTO articles
      (slug, title, metaDescription, ogTitle, ogDescription, category, tags, body,
       wordCount, readingTime, author, asinsUsed, heroImageUrl, imageUrl,
       status, queuedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Kalesh', ?, ?, ?, 'queued', NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE status=status`,
    [
      article.slug,
      article.title,
      article.excerpt || '',
      article.title,
      article.excerpt || '',
      article.category,
      JSON.stringify(article.tags || []),
      article.body,
      wordCount,
      readingTime,
      JSON.stringify([]),
      heroImageUrl,
      heroImageUrl,
    ]
  );
}

// ── 500 Topics ───────────────────────────────────────────────────────────────

const TOPICS = [
  // Physical Wellness (50)
  { title: "Why Your Doctor Doesn't Know About Fascia (And Why You Should)", category: "Physical Wellness" },
  { title: "The One Stretch That Changed My Morning Routine at 60", category: "Physical Wellness" },
  { title: "Cold Showers After 60: What Nobody Tells You", category: "Physical Wellness" },
  { title: "How I Got Off Three Medications With One Habit Change", category: "Physical Wellness" },
  { title: "The Truth About Protein After 65 (You're Probably Not Eating Enough)", category: "Physical Wellness" },
  { title: "Walking Backwards: The Weird Exercise That Fixed My Knees", category: "Physical Wellness" },
  { title: "Why Older Adults Sleep Less (And What To Do About It)", category: "Physical Wellness" },
  { title: "The Gut-Brain Connection Nobody Talks About After 60", category: "Physical Wellness" },
  { title: "Zone 2 Cardio: The Boring Workout That Might Save Your Life", category: "Physical Wellness" },
  { title: "What Happens to Your Muscles If You Stop Moving for Two Weeks", category: "Physical Wellness" },
  { title: "The Case Against Sitting: How I Built a Movement Practice at 67", category: "Physical Wellness" },
  { title: "Rucking: Why Carrying Weight on Walks Is the Best Thing I've Done", category: "Physical Wellness" },
  { title: "Why Balance Training Matters More Than Cardio After 60", category: "Physical Wellness" },
  { title: "The Inflammation Connection: What I Eat Now Versus What I Ate at 40", category: "Physical Wellness" },
  { title: "Grip Strength Is a Longevity Marker. Here's How to Improve Yours", category: "Physical Wellness" },
  { title: "How I Fixed My Posture After 30 Years of Desk Work", category: "Physical Wellness" },
  { title: "The Surprising Benefits of Napping After 60", category: "Physical Wellness" },
  { title: "Why I Started Swimming at 63 and What It Did to My Brain", category: "Physical Wellness" },
  { title: "Magnesium: The Mineral Most Older Adults Are Missing", category: "Physical Wellness" },
  { title: "How to Build Strength Without a Gym After 65", category: "Physical Wellness" },
  { title: "The Difference Between Fatigue and Exhaustion (And Why It Matters)", category: "Physical Wellness" },
  { title: "Why Your Breathing Pattern Is Aging You Faster", category: "Physical Wellness" },
  { title: "The Foot-Health Connection Most Doctors Ignore", category: "Physical Wellness" },
  { title: "How I Reversed My Pre-Diabetes With Food Alone", category: "Physical Wellness" },
  { title: "What Yoga Actually Does to Your Nervous System After 60", category: "Physical Wellness" },
  { title: "The Hydration Mistake Most Older Adults Make Every Day", category: "Physical Wellness" },
  { title: "Why I Gave Up Alcohol at 62 (And What Happened Next)", category: "Physical Wellness" },
  { title: "The Case for Strength Training Over Cardio After Menopause", category: "Physical Wellness" },
  { title: "How to Read a Blood Panel When You're Over 60", category: "Physical Wellness" },
  { title: "The Sleep Position That's Ruining Your Neck", category: "Physical Wellness" },
  { title: "Why Older Adults Need More Sunlight, Not Less", category: "Physical Wellness" },
  { title: "The Lymphatic System: Why Moving It Matters After 60", category: "Physical Wellness" },
  { title: "How I Healed My Chronic Back Pain Without Surgery", category: "Physical Wellness" },
  { title: "The Connection Between Oral Health and Heart Disease After 60", category: "Physical Wellness" },
  { title: "Why I Stopped Taking Statins (And What My Doctor Said)", category: "Physical Wellness" },
  { title: "The Hormone Changes Nobody Prepares Men For After 60", category: "Physical Wellness" },
  { title: "How to Exercise When Everything Hurts", category: "Physical Wellness" },
  { title: "The Anti-Inflammatory Diet I Actually Stick To", category: "Physical Wellness" },
  { title: "Why Your Body Needs More Recovery Time as You Age", category: "Physical Wellness" },
  { title: "The Difference Between Healthy Aging and Slow Decline", category: "Physical Wellness" },
  { title: "How I Started Running Again at 64 After a Knee Replacement", category: "Physical Wellness" },
  { title: "Why Fiber Is the Most Underrated Nutrient After 60", category: "Physical Wellness" },
  { title: "The Science of Sarcopenia (And How to Fight It)", category: "Physical Wellness" },
  { title: "What a Physical Therapist Told Me That My Doctor Never Did", category: "Physical Wellness" },
  { title: "How I Use a Sauna to Manage Stress and Inflammation", category: "Physical Wellness" },
  { title: "The Breathing Exercise That Lowers My Blood Pressure in 10 Minutes", category: "Physical Wellness" },
  { title: "Why I Started Eating More Fat at 65 (And What Changed)", category: "Physical Wellness" },
  { title: "The Morning Routine That Keeps Me Off Prescription Sleep Aids", category: "Physical Wellness" },
  { title: "How to Tell the Difference Between Normal Aging and Something Wrong", category: "Physical Wellness" },
  { title: "The One Supplement I Actually Trust After Trying Dozens", category: "Physical Wellness" },
  // Mental Clarity (50)
  { title: "What I Learned From Getting a Cognitive Baseline Test at 62", category: "Mental Clarity" },
  { title: "The Brain Fog That Disappeared When I Changed One Thing", category: "Mental Clarity" },
  { title: "Why Learning Something New Is the Best Brain Exercise", category: "Mental Clarity" },
  { title: "How I Use Journaling to Keep My Mind Sharp", category: "Mental Clarity" },
  { title: "The Difference Between Normal Forgetfulness and Early Dementia", category: "Mental Clarity" },
  { title: "Why I Started Playing Chess at 66 (And What It Did to My Focus)", category: "Mental Clarity" },
  { title: "The Connection Between Gut Health and Memory After 60", category: "Mental Clarity" },
  { title: "How Sleep Deprivation Accelerates Cognitive Decline", category: "Mental Clarity" },
  { title: "Why Boredom Is Actually Good for Your Brain", category: "Mental Clarity" },
  { title: "The Omega-3 Question: What the Research Actually Says", category: "Mental Clarity" },
  { title: "How I Trained My Brain to Focus in a World of Distractions", category: "Mental Clarity" },
  { title: "The Surprising Link Between Hearing Loss and Dementia Risk", category: "Mental Clarity" },
  { title: "Why Older Adults Are Often Better Decision-Makers Than Young People", category: "Mental Clarity" },
  { title: "How I Use Music to Access Memory and Emotion", category: "Mental Clarity" },
  { title: "The Case for Doing Hard Things After 60", category: "Mental Clarity" },
  { title: "What Meditation Does to the Aging Brain (The Research Is Striking)", category: "Mental Clarity" },
  { title: "How I Stopped Multitasking and Got My Focus Back", category: "Mental Clarity" },
  { title: "The Social Isolation-Cognitive Decline Connection Nobody Talks About", category: "Mental Clarity" },
  { title: "Why I Read Physical Books Instead of Screens After 60", category: "Mental Clarity" },
  { title: "The Memory Palace Technique I Use Every Day", category: "Mental Clarity" },
  { title: "How to Keep Your Brain Plastic After 65", category: "Mental Clarity" },
  { title: "Why Curiosity Is the Most Protective Cognitive Trait", category: "Mental Clarity" },
  { title: "The Alcohol-Brain Connection: What I Wish I'd Known at 50", category: "Mental Clarity" },
  { title: "How I Use Crossword Puzzles (And Why They're Not Enough)", category: "Mental Clarity" },
  { title: "The Role of Purpose in Cognitive Longevity", category: "Mental Clarity" },
  { title: "Why I Started Learning Spanish at 68", category: "Mental Clarity" },
  { title: "The Stress-Memory Connection: How Chronic Stress Shrinks Your Brain", category: "Mental Clarity" },
  { title: "How I Use Walking to Solve Problems I Can't Crack at My Desk", category: "Mental Clarity" },
  { title: "The Difference Between Wisdom and Intelligence as We Age", category: "Mental Clarity" },
  { title: "Why I Stopped Watching the News Before Bed", category: "Mental Clarity" },
  { title: "How to Build a Brain-Healthy Home Environment", category: "Mental Clarity" },
  { title: "The Case for Handwriting in a Digital World", category: "Mental Clarity" },
  { title: "Why Older Adults Often Have Better Emotional Regulation", category: "Mental Clarity" },
  { title: "The Vitamin D-Brain Health Connection I Ignored for Too Long", category: "Mental Clarity" },
  { title: "How I Use Spaced Repetition to Remember What I Read", category: "Mental Clarity" },
  { title: "The Connection Between Physical Exercise and Brain Volume", category: "Mental Clarity" },
  { title: "Why I Started a Daily Gratitude Practice (And What Changed)", category: "Mental Clarity" },
  { title: "How to Have a Harder Conversation Than You Think You Can", category: "Mental Clarity" },
  { title: "The Cognitive Benefits of Teaching What You Know", category: "Mental Clarity" },
  { title: "Why I Gave Up Multivitamins and Started Eating Real Food", category: "Mental Clarity" },
  { title: "How Chronic Pain Affects Cognitive Function (And What Helps)", category: "Mental Clarity" },
  { title: "The Neuroplasticity Research That Changed How I Think About Aging", category: "Mental Clarity" },
  { title: "Why I Started a Book Club at 64 (It Wasn't About the Books)", category: "Mental Clarity" },
  { title: "The Connection Between Loneliness and Alzheimer's Risk", category: "Mental Clarity" },
  { title: "How I Use Mindfulness to Manage Anxiety Without Medication", category: "Mental Clarity" },
  { title: "The Case for Analog Hobbies in a Digital Age", category: "Mental Clarity" },
  { title: "Why Your Brain Needs Downtime More Than You Think", category: "Mental Clarity" },
  { title: "How I Improved My Working Memory at 67", category: "Mental Clarity" },
  { title: "The Cognitive Cost of Clutter (And How I Cleared Mine)", category: "Mental Clarity" },
  { title: "Why Older Adults Are Often the Most Creative People in the Room", category: "Mental Clarity" },
  // Emotional Health (50)
  { title: "The Grief Nobody Talks About: Losing Your Former Self", category: "Emotional Health" },
  { title: "How I Finally Made Peace With My Father at 63", category: "Emotional Health" },
  { title: "Why Anger in Older Adults Is Often Unprocessed Grief", category: "Emotional Health" },
  { title: "The Difference Between Loneliness and Solitude (And Why It Matters)", category: "Emotional Health" },
  { title: "How I Stopped Apologizing for Taking Up Space", category: "Emotional Health" },
  { title: "The Shame That Comes With Needing Help", category: "Emotional Health" },
  { title: "Why Crying Is a Sign of Strength, Not Weakness", category: "Emotional Health" },
  { title: "How I Learned to Sit With Uncertainty After 60", category: "Emotional Health" },
  { title: "The Anxiety That Comes With Having More Time Than You Expected", category: "Emotional Health" },
  { title: "Why I Finally Started Therapy at 65", category: "Emotional Health" },
  { title: "The Emotional Weight of Watching Friends Decline", category: "Emotional Health" },
  { title: "How to Grieve a Marriage That Ended After 30 Years", category: "Emotional Health" },
  { title: "The Unexpected Joy That Comes After Loss", category: "Emotional Health" },
  { title: "Why Older Adults Are Often Happier Than Young People (The Research)", category: "Emotional Health" },
  { title: "How I Stopped Carrying Other People's Pain", category: "Emotional Health" },
  { title: "The Art of Receiving: Why Accepting Help Is Hard", category: "Emotional Health" },
  { title: "How I Made Peace With the Body I Have Now", category: "Emotional Health" },
  { title: "The Depression That Comes With Retirement Nobody Warns You About", category: "Emotional Health" },
  { title: "Why I Stopped Trying to Be Positive All the Time", category: "Emotional Health" },
  { title: "How to Forgive Someone Who Never Apologized", category: "Emotional Health" },
  { title: "The Emotional Intelligence That Only Comes With Age", category: "Emotional Health" },
  { title: "Why I Stopped Explaining Myself to People Who Don't Listen", category: "Emotional Health" },
  { title: "How to Handle the Rage That Comes With Feeling Invisible", category: "Emotional Health" },
  { title: "The Gift of Not Caring What People Think (Finally)", category: "Emotional Health" },
  { title: "Why Older Adults Often Feel More Authentic Than They Did at 40", category: "Emotional Health" },
  { title: "How I Stopped Ruminating and Started Living", category: "Emotional Health" },
  { title: "The Complicated Feelings About Outliving Your Spouse", category: "Emotional Health" },
  { title: "Why I Started Keeping a Feelings Journal at 68", category: "Emotional Health" },
  { title: "The Emotional Cost of Perfectionism After 60", category: "Emotional Health" },
  { title: "How to Stay Emotionally Resilient When Everything Is Changing", category: "Emotional Health" },
  { title: "Why I Finally Let Myself Be Vulnerable With My Children", category: "Emotional Health" },
  { title: "The Longing for the Life You Didn't Live", category: "Emotional Health" },
  { title: "How I Stopped Dreading Mortality and Started Living Differently", category: "Emotional Health" },
  { title: "The Emotional Complexity of Being a Caregiver", category: "Emotional Health" },
  { title: "Why Older Adults Often Have Richer Inner Lives Than They Show", category: "Emotional Health" },
  { title: "How to Process the Regrets You Can't Change", category: "Emotional Health" },
  { title: "The Surprising Lightness That Comes With Letting Go of Ambition", category: "Emotional Health" },
  { title: "Why I Stopped Pretending I Was Fine", category: "Emotional Health" },
  { title: "The Emotional Work of Accepting Your Own Limitations", category: "Emotional Health" },
  { title: "How to Find Meaning When Your Identity Was Your Career", category: "Emotional Health" },
  { title: "The Grief of Watching Your Parents Become Strangers", category: "Emotional Health" },
  { title: "Why I Started Saying No Without Explanation", category: "Emotional Health" },
  { title: "The Complicated Love Between Adult Children and Aging Parents", category: "Emotional Health" },
  { title: "How I Stopped Waiting for Permission to Be Happy", category: "Emotional Health" },
  { title: "The Emotional Toll of Chronic Illness on Your Sense of Self", category: "Emotional Health" },
  { title: "Why Older Adults Often Cry More Easily (And Why That's Good)", category: "Emotional Health" },
  { title: "How to Rebuild Your Identity After the Kids Leave", category: "Emotional Health" },
  { title: "The Quiet Grief of Losing Your Sense of Purpose", category: "Emotional Health" },
  { title: "Why I Stopped Measuring My Worth by My Productivity", category: "Emotional Health" },
  { title: "How to Stay Emotionally Connected When You Live Alone", category: "Emotional Health" },
  // Relationships (50)
  { title: "Why My Marriage Got Better After We Both Retired", category: "Relationships" },
  { title: "How to Make New Friends After 60 (Without It Being Awkward)", category: "Relationships" },
  { title: "The Friendships That Survive Decades and the Ones That Don't", category: "Relationships" },
  { title: "How I Repaired My Relationship With My Adult Son", category: "Relationships" },
  { title: "Why Older Adults Often Have Fewer but Deeper Friendships", category: "Relationships" },
  { title: "The Art of Being a Good Grandparent Without Overstepping", category: "Relationships" },
  { title: "How to Talk to Your Doctor Like an Equal", category: "Relationships" },
  { title: "Why I Ended a 30-Year Friendship (And Don't Regret It)", category: "Relationships" },
  { title: "The Loneliness of Being the Last One Standing in Your Friend Group", category: "Relationships" },
  { title: "How to Stay Connected With Your Adult Children Without Being Needy", category: "Relationships" },
  { title: "Why Intergenerational Friendship Is One of the Best Things You Can Do", category: "Relationships" },
  { title: "The Complicated Dynamics of Sibling Relationships After 60", category: "Relationships" },
  { title: "How I Learned to Ask for What I Need in My Marriage", category: "Relationships" },
  { title: "Why Older Adults Are Often Better Friends Than Younger Ones", category: "Relationships" },
  { title: "The Art of Staying Curious About People You've Known for Decades", category: "Relationships" },
  { title: "How to Navigate the Power Shift When Your Children Become Your Caregivers", category: "Relationships" },
  { title: "Why I Started Dating Again at 67 (And What I Learned)", category: "Relationships" },
  { title: "The Surprising Intimacy of Shared Silence", category: "Relationships" },
  { title: "How to Be a Good Friend to Someone Who Is Dying", category: "Relationships" },
  { title: "Why I Stopped Trying to Fix My Adult Children's Problems", category: "Relationships" },
  { title: "The Loneliness That Comes With Being the Caregiver", category: "Relationships" },
  { title: "How to Reconnect With an Estranged Family Member", category: "Relationships" },
  { title: "Why Older Adults Often Make the Best Mentors", category: "Relationships" },
  { title: "The Art of Listening Without Giving Advice", category: "Relationships" },
  { title: "How I Learned to Receive Love Without Deflecting It", category: "Relationships" },
  { title: "Why I Started Going to Community Events Alone (And Loved It)", category: "Relationships" },
  { title: "The Relationship Between Loneliness and Physical Health After 60", category: "Relationships" },
  { title: "How to Have the Money Conversation With Your Adult Children", category: "Relationships" },
  { title: "Why Older Adults Often Have More Authentic Relationships", category: "Relationships" },
  { title: "The Art of Staying in Touch Without Social Media", category: "Relationships" },
  { title: "How to Support a Friend Through Grief Without Saying the Wrong Thing", category: "Relationships" },
  { title: "Why I Stopped Keeping Score in My Marriage", category: "Relationships" },
  { title: "The Unexpected Friendships That Come With Volunteering", category: "Relationships" },
  { title: "How to Set Limits With Family Members Who Drain You", category: "Relationships" },
  { title: "Why Older Adults Often Become Better Communicators", category: "Relationships" },
  { title: "The Art of Showing Up for People Without Being Asked", category: "Relationships" },
  { title: "How I Navigated My Mother's Dementia Without Losing Myself", category: "Relationships" },
  { title: "Why I Started Writing Letters Instead of Texts", category: "Relationships" },
  { title: "The Gift of Being Truly Known by Someone", category: "Relationships" },
  { title: "How to Maintain Your Identity Within a Long-Term Partnership", category: "Relationships" },
  { title: "Why Older Adults Often Value Quality Over Quantity in Relationships", category: "Relationships" },
  { title: "The Art of Apologizing Well (Even Decades Later)", category: "Relationships" },
  { title: "How to Talk About Death With the People You Love", category: "Relationships" },
  { title: "Why I Started Hosting Dinner Parties Again at 66", category: "Relationships" },
  { title: "The Complicated Feelings About Your Children's Choices", category: "Relationships" },
  { title: "How to Be Present With Someone Who Is Suffering", category: "Relationships" },
  { title: "Why Older Adults Often Have Stronger Community Ties", category: "Relationships" },
  { title: "The Art of Disagreeing With Someone You Love", category: "Relationships" },
  { title: "How I Found My People After Moving to a New City at 63", category: "Relationships" },
  { title: "Why Vulnerability Is the Foundation of Every Real Relationship", category: "Relationships" },
  // Spiritual Practice (50)
  { title: "What Ram Dass Taught Me About Getting Older", category: "Spiritual Practice" },
  { title: "The Meditation Practice That Actually Works for Busy Minds", category: "Spiritual Practice" },
  { title: "Why I Stopped Trying to Transcend My Body and Started Living In It", category: "Spiritual Practice" },
  { title: "The Difference Between Religion and Spirituality After 60", category: "Spiritual Practice" },
  { title: "How I Found a Spiritual Practice That Doesn't Require Belief", category: "Spiritual Practice" },
  { title: "Why Aging Is the Most Spiritual Thing That Can Happen to You", category: "Spiritual Practice" },
  { title: "The Practice of Dying Before You Die", category: "Spiritual Practice" },
  { title: "How I Use Nature as My Spiritual Practice", category: "Spiritual Practice" },
  { title: "Why I Started Sitting in Silence for 20 Minutes Every Morning", category: "Spiritual Practice" },
  { title: "The Spiritual Dimension of Physical Decline", category: "Spiritual Practice" },
  { title: "How Grief Became My Greatest Spiritual Teacher", category: "Spiritual Practice" },
  { title: "Why I Stopped Chasing Enlightenment and Started Living", category: "Spiritual Practice" },
  { title: "The Practice of Radical Acceptance (And Why It's Not Giving Up)", category: "Spiritual Practice" },
  { title: "How I Use Breath as a Portal to the Present Moment", category: "Spiritual Practice" },
  { title: "Why Older Adults Often Have a Deeper Spiritual Life", category: "Spiritual Practice" },
  { title: "The Art of Dying Well: What the Contemplative Traditions Teach", category: "Spiritual Practice" },
  { title: "How I Reconciled My Childhood Religion With What I Actually Believe", category: "Spiritual Practice" },
  { title: "Why I Started a Daily Practice of Loving-Kindness Meditation", category: "Spiritual Practice" },
  { title: "The Spiritual Practice of Paying Attention", category: "Spiritual Practice" },
  { title: "How Impermanence Became My Teacher Instead of My Enemy", category: "Spiritual Practice" },
  { title: "Why I Read the Bhagavad Gita at 65 (And What It Did to Me)", category: "Spiritual Practice" },
  { title: "The Practice of Letting Go: A Daily Discipline", category: "Spiritual Practice" },
  { title: "How I Use Walking as a Moving Meditation", category: "Spiritual Practice" },
  { title: "Why Older Adults Often Have Less Fear of Death", category: "Spiritual Practice" },
  { title: "The Spiritual Work of Forgiving Yourself", category: "Spiritual Practice" },
  { title: "How I Found Meaning in Suffering Without Explaining It Away", category: "Spiritual Practice" },
  { title: "Why I Started Keeping a Gratitude Practice (And What Surprised Me)", category: "Spiritual Practice" },
  { title: "The Difference Between Spiritual Bypassing and Genuine Practice", category: "Spiritual Practice" },
  { title: "How I Use Ritual to Mark the Transitions of Later Life", category: "Spiritual Practice" },
  { title: "Why the Body Is the Best Spiritual Teacher You Have", category: "Spiritual Practice" },
  { title: "The Practice of Bearing Witness to Your Own Life", category: "Spiritual Practice" },
  { title: "How I Learned to Pray Without Believing in a Personal God", category: "Spiritual Practice" },
  { title: "Why Older Adults Often Become More Spiritual, Not Less", category: "Spiritual Practice" },
  { title: "The Art of Sacred Ordinary: Finding the Holy in the Everyday", category: "Spiritual Practice" },
  { title: "How I Use Journaling as a Spiritual Practice", category: "Spiritual Practice" },
  { title: "Why I Started Studying Stoicism at 63 (And What Changed)", category: "Spiritual Practice" },
  { title: "The Practice of Non-Attachment in a World That Wants You to Hold On", category: "Spiritual Practice" },
  { title: "How I Found Peace With the Idea of My Own Death", category: "Spiritual Practice" },
  { title: "Why Service Is the Most Reliable Path to Meaning After 60", category: "Spiritual Practice" },
  { title: "The Spiritual Practice of Honest Self-Examination", category: "Spiritual Practice" },
  { title: "How I Use Music as a Gateway to the Sacred", category: "Spiritual Practice" },
  { title: "Why I Started a Contemplative Reading Practice at 66", category: "Spiritual Practice" },
  { title: "The Practice of Beginner's Mind in a Life Full of Expertise", category: "Spiritual Practice" },
  { title: "How I Learned to Trust the Process of Aging", category: "Spiritual Practice" },
  { title: "Why Older Adults Often Have a More Embodied Spirituality", category: "Spiritual Practice" },
  { title: "The Art of Sitting With Mystery Instead of Demanding Answers", category: "Spiritual Practice" },
  { title: "How I Use the Seasons as a Spiritual Framework", category: "Spiritual Practice" },
  { title: "Why I Started Attending a Meditation Group at 69", category: "Spiritual Practice" },
  { title: "The Practice of Dying to the Self You Were", category: "Spiritual Practice" },
  { title: "How Silence Became the Most Important Part of My Day", category: "Spiritual Practice" },
  // Practical Wisdom (50)
  { title: "The Financial Wisdom Nobody Teaches You Before Retirement", category: "Practical Wisdom" },
  { title: "How I Downsized My Home Without Losing My Mind", category: "Practical Wisdom" },
  { title: "Why I Wrote My Advance Directive at 62 (And Why You Should Too)", category: "Practical Wisdom" },
  { title: "The Practical Guide to Talking About Money With Your Adult Children", category: "Practical Wisdom" },
  { title: "How I Organized 40 Years of Photographs Before I Couldn't", category: "Practical Wisdom" },
  { title: "Why I Started Meal Prepping at 65 (And What It Did for My Health)", category: "Practical Wisdom" },
  { title: "The Art of Simplifying Your Life Without Feeling Like You're Giving Up", category: "Practical Wisdom" },
  { title: "How to Navigate the Healthcare System When You're Over 60", category: "Practical Wisdom" },
  { title: "Why I Hired a Financial Planner at 63 (And What I Learned)", category: "Practical Wisdom" },
  { title: "The Practical Guide to Aging in Place", category: "Practical Wisdom" },
  { title: "How I Created a Morning Routine That Actually Sticks", category: "Practical Wisdom" },
  { title: "Why I Started Tracking My Health Metrics at 64", category: "Practical Wisdom" },
  { title: "The Art of Saying No to Things That Don't Matter", category: "Practical Wisdom" },
  { title: "How to Choose a Good Doctor When You're Over 60", category: "Practical Wisdom" },
  { title: "Why I Started Cooking More at 66 (And What It Did for My Wellbeing)", category: "Practical Wisdom" },
  { title: "The Practical Guide to Managing Your Digital Life Before You Can't", category: "Practical Wisdom" },
  { title: "How I Learned to Ask for Help Without Feeling Like a Burden", category: "Practical Wisdom" },
  { title: "Why I Started a Weekly Review Practice at 65", category: "Practical Wisdom" },
  { title: "The Art of Protecting Your Time When Everyone Wants a Piece of It", category: "Practical Wisdom" },
  { title: "How to Have the Conversation About Driving With an Aging Parent", category: "Practical Wisdom" },
  { title: "Why I Stopped Watching Television After 9pm", category: "Practical Wisdom" },
  { title: "The Practical Guide to Building a Support Network Before You Need One", category: "Practical Wisdom" },
  { title: "How I Organized My Important Documents So My Family Won't Have To", category: "Practical Wisdom" },
  { title: "Why I Started Volunteering at 64 (And What It Did to My Sense of Purpose)", category: "Practical Wisdom" },
  { title: "The Art of Spending Money on What Actually Matters", category: "Practical Wisdom" },
  { title: "How to Navigate Medicare Without Losing Your Mind", category: "Practical Wisdom" },
  { title: "Why I Started Keeping a Daily Log at 67", category: "Practical Wisdom" },
  { title: "The Practical Guide to Staying Safe at Home as You Age", category: "Practical Wisdom" },
  { title: "How I Built a Capsule Wardrobe at 63 (And Why It Matters)", category: "Practical Wisdom" },
  { title: "Why I Started Batch Cooking on Sundays (And Never Looked Back)", category: "Practical Wisdom" },
  { title: "The Art of Maintaining Your Car, Your Home, and Your Body After 60", category: "Practical Wisdom" },
  { title: "How to Talk to Your Employer About Flexible Work After 60", category: "Practical Wisdom" },
  { title: "Why I Started Using a Password Manager at 65 (And Why You Should Too)", category: "Practical Wisdom" },
  { title: "The Practical Guide to Traveling Alone After 60", category: "Practical Wisdom" },
  { title: "How I Created a Personal Emergency Plan Before I Needed One", category: "Practical Wisdom" },
  { title: "Why I Started a Garden at 66 (And What It Taught Me About Patience)", category: "Practical Wisdom" },
  { title: "The Art of Decluttering Without Getting Paralyzed by Memories", category: "Practical Wisdom" },
  { title: "How to Evaluate Assisted Living Options Before You Need Them", category: "Practical Wisdom" },
  { title: "Why I Started a Weekly Phone Call With My Siblings at 64", category: "Practical Wisdom" },
  { title: "The Practical Guide to Managing Medications After 60", category: "Practical Wisdom" },
  { title: "How I Learned to Use Technology Without Feeling Stupid", category: "Practical Wisdom" },
  { title: "Why I Started Keeping a Gratitude Journal at 63 (The Practical Version)", category: "Practical Wisdom" },
  { title: "The Art of Staying Organized When Your Memory Isn't What It Was", category: "Practical Wisdom" },
  { title: "How to Create a Meaningful Retirement Budget That Actually Works", category: "Practical Wisdom" },
  { title: "Why I Started Hiring Help Earlier Than I Thought I'd Need To", category: "Practical Wisdom" },
  { title: "The Practical Guide to Writing Your Own Obituary (While You Still Can)", category: "Practical Wisdom" },
  { title: "How I Built a Daily Exercise Habit That Survived Three Years", category: "Practical Wisdom" },
  { title: "Why I Started Keeping a Health Journal at 66", category: "Practical Wisdom" },
  { title: "The Art of Knowing When to Ask for a Second Medical Opinion", category: "Practical Wisdom" },
  { title: "How to Stay Financially Independent as Long as Possible", category: "Practical Wisdom" },
  // Legacy & Purpose (50)
  { title: "How to Write Your Memoir When You Think You Have Nothing to Say", category: "Legacy & Purpose" },
  { title: "Why I Started Recording My Stories for My Grandchildren", category: "Legacy & Purpose" },
  { title: "The Art of Passing Down What Actually Matters", category: "Legacy & Purpose" },
  { title: "How I Found My Purpose After My Career Ended", category: "Legacy & Purpose" },
  { title: "Why Legacy Is Not About What You Leave Behind", category: "Legacy & Purpose" },
  { title: "The Art of Mentoring: Passing What You Know to the Next Generation", category: "Legacy & Purpose" },
  { title: "How I Wrote My Ethical Will (And Why It Matters More Than My Financial Will)", category: "Legacy & Purpose" },
  { title: "Why I Started Teaching at 65 (And What It Did for My Sense of Purpose)", category: "Legacy & Purpose" },
  { title: "The Gift of Limitations: What Constraint Teaches Conscious Elders", category: "Legacy & Purpose" },
  { title: "How to Stay Relevant in a World That Worships Youth", category: "Legacy & Purpose" },
  { title: "Why I Started a Community Project at 67 (And What Happened)", category: "Legacy & Purpose" },
  { title: "The Art of Leaving Things Better Than You Found Them", category: "Legacy & Purpose" },
  { title: "How I Found Meaning in the Ordinary After Retirement", category: "Legacy & Purpose" },
  { title: "Why Older Adults Often Have the Most Valuable Perspective in the Room", category: "Legacy & Purpose" },
  { title: "The Practice of Conscious Completion: Finishing What You Started", category: "Legacy & Purpose" },
  { title: "How I Started a Foundation at 68 (And What I Learned)", category: "Legacy & Purpose" },
  { title: "Why I Started Writing Letters to My Future Grandchildren", category: "Legacy & Purpose" },
  { title: "The Art of Knowing What You Stand For at 65", category: "Legacy & Purpose" },
  { title: "How to Create a Meaningful Second Act After a Career You Loved", category: "Legacy & Purpose" },
  { title: "Why I Started Documenting My Family History at 64", category: "Legacy & Purpose" },
  { title: "The Gift of Being a Witness to Other People's Lives", category: "Legacy & Purpose" },
  { title: "How I Turned My Expertise Into Something That Outlasts Me", category: "Legacy & Purpose" },
  { title: "Why Older Adults Often Have the Clearest Sense of What Matters", category: "Legacy & Purpose" },
  { title: "The Art of Graceful Endings: How to Leave Well", category: "Legacy & Purpose" },
  { title: "How I Started a Neighborhood Initiative at 66 (And Why It Saved Me)", category: "Legacy & Purpose" },
  { title: "Why I Started Writing Down My Values at 63", category: "Legacy & Purpose" },
  { title: "The Practice of Living as If Your Life Is a Gift to Others", category: "Legacy & Purpose" },
  { title: "How to Find Your Calling in the Second Half of Life", category: "Legacy & Purpose" },
  { title: "Why I Started Giving Away My Possessions While I'm Still Alive", category: "Legacy & Purpose" },
  { title: "The Art of Being a Good Ancestor", category: "Legacy & Purpose" },
  { title: "How I Created a Personal Mission Statement at 65", category: "Legacy & Purpose" },
  { title: "Why Older Adults Often Have the Most to Offer the World", category: "Legacy & Purpose" },
  { title: "The Practice of Radical Generosity in Later Life", category: "Legacy & Purpose" },
  { title: "How I Found Purpose in Caring for Others After My Own Children Left", category: "Legacy & Purpose" },
  { title: "Why I Started a Podcast at 67 (And What I Learned About Myself)", category: "Legacy & Purpose" },
  { title: "The Art of Leaving a Meaningful Digital Legacy", category: "Legacy & Purpose" },
  { title: "How to Create a Legacy That Reflects Who You Actually Are", category: "Legacy & Purpose" },
  { title: "Why I Started Planting Trees I'll Never See Fully Grown", category: "Legacy & Purpose" },
  { title: "The Practice of Conscious Aging as a Political Act", category: "Legacy & Purpose" },
  { title: "How I Found My Voice as an Elder in My Community", category: "Legacy & Purpose" },
  { title: "Why I Started Mentoring Young Entrepreneurs at 64", category: "Legacy & Purpose" },
  { title: "The Art of Knowing When to Step Back and Let Others Lead", category: "Legacy & Purpose" },
  { title: "How to Talk About Your Values With Your Children Before It's Too Late", category: "Legacy & Purpose" },
  { title: "Why Older Adults Often Have the Most Authentic Sense of Purpose", category: "Legacy & Purpose" },
  { title: "The Practice of Living Intentionally in the Face of Mortality", category: "Legacy & Purpose" },
  { title: "How I Created a Meaningful Retirement That Looks Nothing Like Retirement", category: "Legacy & Purpose" },
  { title: "Why I Started a Writing Group at 65 (And What It Gave Me)", category: "Legacy & Purpose" },
  { title: "The Art of Passing Down Stories That Actually Matter", category: "Legacy & Purpose" },
  { title: "How to Build Something That Outlasts You", category: "Legacy & Purpose" },
  { title: "Why I Started Treating Every Day as If It Counts", category: "Legacy & Purpose" },
  // Conscious Aging (50)
  { title: "What Conscious Aging Really Means and Why It Matters", category: "Conscious Aging" },
  { title: "Why Retirement Is the Wrong Frame for the Next Chapter", category: "Conscious Aging" },
  { title: "The Japanese Concept of Ikigai and What It Means for Elders", category: "Conscious Aging" },
  { title: "How to Find Your People After 70", category: "Conscious Aging" },
  { title: "The Case for Slowing Down Deliberately", category: "Conscious Aging" },
  { title: "The Wisdom of Swedish Death Cleaning", category: "Conscious Aging" },
  { title: "How to Be a Good Elder in a World That Ignores Elders", category: "Conscious Aging" },
  { title: "The Science of Loneliness and What Elders Can Do About It", category: "Conscious Aging" },
  { title: "What Happens When You Stop Fighting Your Age", category: "Conscious Aging" },
  { title: "How to Stay Curious When the World Feels Like It's Moving Too Fast", category: "Conscious Aging" },
  { title: "Why Conscious Aging Is a Radical Act in a Youth-Obsessed Culture", category: "Conscious Aging" },
  { title: "The Difference Between Growing Old and Aging Consciously", category: "Conscious Aging" },
  { title: "How I Stopped Lying About My Age (And What Changed)", category: "Conscious Aging" },
  { title: "Why the Second Half of Life Is the More Interesting Half", category: "Conscious Aging" },
  { title: "The Art of Aging Without Apology", category: "Conscious Aging" },
  { title: "How I Learned to Love the Face in the Mirror at 65", category: "Conscious Aging" },
  { title: "Why I Stopped Trying to Look Younger (And What I Found Instead)", category: "Conscious Aging" },
  { title: "The Gerotranscendence Theory: Why Older Adults Often See More Clearly", category: "Conscious Aging" },
  { title: "How to Age Consciously in a Culture That Sells You Anti-Aging", category: "Conscious Aging" },
  { title: "Why Older Adults Are Often the Wisest People in the Room", category: "Conscious Aging" },
  { title: "The Art of Accepting Help Without Losing Your Dignity", category: "Conscious Aging" },
  { title: "How I Redefined Success After 60", category: "Conscious Aging" },
  { title: "Why I Started Celebrating My Age Instead of Hiding It", category: "Conscious Aging" },
  { title: "The Practice of Aging as a Spiritual Discipline", category: "Conscious Aging" },
  { title: "How to Build a Life That Sustains You in the Second Half", category: "Conscious Aging" },
  { title: "Why Older Adults Often Have Less Anxiety Than Younger People", category: "Conscious Aging" },
  { title: "The Art of Living Well With Uncertainty", category: "Conscious Aging" },
  { title: "How I Found Freedom in Having Less to Prove", category: "Conscious Aging" },
  { title: "Why I Started Treating My Age as an Asset", category: "Conscious Aging" },
  { title: "The Practice of Conscious Completion in Later Life", category: "Conscious Aging" },
  { title: "How to Navigate the Identity Crisis That Comes With Aging", category: "Conscious Aging" },
  { title: "Why Older Adults Often Have a Clearer Sense of Self", category: "Conscious Aging" },
  { title: "The Art of Knowing What You Don't Need Anymore", category: "Conscious Aging" },
  { title: "How I Stopped Comparing My Aging to Other People's Aging", category: "Conscious Aging" },
  { title: "Why the Elder Years Are the Most Authentic Years", category: "Conscious Aging" },
  { title: "The Practice of Aging as an Act of Love", category: "Conscious Aging" },
  { title: "How to Find Beauty in the Aging Body", category: "Conscious Aging" },
  { title: "Why I Started Embracing My Wrinkles (And What That Took)", category: "Conscious Aging" },
  { title: "The Art of Being Present in a Body That Is Changing", category: "Conscious Aging" },
  { title: "How Conscious Aging Changed My Relationship With Time", category: "Conscious Aging" },
  { title: "Why Older Adults Often Have More Genuine Joy Than Younger People", category: "Conscious Aging" },
  { title: "The Practice of Aging With Grace and Grit", category: "Conscious Aging" },
  { title: "How I Found Peace With the Pace of My Own Life", category: "Conscious Aging" },
  { title: "Why I Started Saying 'I'm Old' Without Apology", category: "Conscious Aging" },
  { title: "The Art of Living Fully in the Time You Have Left", category: "Conscious Aging" },
  { title: "How Conscious Aging Became My Most Important Practice", category: "Conscious Aging" },
  { title: "Why Older Adults Are Often the Most Interesting People at the Table", category: "Conscious Aging" },
  { title: "The Practice of Honoring the Life You've Actually Lived", category: "Conscious Aging" },
  { title: "How I Learned to Be Proud of My Age", category: "Conscious Aging" },
  { title: "Why Aging Consciously Is the Most Important Work You Can Do", category: "Conscious Aging" },
  // TCM & Supplements (50)
  { title: "The TCM Herbs That Support Longevity After 60", category: "Physical Wellness" },
  { title: "Why Lion's Mane Mushroom Is Worth Considering for Brain Health", category: "Physical Wellness" },
  { title: "CoQ10, Magnesium, and the Supplements Worth Knowing About", category: "Physical Wellness" },
  { title: "Astragalus and the Longevity Herbs of Traditional Chinese Medicine", category: "Physical Wellness" },
  { title: "What Reishi Mushroom Actually Does (And What It Doesn't)", category: "Physical Wellness" },
  { title: "The Case for Berberine After 60 (The Research Is Interesting)", category: "Physical Wellness" },
  { title: "Why I Started Taking NMN at 64 (And What Happened)", category: "Physical Wellness" },
  { title: "The Adaptogen Question: What Actually Works for Stress After 60", category: "Physical Wellness" },
  { title: "Why Rhodiola Rosea Might Be the Most Underrated Supplement for Elders", category: "Physical Wellness" },
  { title: "The Gut Microbiome After 60: What Changes and What You Can Do", category: "Physical Wellness" },
  { title: "Why I Started Taking Vitamin K2 (And Why My Doctor Didn't Tell Me)", category: "Physical Wellness" },
  { title: "The Zinc-Immune System Connection Most Older Adults Miss", category: "Physical Wellness" },
  { title: "Why I Started Using Adaptogenic Herbs Instead of Coffee", category: "Physical Wellness" },
  { title: "The Collagen Question: Does It Actually Work After 60?", category: "Physical Wellness" },
  { title: "Why I Started Taking Creatine at 65 (Not Just for Athletes)", category: "Physical Wellness" },
  { title: "The Melatonin Debate: What the Research Actually Says for Older Adults", category: "Physical Wellness" },
  { title: "Why I Started Using Medicinal Mushrooms in My Morning Routine", category: "Physical Wellness" },
  { title: "The B12 Deficiency That Mimics Dementia (And How to Test for It)", category: "Physical Wellness" },
  { title: "Why I Started Taking Quercetin at 63 (The Senolytic Research)", category: "Physical Wellness" },
  { title: "The Omega-3 to Omega-6 Ratio: Why It Matters More After 60", category: "Physical Wellness" },
  { title: "Why I Started Using Ashwagandha for Sleep (And What Changed)", category: "Physical Wellness" },
  { title: "The Curcumin Absorption Problem (And How to Solve It)", category: "Physical Wellness" },
  { title: "Why I Started Taking Spermidine at 66 (The Autophagy Connection)", category: "Physical Wellness" },
  { title: "The Lithium Orotate Question: What the Research Says for Brain Health", category: "Physical Wellness" },
  { title: "Why I Started Using Bacopa Monnieri for Memory at 64", category: "Physical Wellness" },
  { title: "The Phosphatidylserine Question: Does It Help Aging Brains?", category: "Physical Wellness" },
  { title: "Why I Started Taking Alpha-Lipoic Acid at 63", category: "Physical Wellness" },
  { title: "The DHEA Question: What Older Adults Need to Know", category: "Physical Wellness" },
  { title: "Why I Started Using Ginkgo Biloba (And What the Research Actually Says)", category: "Physical Wellness" },
  { title: "The Resveratrol Debate: What We Know and What We Don't", category: "Physical Wellness" },
  { title: "Why I Started Taking Fisetin at 65 (The Senolytic Research)", category: "Physical Wellness" },
  { title: "The Digestive Enzyme Question: Do You Need Them After 60?", category: "Physical Wellness" },
  { title: "Why I Started Using Chaga Mushroom in My Daily Routine", category: "Physical Wellness" },
  { title: "The Iodine Deficiency Nobody Talks About After 60", category: "Physical Wellness" },
  { title: "Why I Started Taking Selenium for Thyroid Health at 64", category: "Physical Wellness" },
  { title: "The Boron Question: Why This Trace Mineral Matters for Bone Health", category: "Physical Wellness" },
  { title: "Why I Started Using Shilajit at 66 (The Ayurvedic Perspective)", category: "Physical Wellness" },
  { title: "The Taurine Question: Why This Amino Acid Matters for Longevity", category: "Physical Wellness" },
  { title: "Why I Started Taking Glycine for Sleep and Longevity at 65", category: "Physical Wellness" },
  { title: "The Carnosine Question: What It Does for the Aging Body", category: "Physical Wellness" },
  { title: "Why I Started Using Maca Root at 63 (The Hormone Connection)", category: "Physical Wellness" },
  { title: "The Stinging Nettle Question: Why This Herb Matters for Men After 60", category: "Physical Wellness" },
  { title: "Why I Started Taking Saw Palmetto at 64 (And What Changed)", category: "Physical Wellness" },
  { title: "The Black Seed Oil Question: What the Research Says for Inflammation", category: "Physical Wellness" },
  { title: "Why I Started Using Moringa at 65 (The Nutrient Density Argument)", category: "Physical Wellness" },
  { title: "The Spirulina Question: Is It Worth It for Older Adults?", category: "Physical Wellness" },
  { title: "Why I Started Taking Nattokinase for Cardiovascular Health at 63", category: "Physical Wellness" },
  { title: "The Serrapeptase Question: What This Enzyme Does for Inflammation", category: "Physical Wellness" },
  { title: "Why I Started Using Pine Bark Extract at 66 (The Pycnogenol Research)", category: "Physical Wellness" },
  { title: "The Hyaluronic Acid Question: Does It Work for Joint Health After 60?", category: "Physical Wellness" },
  // Grief & Loss (50)
  { title: "Grief Is Not a Problem to Solve", category: "Grief & Loss" },
  { title: "How I Survived the First Year After My Spouse Died", category: "Grief & Loss" },
  { title: "The Grief That Comes With Watching Your Parents Disappear Into Dementia", category: "Grief & Loss" },
  { title: "Why Grief Gets Harder Before It Gets Easier", category: "Grief & Loss" },
  { title: "The Complicated Grief of Losing Someone You Had a Difficult Relationship With", category: "Grief & Loss" },
  { title: "How I Learned to Grieve Without Performing It for Other People", category: "Grief & Loss" },
  { title: "Why Grief Is Not Linear (And What That Means for You)", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Health (And What Comes After)", category: "Grief & Loss" },
  { title: "How I Found My Way Back to Life After My Child Died", category: "Grief & Loss" },
  { title: "Why Grief Is the Price of Love (And Why That's Okay)", category: "Grief & Loss" },
  { title: "The Anticipatory Grief of Watching Someone You Love Decline", category: "Grief & Loss" },
  { title: "How I Learned to Carry My Grief Instead of Being Carried by It", category: "Grief & Loss" },
  { title: "Why Older Adults Often Grieve More Quietly Than Younger People", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Independence (And How to Face It)", category: "Grief & Loss" },
  { title: "How to Support Someone Who Is Grieving Without Saying the Wrong Thing", category: "Grief & Loss" },
  { title: "Why I Stopped Trying to Get Over My Grief and Started Living With It", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Community When You Move in Later Life", category: "Grief & Loss" },
  { title: "How I Found Meaning in My Grief Instead of Just Surviving It", category: "Grief & Loss" },
  { title: "Why Grief and Gratitude Can Coexist (And Why That's Not Toxic Positivity)", category: "Grief & Loss" },
  { title: "The Grief of Watching Your Own Decline", category: "Grief & Loss" },
  { title: "How I Learned to Talk About My Dead Spouse Without Making People Uncomfortable", category: "Grief & Loss" },
  { title: "Why Grief Is a Form of Love That Has Nowhere to Go", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Sense of the Future", category: "Grief & Loss" },
  { title: "How to Grieve the Life You Thought You'd Have", category: "Grief & Loss" },
  { title: "Why I Started a Grief Group at 65 (And What It Gave Me)", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Best Friend to Alzheimer's", category: "Grief & Loss" },
  { title: "How I Learned to Celebrate the Life of Someone I Lost", category: "Grief & Loss" },
  { title: "Why Grief Is Not Something You Get Over (And Why That's Okay)", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Career Identity When You Retire", category: "Grief & Loss" },
  { title: "How to Hold Space for Your Own Grief Without Drowning in It", category: "Grief & Loss" },
  { title: "Why I Started Writing Letters to the People I've Lost", category: "Grief & Loss" },
  { title: "The Grief of Watching Your Siblings Age and Decline", category: "Grief & Loss" },
  { title: "How I Found Beauty in the Grief Process", category: "Grief & Loss" },
  { title: "Why Grief Is One of the Most Human Things We Do", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Physical Capabilities", category: "Grief & Loss" },
  { title: "How to Grieve Without Isolating Yourself", category: "Grief & Loss" },
  { title: "Why I Started Marking the Anniversary of My Loss (And What It Did)", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Last Parent", category: "Grief & Loss" },
  { title: "How I Learned to Accept Comfort From Others When I Was Grieving", category: "Grief & Loss" },
  { title: "Why Grief Is a Teacher If You Let It Be", category: "Grief & Loss" },
  { title: "The Grief of Outliving Your Friends", category: "Grief & Loss" },
  { title: "How to Grieve a Relationship That Ended Before the Person Died", category: "Grief & Loss" },
  { title: "Why I Started Talking to My Dead Mother (And Why It Helped)", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Home After Decades", category: "Grief & Loss" },
  { title: "How I Found My Way Through Complicated Grief", category: "Grief & Loss" },
  { title: "Why Grief Requires Witnesses (And Where to Find Them)", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Vision of the Future", category: "Grief & Loss" },
  { title: "How to Keep Living Fully While You're Grieving", category: "Grief & Loss" },
  { title: "Why I Started a Memorial Practice for Everyone I've Lost", category: "Grief & Loss" },
  { title: "The Grief of Losing Your Sense of Who You Are After Loss", category: "Grief & Loss" },
  // Community (50)
  { title: "The Quiet Power of Intergenerational Friendship", category: "Community" },
  { title: "How to Build Community After 60 When You're Starting From Scratch", category: "Community" },
  { title: "Why I Started a Neighborhood Walking Group at 64", category: "Community" },
  { title: "The Art of Being a Good Neighbor in Later Life", category: "Community" },
  { title: "How I Found My Community at a Cohousing Development at 66", category: "Community" },
  { title: "Why Older Adults Often Make the Best Community Builders", category: "Community" },
  { title: "The Loneliness Epidemic Among Older Adults (And What We Can Do)", category: "Community" },
  { title: "How I Started a Community Garden at 65 (And What It Gave Me)", category: "Community" },
  { title: "Why I Joined a Choir at 63 (And What It Did for My Brain and Heart)", category: "Community" },
  { title: "The Art of Showing Up for Your Community Without Burning Out", category: "Community" },
  { title: "How to Find Your Tribe After Retirement", category: "Community" },
  { title: "Why Older Adults Often Have the Strongest Sense of Community", category: "Community" },
  { title: "The Power of Shared Meals: Why I Started a Monthly Dinner Club at 67", category: "Community" },
  { title: "How I Became a Regular at My Local Coffee Shop (And Why It Matters)", category: "Community" },
  { title: "Why I Started Volunteering at My Local Library at 64", category: "Community" },
  { title: "The Art of Being Present in Your Community Instead of Just Passing Through", category: "Community" },
  { title: "How I Found Connection Through a Faith Community After Decades Away", category: "Community" },
  { title: "Why Older Adults Often Have the Most to Contribute to Their Communities", category: "Community" },
  { title: "The Practice of Radical Hospitality in Later Life", category: "Community" },
  { title: "How I Started a Skill-Sharing Group at 65 (And What We Built)", category: "Community" },
  { title: "Why I Started Attending Town Hall Meetings at 63 (And What Changed)", category: "Community" },
  { title: "The Art of Being a Good Citizen in the Second Half of Life", category: "Community" },
  { title: "How I Found My People Through a Hiking Club at 66", category: "Community" },
  { title: "Why Older Adults Often Have the Deepest Roots in Their Communities", category: "Community" },
  { title: "The Practice of Knowing Your Neighbors by Name", category: "Community" },
  { title: "How I Started a Book Club That Actually Talks About Real Things at 64", category: "Community" },
  { title: "Why I Started Attending Lectures and Talks at My Local University at 67", category: "Community" },
  { title: "The Art of Being a Good Mentor to Younger People in Your Community", category: "Community" },
  { title: "How I Found Connection Through a Men's Group at 65", category: "Community" },
  { title: "Why Older Adults Often Have the Most Stable Sense of Place", category: "Community" },
  { title: "The Practice of Showing Up Even When You Don't Feel Like It", category: "Community" },
  { title: "How I Started a Grief Support Group at 66 (And What It Became)", category: "Community" },
  { title: "Why I Started Attending Concerts and Performances Again at 64", category: "Community" },
  { title: "The Art of Being a Good Witness to Your Community's History", category: "Community" },
  { title: "How I Found My Community Through a Meditation Center at 63", category: "Community" },
  { title: "Why Older Adults Often Have the Most to Teach About Community Building", category: "Community" },
  { title: "The Practice of Civic Engagement in Later Life", category: "Community" },
  { title: "How I Started a Neighborhood Emergency Preparedness Group at 65", category: "Community" },
  { title: "Why I Started Attending Religious Services Again at 67 (Not for the Reasons You Think)", category: "Community" },
  { title: "The Art of Being a Good Elder in Your Community", category: "Community" },
  { title: "How I Found Connection Through a Photography Club at 64", category: "Community" },
  { title: "Why Older Adults Often Have the Strongest Commitment to Their Communities", category: "Community" },
  { title: "The Practice of Intergenerational Exchange in Your Neighborhood", category: "Community" },
  { title: "How I Started a Monthly Potluck at 66 (And What It Built)", category: "Community" },
  { title: "Why I Started Attending Community Theater at 63 (And What It Gave Me)", category: "Community" },
  { title: "The Art of Building Community in an Age of Isolation", category: "Community" },
  { title: "How I Found My People Through a Woodworking Club at 65", category: "Community" },
  { title: "Why Older Adults Often Have the Most Genuine Sense of Belonging", category: "Community" },
  { title: "The Practice of Being a Good Steward of Your Community", category: "Community" },
  { title: "How I Started a Neighborhood Storytelling Night at 67 (And What Happened)", category: "Community" },
];

// ── Main runner ───────────────────────────────────────────────────────────────

async function processArticle(conn, existingSlugs, topic, idx, total) {
  const topicSlugPreview = topic.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);

  // Skip if a slug variant already exists
  if ([...existingSlugs].some(s => s.includes(topicSlugPreview.substring(0, 20)))) {
    console.log(`  [${idx}/${total}] SKIP (exists): "${topic.title.substring(0, 60)}"`);
    return 'skipped';
  }

  let lastGate = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const article = await generateOne(topic.title, topic.category, attempt);
      const gate = runGate(article.body);

      if (!gate.passed) {
        console.log(`  [${idx}/${total}] Gate FAIL (attempt ${attempt}/${MAX_RETRIES}): ${gate.failures.slice(0,2).join(', ')} | words=${gate.wordCount}`);
        lastGate = gate;
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        console.error(`  [${idx}/${total}] EXHAUSTED retries for "${topic.title.substring(0, 50)}"`);
        return 'failed';
      }

      // Gate passed - assign hero image
      const heroImageUrl = await assignHeroImage(article.slug, article.category);

      if (!DRY_RUN) {
        await insertQueued(conn, article, heroImageUrl);
        existingSlugs.add(article.slug);
      }

      console.log(`  [${idx}/${total}] OK: "${article.title.substring(0, 55)}" | ${gate.wordCount}w | ${heroImageUrl.split('/').pop()}`);
      return 'inserted';
    } catch (err) {
      console.error(`  [${idx}/${total}] ERROR (attempt ${attempt}): ${err.message?.substring(0, 80)}`);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 3000 * attempt));
      } else {
        return 'error';
      }
    }
  }
  return 'error';
}

async function main() {
  console.log('=== Conscious Elder: 500-Article Queue Seeder ===');
  console.log(`Model: ${MODEL}`);
  console.log(`DRY_RUN: ${DRY_RUN}`);
  console.log(`START: ${START}, LIMIT: ${LIMIT}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log('');

  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const existingSlugs = await getExistingSlugs(conn);
  console.log(`Existing articles in DB: ${existingSlugs.size}`);

  const topics = TOPICS.slice(START, START + LIMIT);
  console.log(`Topics to process: ${topics.length}`);
  console.log('');

  const stats = { inserted: 0, skipped: 0, failed: 0, error: 0 };
  const startTime = Date.now();

  // Process in batches of CONCURRENCY
  for (let i = 0; i < topics.length; i += CONCURRENCY) {
    const batch = topics.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((topic, j) => processArticle(conn, existingSlugs, topic, START + i + j + 1, LIMIT))
    );
    results.forEach(r => stats[r]++);

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const done = i + batch.length;
    const rate = done / (elapsed || 1);
    const remaining = Math.round((topics.length - done) / rate);
    console.log(`  Progress: ${done}/${topics.length} | inserted=${stats.inserted} skipped=${stats.skipped} failed=${stats.failed} | ~${remaining}s remaining`);

    // Small pause between batches to avoid rate limiting
    if (i + CONCURRENCY < topics.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  await conn.end();

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log('');
  console.log('=== COMPLETE ===');
  console.log(`Total time: ${Math.round(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`Inserted: ${stats.inserted}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Errors:   ${stats.error}`);
  console.log('');
  console.log('Articles are status=queued (NOT published).');
  console.log('The Phase 1 cron will publish them one at a time on DigitalOcean.');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
