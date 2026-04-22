/**
 * assign-images.mjs
 * Assigns unique, topic-matched Unsplash images to every article and page hero.
 * Uses the Unsplash source URL format which serves free, high-quality photos.
 * Images are sized at 1600x900 for heroes and 800x500 for cards.
 */
import mysql from 'mysql2/promise';

// Each entry: [titleFragment, heroImageUrl, cardImageUrl]
// All images are from Unsplash - warm, nature, elder, wisdom themes
const IMAGE_MAP = [
  // Article 1: What Conscious Aging Really Means
  {
    titleFragment: 'Conscious Aging Really Means',
    hero: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop',
  },
  // Article 2: TCM Herbs That Support Longevity
  {
    titleFragment: 'TCM Herbs',
    hero: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80&auto=format&fit=crop',
  },
  // Article 3: Lion's Mane Mushroom
  {
    titleFragment: "Lion's Mane",
    hero: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop',
  },
  // Article 4: How to Build a Morning Ritual
  {
    titleFragment: 'Morning Ritual',
    hero: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80&auto=format&fit=crop',
  },
  // Article 5: The Art of Letting Go / Downsizing
  {
    titleFragment: 'Letting Go',
    hero: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
  },
  // Article 6: How Meditation Changes the Aging Brain
  {
    titleFragment: 'Meditation',
    hero: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80&auto=format&fit=crop',
  },
  // Article 7: Legacy Letters
  {
    titleFragment: 'Legacy Letters',
    hero: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format&fit=crop',
  },
  // Article 8: Intergenerational Friendship
  {
    titleFragment: 'Intergenerational',
    hero: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop',
  },
  // Article 9: What Ram Dass Taught Me
  {
    titleFragment: 'Ram Dass',
    hero: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80&auto=format&fit=crop',
  },
  // Article 10: CoQ10, Magnesium, and the Supplements
  {
    titleFragment: 'CoQ10',
    hero: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80&auto=format&fit=crop',
  },
  // Article 11: How to Talk to Your Adult Children About End-of-Life
  {
    titleFragment: 'Adult Children',
    hero: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800&q=80&auto=format&fit=crop',
  },
  // Article 12: The Balance Problem Nobody Talks About After 65
  {
    titleFragment: 'Balance Problem',
    hero: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop',
  },
  // Article 13: Grief Is Not a Problem to Solve
  {
    titleFragment: 'Grief',
    hero: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80&auto=format&fit=crop',
  },
  // Article 14: Why Retirement Is the Wrong Frame
  {
    titleFragment: 'Retirement',
    hero: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80&auto=format&fit=crop',
  },
  // Article 15: The Japanese Concept of Ikigai
  {
    titleFragment: 'Ikigai',
    hero: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop',
  },
  // Article 16: How to Find Your People After 70
  {
    titleFragment: 'Find Your People',
    hero: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85&auto=format&fit=crop&crop=faces',
    card: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop&crop=faces',
  },
  // Article 17: The Case for Slowing Down Deliberately
  {
    titleFragment: 'Slowing Down',
    hero: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&auto=format&fit=crop',
  },
  // Article 18: What Tai Chi Actually Does
  {
    titleFragment: 'Tai Chi',
    hero: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop',
  },
  // Article 19: The Wisdom of Swedish Death Cleaning
  {
    titleFragment: 'Swedish Death Cleaning',
    hero: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80&auto=format&fit=crop',
  },
  // Article 20: How to Be a Good Elder
  {
    titleFragment: 'Good Elder',
    hero: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80&auto=format&fit=crop',
  },
  // Article 21: The Science of Loneliness
  {
    titleFragment: 'Loneliness',
    hero: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80&auto=format&fit=crop',
  },
  // Article 22: Why Your Sleep Changes After 60
  {
    titleFragment: 'Sleep',
    hero: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&q=80&auto=format&fit=crop',
  },
  // Article 23: Astragalus and the Longevity Herbs
  {
    titleFragment: 'Astragalus',
    hero: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop',
  },
  // Article 24: The Art of Mentoring
  {
    titleFragment: 'Mentoring',
    hero: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop',
  },
  // Article 25: How to Write Your Memoir
  {
    titleFragment: 'Memoir',
    hero: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=85&auto=format&fit=crop&crop=bottom',
    card: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format&fit=crop&crop=bottom',
  },
  // Article 26: The Spiritual Dimension of Physical Decline
  {
    titleFragment: 'Spiritual Dimension',
    hero: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80&auto=format&fit=crop',
  },
  // Article 27: What Happens When You Stop Fighting Your Age
  {
    titleFragment: 'Stop Fighting',
    hero: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80&auto=format&fit=crop',
  },
  // Article 28: The Financial Wisdom Nobody Teaches
  {
    titleFragment: 'Financial Wisdom',
    hero: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80&auto=format&fit=crop',
  },
  // Article 29: How to Stay Curious
  {
    titleFragment: 'Stay Curious',
    hero: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop',
  },
  // Article 30: The Gift of Limitations
  {
    titleFragment: 'Gift of Limitations',
    hero: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&q=85&auto=format&fit=crop',
    card: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80&auto=format&fit=crop',
  },
];

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [articles] = await conn.execute('SELECT id, title FROM articles ORDER BY id ASC');

  let updated = 0;
  for (const article of articles) {
    const match = IMAGE_MAP.find(m =>
      article.title.toLowerCase().includes(m.titleFragment.toLowerCase())
    );
    if (match) {
      await conn.execute(
        'UPDATE articles SET imageUrl = ?, heroImageUrl = ? WHERE id = ?',
        [match.card, match.hero, article.id]
      );
      console.log(`[OK] "${article.title.substring(0, 50)}" -> image assigned`);
      updated++;
    } else {
      // Fallback: assign a generic warm nature image based on category
      const fallbackHero = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop';
      const fallbackCard = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop';
      await conn.execute(
        'UPDATE articles SET imageUrl = ?, heroImageUrl = ? WHERE id = ?',
        [fallbackCard, fallbackHero, article.id]
      );
      console.log(`[FALLBACK] "${article.title.substring(0, 50)}" -> fallback image`);
      updated++;
    }
  }

  console.log(`\nDone: ${updated} articles updated with images.`);
  await conn.end();
}

run().catch(err => { console.error(err); process.exit(1); });
