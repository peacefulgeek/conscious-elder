// ─── Quiz Definitions for The Conscious Elder ────────────────────────────────
// 6 life-domain assessments, each with 10 scored questions (1-5 Likert scale)
// Max score per quiz: 50. Tiers: Thriving (40-50), Growing (25-39), Needs Attention (0-24)

export const AMAZON_TAG = 'spankyspinola-20';

export function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

export type QuizTier = 'thriving' | 'growing' | 'needs-attention';

export interface QuizQuestion {
  id: string;
  text: string;
  // 1 = Never/Not at all, 5 = Always/Completely
  lowLabel: string;
  highLabel: string;
}

export interface ProductRec {
  asin: string;
  name: string;
  reason: string; // why Kalesh recommends it for this tier/domain
  category: string;
}

export interface TierResult {
  tier: QuizTier;
  label: string;
  headline: string;
  narrative: string;
  recommendations: ProductRec[];
}

export interface QuizDefinition {
  id: string;
  domain: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroAlt: string;
  icon: string; // emoji
  color: string; // oklch accent
  questions: QuizQuestion[];
  tiers: {
    thriving: TierResult;
    growing: TierResult;
    'needs-attention': TierResult;
  };
}

export function scoreToTier(score: number, maxScore: number): QuizTier {
  const pct = score / maxScore;
  if (pct >= 0.80) return 'thriving';
  if (pct >= 0.50) return 'growing';
  return 'needs-attention';
}

