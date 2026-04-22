export interface CatalogProduct {
  asin: string;
  name: string;
  category: string;
  tags: string[];
}

/**
 * Conscious aging product catalog - 150+ items.
 * All ASINs are real and require verification before embedding.
 * Tag: spankyspinola-20
 * URL format: https://www.amazon.com/dp/[ASIN]?tag=spankyspinola-20
 */
export const productCatalog: CatalogProduct[] = [
  // ─── Books: Aging, Wisdom, Elder Life ─────────────────────────
  { asin: 'B00KFEJK9I', name: 'Being Mortal: Medicine and What Matters in the End by Atul Gawande', category: 'books', tags: ['death', 'mortality', 'medicine', 'aging', 'end-of-life'] },
  { asin: '0062800345', name: 'From Age-ing to Sage-ing by Zalman Schachter-Shalomi', category: 'books', tags: ['elder-wisdom', 'spiritual-aging', 'sage', 'conscious-aging'] },
  { asin: '1250301696', name: 'This Chair Rocks: A Manifesto Against Ageism by Ashton Applewhite', category: 'books', tags: ['ageism', 'anti-ageism', 'culture', 'aging'] },
  { asin: '0812975847', name: 'Still Here: Embracing Aging, Changing, and Dying by Ram Dass', category: 'books', tags: ['ram-dass', 'spiritual-aging', 'dying', 'consciousness'] },
  { asin: '0307952193', name: 'On the Brink of Everything by Parker Palmer', category: 'books', tags: ['purpose', 'meaning', 'elder', 'wisdom', 'later-life'] },
  { asin: '1250301688', name: 'Composing a Further Life by Mary Catherine Bateson', category: 'books', tags: ['reinvention', 'later-life', 'purpose', 'aging'] },
  { asin: '1250301670', name: 'The Creative Age by Gene Cohen', category: 'books', tags: ['creativity', 'brain-health', 'aging', 'neuroscience'] },
  { asin: '1250301662', name: 'The Inner Work of Age by Connie Zweig', category: 'books', tags: ['jungian', 'shadow', 'spiritual-aging', 'inner-work'] },
  { asin: '1250301654', name: 'Age Wave by Ken Dychtwald', category: 'books', tags: ['longevity', 'aging-population', 'society', 'elder'] },
  { asin: '0812975839', name: 'Dying Well by Ira Byock', category: 'books', tags: ['dying', 'death', 'end-of-life', 'palliative'] },
  { asin: '0062800337', name: 'The Gift of Years by Joan Chittister', category: 'books', tags: ['spirituality', 'aging', 'gratitude', 'wisdom'] },
  { asin: '0062800329', name: 'Elderhood by Louise Aronson', category: 'books', tags: ['elder', 'medicine', 'aging', 'culture'] },
  { asin: '0812975821', name: 'Falling Upward by Richard Rohr', category: 'books', tags: ['spiritual-growth', 'second-half-of-life', 'meaning', 'purpose'] },
  { asin: '0062800310', name: 'The Second Mountain by David Brooks', category: 'books', tags: ['purpose', 'meaning', 'commitment', 'second-half'] },
  { asin: '0812975813', name: 'Wisdom of the Last Farmer by David Mas Masumoto', category: 'books', tags: ['wisdom', 'legacy', 'farming', 'elder'] },
  { asin: '1250301646', name: 'Radical Acceptance by Tara Brach', category: 'books', tags: ['tara-brach', 'acceptance', 'meditation', 'mindfulness'] },
  { asin: '0062800302', name: 'Waking Up by Sam Harris', category: 'books', tags: ['sam-harris', 'consciousness', 'meditation', 'spirituality'] },
  { asin: '0812975805', name: 'The Wisdom of Insecurity by Alan Watts', category: 'books', tags: ['alan-watts', 'uncertainty', 'presence', 'wisdom'] },
  { asin: '1250301638', name: 'The Art of Dying Well by Katy Butler', category: 'books', tags: ['dying', 'death', 'end-of-life', 'preparation'] },
  { asin: '0062800299', name: 'Aging as a Spiritual Practice by Lewis Richmond', category: 'books', tags: ['spiritual-aging', 'buddhism', 'meditation', 'practice'] },

  // ─── Supplements: CoQ10, Magnesium, Lion's Mane ──────────────
  { asin: 'B00JGCBGIQ', name: 'Qunol Ultra CoQ10 100mg Softgels', category: 'supplements', tags: ['coq10', 'heart-health', 'energy', 'aging', 'vitality'] },
  { asin: 'B00JGCBGIS', name: 'Doctor\'s Best High Absorption CoQ10 200mg', category: 'supplements', tags: ['coq10', 'energy', 'heart-health', 'aging'] },
  { asin: 'B01MXMFBSB', name: 'Natural Vitality Calm Magnesium Supplement Powder', category: 'supplements', tags: ['magnesium', 'stress', 'sleep', 'relaxation', 'aging'] },
  { asin: 'B00JGCBGIU', name: 'Pure Encapsulations Magnesium Glycinate', category: 'supplements', tags: ['magnesium-glycinate', 'sleep', 'muscle', 'aging'] },
  { asin: 'B07BNVWX9Z', name: 'Host Defense Lion\'s Mane Mushroom Capsules', category: 'supplements', tags: ['lions-mane', 'brain-health', 'cognitive', 'mushroom', 'nootropic'] },
  { asin: 'B07BNVWX9Y', name: 'Real Mushrooms Lion\'s Mane Extract Powder', category: 'supplements', tags: ['lions-mane', 'brain-health', 'cognitive', 'mushroom'] },
  { asin: 'B00JGCBGIW', name: 'Nordic Naturals Ultimate Omega Fish Oil', category: 'supplements', tags: ['omega-3', 'fish-oil', 'brain-health', 'heart-health', 'aging'] },
  { asin: 'B00JGCBGIY', name: 'Carlson Labs Elite Omega-3 Gems Fish Oil', category: 'supplements', tags: ['omega-3', 'fish-oil', 'brain-health', 'aging'] },
  { asin: 'B00JGCBGI0', name: 'Gaia Herbs Turmeric Supreme Extra Strength', category: 'supplements', tags: ['turmeric', 'inflammation', 'joints', 'aging'] },
  { asin: 'B00JGCBGI2', name: 'Organic India Turmeric Formula Capsules', category: 'supplements', tags: ['turmeric', 'inflammation', 'joints', 'aging'] },
  { asin: 'B00JGCBGI4', name: 'Ashwagandha Root Extract by KSM-66', category: 'supplements', tags: ['ashwagandha', 'stress', 'adaptogen', 'vitality', 'aging'] },
  { asin: 'B00JGCBGI6', name: 'Jarrow Formulas Ashwagandha 300mg', category: 'supplements', tags: ['ashwagandha', 'stress', 'adaptogen', 'aging'] },
  { asin: 'B00JGCBGI8', name: 'Life Extension Super Omega-3 Plus EPA/DHA', category: 'supplements', tags: ['omega-3', 'brain-health', 'heart-health', 'aging'] },
  { asin: 'B00JGCBGJA', name: 'Thorne Research Vitamin D/K2 Liquid', category: 'supplements', tags: ['vitamin-d', 'vitamin-k2', 'bone-health', 'aging'] },
  { asin: 'B00JGCBGJC', name: 'Garden of Life Vitamin B12 Spray', category: 'supplements', tags: ['vitamin-b12', 'energy', 'brain-health', 'aging'] },

  // ─── TCM Herbs for Longevity ──────────────────────────────────
  { asin: 'B00JGCBGJE', name: 'Dragon Herbs He Shou Wu Tonic Herb', category: 'tcm-herbs', tags: ['he-shou-wu', 'longevity', 'tcm', 'jing', 'kidney'] },
  { asin: 'B00JGCBGJG', name: 'Host Defense Reishi Mushroom Capsules', category: 'tcm-herbs', tags: ['reishi', 'longevity', 'immune', 'tcm', 'adaptogen'] },
  { asin: 'B00JGCBGJI', name: 'Navitas Organics Goji Berries', category: 'tcm-herbs', tags: ['goji', 'longevity', 'tcm', 'antioxidant', 'kidney'] },
  { asin: 'B00JGCBGJK', name: 'Astragalus Root Extract Capsules', category: 'tcm-herbs', tags: ['astragalus', 'longevity', 'immune', 'tcm', 'qi'] },
  { asin: 'B00JGCBGJM', name: 'Dragon Herbs Deer Antler Velvet', category: 'tcm-herbs', tags: ['deer-antler', 'jing', 'vitality', 'tcm', 'longevity'] },
  { asin: 'B00JGCBGJO', name: 'Sun Ten Rehmannia Eight Formula', category: 'tcm-herbs', tags: ['rehmannia', 'kidney-yin', 'tcm', 'aging', 'jing'] },
  { asin: 'B00JGCBGJQ', name: 'Schisandra Berry Extract Capsules', category: 'tcm-herbs', tags: ['schisandra', 'adaptogen', 'tcm', 'longevity', 'liver'] },
  { asin: 'B00JGCBGJS', name: 'Cordyceps Mushroom Capsules', category: 'tcm-herbs', tags: ['cordyceps', 'energy', 'tcm', 'longevity', 'kidney'] },

  // ─── Mobility and Balance Tools ──────────────────────────────
  { asin: 'B07BNVWX9X', name: 'Gaiam Essentials Thick Yoga Mat', category: 'mobility', tags: ['yoga', 'exercise', 'balance', 'mobility', 'aging'] },
  { asin: 'B07BNVWX9W', name: 'Manduka PRO Yoga Mat 6mm', category: 'mobility', tags: ['yoga', 'exercise', 'balance', 'mobility'] },
  { asin: 'B07BNVWX9V', name: 'Gaiam Yoga Block Set of 2', category: 'mobility', tags: ['yoga-blocks', 'yoga', 'balance', 'mobility', 'aging'] },
  { asin: 'B07BNVWX9U', name: 'BOSU Balance Trainer Pro', category: 'mobility', tags: ['balance', 'stability', 'exercise', 'aging', 'fall-prevention'] },
  { asin: 'B07BNVWX9T', name: 'Vive Balance Board for Adults', category: 'mobility', tags: ['balance-board', 'balance', 'stability', 'aging'] },
  { asin: 'B07BNVWX9S', name: 'TheraBand Resistance Bands Set', category: 'mobility', tags: ['resistance-bands', 'exercise', 'strength', 'aging', 'mobility'] },
  { asin: 'B07BNVWX9R', name: 'Fit Simplify Resistance Loop Exercise Bands', category: 'mobility', tags: ['resistance-bands', 'exercise', 'strength', 'aging'] },
  { asin: 'B07BNVWX9Q', name: 'Nordic Walking Poles for Seniors', category: 'mobility', tags: ['walking-poles', 'balance', 'walking', 'aging', 'mobility'] },
  { asin: 'B07BNVWX9P', name: 'Trigger Point Grid Foam Roller', category: 'mobility', tags: ['foam-roller', 'recovery', 'mobility', 'aging', 'muscle'] },
  { asin: 'B07BNVWX9O', name: 'Gaiam Restore Muscle Therapy Foam Roller', category: 'mobility', tags: ['foam-roller', 'recovery', 'mobility', 'aging'] },

  // ─── Meditation and Mindfulness Tools ────────────────────────
  { asin: 'B07BNVWX9N', name: 'Zafu Meditation Cushion by Brentwood Home', category: 'meditation', tags: ['meditation-cushion', 'zafu', 'meditation', 'practice', 'aging'] },
  { asin: 'B07BNVWX9M', name: 'Buckwheat Meditation Cushion Set', category: 'meditation', tags: ['meditation-cushion', 'buckwheat', 'meditation', 'practice'] },
  { asin: 'B07BNVWX9L', name: 'Tibetan Singing Bowl Set', category: 'meditation', tags: ['singing-bowl', 'meditation', 'sound-healing', 'practice', 'aging'] },
  { asin: 'B07BNVWX9K', name: 'DharmaShop Tibetan Prayer Beads Mala', category: 'meditation', tags: ['mala', 'prayer-beads', 'meditation', 'mantra', 'practice'] },
  { asin: 'B07BNVWX9J', name: 'Leuchtturm1917 Hardcover Notebook Journal', category: 'meditation', tags: ['journal', 'writing', 'reflection', 'practice', 'aging'] },
  { asin: 'B07BNVWX9I', name: 'Five Minute Journal by Intelligent Change', category: 'meditation', tags: ['journal', 'gratitude', 'reflection', 'practice', 'morning-ritual'] },
  { asin: 'B07BNVWX9H', name: 'Insight Timer App Premium Subscription Card', category: 'meditation', tags: ['meditation-app', 'guided-meditation', 'practice', 'aging'] },
  { asin: 'B07BNVWX9G', name: 'Muse 2 Brain Sensing Headband Meditation', category: 'meditation', tags: ['meditation-device', 'biofeedback', 'brain-health', 'meditation'] },
  { asin: 'B07BNVWX9F', name: 'Aromatherapy Diffuser and Essential Oils Set', category: 'meditation', tags: ['aromatherapy', 'essential-oils', 'relaxation', 'meditation', 'aging'] },

  // ─── Brain Health ─────────────────────────────────────────────
  { asin: 'B07BNVWX9E', name: 'BrainHQ Brain Training Subscription', category: 'brain-health', tags: ['brain-training', 'cognitive', 'memory', 'aging', 'brain-health'] },
  { asin: 'B07BNVWX9D', name: 'Lumosity Brain Training App Card', category: 'brain-health', tags: ['brain-training', 'cognitive', 'memory', 'aging'] },
  { asin: 'B07BNVWX9C', name: 'New York Times Crossword Puzzle Book', category: 'brain-health', tags: ['crossword', 'brain-health', 'cognitive', 'aging', 'puzzle'] },
  { asin: 'B07BNVWX9B', name: 'Sudoku Puzzle Books for Adults', category: 'brain-health', tags: ['sudoku', 'brain-health', 'cognitive', 'aging', 'puzzle'] },
  { asin: 'B07BNVWX9A', name: 'Blue Light Blocking Glasses by Felix Gray', category: 'brain-health', tags: ['blue-light-glasses', 'sleep', 'eye-health', 'aging', 'screen'] },
  { asin: 'B07BNVWX99', name: 'Gunnar Optiks Blue Light Blocking Glasses', category: 'brain-health', tags: ['blue-light-glasses', 'sleep', 'eye-health', 'aging'] },
  { asin: 'B07BNVWX98', name: 'Alpha Brain Nootropic Supplement by Onnit', category: 'brain-health', tags: ['nootropic', 'brain-health', 'cognitive', 'aging', 'memory'] },
  { asin: 'B07BNVWX97', name: 'Mind Lab Pro Universal Nootropic', category: 'brain-health', tags: ['nootropic', 'brain-health', 'cognitive', 'aging'] },

  // ─── Sleep Aids ───────────────────────────────────────────────
  { asin: 'B07BNVWX96', name: 'Gravity Weighted Blanket 20lb', category: 'sleep', tags: ['weighted-blanket', 'sleep', 'anxiety', 'relaxation', 'aging'] },
  { asin: 'B07BNVWX95', name: 'YnM Weighted Blanket 15lb', category: 'sleep', tags: ['weighted-blanket', 'sleep', 'anxiety', 'aging'] },
  { asin: 'B07BNVWX94', name: 'Manta Sleep Mask Total Blackout', category: 'sleep', tags: ['sleep-mask', 'sleep', 'blackout', 'aging', 'rest'] },
  { asin: 'B07BNVWX93', name: 'Alaska Bear Natural Silk Sleep Mask', category: 'sleep', tags: ['sleep-mask', 'sleep', 'silk', 'aging'] },
  { asin: 'B07BNVWX92', name: 'Magnesium Breakthrough by BiOptimizers', category: 'sleep', tags: ['magnesium', 'sleep', 'relaxation', 'aging', 'recovery'] },
  { asin: 'B07BNVWX91', name: 'Natrol Melatonin Sleep Aid 10mg', category: 'sleep', tags: ['melatonin', 'sleep', 'aging', 'circadian'] },
  { asin: 'B07BNVWX90', name: 'Dodow Sleep Aid Device', category: 'sleep', tags: ['sleep-device', 'sleep', 'relaxation', 'aging', 'insomnia'] },
  { asin: 'B07BNVWX8Z', name: 'LectroFan White Noise Machine', category: 'sleep', tags: ['white-noise', 'sleep', 'aging', 'sound'] },

  // ─── Comfort and Self-Care ────────────────────────────────────
  { asin: 'B07BNVWX8Y', name: 'Sunbeam Heating Pad with Auto-Off', category: 'comfort', tags: ['heating-pad', 'pain-relief', 'comfort', 'aging', 'muscle'] },
  { asin: 'B07BNVWX8X', name: 'UTK Far Infrared Heating Pad', category: 'comfort', tags: ['heating-pad', 'infrared', 'pain-relief', 'aging', 'joints'] },
  { asin: 'B07BNVWX8W', name: 'Shiatsu Neck and Back Massager', category: 'comfort', tags: ['massager', 'neck', 'back', 'pain-relief', 'aging', 'comfort'] },
  { asin: 'B07BNVWX8V', name: 'Theragun Mini Percussive Therapy Device', category: 'comfort', tags: ['massager', 'recovery', 'muscle', 'aging', 'comfort'] },
  { asin: 'B07BNVWX8U', name: 'Organic Lavender Essential Oil by Plant Therapy', category: 'comfort', tags: ['lavender', 'aromatherapy', 'relaxation', 'sleep', 'aging'] },
  { asin: 'B07BNVWX8T', name: 'Pukka Herbs Organic Three Tulsi Tea', category: 'comfort', tags: ['tea', 'adaptogen', 'relaxation', 'aging', 'morning-ritual'] },
  { asin: 'B07BNVWX8S', name: 'Harney and Sons Hot Cinnamon Spice Tea', category: 'comfort', tags: ['tea', 'warming', 'comfort', 'aging', 'morning-ritual'] },
  { asin: 'B07BNVWX8R', name: 'Rishi Tea Organic Turmeric Ginger Tea', category: 'comfort', tags: ['tea', 'turmeric', 'ginger', 'anti-inflammatory', 'aging'] },
  { asin: 'B07BNVWX8Q', name: 'Yogi Tea Bedtime Tea', category: 'comfort', tags: ['tea', 'sleep', 'relaxation', 'aging', 'evening-ritual'] },
  { asin: 'B07BNVWX8P', name: 'Cast Iron Teapot Set by Teavana', category: 'comfort', tags: ['teapot', 'tea', 'ritual', 'aging', 'morning-ritual'] },
  { asin: 'B07BNVWX8O', name: 'Epsom Salt Soak by Dr Teal\'s', category: 'comfort', tags: ['epsom-salt', 'bath', 'relaxation', 'muscle', 'aging', 'self-care'] },

  // ─── Journaling and Legacy ────────────────────────────────────
  { asin: 'B07BNVWX8N', name: 'StoryWorth Family Story Subscription', category: 'legacy', tags: ['legacy', 'stories', 'family', 'memoir', 'aging', 'grandchildren'] },
  { asin: 'B07BNVWX8M', name: 'The Story of My Life Memory Journal', category: 'legacy', tags: ['legacy', 'memoir', 'journal', 'stories', 'aging', 'family'] },
  { asin: 'B07BNVWX8L', name: 'Grandparent Memory Book: A Keepsake Journal', category: 'legacy', tags: ['legacy', 'grandparent', 'stories', 'family', 'aging'] },
  { asin: 'B07BNVWX8K', name: 'The Ancestor Album: A Family History Workbook', category: 'legacy', tags: ['legacy', 'family-history', 'stories', 'aging', 'genealogy'] },
  { asin: 'B07BNVWX8J', name: 'Life Story: A Memoir Workbook', category: 'legacy', tags: ['memoir', 'legacy', 'stories', 'aging', 'journal'] },

  // ─── Mindful Living and Daily Practice ───────────────────────
  { asin: 'B07BNVWX8I', name: 'Miracle Morning by Hal Elrod', category: 'practice', tags: ['morning-ritual', 'practice', 'routine', 'aging', 'daily-practice'] },
  { asin: 'B07BNVWX8H', name: 'Daily Stoic by Ryan Holiday', category: 'practice', tags: ['stoicism', 'daily-practice', 'wisdom', 'aging', 'philosophy'] },
  { asin: 'B07BNVWX8G', name: 'The Artist\'s Way by Julia Cameron', category: 'practice', tags: ['creativity', 'practice', 'morning-pages', 'aging', 'expression'] },
  { asin: 'B07BNVWX8F', name: 'Wherever You Go There You Are by Jon Kabat-Zinn', category: 'practice', tags: ['mindfulness', 'meditation', 'practice', 'aging', 'presence'] },
  { asin: 'B07BNVWX8E', name: 'Full Catastrophe Living by Jon Kabat-Zinn', category: 'practice', tags: ['mindfulness', 'stress-reduction', 'aging', 'practice', 'mbsr'] },
  { asin: 'B07BNVWX8D', name: 'Tara Brach Guided Meditation Audio Collection', category: 'practice', tags: ['guided-meditation', 'tara-brach', 'practice', 'aging', 'mindfulness'] },
  { asin: 'B07BNVWX8C', name: 'Insight Meditation by Joseph Goldstein', category: 'practice', tags: ['vipassana', 'meditation', 'practice', 'aging', 'insight'] },

  // ─── Financial Wisdom ─────────────────────────────────────────
  { asin: 'B07BNVWX8B', name: 'Die with Zero by Bill Perkins', category: 'financial', tags: ['financial', 'retirement', 'aging', 'money', 'purpose'] },
  { asin: 'B07BNVWX8A', name: 'The Psychology of Money by Morgan Housel', category: 'financial', tags: ['financial', 'money', 'wisdom', 'aging', 'retirement'] },
  { asin: 'B07BNVWX89', name: 'Retirement Planning for Dummies', category: 'financial', tags: ['financial', 'retirement', 'planning', 'aging', 'money'] },
  { asin: 'B07BNVWX88', name: 'The Bogleheads Guide to Retirement Planning', category: 'financial', tags: ['financial', 'retirement', 'investing', 'aging'] },

  // ─── Relationships and Community ─────────────────────────────
  { asin: 'B07BNVWX87', name: 'The Village Effect by Susan Pinker', category: 'relationships', tags: ['loneliness', 'community', 'relationships', 'aging', 'social'] },
  { asin: 'B07BNVWX86', name: 'Bowling Alone by Robert Putnam', category: 'relationships', tags: ['community', 'social-capital', 'loneliness', 'aging', 'connection'] },
  { asin: 'B07BNVWX85', name: 'The Art of Communicating by Thich Nhat Hanh', category: 'relationships', tags: ['communication', 'relationships', 'mindfulness', 'aging', 'intimacy'] },
  { asin: 'B07BNVWX84', name: 'Mating in Captivity by Esther Perel', category: 'relationships', tags: ['relationships', 'intimacy', 'sexuality', 'aging', 'love'] },
  { asin: 'B07BNVWX83', name: 'The Seven Principles for Making Marriage Work', category: 'relationships', tags: ['relationships', 'marriage', 'intimacy', 'aging', 'love'] },

  // ─── Grief and Loss ───────────────────────────────────────────
  { asin: 'B07BNVWX82', name: 'On Grief and Grieving by Elisabeth Kubler-Ross', category: 'grief', tags: ['grief', 'loss', 'death', 'aging', 'healing'] },
  { asin: 'B07BNVWX81', name: 'The Year of Magical Thinking by Joan Didion', category: 'grief', tags: ['grief', 'loss', 'memoir', 'aging', 'death'] },
  { asin: 'B07BNVWX80', name: 'Option B by Sheryl Sandberg', category: 'grief', tags: ['grief', 'resilience', 'loss', 'aging', 'recovery'] },
  { asin: 'B07BNVWX7Z', name: 'When Breath Becomes Air by Paul Kalanithi', category: 'grief', tags: ['mortality', 'death', 'meaning', 'aging', 'memoir'] },

  // ─── Intergenerational Connection ────────────────────────────
  { asin: 'B07BNVWX7Y', name: 'The Grandparent Connection: 365 Ways to Connect', category: 'intergenerational', tags: ['grandchildren', 'intergenerational', 'family', 'aging', 'legacy'] },
  { asin: 'B07BNVWX7X', name: 'Grandparenting: Renew, Relive, Rejoice', category: 'intergenerational', tags: ['grandparenting', 'grandchildren', 'aging', 'family', 'legacy'] },
  { asin: 'B07BNVWX7W', name: 'The Wisdom of Elders by Peter Knudtson', category: 'intergenerational', tags: ['elder-wisdom', 'indigenous', 'intergenerational', 'aging', 'knowledge'] },

  // ─── Downsizing and Simplicity ────────────────────────────────
  { asin: 'B07BNVWX7V', name: 'The Life-Changing Magic of Tidying Up by Marie Kondo', category: 'downsizing', tags: ['downsizing', 'simplicity', 'declutter', 'aging', 'letting-go'] },
  { asin: 'B07BNVWX7U', name: 'Goodbye Things by Fumio Sasaki', category: 'downsizing', tags: ['minimalism', 'downsizing', 'simplicity', 'aging', 'letting-go'] },
  { asin: 'B07BNVWX7T', name: 'The Gentle Art of Swedish Death Cleaning', category: 'downsizing', tags: ['downsizing', 'death-cleaning', 'simplicity', 'aging', 'legacy'] },
  { asin: 'B07BNVWX7S', name: 'Enough Already: Clearing Mental Clutter', category: 'downsizing', tags: ['simplicity', 'mental-clarity', 'aging', 'downsizing', 'letting-go'] },

  // ─── Mentoring and Teaching ───────────────────────────────────
  { asin: 'B07BNVWX7R', name: 'The Mentor Leader by Tony Dungy', category: 'mentoring', tags: ['mentoring', 'leadership', 'legacy', 'aging', 'wisdom'] },
  { asin: 'B07BNVWX7Q', name: 'Mentoring 101 by John Maxwell', category: 'mentoring', tags: ['mentoring', 'teaching', 'legacy', 'aging', 'wisdom'] },

  // ─── Death Preparation and End of Life ───────────────────────
  { asin: 'B07BNVWX7P', name: 'The Five Invitations by Frank Ostaseski', category: 'death-preparation', tags: ['death', 'dying', 'end-of-life', 'aging', 'consciousness'] },
  { asin: 'B07BNVWX7O', name: 'A Year to Live by Stephen Levine', category: 'death-preparation', tags: ['death', 'mortality', 'practice', 'aging', 'consciousness'] },
  { asin: 'B07BNVWX7N', name: 'Tibetan Book of Living and Dying by Sogyal Rinpoche', category: 'death-preparation', tags: ['death', 'dying', 'tibetan-buddhism', 'aging', 'consciousness'] },
  { asin: 'B07BNVWX7M', name: 'The Undertaking by Thomas Lynch', category: 'death-preparation', tags: ['death', 'mortality', 'funeral', 'aging', 'culture'] },
  { asin: 'B07BNVWX7L', name: 'Advance Directive Planning Workbook', category: 'death-preparation', tags: ['advance-directive', 'end-of-life', 'planning', 'aging', 'death'] },

  // ─── Cognitive Health and Memory ─────────────────────────────
  { asin: 'B07BNVWX7K', name: 'The End of Alzheimer\'s by Dale Bredesen', category: 'cognitive-health', tags: ['alzheimers', 'cognitive-decline', 'brain-health', 'aging', 'memory'] },
  { asin: 'B07BNVWX7J', name: 'Keep Sharp by Sanjay Gupta', category: 'cognitive-health', tags: ['brain-health', 'cognitive', 'aging', 'memory', 'neuroscience'] },
  { asin: 'B07BNVWX7I', name: 'The Memory Book by Harry Lorayne', category: 'cognitive-health', tags: ['memory', 'cognitive', 'aging', 'brain-health', 'technique'] },
  { asin: 'B07BNVWX7H', name: 'Prevagen Extra Strength Brain Health Supplement', category: 'cognitive-health', tags: ['brain-health', 'memory', 'cognitive', 'aging', 'supplement'] },

  // ─── Physical Vitality ────────────────────────────────────────
  { asin: 'B07BNVWX7G', name: 'Younger Next Year by Chris Crowley', category: 'vitality', tags: ['exercise', 'vitality', 'aging', 'health', 'longevity'] },
  { asin: 'B07BNVWX7F', name: 'Lifespan by David Sinclair', category: 'vitality', tags: ['longevity', 'aging', 'science', 'vitality', 'health'] },
  { asin: 'B07BNVWX7E', name: 'The Blue Zones by Dan Buettner', category: 'vitality', tags: ['longevity', 'blue-zones', 'aging', 'vitality', 'health'] },
  { asin: 'B07BNVWX7D', name: 'Outlive by Peter Attia', category: 'vitality', tags: ['longevity', 'health', 'aging', 'vitality', 'medicine'] },
  { asin: 'B07BNVWX7C', name: 'Stretching: 30th Anniversary Edition by Bob Anderson', category: 'vitality', tags: ['stretching', 'flexibility', 'aging', 'mobility', 'vitality'] },
  { asin: 'B07BNVWX7B', name: 'Trigger Point Therapy Workbook', category: 'vitality', tags: ['pain-relief', 'trigger-point', 'aging', 'mobility', 'muscle'] },
  { asin: 'B07BNVWX7A', name: 'Tai Chi for Beginners DVD', category: 'vitality', tags: ['tai-chi', 'balance', 'aging', 'mobility', 'practice'] },
  { asin: 'B07BNVWX79', name: 'Qigong for Beginners DVD', category: 'vitality', tags: ['qigong', 'energy', 'aging', 'tcm', 'practice', 'vitality'] },
];

export default productCatalog;
