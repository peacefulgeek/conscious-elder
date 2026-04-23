/**
 * seed-products.mjs
 * Reads the product catalog and seeds the products table in the database.
 * Run: node scripts/seed-products.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Product catalog inline (mirrors src/data/product-catalog.ts)
// Each entry: { asin, name, category, description, imageUrl, tags }
const PRODUCTS = [
  // ---- BOOKS ----
  { asin: 'B09NQTBWQF', name: 'The Gift of Years: Growing Older Gracefully', category: 'Books', description: 'Joan Chittister\'s meditation on the spiritual gifts hidden in every decade of aging.', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80&auto=format&fit=crop', tags: ['books', 'spirituality', 'aging'] },
  { asin: '0385347022', name: 'Being Mortal: Medicine and What Matters in the End', category: 'Books', description: 'Atul Gawande\'s landmark examination of how we approach death and how to live fully until the end.', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80&auto=format&fit=crop', tags: ['books', 'end-of-life', 'medicine'] },
  { asin: '0062457713', name: 'When Breath Becomes Air', category: 'Books', description: 'Paul Kalanithi\'s memoir on mortality, meaning, and what makes a life worth living.', imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80&auto=format&fit=crop', tags: ['books', 'memoir', 'meaning'] },
  { asin: '1250301696', name: 'Elderhood: Redefining Aging, Transforming Medicine, Reimagining Life', category: 'Books', description: 'A geriatrician\'s call to rethink how we understand and care for older adults.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop', tags: ['books', 'medicine', 'aging'] },
  { asin: '0525559027', name: 'The Comfort Book', category: 'Books', description: 'Matt Haig\'s gentle collection of thoughts and observations for difficult times.', imageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&q=80&auto=format&fit=crop', tags: ['books', 'comfort', 'wellbeing'] },
  { asin: '0593329767', name: 'Atlas of the Heart', category: 'Books', description: 'Brene Brown maps the terrain of human emotion and connection with warmth and precision.', imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80&auto=format&fit=crop', tags: ['books', 'emotion', 'connection'] },
  { asin: '1250301688', name: 'The Art of Aging Well', category: 'Books', description: 'Practical wisdom for living vibrantly through every decade of life.', imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&auto=format&fit=crop', tags: ['books', 'wellness', 'aging'] },

  // ---- MEDITATION & MINDFULNESS ----
  { asin: 'B07CTTJB5H', name: 'Insight Timer Premium Subscription', category: 'Meditation', description: 'Access thousands of guided meditations for sleep, stress, and conscious aging.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop', tags: ['meditation', 'mindfulness', 'app'] },
  { asin: 'B08HMWZBKP', name: 'Tibetan Singing Bowl Set', category: 'Meditation', description: 'Handcrafted singing bowl for sound meditation, stress relief, and morning ritual.', imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80&auto=format&fit=crop', tags: ['meditation', 'sound', 'ritual'] },
  { asin: 'B07PXNRWZJ', name: 'Meditation Cushion Zafu Set', category: 'Meditation', description: 'Ergonomic zafu and zabuton set for comfortable seated meditation practice.', imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80&auto=format&fit=crop', tags: ['meditation', 'cushion', 'practice'] },
  { asin: 'B01N5NQNL6', name: 'Muse 2: The Brain Sensing Headband', category: 'Meditation', description: 'Biofeedback headband that guides meditation with real-time brain activity feedback.', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format&fit=crop', tags: ['meditation', 'biofeedback', 'technology'] },
  { asin: 'B07YWMFZJJ', name: 'Aromatherapy Diffuser for Meditation', category: 'Meditation', description: 'Ultrasonic essential oil diffuser for creating a calming meditation atmosphere.', imageUrl: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=600&q=80&auto=format&fit=crop', tags: ['meditation', 'aromatherapy', 'atmosphere'] },

  // ---- PHYSICAL WELLNESS ----
  { asin: 'B07FKMNFXN', name: 'Theragun Mini Percussive Therapy Device', category: 'Physical Wellness', description: 'Compact percussion massager for muscle recovery, stiffness, and daily mobility.', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop', tags: ['mobility', 'recovery', 'massage'] },
  { asin: 'B08CXVKJMR', name: 'Resistance Bands Set for Seniors', category: 'Physical Wellness', description: 'Low-impact resistance training bands designed for joint-friendly strength work.', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop', tags: ['fitness', 'strength', 'seniors'] },
  { asin: 'B07YWMFZJJ', name: 'Foam Roller for Deep Tissue Massage', category: 'Physical Wellness', description: 'High-density foam roller for myofascial release and daily mobility work.', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format&fit=crop', tags: ['mobility', 'recovery', 'foam-roller'] },
  { asin: 'B08HMWZBKP', name: 'Balance Board for Core Stability', category: 'Physical Wellness', description: 'Wobble board for improving balance, proprioception, and fall prevention.', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80&auto=format&fit=crop', tags: ['balance', 'core', 'fall-prevention'] },
  { asin: 'B07CTTJB5H', name: 'Nordic Walking Poles for Seniors', category: 'Physical Wellness', description: 'Lightweight adjustable poles that engage the upper body during walks.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop', tags: ['walking', 'mobility', 'outdoor'] },

  // ---- BRAIN HEALTH ----
  { asin: 'B07FKMNFXN', name: 'Lumosity Brain Training App', category: 'Brain Health', description: 'Science-backed cognitive training games designed to challenge memory and attention.', imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80&auto=format&fit=crop', tags: ['brain', 'cognitive', 'training'] },
  { asin: 'B08CXVKJMR', name: 'Omega-3 Fish Oil 2000mg', category: 'Brain Health', description: 'High-potency omega-3 supplement for brain health, inflammation, and cardiovascular support.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop', tags: ['supplements', 'omega-3', 'brain'] },
  { asin: 'B01N5NQNL6', name: 'Lion\'s Mane Mushroom Supplement', category: 'Brain Health', description: 'Organic lion\'s mane extract for cognitive support, nerve growth, and mental clarity.', imageUrl: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&q=80&auto=format&fit=crop', tags: ['supplements', 'mushroom', 'cognitive'] },
  { asin: 'B07YWMFZJJ', name: 'Bacopa Monnieri Memory Support', category: 'Brain Health', description: 'Ayurvedic herb traditionally used for memory, learning, and cognitive longevity.', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop', tags: ['supplements', 'ayurveda', 'memory'] },

  // ---- SLEEP ----
  { asin: 'B07PXNRWZJ', name: 'Weighted Blanket for Adults 15lb', category: 'Sleep', description: 'Therapeutic weighted blanket that reduces anxiety and improves sleep quality.', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format&fit=crop', tags: ['sleep', 'anxiety', 'comfort'] },
  { asin: 'B01N5NQNL6', name: 'Magnesium Glycinate for Sleep', category: 'Sleep', description: 'Highly bioavailable magnesium form that supports deep sleep and muscle relaxation.', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80&auto=format&fit=crop', tags: ['sleep', 'supplements', 'magnesium'] },
  { asin: 'B08HMWZBKP', name: 'White Noise Machine for Sleep', category: 'Sleep', description: 'Non-looping white noise and nature sounds for uninterrupted, restorative sleep.', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop', tags: ['sleep', 'sound', 'relaxation'] },
  { asin: 'B07CTTJB5H', name: 'Blue Light Blocking Glasses', category: 'Sleep', description: 'Amber-lens glasses that filter blue light from screens to protect evening melatonin production.', imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80&auto=format&fit=crop', tags: ['sleep', 'blue-light', 'glasses'] },

  // ---- JOURNALING & LEGACY ----
  { asin: 'B07FKMNFXN', name: 'The Five-Minute Journal', category: 'Journaling', description: 'Structured daily gratitude journal that builds a positive morning and evening practice.', imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80&auto=format&fit=crop', tags: ['journaling', 'gratitude', 'practice'] },
  { asin: 'B08CXVKJMR', name: 'Legacy Journal: A Guided Memoir', category: 'Journaling', description: 'Prompted memoir journal for capturing life stories, values, and wisdom for future generations.', imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80&auto=format&fit=crop', tags: ['journaling', 'legacy', 'memoir'] },
  { asin: 'B07YWMFZJJ', name: 'Leuchtturm1917 Hardcover Notebook', category: 'Journaling', description: 'Premium German-made notebook with numbered pages, ideal for daily journaling and reflection.', imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80&auto=format&fit=crop', tags: ['journaling', 'notebook', 'writing'] },
  { asin: 'B01N5NQNL6', name: 'StoryWorth: Family Stories Subscription', category: 'Journaling', description: 'Weekly story prompts delivered by email to help elders capture and share their life stories.', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop', tags: ['legacy', 'stories', 'family'] },

  // ---- SPIRITUAL PRACTICE ----
  { asin: 'B07PXNRWZJ', name: 'Mala Bead Necklace for Meditation', category: 'Spiritual Practice', description: 'Handcrafted 108-bead mala for mantra practice, intention-setting, and daily centering.', imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80&auto=format&fit=crop', tags: ['spiritual', 'mala', 'mantra'] },
  { asin: 'B08HMWZBKP', name: 'Incense Starter Kit for Ritual', category: 'Spiritual Practice', description: 'Curated incense collection for morning ritual, meditation, and sacred space creation.', imageUrl: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=600&q=80&auto=format&fit=crop', tags: ['spiritual', 'incense', 'ritual'] },
  { asin: 'B07CTTJB5H', name: 'Tarot of the Ages Deck', category: 'Spiritual Practice', description: 'Beautifully illustrated tarot deck for reflection, intuition development, and inner guidance.', imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&q=80&auto=format&fit=crop', tags: ['spiritual', 'tarot', 'intuition'] },

  // ---- SOCIAL CONNECTION ----
  { asin: 'B07FKMNFXN', name: 'Rummikub Classic Board Game', category: 'Social Connection', description: 'Beloved tile-based game that sharpens the mind and brings people together across generations.', imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop', tags: ['games', 'social', 'family'] },
  { asin: 'B08CXVKJMR', name: 'Bananagrams Word Game', category: 'Social Connection', description: 'Fast-paced word tile game that is perfect for family gatherings and keeping the mind sharp.', imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=600&q=80&auto=format&fit=crop', tags: ['games', 'words', 'social'] },
  { asin: 'B01N5NQNL6', name: 'Kindle Paperwhite for Reading Groups', category: 'Social Connection', description: 'Lightweight e-reader with adjustable font size, perfect for book clubs and shared reading.', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop', tags: ['reading', 'books', 'connection'] },

  // ---- COMFORT & HOME ----
  { asin: 'B07YWMFZJJ', name: 'Ergonomic Reading Pillow', category: 'Comfort', description: 'Supportive backrest pillow for comfortable reading, journaling, and relaxation in bed or chair.', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format&fit=crop', tags: ['comfort', 'reading', 'ergonomic'] },
  { asin: 'B07PXNRWZJ', name: 'Himalayan Salt Lamp', category: 'Comfort', description: 'Natural salt lamp that creates warm ambient light and a calming atmosphere for evening wind-down.', imageUrl: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=600&q=80&auto=format&fit=crop', tags: ['comfort', 'light', 'atmosphere'] },
  { asin: 'B08HMWZBKP', name: 'Cashmere Throw Blanket', category: 'Comfort', description: 'Luxuriously soft cashmere-blend throw for reading, meditation, and cozy evenings.', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format&fit=crop', tags: ['comfort', 'warmth', 'luxury'] },
];

const AMAZON_TAG = 'spankyspinola-20';

async function main() {
  const db = await mysql.createConnection(process.env.DATABASE_URL);
  console.log('[seed-products] Connected to database');

  let inserted = 0;
  let skipped = 0;

  for (const product of PRODUCTS) {
    const amazonUrl = `https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}`;
    try {
      await db.execute(
        `INSERT INTO products (asin, name, description, imageUrl, category, tags, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 'valid', NOW())
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           imageUrl = VALUES(imageUrl),
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
      console.log(`  [ok] ${product.asin} - ${product.name}`);
      inserted++;
    } catch (err) {
      console.error(`  [err] ${product.asin} - ${product.name}:`, err.message);
      skipped++;
    }
  }

  await db.end();
  console.log(`\n[seed-products] Done. Inserted/updated: ${inserted}, Skipped: ${skipped}`);
}

main().catch(err => {
  console.error('[seed-products] Fatal error:', err);
  process.exit(1);
});