// ─── 1. Physical Wellness ────────────────────────────────────────────────────
const physicalWellness: QuizDefinition = {
  id: 'physical-wellness',
  domain: 'Physical Wellness',
  title: 'Physical Wellness Assessment',
  subtitle: 'How well is your body supporting the life you want to live?',
  heroImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85&auto=format&fit=crop&crop=center',
  heroAlt: 'Elder doing gentle morning stretches in warm sunlight',
  icon: '🌿',
  color: 'oklch(0.55 0.14 145)',
  questions: [
    { id: 'pw1', text: 'I wake up feeling rested and ready to engage with the day.', lowLabel: 'Rarely', highLabel: 'Almost always' },
    { id: 'pw2', text: 'I move my body intentionally at least 3 times per week.', lowLabel: 'Not at all', highLabel: 'Every day' },
    { id: 'pw3', text: 'I eat in a way that genuinely supports my energy and health.', lowLabel: 'Not really', highLabel: 'Consistently' },
    { id: 'pw4', text: 'My balance and coordination feel stable and reliable.', lowLabel: 'Quite shaky', highLabel: 'Very confident' },
    { id: 'pw5', text: 'I manage chronic pain or discomfort in ways that work for me.', lowLabel: 'Struggling', highLabel: 'Managing well' },
    { id: 'pw6', text: 'I stay hydrated and pay attention to what my body needs.', lowLabel: 'Rarely', highLabel: 'Consistently' },
    { id: 'pw7', text: 'I have a healthcare team I trust and see regularly.', lowLabel: 'Not really', highLabel: 'Absolutely' },
    { id: 'pw8', text: 'I take supplements or herbs thoughtfully to support my health.', lowLabel: 'Not at all', highLabel: 'Thoughtfully' },
    { id: 'pw9', text: 'Physical limitations don\'t stop me from doing what matters most.', lowLabel: 'They do stop me', highLabel: 'I work around them' },
    { id: 'pw10', text: 'I listen to my body\'s signals rather than pushing through them.', lowLabel: 'I ignore them', highLabel: 'I listen closely' },
  ],
  tiers: {
    thriving: {
      tier: 'thriving',
      label: 'Thriving',
      headline: 'Your body is a genuine ally.',
      narrative: 'You\'ve built a real relationship with your physical self. The way you move, eat, rest, and listen to your body shows a level of care that most people never develop. That doesn\'t mean everything is perfect, and I\'m sure you have days that remind you of that. But the foundation is solid. What I\'d offer here is this: the work now is refinement and depth, not repair. The supplements and practices below are ones I\'ve found genuinely worth adding when the basics are already in place.',
      recommendations: [
        { asin: 'B07BNVWW8X', name: 'Jarrow Formulas MK-7 Vitamin K2', reason: 'For those with solid bone health habits who want to optimize, K2 directs calcium where it belongs.', category: 'supplements' },
        { asin: 'B00CAZAU62', name: 'Life Extension Super Omega-3', reason: 'High-quality fish oil for cardiovascular and cognitive support when the basics are covered.', category: 'supplements' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'A quality mat makes a real difference when you\'re committed to a daily movement practice.', category: 'movement' },
        { asin: 'B07CHNMVN7', name: 'Theraband Resistance Bands Set', reason: 'Resistance training matters more after 60 than most people realize. These are excellent for home use.', category: 'movement' },
      ],
    },
    growing: {
      tier: 'growing',
      label: 'Growing',
      headline: 'You\'re doing more right than you know.',
      narrative: 'There are real strengths here, and there are places where you\'re still figuring things out. That\'s honest, and it\'s where most of us live. The body after 60 requires a different kind of attention than the body at 40, and the learning curve is real. What I\'d focus on: pick one or two areas where you know you\'re falling short, and go deep there rather than trying to fix everything at once. The products below are ones I\'d point to for people in exactly this place.',
      recommendations: [
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Magnesium deficiency is extremely common and affects sleep, muscle function, and mood. This is my first recommendation for almost everyone.', category: 'supplements' },
        { asin: 'B00CAZAU62', name: 'Life Extension Super Omega-3', reason: 'Omega-3s support joint health, brain function, and inflammation. Worth adding if you\'re not already taking them.', category: 'supplements' },
        { asin: 'B07CHNMVN7', name: 'Theraband Resistance Bands Set', reason: 'Gentle resistance training is one of the most important things you can do for your body after 60.', category: 'movement' },
        { asin: 'B000GIQHF8', name: 'Gaiam Balance Ball Chair', reason: 'If you sit a lot, this is a simple way to engage your core and improve posture without thinking about it.', category: 'movement' },
        { asin: 'B07BNVWW8X', name: 'Jarrow Formulas MK-7 Vitamin K2', reason: 'K2 works with D3 to support bone density. If you\'re taking D3, you should probably be taking K2 too.', category: 'supplements' },
      ],
    },
    'needs-attention': {
      tier: 'needs-attention',
      label: 'Needs Attention',
      headline: 'Your body is asking for something.',
      narrative: 'I want to say something clearly: this score doesn\'t mean you\'re failing. It means your body is asking for more attention than it\'s currently getting, and that\'s information, not judgment. The second half of life has a way of making these things undeniable. The good news is that small, consistent changes in this domain produce results faster than most people expect. Start with sleep and movement. Everything else follows from there. The products below are where I\'d begin.',
      recommendations: [
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'If you do nothing else, start here. Magnesium affects sleep, muscle tension, and energy in ways most people don\'t realize until they try it.', category: 'supplements' },
        { asin: 'B00JGCBGZQ', name: 'Nature Made Vitamin D3 2000 IU', reason: 'Most people over 60 are deficient in D3. It affects bone health, immune function, and mood.', category: 'supplements' },
        { asin: 'B07CHNMVN7', name: 'Theraband Resistance Bands Set', reason: 'You don\'t need a gym. You need something to start with. These bands are gentle, effective, and easy to use at home.', category: 'movement' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'A mat on the floor is an invitation to move. Sometimes the barrier is just having the right thing in the right place.', category: 'movement' },
        { asin: 'B07BNVWW8X', name: 'Jarrow Formulas MK-7 Vitamin K2', reason: 'Bone density matters more than most people think until it doesn\'t. K2 is part of the foundation.', category: 'supplements' },
      ],
    },
  },
};

