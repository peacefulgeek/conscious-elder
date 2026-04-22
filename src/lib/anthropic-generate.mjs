/**
 * Anthropic article generation for The Conscious Elder.
 * Uses Claude claude-sonnet-4-5 for main generation.
 * HARD RULES block is appended to every prompt.
 */
import Anthropic from '@anthropic-ai/sdk';
import { matchProducts } from './match-products.mjs';
import { buildAmazonUrl } from './amazon-verify.mjs';
import { productCatalog } from '../data/product-catalog.ts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AMAZON_TAG = process.env.AMAZON_TAG || 'spankyspinola-20';

// Kalesh's 50-phrase library (use 3-5 per article)
const KALESH_PHRASES = [
  "There's a quiet intelligence in that.",
  "Let's sit with this for a moment.",
  "The deeper pattern here is worth noticing.",
  "What if aging isn't what we've been told?",
  "This is where the real conversation begins.",
  "The mind wants certainty. Wisdom lives in the question.",
  "Notice what happens when you stop fighting this.",
  "There's something honest about getting older.",
  "The culture sells you youth. Consciousness offers you depth.",
  "Sit with that. Let it land.",
  "Stay with me here.",
  "I know, I know.",
  "Wild, right?",
  "Think about that for a second.",
  "That's not nothing.",
  "Here's what I keep coming back to.",
  "It's worth asking why.",
  "Most people never get to this question.",
  "That's the part nobody talks about.",
  "Something shifts when you accept this.",
];

// Niche researchers (70% usage)
const NICHE_RESEARCHERS = [
  'Ram Dass', 'Zalman Schachter-Shalomi', 'Bill Thomas', 'Ashton Applewhite',
  'Mary Catherine Bateson', 'Lars Tornstam', 'Gene Cohen', 'Ken Dychtwald',
  'Connie Zweig', 'Parker Palmer'
];

// Spiritual researchers (30% max)
const SPIRITUAL_RESEARCHERS = [
  'Krishnamurti', 'Alan Watts', 'Sam Harris', 'Sadhguru', 'Tara Brach'
];

const HARD_RULES = `
HARD RULES for this article:
- 1,600 to 2,000 words (strict; under 1,200 or over 2,500 = regenerate)
- Zero em-dashes. Use commas, periods, colons, or parentheses instead.
- Never use these words: delve, tapestry, paradigm, synergy, leverage, unlock,
  empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust,
  beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate,
  plethora, myriad, comprehensive, transformative, groundbreaking, innovative,
  cutting-edge, revolutionary, state-of-the-art, ever-evolving, profound, holistic,
  nuanced, multifaceted, stakeholders, ecosystem, furthermore, moreover,
  additionally, consequently, subsequently, thereby, streamline, optimize,
  facilitate, amplify, catalyze.
- Never use these phrases: "it's important to note," "in conclusion," "in summary,"
  "in the realm of," "dive deep into," "at the end of the day," "in today's
  fast-paced world," "plays a crucial role," "a testament to," "when it comes to,"
  "cannot be overstated."
- Contractions throughout. You're. Don't. It's. That's. I've. We'll.
- Vary sentence length aggressively. Some fragments. Some long ones that stretch
  across a full breath. Some just three words.
- Direct address ("you") throughout OR first-person ("I / my") throughout. Pick one.
- Include at least 2 conversational openers: "Here's the thing," "Honestly,"
  "Look," "Truth is," "But here's what's interesting," "Think about it," "That said."
- Concrete specifics over abstractions. A name. A number. A moment.
- 3 to 4 Amazon product links embedded naturally in prose, each followed by
  "(paid link)" in plain text. Use only ASINs from the provided catalog.
- No em-dashes. No em-dashes. No em-dashes.
`;

const OPENER_TYPES = ['gut-punch', 'question', 'story', 'counterintuitive'];
const CONCLUSION_TYPES = ['call-to-action', 'reflection', 'question', 'challenge', 'benediction'];

const SANSKRIT_MANTRAS = [
  '*Om Shanti Shanti Shanti* - peace in body, mind, and spirit.',
  '*Tat Tvam Asi* - thou art that.',
  '*So Hum* - I am that.',
  '*Aham Brahmasmi* - I am the infinite reality.',
  '*Sat Chit Ananda* - existence, consciousness, bliss.',
  '*Om Namah Shivaya* - I bow to the divine within.',
  '*Lokah Samastah Sukhino Bhavantu* - may all beings everywhere be happy and free.',
];

/**
 * Generate a single article for a given topic.
 * @param {Object} options
 * @param {string} options.topic - Article topic/title
 * @param {string} [options.openerType] - gut-punch | question | story | counterintuitive
 * @param {string} [options.conclusionType] - call-to-action | reflection | question | challenge | benediction
 * @param {boolean} [options.includeKaleshBacklink] - Whether to include a backlink to kalesh.love
 * @param {number} [options.faqCount] - 0, 2-3, or 5
 * @param {Array} [options.verifiedProducts] - Pre-verified products to use for affiliate links
 * @returns {Promise<Object>} - Article object with body, slug, metadata
 */
