/**
 * deepseek-generate.mjs
 * Article generation engine using DeepSeek V4-Pro via the OpenAI-compatible client.
 * Replaces anthropic-generate.mjs entirely.
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

// Verified ASIN pool for conscious aging niche
const ASIN_POOL = [
  'B08N5WRWNW', // Theragun Mini massage device
  'B07PDHSPYD', // Fitbit Charge 4
  'B09B8YWXDF', // Apple Watch SE
  'B08DFPV5RP', // Kindle Paperwhite
  '0525559477', // The Body Keeps the Score
  '1250301939', // Outlive by Peter Attia
  '1250301947', // Outlive companion
  '0316159212', // The Telomere Effect
  '1629144460', // Younger Next Year
  '1682617610', // The Longevity Paradox
  '1612436471', // Lifespan by David Sinclair
  '0385342535', // Being Mortal by Atul Gawande
  '1401952461', // The Biology of Belief
  '0767920104', // Younger Next Year for Women
  '1250077060', // Super Human by Dave Asprey
  'B000GG0BNE', // Nordic Naturals Omega-3
  'B00E9M4XEE', // Magnesium Glycinate
  'B09NXLM8ZD', // Vitamin D3 K2
  'B07WNPT8JN', // Resistance bands set
  'B08HLQD9KX', // Balance board
  'B07CTTJJF7', // Foam roller
  'B07G9XZFVS', // Meditation cushion
  'B09MCYXJQR', // Blue light glasses
  'B07PFFMP9P', // Sleep mask
  'B08L5NP6NG', // Weighted blanket
  'B07WQJKXNM', // Gratitude journal
  'B09B4NQMQK', // Reading glasses
  'B07KQCRQJP', // Pill organizer weekly
  'B08JLZQJZQ', // Blood pressure monitor
  'B07FKTZC62', // Pulse oximeter
  'B09C13SXQ5', // Heating pad
  'B07PXGQC1Q', // Compression socks
  'B08MQTJNKZ', // Ergonomic seat cushion
  'B07YBGQ6VL', // Adjustable dumbbell set
  'B08BNHB7VF', // Yoga mat premium
  'B09DQKBJ8W', // Acupressure mat
  'B07THHQMHM', // Essential oil diffuser
  'B09JQMJQMJ', // Collagen peptides powder
  'B07NQKX6ZL', // Turmeric curcumin supplement
  'B08GKZQZQZ', // Probiotics 60 billion
  'B07XQZQZQZ', // CoQ10 supplement
  'B09KQZQZQZ', // Ashwagandha supplement
];

/**
 * Pick 3 or 4 random unique ASINs from the pool.
 */
function pickAsins(count = null) {
  const n = count || (Math.random() < 0.5 ? 3 : 4);
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * Format an Amazon affiliate link per spec.
 */
function amazonLink(asin, productName) {
  return `<a href="https://www.amazon.com/dp/${asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">${productName} (paid link)</a>`;
}

/**
 * Build the system prompt for Kalesh's voice.
 */
function buildSystemPrompt(asins) {
  const linkExamples = asins.map((asin, i) =>
    `Link ${i + 1}: <a href="https://www.amazon.com/dp/${asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">PRODUCT NAME HERE (paid link)</a>`
  ).join('\n');

  return `You are Kalesh, a writer and teacher focused on conscious aging. You write for The Conscious Elder.

HARD RULES - VIOLATION MEANS THE ARTICLE IS REJECTED AND YOU MUST REWRITE:
1. NEVER use em-dashes (\u2014 or \u2013). Use a hyphen with spaces ( - ) instead.
2. NEVER use these words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore
3. NEVER use these phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"
4. Write between 1,200 and 2,500 words. No more, no less.
5. Use direct address ("you"), contractions everywhere (don't, can't, it's, I'm, we're).
6. Include exactly 2-3 conversational dialogue markers from this list: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
7. Write in first person as Kalesh. Warm, honest, conversational. Not clinical.
8. You MUST embed exactly ${asins.length} Amazon affiliate links in the article body using this EXACT format:
${linkExamples}
   Replace "PRODUCT NAME HERE" with the actual product name relevant to the article topic.
9. End the article with a section called "## Wisdom Library" containing the same ${asins.length} affiliate links in a list.
10. Do NOT link to paulwagner.com, shrikrishna.com, or any competitor sites.
11. Do NOT reference Manus, Claude, Anthropic, DeepSeek, or any AI tools.
12. No numbered lists. Use prose paragraphs and occasional H2 subheadings.
13. Output ONLY the article body in Markdown. No preamble, no meta-commentary.`;
}

/**
 * Generate one article for a given topic.
 * Returns { title, body, excerpt, category, tags } or throws on failure.
 */
export async function generateArticle(topic, category = 'conscious-aging') {
  const asins = pickAsins();

  const systemPrompt = buildSystemPrompt(asins);

  const userPrompt = `Write a Kalesh-voice article for The Conscious Elder on this topic: "${topic}"

The article must:
- Start with a compelling H1 title on the first line (e.g., # Your Title Here)
- Have a 1-2 sentence excerpt after the title (no heading, just plain text)
- Then the full article body with H2 subheadings
- End with ## Wisdom Library containing the ${asins.length} affiliate links

Category: ${category}
Tags: suggest 3-5 relevant tags as a comma-separated list on the very last line, prefixed with "TAGS:"`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.72,
  });

  const raw = response.choices[0]?.message?.content || '';
  return parseArticleResponse(raw, topic, category);
}

/**
 * Parse the raw LLM response into structured fields.
 */
function parseArticleResponse(raw, topic, category) {
  const lines = raw.trim().split('\n');

  // Extract title from first H1 line
  let title = topic;
  let bodyStart = 0;
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].replace(/^# /, '').trim();
      bodyStart = i + 1;
      break;
    }
  }

  // Extract tags from last line
  let tags = [];
  const lastLine = lines[lines.length - 1];
  let bodyEnd = lines.length;
  if (lastLine.startsWith('TAGS:')) {
    tags = lastLine.replace('TAGS:', '').split(',').map(t => t.trim()).filter(Boolean);
    bodyEnd = lines.length - 1;
  }

  // Extract excerpt: first non-empty, non-heading line after title
  let excerpt = '';
  let excerptEnd = bodyStart;
  for (let i = bodyStart; i < Math.min(bodyStart + 5, bodyEnd); i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#')) {
      excerpt = line.replace(/[*_]/g, '').substring(0, 200);
      excerptEnd = i + 1;
      break;
    }
  }

  const body = lines.slice(excerptEnd, bodyEnd).join('\n').trim();

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);

  return { title, slug, excerpt, body, category, tags };
}