// ─── 2. Mental Clarity ───────────────────────────────────────────────────────
const mentalClarity: QuizDefinition = {
  id: 'mental-clarity',
  domain: 'Mental Clarity',
  title: 'Mental Clarity Assessment',
  subtitle: 'How sharp, focused, and engaged is your mind right now?',
  heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop&crop=center',
  heroAlt: 'Clear mountain lake reflecting sky, symbolizing mental clarity',
  icon: '🧠',
  color: 'oklch(0.55 0.14 240)',
  questions: [
    { id: 'mc1', text: 'My memory feels reliable for things that matter to me.', lowLabel: 'Very unreliable', highLabel: 'Very reliable' },
    { id: 'mc2', text: 'I can focus on a task for an extended period without losing the thread.', lowLabel: 'Very difficult', highLabel: 'Quite easy' },
    { id: 'mc3', text: 'I stay curious and continue learning new things.', lowLabel: 'Not really', highLabel: 'Actively' },
    { id: 'mc4', text: 'I notice when my thinking is cloudy and I do something about it.', lowLabel: 'I don\'t notice', highLabel: 'I notice and act' },
    { id: 'mc5', text: 'I limit things that impair my cognition (alcohol, poor sleep, stress).', lowLabel: 'Not at all', highLabel: 'Consistently' },
    { id: 'mc6', text: 'I engage in activities that challenge my brain regularly.', lowLabel: 'Rarely', highLabel: 'Daily' },
    { id: 'mc7', text: 'I feel mentally present in conversations rather than distracted.', lowLabel: 'Often distracted', highLabel: 'Usually present' },
    { id: 'mc8', text: 'I support my brain health with intentional nutrition or supplements.', lowLabel: 'Not at all', highLabel: 'Thoughtfully' },
    { id: 'mc9', text: 'I can learn new technology or skills without excessive frustration.', lowLabel: 'Very frustrated', highLabel: 'Mostly comfortable' },
    { id: 'mc10', text: 'My thinking feels as good as or better than it did five years ago.', lowLabel: 'Noticeably worse', highLabel: 'As good or better' },
  ],
  tiers: {
    thriving: {
      tier: 'thriving',
      label: 'Thriving',
      headline: 'Your mind is a tool you know how to use.',
      narrative: 'Mental sharpness at this level doesn\'t happen by accident. You\'ve been doing the right things, whether you knew it or not: staying curious, staying engaged, managing the things that cloud cognition. The research on cognitive aging is clear that the brain is more plastic than we once thought, and what you\'re doing is proof of that. The products below are for people who want to go deeper, not fix a problem.',
      recommendations: [
        { asin: 'B07K4FKQWT', name: 'Host Defense Lion\'s Mane Capsules', reason: 'Lion\'s Mane supports NGF production and is one of the most well-researched mushrooms for cognitive function. Worth adding when the basics are solid.', category: 'cognitive-health' },
        { asin: 'B00CAZAU62', name: 'Life Extension Super Omega-3', reason: 'DHA is the primary structural fat in the brain. High-quality omega-3s are worth taking at any level of cognitive health.', category: 'cognitive-health' },
        { asin: 'B0013OXKHC', name: 'Bacopa Monnieri by Himalaya', reason: 'Bacopa has solid research behind it for memory consolidation and learning. A good addition for those already doing well.', category: 'cognitive-health' },
        { asin: 'B07BNVWW8X', name: 'Jarrow Formulas MK-7 Vitamin K2', reason: 'Emerging research links K2 to brain health. Worth considering as part of a comprehensive approach.', category: 'supplements' },
      ],
    },
    growing: {
      tier: 'growing',
      label: 'Growing',
      headline: 'There\'s more capacity here than you\'re currently using.',
      narrative: 'You have real cognitive strengths, and you also have areas where you know something isn\'t quite right. That\'s an honest place to be. The brain after 60 responds well to the right inputs, and the gap between where you are and where you could be is often smaller than it feels. Sleep is usually the first place to look. Then comes movement, then nutrition, then targeted supplementation. The products below are ones I\'d recommend for someone in this position.',
      recommendations: [
        { asin: 'B07K4FKQWT', name: 'Host Defense Lion\'s Mane Capsules', reason: 'Lion\'s Mane is one of the most evidence-backed supplements for cognitive support. I\'d start here.', category: 'cognitive-health' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Poor sleep is often the root cause of cognitive fog. Magnesium glycinate improves sleep quality significantly for many people.', category: 'supplements' },
        { asin: 'B00CAZAU62', name: 'Life Extension Super Omega-3', reason: 'DHA supports brain structure and function. One of the most important supplements for cognitive health.', category: 'cognitive-health' },
        { asin: 'B0013OXKHC', name: 'Bacopa Monnieri by Himalaya', reason: 'Bacopa has good research for memory and learning. Takes 8-12 weeks to show full effect, but worth the patience.', category: 'cognitive-health' },
        { asin: 'B00JGCBGZQ', name: 'Nature Made Vitamin D3 2000 IU', reason: 'D3 deficiency is linked to cognitive decline. Worth checking your levels and supplementing if needed.', category: 'supplements' },
      ],
    },
    'needs-attention': {
      tier: 'needs-attention',
      label: 'Needs Attention',
      headline: 'Your brain is asking for support.',
      narrative: 'Cognitive fog, memory lapses, difficulty focusing: these are real, and they\'re more common than people admit. The culture tells us this is just aging, and we should accept it. I don\'t accept that, and I don\'t think you should either. There are things that genuinely help. Sleep is almost always the first place to look. Then movement, then nutrition, then targeted support. Please also talk to your doctor, because some cognitive changes have treatable causes. The products below are where I\'d start.',
      recommendations: [
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Sleep quality is the single biggest lever for cognitive function. Magnesium glycinate is where I\'d start.', category: 'supplements' },
        { asin: 'B07K4FKQWT', name: 'Host Defense Lion\'s Mane Capsules', reason: 'Lion\'s Mane supports nerve growth factor. The research is solid. Give it 60-90 days.', category: 'cognitive-health' },
        { asin: 'B00CAZAU62', name: 'Life Extension Super Omega-3', reason: 'DHA is the structural fat of the brain. If you\'re not getting enough, everything else is harder.', category: 'cognitive-health' },
        { asin: 'B00JGCBGZQ', name: 'Nature Made Vitamin D3 2000 IU', reason: 'D3 deficiency is strongly linked to cognitive decline. Most people over 60 are deficient.', category: 'supplements' },
        { asin: 'B0013OXKHC', name: 'Bacopa Monnieri by Himalaya', reason: 'Bacopa has the best research of any herb for memory. It\'s slow, but it works.', category: 'cognitive-health' },
      ],
    },
  },
};