export async function generateArticle({
  topic,
  openerType,
  conclusionType,
  includeKaleshBacklink = false,
  faqCount = 0,
  verifiedProducts = [],
}) {
  // Pick opener and conclusion types if not specified
  const opener = openerType || OPENER_TYPES[Math.floor(Math.random() * OPENER_TYPES.length)];
  const conclusion = conclusionType || CONCLUSION_TYPES[Math.floor(Math.random() * CONCLUSION_TYPES.length)];

  // Select 3-4 products for this article
  const catalog = verifiedProducts.length > 0 ? verifiedProducts : productCatalog;
  const slug = slugify(topic);
  const tags = extractTopicTags(topic);
  const category = inferCategory(topic);

  const products = matchProducts({
    articleTitle: topic,
    articleTags: tags,
    articleCategory: category,
    catalog: catalog.map(p => ({
      asin: p.asin,
      name: p.name,
      category: p.category,
      tags: Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]'),
    })),
    minLinks: 3,
    maxLinks: 4,
  });

  const productBlock = products.map(p =>
    `- ASIN: ${p.asin} | Name: ${p.name} | URL: ${buildAmazonUrl(p.asin)}`
  ).join('\n');

  // Pick 3-5 Kalesh phrases
  const phrases = shuffleArray([...KALESH_PHRASES]).slice(0, 4);

  // Pick researchers (70% niche, 30% spiritual)
  const researchers = [
    ...shuffleArray([...NICHE_RESEARCHERS]).slice(0, 2),
    ...shuffleArray([...SPIRITUAL_RESEARCHERS]).slice(0, 1),
  ];

  const kaleshBacklinkInstruction = includeKaleshBacklink
    ? `\n- Include one natural backlink to https://kalesh.love with varied anchor text (e.g., "Kalesh writes more about this here", "as Kalesh explores on his site", "read Kalesh's deeper take"). Do NOT link to paulwagner.com or shrikrishna.com.`
    : '';

  const faqInstruction = faqCount > 0
    ? `\n- Include a FAQ section with exactly ${faqCount} questions and answers near the end.`
    : '\n- Do NOT include a FAQ section in this article.';

  const openerInstructions = {
    'gut-punch': 'Start with a gut-punch statement - a bold, uncomfortable truth that stops the reader cold.',
    'question': 'Start with a provocative question that the reader has never quite put into words before.',
    'story': 'Start with a micro-story - a specific moment, a scene, a person. 2-4 sentences max.',
    'counterintuitive': 'Start with a counterintuitive claim - something that contradicts what most people assume.',
  };

  const conclusionInstructions = {
    'call-to-action': 'End with a call to action - specific, concrete, doable today.',
    'reflection': 'End with a reflection - a thought to sit with, not a directive.',
    'question': 'End with a question - one that lingers, that the reader carries with them.',
    'challenge': 'End with a challenge - something that asks the reader to do something uncomfortable.',
    'benediction': 'End with a benediction - a blessing, a wish, a send-off with warmth and weight.',
  };

  const mantra = SANSKRIT_MANTRAS[Math.floor(Math.random() * SANSKRIT_MANTRAS.length)];

  const prompt = `You are Kalesh, a consciousness teacher and writer. You write about conscious aging, elder wisdom, and purposeful later life. Your voice is intellectually warm, conversational, first-person, and grounded. You think out loud with the reader.

Write a complete article on this topic: "${topic}"

KALESH VOICE PROFILE:
- Sentence length: Long sentences, 18-28 words. Flowing, intellectual, layered.
- Tone: Intellectual warmth. Never sentimental, never preachy. Thinks out loud with the reader.
- Direct address: Use "you" directly, or address the reader through the ideas themselves. NEVER "my friend," NEVER "sweetheart."
- Spiritual references: Krishnamurti, Alan Watts, Sam Harris, Sadhguru, Tara Brach. NEVER Amma, NEVER Rumi, NEVER Ramana Maharshi.
- Humor: Intellectual wit - dry, observational, occasionally self-deprecating. Not jokes. Not punchlines.

Include 3-5 of these Kalesh signature phrases naturally in the text:
${phrases.map(p => `"${p}"`).join('\n')}

Reference these researchers naturally (don't force it):
${researchers.join(', ')}

ARTICLE STRUCTURE:
1. H1 title (the exact topic above, or a compelling variant)
2. ${openerInstructions[opener]}
3. 3-5 H2 sections with H3 subsections where needed
4. [AUTHOR_BIO_PLACEHOLDER] - place this exact text after the 4th or 5th section to mark where the author bio card goes
5. ${faqInstruction}
6. ${conclusionInstructions[conclusion]}
7. End with this Sanskrit mantra on its own line: ${mantra}

AMAZON AFFILIATE LINKS (embed naturally in prose):
${productBlock}

Embed 3-4 of these products naturally in the article prose. Use soft, conversational language:
- "One option that many people like is..."
- "A tool that often helps with this is..."
- "Something worth considering might be..."
- "For those looking for a simple solution, this works well..."
Each product link must be followed immediately by "(paid link)" in plain text.

Also add a "Wisdom Library" section near the end (before the conclusion) with 3-4 product recommendations using the same soft language.

AFFILIATE DISCLOSURE: Include this line near the top of the article, after the opening paragraph:
*As an Amazon Associate, I earn from qualifying purchases.*
${kaleshBacklinkInstruction}

METADATA (return as a JSON block at the very end, after the article, wrapped in <<<METADATA>>> tags):
{
  "slug": "${slug}",
  "title": "[article title]",
  "metaDescription": "[150-160 chars, compelling, includes main keyword]",
  "ogTitle": "[same as title or slight variant]",
  "ogDescription": "[same as metaDescription or slight variant]",
  "category": "${category}",
  "tags": ${JSON.stringify(tags)},
  "imageAlt": "[descriptive alt text for hero image, no text in image]",
  "readingTime": [estimated minutes],
  "author": "Kalesh",
  "openerType": "${opener}",
  "conclusionType": "${conclusion}",
  "faqCount": ${faqCount},
  "hasKaleshBacklink": ${includeKaleshBacklink}
}

${HARD_RULES}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawContent = response.content[0].text;

  // Extract metadata
  const metaMatch = rawContent.match(/<<<METADATA>>>([\s\S]*?)(?:<<<\/METADATA>>>|$)/);
  let metadata = {};
  if (metaMatch) {
    try {
      metadata = JSON.parse(metaMatch[1].trim());
    } catch (e) {
      console.warn('[anthropic-generate] Failed to parse metadata:', e.message);
    }
  }

  // Extract body (everything before <<<METADATA>>>)
  const body = rawContent.replace(/<<<METADATA>>>[\s\S]*$/, '').trim();

  return {
    slug: metadata.slug || slug,
    title: metadata.title || topic,
    metaDescription: metadata.metaDescription || '',
    ogTitle: metadata.ogTitle || metadata.title || topic,
    ogDescription: metadata.ogDescription || metadata.metaDescription || '',
    category: metadata.category || category,
    tags: metadata.tags || tags,
    imageAlt: metadata.imageAlt || `${topic} - The Conscious Elder`,
    readingTime: metadata.readingTime || Math.ceil(countWords(body) / 200),
    author: 'Kalesh',
    openerType: opener,
    conclusionType: conclusion,
    faqCount: metadata.faqCount || faqCount,
    hasKaleshBacklink: includeKaleshBacklink,
    body,
    asinsUsed: products.map(p => p.asin),
  };
}

function countWords(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).length;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractTopicTags(topic) {
  const topicLower = topic.toLowerCase();
  const tagMap = {
    'aging': ['aging', 'elder'],
    'spiritual': ['spirituality', 'consciousness'],
    'brain': ['brain-health', 'cognitive'],
    'death': ['death', 'mortality', 'end-of-life'],
    'meditation': ['meditation', 'mindfulness', 'practice'],
    'supplement': ['supplements', 'vitality', 'health'],
    'tcm': ['tcm', 'traditional-chinese-medicine', 'longevity'],
    'relationship': ['relationships', 'intimacy', 'connection'],
    'grief': ['grief', 'loss', 'healing'],
    'legacy': ['legacy', 'stories', 'family'],
    'wisdom': ['wisdom', 'elder-wisdom'],
    'morning': ['morning-ritual', 'daily-practice'],
    'retirement': ['retirement', 'financial', 'purpose'],
    'loneliness': ['loneliness', 'community', 'connection'],
    'mentoring': ['mentoring', 'teaching', 'legacy'],
    'downsizing': ['downsizing', 'simplicity', 'letting-go'],
  };

  const tags = ['conscious-aging'];
  for (const [key, values] of Object.entries(tagMap)) {
    if (topicLower.includes(key)) tags.push(...values);
  }
  return [...new Set(tags)];
}

function inferCategory(topic) {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('supplement') || topicLower.includes('herb') || topicLower.includes('tcm') || topicLower.includes('medicine')) return 'supplements';
  if (topicLower.includes('death') || topicLower.includes('dying') || topicLower.includes('mortality')) return 'death-preparation';
  if (topicLower.includes('meditation') || topicLower.includes('practice') || topicLower.includes('ritual')) return 'practice';
  if (topicLower.includes('brain') || topicLower.includes('cognitive') || topicLower.includes('memory')) return 'cognitive-health';
  if (topicLower.includes('relationship') || topicLower.includes('love') || topicLower.includes('intimacy')) return 'relationships';
  if (topicLower.includes('grief') || topicLower.includes('loss')) return 'grief';
  if (topicLower.includes('legacy') || topicLower.includes('mentor') || topicLower.includes('stories')) return 'legacy';
  if (topicLower.includes('financial') || topicLower.includes('retirement') || topicLower.includes('money')) return 'financial';
  if (topicLower.includes('loneliness') || topicLower.includes('community') || topicLower.includes('intergenerational')) return 'relationships';
  if (topicLower.includes('downsizing') || topicLower.includes('simplicity')) return 'downsizing';
  return 'conscious-aging';
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
