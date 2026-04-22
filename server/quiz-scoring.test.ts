import { describe, expect, it } from 'vitest';
import { scoreToTier, QUIZZES, QUIZ_MAP, buildAmazonUrl, AMAZON_TAG } from '../shared/quizzes';

// ─── Amazon URL builder ───────────────────────────────────────────────────────

describe('buildAmazonUrl', () => {
  it('builds a correct Amazon affiliate URL with the right tag', () => {
    const url = buildAmazonUrl('B0019LTGOU');
    expect(url).toBe('https://www.amazon.com/dp/B0019LTGOU?tag=spankyspinola-20');
  });

  it('uses the spankyspinola-20 affiliate tag', () => {
    expect(AMAZON_TAG).toBe('spankyspinola-20');
  });

  it('uses the /dp/ path format', () => {
    const url = buildAmazonUrl('B00CAZAU62');
    expect(url).toMatch(/amazon\.com\/dp\//);
  });

  it('appends tag as a query parameter', () => {
    const url = buildAmazonUrl('B07K4FKQWT');
    expect(url).toContain('?tag=spankyspinola-20');
  });

  it('does not include any other query parameters', () => {
    const url = buildAmazonUrl('B07BNVWW8X');
    const params = new URL(url).searchParams;
    expect([...params.keys()]).toEqual(['tag']);
  });
});

// ─── scoreToTier ─────────────────────────────────────────────────────────────

describe('scoreToTier', () => {
  it('returns thriving for 80% or above', () => {
    expect(scoreToTier(40, 50)).toBe('thriving');
    expect(scoreToTier(50, 50)).toBe('thriving');
    expect(scoreToTier(48, 50)).toBe('thriving');
  });

  it('returns growing for 50-79%', () => {
    expect(scoreToTier(25, 50)).toBe('growing');
    expect(scoreToTier(30, 50)).toBe('growing');
    expect(scoreToTier(39, 50)).toBe('growing');
  });

  it('returns needs-attention for below 50%', () => {
    expect(scoreToTier(0, 50)).toBe('needs-attention');
    expect(scoreToTier(10, 50)).toBe('needs-attention');
    expect(scoreToTier(24, 50)).toBe('needs-attention');
  });

  it('handles exact boundary at 80%', () => {
    expect(scoreToTier(40, 50)).toBe('thriving');
    expect(scoreToTier(39, 50)).toBe('growing');
  });

  it('handles exact boundary at 50%', () => {
    expect(scoreToTier(25, 50)).toBe('growing');
    expect(scoreToTier(24, 50)).toBe('needs-attention');
  });
});

// ─── Quiz definitions ─────────────────────────────────────────────────────────

describe('QUIZZES', () => {
  it('exports exactly 6 quiz definitions', () => {
    expect(QUIZZES).toHaveLength(6);
  });

  it('has the correct quiz IDs', () => {
    const ids = QUIZZES.map(q => q.id);
    expect(ids).toContain('physical-wellness');
    expect(ids).toContain('mental-clarity');
    expect(ids).toContain('emotional-health');
    expect(ids).toContain('spiritual-practice');
    expect(ids).toContain('social-connection');
    expect(ids).toContain('legacy-and-purpose');
  });

  it('each quiz has exactly 10 questions', () => {
    for (const quiz of QUIZZES) {
      expect(quiz.questions).toHaveLength(10);
    }
  });

  it('each question has a unique id within its quiz', () => {
    for (const quiz of QUIZZES) {
      const ids = quiz.questions.map(q => q.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    }
  });

  it('each quiz has all three tier results', () => {
    for (const quiz of QUIZZES) {
      expect(quiz.tiers.thriving).toBeDefined();
      expect(quiz.tiers.growing).toBeDefined();
      expect(quiz.tiers['needs-attention']).toBeDefined();
    }
  });

  it('each tier has at least 3 product recommendations', () => {
    for (const quiz of QUIZZES) {
      for (const tier of ['thriving', 'growing', 'needs-attention'] as const) {
        expect(quiz.tiers[tier].recommendations.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('all product recommendations have valid ASIN format', () => {
    const asinPattern = /^[A-Z0-9]{10}$/;
    for (const quiz of QUIZZES) {
      for (const tier of ['thriving', 'growing', 'needs-attention'] as const) {
        for (const rec of quiz.tiers[tier].recommendations) {
          expect(rec.asin).toMatch(asinPattern);
        }
      }
    }
  });

  it('all product recommendation URLs use the correct affiliate tag', () => {
    for (const quiz of QUIZZES) {
      for (const tier of ['thriving', 'growing', 'needs-attention'] as const) {
        for (const rec of quiz.tiers[tier].recommendations) {
          const url = buildAmazonUrl(rec.asin);
          expect(url).toContain('tag=spankyspinola-20');
        }
      }
    }
  });

  it('no quiz definition contains em-dashes', () => {
    const json = JSON.stringify(QUIZZES);
    expect(json).not.toContain('\u2014'); // em-dash
    expect(json).not.toContain('\u2013'); // en-dash
  });

  it('no quiz definition references paulwagner or shrikrishna', () => {
    const json = JSON.stringify(QUIZZES).toLowerCase();
    expect(json).not.toContain('paulwagner');
    expect(json).not.toContain('paul wagner');
    expect(json).not.toContain('shrikrishna');
  });

  it('no quiz definition references manus', () => {
    const json = JSON.stringify(QUIZZES).toLowerCase();
    expect(json).not.toContain('manus');
  });
});

// ─── QUIZ_MAP ─────────────────────────────────────────────────────────────────

describe('QUIZ_MAP', () => {
  it('maps quiz IDs to their definitions', () => {
    expect(QUIZ_MAP['physical-wellness']).toBeDefined();
    expect(QUIZ_MAP['physical-wellness'].id).toBe('physical-wellness');
  });

  it('has the same number of entries as QUIZZES', () => {
    expect(Object.keys(QUIZ_MAP)).toHaveLength(QUIZZES.length);
  });

  it('returns undefined for unknown quiz IDs', () => {
    expect(QUIZ_MAP['unknown-quiz']).toBeUndefined();
  });
});

// ─── Integration: scoring a full quiz ────────────────────────────────────────

describe('Full quiz scoring simulation', () => {
  it('correctly scores a perfect physical wellness quiz', () => {
    const quiz = QUIZ_MAP['physical-wellness'];
    const totalScore = quiz.questions.length * 5; // all 5s
    const maxScore = quiz.questions.length * 5;
    const tier = scoreToTier(totalScore, maxScore);
    expect(tier).toBe('thriving');
    expect(quiz.tiers[tier].label).toBe('Thriving');
  });

  it('correctly scores a minimal physical wellness quiz', () => {
    const quiz = QUIZ_MAP['physical-wellness'];
    const totalScore = quiz.questions.length * 1; // all 1s
    const maxScore = quiz.questions.length * 5;
    const tier = scoreToTier(totalScore, maxScore);
    expect(tier).toBe('needs-attention');
  });

  it('correctly scores a mid-range legacy quiz', () => {
    const quiz = QUIZ_MAP['legacy-and-purpose'];
    const totalScore = Math.floor(quiz.questions.length * 3); // all 3s
    const maxScore = quiz.questions.length * 5;
    const tier = scoreToTier(totalScore, maxScore);
    expect(tier).toBe('growing');
  });
});