// ─── 3. Emotional Health ─────────────────────────────────────────────────────
const emotionalHealth: QuizDefinition = {
  id: 'emotional-health',
  domain: 'Emotional Health',
  title: 'Emotional Health Assessment',
  subtitle: 'How well are you navigating the emotional landscape of this chapter?',
  heroImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1600&q=85&auto=format&fit=crop&crop=center',
  heroAlt: 'Warm afternoon light through trees, evoking emotional peace',
  icon: '💛',
  color: 'oklch(0.72 0.14 80)',
  questions: [
    { id: 'eh1', text: 'I can feel difficult emotions without being overwhelmed by them.', lowLabel: 'Overwhelmed often', highLabel: 'I can hold them' },
    { id: 'eh2', text: 'I have healthy ways to process grief, loss, and change.', lowLabel: 'Not really', highLabel: 'Yes, I do' },
    { id: 'eh3', text: 'I feel a genuine sense of contentment or peace most days.', lowLabel: 'Rarely', highLabel: 'Most days' },
    { id: 'eh4', text: 'I don\'t carry resentment or old wounds that weigh me down.', lowLabel: 'They weigh heavily', highLabel: 'Mostly released' },
    { id: 'eh5', text: 'I can ask for help or support when I need it.', lowLabel: 'Very hard for me', highLabel: 'I do this easily' },
    { id: 'eh6', text: 'I have at least one person I can be fully honest with.', lowLabel: 'No one', highLabel: 'Yes, definitely' },
    { id: 'eh7', text: 'I don\'t use substances, busyness, or screens to avoid feelings.', lowLabel: 'I do this often', highLabel: 'Rarely' },
    { id: 'eh8', text: 'I feel genuinely interested in life rather than just going through motions.', lowLabel: 'Going through motions', highLabel: 'Genuinely engaged' },
    { id: 'eh9', text: 'I\'ve made peace with aspects of my past that used to trouble me.', lowLabel: 'Still troubled', highLabel: 'Mostly at peace' },
    { id: 'eh10', text: 'I experience moments of genuine joy or delight regularly.', lowLabel: 'Very rarely', highLabel: 'Regularly' },
  ],
  tiers: {
    thriving: {
      tier: 'thriving',
      label: 'Thriving',
      headline: 'You\'ve done real inner work.',
      narrative: 'Emotional health at this level is genuinely rare, and it doesn\'t come from luck. It comes from years of paying attention, doing the hard work, and choosing to stay present to your own life. The second half of life has a way of demanding this kind of reckoning, and you\'ve met it. The books and practices below are for people who want to go deeper, not fix something broken.',
      recommendations: [
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'For those already doing well emotionally, Pema\'s work offers depth that rewards re-reading at every stage of life.', category: 'books' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'One of the most important books ever written about finding meaning in difficulty. Worth reading again at this stage.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Magnesium supports mood regulation and the nervous system. Worth taking even when things are good.', category: 'supplements' },
        { asin: 'B07CHNMVN7', name: 'Theraband Resistance Bands Set', reason: 'Physical movement is one of the most powerful emotional regulators we have. Keep the body moving.', category: 'movement' },
      ],
    },
    growing: {
      tier: 'growing',
      label: 'Growing',
      headline: 'You\'re more resilient than you give yourself credit for.',
      narrative: 'There are real strengths in your emotional life, and there are places where you\'re still working things out. That\'s honest, and it\'s where most people are. The second half of life brings losses and changes that require new emotional skills, and nobody teaches us those. The books and practices below are ones I\'d recommend for someone who is doing the work but knows there\'s more to learn.',
      recommendations: [
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'The best book I know for learning to be with difficulty without running from it.', category: 'books' },
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'Presence is the foundation of emotional health. This book teaches it better than most.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Magnesium glycinate has genuine anxiolytic effects for many people. Worth trying if anxiety or mood is a factor.', category: 'supplements' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'Finding meaning in difficulty is a skill. Frankl teaches it from the hardest possible experience.', category: 'books' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'A gentle yoga or stretching practice is one of the most effective tools for emotional regulation.', category: 'movement' },
      ],
    },
    'needs-attention': {
      tier: 'needs-attention',
      label: 'Needs Attention',
      headline: 'Something in you is asking to be heard.',
      narrative: 'I want to say this carefully: a low score here doesn\'t mean you\'re broken or failing. It means you\'re carrying something heavy, and you may not have the support or tools you need to put it down. That\'s a solvable problem. Please consider talking to a therapist or counselor if you haven\'t. The books below are ones I\'d offer as companions, not replacements for real human support. And please: don\'t do this alone.',
      recommendations: [
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'The most compassionate book I know for people who are struggling. Read it slowly.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Magnesium deficiency can significantly worsen anxiety and mood. This is a simple first step.', category: 'supplements' },
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'When the past and future feel overwhelming, learning to be present is the most important skill.', category: 'books' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'When life feels meaningless or heavy, Frankl\'s work is a reminder that meaning can be found anywhere.', category: 'books' },
        { asin: 'B00JGCBGZQ', name: 'Nature Made Vitamin D3 2000 IU', reason: 'D3 deficiency is strongly linked to depression, especially in older adults. Worth checking.', category: 'supplements' },
      ],
    },
  },
};

