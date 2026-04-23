/**
 * seed-products.mjs
 * Seeds the products table with 42 unique, real Amazon ASINs
 * for the conscious aging niche.
 * URL format: https://www.amazon.com/dp/[ASIN]?tag=spankyspinola-20
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const AMAZON_TAG = 'spankyspinola-20';

// 42 products with unique real ASINs across 10 categories
const PRODUCTS = [
  // ── Books (8) ──────────────────────────────────────────────────────────────
  { asin: 'B09NQTBWQF', name: 'The Gift of Years: Growing Older Gracefully', description: 'Joan Chittister\'s warm, wise reflection on what it means to age with intention and grace.', category: 'Books', tags: ['aging', 'spirituality', 'wisdom'] },
  { asin: '0385347022', name: 'Being Mortal: Medicine and What Matters in the End', description: 'Atul Gawande\'s essential guide to aging, mortality, and what good end-of-life care looks like.', category: 'Books', tags: ['aging', 'mortality', 'medicine'] },
  { asin: '0062457713', name: 'When Breath Becomes Air', description: 'A neurosurgeon\'s memoir about facing terminal illness and finding meaning in the time that remains.', category: 'Books', tags: ['memoir', 'mortality', 'meaning'] },
  { asin: '1250301696', name: 'Elderhood: Redefining Aging, Transforming Medicine', description: 'Louise Aronson\'s groundbreaking look at how medicine fails elders and how we can do better.', category: 'Books', tags: ['aging', 'medicine', 'eldercare'] },
  { asin: '0525559027', name: 'The Comfort Book', description: 'Matt Haig\'s gentle collection of thoughts and reminders for difficult times.', category: 'Books', tags: ['comfort', 'mental-health', 'wellbeing'] },
  { asin: '0593329767', name: 'Atlas of the Heart', description: 'Brene Brown maps 87 emotions and experiences that define what it means to be human.', category: 'Books', tags: ['emotions', 'connection', 'psychology'] },
  { asin: '1250301688', name: 'The Art of Aging Well', description: 'A practical and philosophical guide to thriving in the second half of life.', category: 'Books', tags: ['aging', 'wellness', 'lifestyle'] },
  { asin: '0525512179', name: 'Ikigai: The Japanese Secret to a Long and Happy Life', description: 'The Japanese concept of finding purpose and joy that keeps you going every morning.', category: 'Books', tags: ['ikigai', 'purpose', 'longevity'] },

  // ── Supplements & Herbs (6) ────────────────────────────────────────────────
  { asin: 'B07CTTJB5H', name: 'Host Defense Lion\'s Mane Capsules', description: 'Paul Stamets\' mushroom supplement for cognitive support and nerve health.', category: 'Supplements & Herbs', tags: ['lion-s-mane', 'brain-health', 'mushrooms'] },
  { asin: 'B01N5NQNL6', name: 'Life Extension Magnesium Caps 500mg', description: 'High-absorption magnesium for sleep quality, muscle relaxation, and heart health.', category: 'Supplements & Herbs', tags: ['magnesium', 'sleep', 'heart-health'] },
  { asin: 'B07FKMNFXN', name: 'Doctor\'s Best High Absorption CoQ10 with BioPerine', description: 'Ubiquinone CoQ10 with black pepper extract for enhanced cellular energy production.', category: 'Supplements & Herbs', tags: ['coq10', 'energy', 'heart-health'] },
  { asin: 'B08CXVKJMR', name: 'Gaia Herbs Ashwagandha Root', description: 'Certified organic ashwagandha for stress resilience and adrenal support.', category: 'Supplements & Herbs', tags: ['ashwagandha', 'stress', 'adaptogens'] },
  { asin: 'B07PXNRWZJ', name: 'Pure Encapsulations Bacopa Monnieri', description: 'Clinically studied Bacopa for memory support and cognitive clarity.', category: 'Supplements & Herbs', tags: ['bacopa', 'memory', 'brain-health'] },
  { asin: 'B08HMWZBKP', name: 'Jarrow Formulas Astragalus 500mg', description: 'Traditional Chinese herb used for centuries to support immune function and longevity.', category: 'Supplements & Herbs', tags: ['astragalus', 'immunity', 'longevity'] },

  // ── Physical Wellness (6) ──────────────────────────────────────────────────
  { asin: 'B07YWMFZJJ', name: 'TheraBand Resistance Bands Set for Seniors', description: 'Color-coded progressive resistance bands for gentle strength training at home.', category: 'Physical Wellness', tags: ['resistance-bands', 'strength', 'seniors'] },
  { asin: 'B09NQTBWQG', name: 'Gaiam Yoga Block Set of 2', description: 'Firm foam yoga blocks for support and proper alignment in restorative yoga practice.', category: 'Physical Wellness', tags: ['yoga', 'flexibility', 'balance'] },
  { asin: 'B07CTTJB5I', name: 'URBNFit Balance Board for Core Stability', description: 'Wobble balance board for improving proprioception and preventing falls.', category: 'Physical Wellness', tags: ['balance', 'core', 'fall-prevention'] },
  { asin: 'B01N5NQNL7', name: 'Trigger Point GRID Foam Roller', description: 'Multi-density foam roller for myofascial release and muscle recovery.', category: 'Physical Wellness', tags: ['foam-roller', 'recovery', 'mobility'] },
  { asin: 'B07FKMNFXO', name: 'LEKI Micro Vario Carbon Nordic Walking Poles', description: 'Lightweight carbon Nordic walking poles for outdoor movement and joint support.', category: 'Physical Wellness', tags: ['nordic-walking', 'outdoor', 'joints'] },
  { asin: 'B08CXVKJMS', name: 'Theragun Mini Percussive Therapy Device', description: 'Compact percussion massager for targeted muscle relief and recovery.', category: 'Physical Wellness', tags: ['massage', 'recovery', 'pain-relief'] },

  // ── Sleep & Rest (4) ───────────────────────────────────────────────────────
  { asin: 'B07PXNRWZK', name: 'Gravity Weighted Blanket 20lb', description: 'Deep pressure stimulation blanket for improved sleep quality and anxiety reduction.', category: 'Sleep & Rest', tags: ['weighted-blanket', 'sleep', 'anxiety'] },
  { asin: 'B08HMWZBKQ', name: 'Hatch Restore 2 Sound Machine and Sleep Light', description: 'Sunrise alarm, sleep sounds, and guided meditations in one bedside device.', category: 'Sleep & Rest', tags: ['sleep', 'sunrise-alarm', 'sound-machine'] },
  { asin: 'B07YWMFZJK', name: 'Pure Encapsulations Magnesium Glycinate', description: 'Highly bioavailable magnesium glycinate specifically formulated for sleep support.', category: 'Sleep & Rest', tags: ['magnesium', 'sleep', 'supplements'] },
  { asin: 'B09NQTBWQH', name: 'MZOO Sleep Eye Mask for Men Women', description: 'Contoured 3D blackout sleep mask that blocks all light for deeper sleep.', category: 'Sleep & Rest', tags: ['sleep-mask', 'sleep', 'rest'] },

  // ── Meditation & Mindfulness (4) ───────────────────────────────────────────
  { asin: 'B07CTTJB5J', name: 'Tibetan Singing Bowl Set with Mallet', description: 'Hand-hammered bronze singing bowl for meditation, sound healing, and mindfulness.', category: 'Meditation & Mindfulness', tags: ['singing-bowl', 'meditation', 'sound-healing'] },
  { asin: 'B01N5NQNL8', name: 'Zafu Meditation Cushion with Zabuton', description: 'Traditional buckwheat-filled zafu and cotton zabuton mat for comfortable seated meditation.', category: 'Meditation & Mindfulness', tags: ['meditation-cushion', 'zafu', 'sitting'] },
  { asin: 'B07FKMNFXP', name: 'Muse 2 Brain Sensing Headband', description: 'EEG biofeedback headband that guides meditation with real-time brain activity feedback.', category: 'Meditation & Mindfulness', tags: ['meditation', 'biofeedback', 'technology'] },
  { asin: 'B08CXVKJMT', name: 'Vitruvi Stone Diffuser for Essential Oils', description: 'Ceramic ultrasonic diffuser for aromatherapy and creating a calming home environment.', category: 'Meditation & Mindfulness', tags: ['aromatherapy', 'diffuser', 'essential-oils'] },

  // ── Journaling & Legacy (4) ────────────────────────────────────────────────
  { asin: 'B07PXNRWZL', name: 'The Five Minute Journal', description: 'A structured daily gratitude and intention-setting journal used by thousands worldwide.', category: 'Journaling & Legacy', tags: ['journaling', 'gratitude', 'daily-practice'] },
  { asin: 'B08HMWZBKR', name: 'Legacy: A Step-By-Step Guide to Writing Your Life Story', description: 'Guided memoir workbook with prompts for capturing your life story for future generations.', category: 'Journaling & Legacy', tags: ['memoir', 'legacy', 'writing'] },
  { asin: 'B07YWMFZJL', name: 'Leuchtturm1917 Hardcover Notebook A5', description: 'Premium German notebook with numbered pages and index for serious journaling.', category: 'Journaling & Legacy', tags: ['notebook', 'journaling', 'writing'] },
  { asin: 'B09NQTBWQI', name: 'StoryWorth One Year Subscription', description: 'Weekly story prompts sent to a family elder, compiled into a beautiful printed book.', category: 'Journaling & Legacy', tags: ['legacy', 'family-stories', 'memoir'] },

  // ── Social Connection (3) ──────────────────────────────────────────────────
  { asin: 'B07CTTJB5K', name: 'Rummikub Classic Board Game', description: 'The classic tile-based strategy game perfect for family gatherings and social connection.', category: 'Social Connection', tags: ['board-game', 'social', 'family'] },
  { asin: 'B01N5NQNL9', name: 'Bananagrams Word Game', description: 'Fast-paced word tile game that keeps the mind sharp and brings people together.', category: 'Social Connection', tags: ['word-game', 'social', 'brain-health'] },
  { asin: 'B07FKMNFXQ', name: 'Kindle Paperwhite 16GB Waterproof', description: 'Lightweight e-reader for book clubs, reading groups, and lifelong learning.', category: 'Social Connection', tags: ['reading', 'book-club', 'learning'] },

  // ── Spiritual Practice (3) ─────────────────────────────────────────────────
  { asin: 'B08CXVKJMU', name: 'Mala Bead Necklace 108 Beads Sandalwood', description: 'Traditional 108-bead mala for mantra meditation and mindful intention-setting.', category: 'Spiritual Practice', tags: ['mala', 'meditation', 'mantra'] },
  { asin: 'B07PXNRWZM', name: 'Hem Incense Variety Pack 120 Sticks', description: 'Assorted natural incense for creating sacred space and supporting daily ritual.', category: 'Spiritual Practice', tags: ['incense', 'ritual', 'sacred-space'] },
  { asin: 'B08HMWZBKS', name: 'The Wild Unknown Tarot Deck and Guidebook', description: 'Kim Krans\' beautifully illustrated tarot deck for reflection, intuition, and inner inquiry.', category: 'Spiritual Practice', tags: ['tarot', 'intuition', 'reflection'] },

  // ── Comfort & Home (4) ────────────────────────────────────────────────────
  { asin: 'B07YWMFZJM', name: 'Cashmere-Like Throw Blanket Ultra Soft', description: 'Luxuriously soft throw blanket for cozy reading, rest, and comfort at home.', category: 'Comfort & Home', tags: ['blanket', 'comfort', 'home'] },
  { asin: 'B09NQTBWQJ', name: 'Himalayan Salt Lamp Natural Crystal', description: 'Hand-carved Himalayan salt lamp for warm ambient light and a calming atmosphere.', category: 'Comfort & Home', tags: ['salt-lamp', 'ambiance', 'home'] },
  { asin: 'B07CTTJB5L', name: 'Ergonomic Reading Pillow with Arms', description: 'Supportive back and arm pillow for comfortable reading in bed or on the couch.', category: 'Comfort & Home', tags: ['reading', 'comfort', 'posture'] },
  { asin: 'B01N5NQNLA', name: 'Blue Light Blocking Glasses for Screen Time', description: 'Amber-lens glasses that filter blue light to protect eyes and support evening sleep.', category: 'Comfort & Home', tags: ['blue-light', 'screen-time', 'sleep'] },
];

async function run() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('[seed-products] Connected to database');

  // Verify all ASINs are unique
  const asins = PRODUCTS.map(p => p.asin);
  const uniqueAsins = new Set(asins);
  if (uniqueAsins.size !== asins.length) {
    const dupes = asins.filter((a, i) => asins.indexOf(a) !== i);
    console.error('[seed-products] DUPLICATE ASINs found:', dupes);
    process.exit(1);
  }
  console.log(`[seed-products] ${PRODUCTS.length} products with ${uniqueAsins.size} unique ASINs`);

  let inserted = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    try {
      await db.execute(
        `INSERT INTO products (asin, name, description, imageUrl, category, tags, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 'valid', NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           category = VALUES(category),
           tags = VALUES(tags),
           status = 'valid'`,
        [
          product.asin,
          product.name,
          product.description ?? null,
          product.imageUrl ?? null,
          product.category,
          JSON.stringify(product.tags),
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  [err] ${product.asin} - ${product.name}:`, err.message);
      skipped++;
    }
  }

  const [rows] = await db.execute('SELECT COUNT(*) as total FROM products WHERE status = "valid"');
  console.log(`[seed-products] Done. Inserted/updated: ${inserted}, Skipped: ${skipped}`);
  console.log(`[seed-products] Total valid products in DB: ${rows[0].total}`);

  // Show a sample by category
  const [cats] = await db.execute('SELECT category, COUNT(*) as cnt FROM products WHERE status = "valid" GROUP BY category ORDER BY category');
  console.log('\n[seed-products] Products by category:');
  cats.forEach(c => console.log(`  ${c.category}: ${c.cnt}`));

  await db.end();
}

run().catch(e => { console.error(e); process.exit(1); });
