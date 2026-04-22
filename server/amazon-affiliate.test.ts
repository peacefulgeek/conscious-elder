import { describe, expect, it } from "vitest";

// ─── Amazon affiliate link format tests ──────────────────────────────────────

const AMAZON_TAG = 'spankyspinola-20';

function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

function validateAmazonUrl(url: string): boolean {
  const pattern = /^https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?tag=spankyspinola-20$/;
  return pattern.test(url);
}

function hasPaidLinkLabel(text: string): boolean {
  return text.includes('(paid link)');
}

function countAmazonLinks(body: string): number {
  return (body.match(/amazon\.com\/dp\/[A-Z0-9]{10}\?tag=spankyspinola-20/g) || []).length;
}

function countPaidLinkLabels(body: string): number {
  return (body.match(/\(paid link\)/gi) || []).length;
}

function hasEmDash(text: string): boolean {
  return /\u2014|(?<![<-])-{2}(?![->\w])/.test(text);
}

// ─── Quality gate tests ───────────────────────────────────────────────────────

const BANNED_WORDS = [
  'delve', 'tapestry', 'nuanced', 'multifaceted', 'comprehensive guide',
  'in conclusion', "it's important to note", 'as an ai', 'i cannot',
  'navigate the', 'realm of', 'foster', 'leverage', 'utilize', 'embark on',
  'beacon of', 'testament to', 'pivotal', 'paramount', 'revolutionize',
  'game-changer', 'cutting-edge', 'paul wagner', 'shrikrishna',
];

function hasBannedWord(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) return word;
  }
  return null;
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe("Amazon affiliate URL format", () => {
  it("builds correct URL with spankyspinola-20 tag", () => {
    const url = buildAmazonUrl('B00JGCBGZQ');
    expect(url).toBe('https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20');
  });

  it("validates correct Amazon URL format", () => {
    expect(validateAmazonUrl('https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20')).toBe(true);
  });

  it("rejects URL without tag", () => {
    expect(validateAmazonUrl('https://www.amazon.com/dp/B00JGCBGZQ')).toBe(false);
  });

  it("rejects URL with wrong tag", () => {
    expect(validateAmazonUrl('https://www.amazon.com/dp/B00JGCBGZQ?tag=wrongtag-20')).toBe(false);
  });

  it("rejects URL with wrong path format", () => {
    expect(validateAmazonUrl('https://www.amazon.com/product/B00JGCBGZQ?tag=spankyspinola-20')).toBe(false);
  });

  it("rejects ASIN shorter than 10 chars", () => {
    expect(validateAmazonUrl('https://www.amazon.com/dp/B0012345?tag=spankyspinola-20')).toBe(false);
  });

  it("accepts book ASIN (numeric)", () => {
    expect(validateAmazonUrl('https://www.amazon.com/dp/0385349947?tag=spankyspinola-20')).toBe(true);
  });
});

describe("Paid link label enforcement", () => {
  it("detects (paid link) label", () => {
    const text = '[Product Name](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20) (paid link)';
    expect(hasPaidLinkLabel(text)).toBe(true);
  });

  it("fails when (paid link) is missing", () => {
    const text = '[Product Name](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20)';
    expect(hasPaidLinkLabel(text)).toBe(false);
  });

  it("counts Amazon links correctly", () => {
    const body = `
      [Product A](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20) (paid link)
      [Product B](https://www.amazon.com/dp/B0013OXKHC?tag=spankyspinola-20) (paid link)
      [Product C](https://www.amazon.com/dp/B07BNVWXKZ?tag=spankyspinola-20) (paid link)
    `;
    expect(countAmazonLinks(body)).toBe(3);
    expect(countPaidLinkLabels(body)).toBe(3);
  });

  it("detects missing paid link labels", () => {
    const body = `
      [Product A](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20) (paid link)
      [Product B](https://www.amazon.com/dp/B0013OXKHC?tag=spankyspinola-20)
      [Product C](https://www.amazon.com/dp/B07BNVWXKZ?tag=spankyspinola-20) (paid link)
    `;
    expect(countAmazonLinks(body)).toBe(3);
    expect(countPaidLinkLabels(body)).toBe(2);
    expect(countPaidLinkLabels(body)).toBeLessThan(countAmazonLinks(body));
  });
});

describe("Em-dash detection", () => {
  it("detects unicode em-dash", () => {
    expect(hasEmDash('This is a sentence\u2014with an em-dash')).toBe(true);
  });

  it("passes clean text", () => {
    expect(hasEmDash('This is a sentence with no em-dashes, just commas.')).toBe(false);
  });

  it("passes text with arrow operators and hyphens in words", () => {
    // Arrow operators and hyphenated words should not trigger
    expect(hasEmDash('const fn = (x: number) => x - 1;')).toBe(false);
    expect(hasEmDash('well-being and self-care are important')).toBe(false);
  });
});

describe("Quality gate banned words", () => {
  it("detects 'delve'", () => {
    expect(hasBannedWord("Let's delve into this topic")).toBe('delve');
  });

  it("detects 'tapestry'", () => {
    expect(hasBannedWord("A rich tapestry of experiences")).toBe('tapestry');
  });

  it("detects 'navigate the'", () => {
    expect(hasBannedWord("We navigate the challenges of aging")).toBe('navigate the');
  });

  it("detects 'paul wagner'", () => {
    expect(hasBannedWord("Paul Wagner is a teacher")).toBe('paul wagner');
  });

  it("detects 'shrikrishna'", () => {
    expect(hasBannedWord("shrikrishna.com")).toBe('shrikrishna');
  });

  it("passes clean Kalesh-voice text", () => {
    const text = `I've been thinking about this for years. Getting older is strange.
    You don't expect to feel so much like yourself, and yet so different.
    The supplements I take now are different from what I took at fifty.
    [Lion's Mane](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20) (paid link) is one I return to.`;
    expect(hasBannedWord(text)).toBeNull();
    expect(hasEmDash(text)).toBe(false);
  });
});

describe("Article body completeness", () => {
  it("requires at least 3 Amazon affiliate links", () => {
    const body = `
      [Product A](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20) (paid link)
      [Product B](https://www.amazon.com/dp/B0013OXKHC?tag=spankyspinola-20) (paid link)
      [Product C](https://www.amazon.com/dp/B07BNVWXKZ?tag=spankyspinola-20) (paid link)
      [AUTHOR_BIO_PLACEHOLDER]
      ## Wisdom Library
      [Product A](https://www.amazon.com/dp/B00JGCBGZQ?tag=spankyspinola-20) (paid link) - description.
    `;
    expect(countAmazonLinks(body)).toBeGreaterThanOrEqual(3);
    expect(body.includes('[AUTHOR_BIO_PLACEHOLDER]')).toBe(true);
    expect(body.includes('## Wisdom Library')).toBe(true);
  });
});