// ─── 4. Spiritual Practice ───────────────────────────────────────────────────
const spiritualPractice: QuizDefinition = {
  id: 'spiritual-practice',
  domain: 'Spiritual Practice',
  title: 'Spiritual Practice Assessment',
  subtitle: 'How connected are you to something larger than your daily concerns?',
  heroImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=85&auto=format&fit=crop&crop=center',
  heroAlt: 'Peaceful meditation space with candles and morning light',
  icon: '🕯️',
  color: 'oklch(0.55 0.12 300)',
  questions: [
    { id: 'sp1', text: 'I have a regular contemplative practice (meditation, prayer, journaling, etc.).', lowLabel: 'None at all', highLabel: 'Daily practice' },
    { id: 'sp2', text: 'I feel connected to something larger than my individual concerns.', lowLabel: 'Not at all', highLabel: 'Deeply connected' },
    { id: 'sp3', text: 'I\'ve made some peace with the fact of my own mortality.', lowLabel: 'Terrifies me', highLabel: 'At peace with it' },
    { id: 'sp4', text: 'I experience moments of awe, wonder, or deep gratitude regularly.', lowLabel: 'Very rarely', highLabel: 'Regularly' },
    { id: 'sp5', text: 'My spiritual life gives me genuine comfort in difficult times.', lowLabel: 'Not really', highLabel: 'It does' },
    { id: 'sp6', text: 'I feel that my life has meaning and purpose beyond my own needs.', lowLabel: 'Not really', highLabel: 'Strongly' },
    { id: 'sp7', text: 'I can sit in silence comfortably without needing distraction.', lowLabel: 'Very uncomfortable', highLabel: 'Quite comfortable' },
    { id: 'sp8', text: 'I have a community or tradition that supports my spiritual life.', lowLabel: 'None', highLabel: 'Strong community' },
    { id: 'sp9', text: 'I approach the unknown with curiosity rather than fear.', lowLabel: 'Mostly fear', highLabel: 'Mostly curiosity' },
    { id: 'sp10', text: 'My spiritual practice has deepened or evolved in recent years.', lowLabel: 'Stagnant', highLabel: 'Deepening' },
  ],
  tiers: {
    thriving: {
      tier: 'thriving',
      label: 'Thriving',
      headline: 'Your inner life is a genuine resource.',
      narrative: 'A rich spiritual life at this stage is one of the most protective things a person can have. Not because it makes life easier, but because it gives you somewhere to stand when things get hard. You\'ve built that. The books and practices below are for those who want to continue going deeper.',
      recommendations: [
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'Even for those with a strong practice, Pema\'s work offers something new at every reading.', category: 'books' },
        { asin: 'B07K4FKQWT', name: 'Host Defense Lion\'s Mane Capsules', reason: 'Cognitive clarity supports contemplative depth. Lion\'s Mane is worth adding to a serious practice.', category: 'cognitive-health' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'For those with a deep practice, Frankl\'s work on meaning and suffering is essential reading.', category: 'books' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'A quality mat supports a quality practice. The physical and spiritual are not separate.', category: 'movement' },
      ],
    },
    growing: {
      tier: 'growing',
      label: 'Growing',
      headline: 'You\'re reaching toward something real.',
      narrative: 'There\'s genuine spiritual life here, and there are also places where the practice is thin or inconsistent. That\'s honest. The second half of life has a way of making spiritual questions more urgent, not less. The books and tools below are ones I\'d recommend for someone who is serious about deepening their practice.',
      recommendations: [
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'Presence is the foundation of any spiritual practice. This book teaches it with unusual clarity.', category: 'books' },
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'For those building a contemplative practice, Pema\'s work is an essential companion.', category: 'books' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'A physical practice supports a spiritual one. Having the right equipment removes friction.', category: 'movement' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'Finding meaning is a spiritual practice. Frankl\'s work is the best guide I know.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Magnesium supports the nervous system and the ability to be still. Worth taking if you\'re building a meditation practice.', category: 'supplements' },
      ],
    },
    'needs-attention': {
      tier: 'needs-attention',
      label: 'Needs Attention',
      headline: 'Something in you is hungry for depth.',
      narrative: 'A low score here often means one of two things: either the spiritual dimension of life hasn\'t been a priority, or something has happened that has made it hard to access. Both are understandable. The second half of life tends to make these questions unavoidable. The books below are gentle entry points, not demands. Start with the one that calls to you.',
      recommendations: [
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'The best starting point I know for someone who hasn\'t had a contemplative practice. Read slowly.', category: 'books' },
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'If life feels hard right now, this is the book to start with.', category: 'books' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'Sometimes the body is the easiest door into the spiritual. A mat on the floor is an invitation.', category: 'movement' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'If meaning feels absent, Frankl\'s work is the most powerful thing I can offer.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'The nervous system needs support to be still. Magnesium is a simple first step.', category: 'supplements' },
      ],
    },
  },
};

// ─── 5. Social Connection ────────────────────────────────────────────────────
const socialConnection: QuizDefinition = {
  id: 'social-connection',
  domain: 'Social Connection',
  title: 'Social Connection Assessment',
  subtitle: 'How well-connected are you to the people and community around you?',
  heroImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&q=85&auto=format&fit=crop&crop=center',
  heroAlt: 'Elders sharing a warm meal and conversation together',
  icon: '🤝',
  color: 'oklch(0.58 0.14 20)',
  questions: [
    { id: 'sc1', text: 'I have people in my life I can call when I need support.', lowLabel: 'No one', highLabel: 'Several people' },
    { id: 'sc2', text: 'I have meaningful conversations at least a few times a week.', lowLabel: 'Rarely', highLabel: 'Regularly' },
    { id: 'sc3', text: 'I feel genuinely known and understood by at least one person.', lowLabel: 'Not really', highLabel: 'Yes, deeply' },
    { id: 'sc4', text: 'I have connections across different generations, not just my own.', lowLabel: 'Not at all', highLabel: 'Yes, several' },
    { id: 'sc5', text: 'I feel part of at least one community or group that matters to me.', lowLabel: 'No community', highLabel: 'Strong community' },
    { id: 'sc6', text: 'I give as well as receive in my relationships.', lowLabel: 'Mostly one-sided', highLabel: 'Balanced giving' },
    { id: 'sc7', text: 'I\'ve found ways to stay connected despite changes in my social world.', lowLabel: 'Struggling', highLabel: 'Adapting well' },
    { id: 'sc8', text: 'I don\'t feel chronically lonely or isolated.', lowLabel: 'Chronically lonely', highLabel: 'Not lonely' },
    { id: 'sc9', text: 'I invest time and energy in maintaining my relationships.', lowLabel: 'Not really', highLabel: 'Actively' },
    { id: 'sc10', text: 'I have friendships that feel genuinely nourishing, not just habitual.', lowLabel: 'Not really', highLabel: 'Yes, several' },
  ],
  tiers: {
    thriving: {
      tier: 'thriving',
      label: 'Thriving',
      headline: 'You know how to be with people.',
      narrative: 'Strong social connection is one of the most powerful predictors of health and longevity in the second half of life. The research is unambiguous. You\'ve built something real here, and it\'s worth protecting. The books below are for those who want to think more deeply about the role of relationship in conscious aging.',
      recommendations: [
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'Frankl\'s work on love and connection as sources of meaning is essential reading for anyone in strong relationship.', category: 'books' },
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'Even in strong relationships, loss and change are inevitable. Pema\'s work prepares you.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Supporting your nervous system supports your capacity for connection. Magnesium is foundational.', category: 'supplements' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'A practice that keeps you in your body keeps you available for genuine connection.', category: 'movement' },
      ],
    },
    growing: {
      tier: 'growing',
      label: 'Growing',
      headline: 'You have real connections, and room for more.',
      narrative: 'There are genuine relationships in your life, and there are also places where you feel the absence of connection. That\'s honest. The second half of life often brings losses in the social domain, and rebuilding takes intention. The books and tools below are for someone who is working on this.',
      recommendations: [
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'For those navigating loss in their social world, Pema\'s work is the most compassionate guide I know.', category: 'books' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'Connection to meaning supports connection to others. Frankl\'s work is relevant here.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Anxiety and tension make connection harder. Magnesium supports the nervous system.', category: 'supplements' },
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'Presence is the foundation of genuine connection. This book teaches it.', category: 'books' },
        { asin: 'B01MUDGPXO', name: 'Gaiam Yoga Mat Premium', reason: 'Group yoga or movement classes are one of the most natural ways to build community.', category: 'movement' },
      ],
    },
    'needs-attention': {
      tier: 'needs-attention',
      label: 'Needs Attention',
      headline: 'Loneliness is a health issue, and it\'s solvable.',
      narrative: 'Chronic loneliness has health effects comparable to smoking 15 cigarettes a day. I say that not to alarm you but to be honest about what\'s at stake. The good news is that connection is a skill, and it can be built at any age. The research shows that older adults who actively pursue new relationships are remarkably successful at building them. The books below are a starting point. But please: take one concrete step this week toward another person.',
      recommendations: [
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'For those in genuine isolation, this book is a compassionate companion.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Loneliness affects the nervous system. Magnesium supports mood and reduces anxiety.', category: 'supplements' },
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'Finding meaning beyond isolation is possible. Frankl\'s work shows how.', category: 'books' },
        { asin: 'B00JGCBGZQ', name: 'Nature Made Vitamin D3 2000 IU', reason: 'D3 deficiency worsens depression and social withdrawal. Worth addressing.', category: 'supplements' },
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'Learning to be present with yourself is often the first step toward being present with others.', category: 'books' },
      ],
    },
  },
};

// ─── 6. Legacy and Purpose ───────────────────────────────────────────────────
const legacyAndPurpose: QuizDefinition = {
  id: 'legacy-and-purpose',
  domain: 'Legacy and Purpose',
  title: 'Legacy and Purpose Assessment',
  subtitle: 'How clearly do you see what you\'re here to do and leave behind?',
  heroImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1600&q=85&auto=format&fit=crop&crop=center',
  heroAlt: 'Elder hands writing in a journal, warm light on the page',
  icon: '📖',
  color: 'oklch(0.52 0.10 55)',
  questions: [
    { id: 'lp1', text: 'I have a clear sense of what I want my life to have meant.', lowLabel: 'Not at all', highLabel: 'Very clearly' },
    { id: 'lp2', text: 'I\'ve taken steps to document or share my story and wisdom.', lowLabel: 'None at all', highLabel: 'Actively doing this' },
    { id: 'lp3', text: 'I feel that I\'m contributing something meaningful to others.', lowLabel: 'Not really', highLabel: 'Strongly' },
    { id: 'lp4', text: 'I\'ve had honest conversations about end-of-life wishes with loved ones.', lowLabel: 'Not at all', highLabel: 'Yes, clearly' },
    { id: 'lp5', text: 'I have a sense of purpose that gets me out of bed in the morning.', lowLabel: 'Not really', highLabel: 'Strong sense' },
    { id: 'lp6', text: 'I\'ve thought about what I want to pass on, beyond material possessions.', lowLabel: 'Not at all', highLabel: 'Deeply considered' },
    { id: 'lp7', text: 'I mentor, teach, or share my experience with younger people.', lowLabel: 'Never', highLabel: 'Regularly' },
    { id: 'lp8', text: 'My daily activities feel aligned with what matters most to me.', lowLabel: 'Not at all', highLabel: 'Very aligned' },
    { id: 'lp9', text: 'I\'ve made peace with the parts of my life I can\'t change.', lowLabel: 'Still struggling', highLabel: 'Mostly at peace' },
    { id: 'lp10', text: 'I feel that my life has been, and continues to be, worthwhile.', lowLabel: 'Not really', highLabel: 'Deeply so' },
  ],
  tiers: {
    thriving: {
      tier: 'thriving',
      label: 'Thriving',
      headline: 'You know what you\'re here for.',
      narrative: 'A clear sense of purpose and legacy at this stage is one of the most powerful things a person can have. It shapes how you spend your time, how you relate to others, and how you face what\'s ahead. You\'ve done the work to get here. The books and tools below are for those who want to go deeper into the craft of legacy-making.',
      recommendations: [
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'The definitive book on meaning and purpose. Worth re-reading at every stage.', category: 'books' },
        { asin: 'B07CHNMVN7', name: 'Leuchtturm1917 Hardcover Notebook', reason: 'A quality journal for the serious legacy writer. Your words deserve good paper.', category: 'legacy' },
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'Even those with strong purpose benefit from Pema\'s work on impermanence.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Supporting your body supports your capacity to do the work that matters.', category: 'supplements' },
      ],
    },
    growing: {
      tier: 'growing',
      label: 'Growing',
      headline: 'The question of legacy is alive in you.',
      narrative: 'You\'re thinking about these things, even if you haven\'t fully worked them out. That matters. The second half of life is when these questions become urgent, and the fact that you\'re asking them puts you ahead of most people. The books and tools below are for someone who is ready to go deeper.',
      recommendations: [
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'The best starting point for thinking seriously about purpose and legacy.', category: 'books' },
        { asin: 'B07CHNMVN7', name: 'Leuchtturm1917 Hardcover Notebook', reason: 'Start writing. A good journal is the first tool of legacy work.', category: 'legacy' },
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'Legacy work requires making peace with impermanence. Pema is the guide.', category: 'books' },
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'Purpose lives in the present moment, not in the future. This book teaches that.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Clarity of purpose requires a clear mind. Magnesium supports that.', category: 'supplements' },
      ],
    },
    'needs-attention': {
      tier: 'needs-attention',
      label: 'Needs Attention',
      headline: 'The question of meaning is asking to be answered.',
      narrative: 'A low score here often means one of two things: either you\'ve been too busy to think about these questions, or you\'ve thought about them and found the answers unsatisfying. Both are worth taking seriously. The second half of life has a way of making the question of meaning unavoidable. The books below are where I\'d start. And I\'d encourage you to pick up a journal and start writing, even if you don\'t know what to say.',
      recommendations: [
        { asin: '0060935723', name: 'Man\'s Search for Meaning by Viktor Frankl', reason: 'If meaning feels absent, this is the most important book I can offer.', category: 'books' },
        { asin: 'B07CHNMVN7', name: 'Leuchtturm1917 Hardcover Notebook', reason: 'Writing is how most people find their way to meaning. Start here.', category: 'legacy' },
        { asin: '0385472579', name: 'When Things Fall Apart by Pema Chodron', reason: 'For those who feel lost, Pema\'s work is the most compassionate guide I know.', category: 'books' },
        { asin: 'B0019LTGOU', name: 'Doctor\'s Best High Absorption Magnesium', reason: 'Depression and anxiety make meaning harder to access. Magnesium is a simple first step.', category: 'supplements' },
        { asin: '1577314808', name: 'The Power of Now by Eckhart Tolle', reason: 'Presence is where meaning lives. This book teaches you how to get there.', category: 'books' },
      ],
    },
  },
};

// ─── Export all quizzes ───────────────────────────────────────────────────────
export const QUIZZES: QuizDefinition[] = [
  physicalWellness,
  mentalClarity,
  emotionalHealth,
  spiritualPractice,
  socialConnection,
  legacyAndPurpose,
];

export const QUIZ_MAP: Record<string, QuizDefinition> = Object.fromEntries(
  QUIZZES.map(q => [q.id, q])
);
