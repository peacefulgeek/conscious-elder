/**
 * JsonLd.tsx - Complete JSON-LD schema suite for The Conscious Elder
 *
 * Exports:
 *   ArticleJsonLd     - Full Article schema with BreadcrumbList, FAQPage, HowTo, SpeakableSpec
 *   WebsiteJsonLd     - WebSite schema with SearchAction
 *   OrganizationJsonLd - Organization schema (sitewide)
 *   PersonJsonLd      - Person schema for author The Editorial Team
 *   CollectionPageJsonLd - CollectionPage + ItemList for articles hub
 *   AboutPageJsonLd   - AboutPage + Organization for about page
 */

const BASE_URL = 'https://consciouselder.com';
const SITE_NAME = 'The Conscious Elder';
const AUTHOR_NAME = 'The Editorial Team';
const AUTHOR_URL = 'https://sacredvow.love';
const ORG_LOGO = 'https://conscious-elder.b-cdn.net/images/og-default.webp';

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const AUTHOR_SCHEMA = {
  '@type': 'Person',
  name: AUTHOR_NAME,
  url: AUTHOR_URL,
  jobTitle: 'Writer and Conscious Aging Guide',
  description: 'The Editorial Team writes about conscious aging, longevity, and the wisdom of the second half of life.',
  knowsAbout: ['Conscious Aging', 'Longevity', 'Traditional Chinese Medicine', 'Ayurveda', 'Meditation', 'Elder Wisdom'],
};

const PUBLISHER_SCHEMA = {
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: SITE_NAME,
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: ORG_LOGO,
    width: 1200,
    height: 630,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract FAQ pairs from question-shaped headings in HTML body */
function extractFaqPairs(body: string): Array<{ question: string; answer: string }> {
  if (!body) return [];
  const questionPattern = /<h[2-4][^>]*>([^<]*\?[^<]*)<\/h[2-4]>/gi;
  const pairs: Array<{ question: string; answer: string }> = [];
  let match: RegExpExecArray | null;
  const bodyLower = body.toLowerCase();

  while ((match = questionPattern.exec(body)) !== null && pairs.length < 6) {
    const question = match[1].replace(/<[^>]+>/g, '').trim();
    if (!question.includes('?')) continue;
    // Find the next paragraph after this heading
    const afterHeading = body.slice(match.index + match[0].length);
    const paraMatch = afterHeading.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (paraMatch) {
      const answer = paraMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 300);
      if (answer.length > 20) {
        pairs.push({ question, answer });
      }
    }
  }
  void bodyLower; // suppress unused warning
  return pairs;
}

/** Extract ordered steps from <ol><li> in HTML body */
function extractHowToSteps(body: string): Array<{ name: string; text: string }> | null {
  if (!body) return null;
  const olMatch = body.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (!olMatch) return null;
  const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const steps: Array<{ name: string; text: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = liPattern.exec(olMatch[1])) !== null && steps.length < 10) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text.length > 10) {
      steps.push({ name: text.slice(0, 60), text });
    }
  }
  return steps.length >= 3 ? steps : null;
}

// ── JsonLd script wrapper ─────────────────────────────────────────────────────

function JsonLdScript({ schema }: { schema: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

// ── Article JSON-LD ───────────────────────────────────────────────────────────

interface ArticleJsonLdProps {
  title: string;
  description?: string;
  slug: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  imageUrl?: string | null;
  category?: string | null;
  wordCount?: number | null;
  body?: string | null;
}

export function ArticleJsonLd({
  title, description, slug, publishedAt, updatedAt, imageUrl, category, wordCount, body,
}: ArticleJsonLdProps) {
  const url = `${BASE_URL}/articles/${slug}`;
  const pubIso = publishedAt ? new Date(publishedAt).toISOString() : undefined;
  const modIso = updatedAt ? new Date(updatedAt).toISOString() : pubIso;

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': url,
    headline: title,
    description: description || '',
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: AUTHOR_SCHEMA,
    publisher: PUBLISHER_SCHEMA,
    datePublished: pubIso,
    dateModified: modIso,
    image: {
      '@type': 'ImageObject',
      url: imageUrl || ORG_LOGO,
    },
    articleSection: category || 'Conscious Aging',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    ...(wordCount ? { wordCount } : {}),
    reviewedBy: AUTHOR_SCHEMA,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-tldr="ai-overview"]'],
    },
  };

  // BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'All Articles', item: `${BASE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: category || 'Conscious Aging', item: `${BASE_URL}/articles?category=${encodeURIComponent(category || 'Conscious Aging')}` },
      { '@type': 'ListItem', position: 4, name: title, item: url },
    ],
  };

  const schemas: unknown[] = [articleSchema, breadcrumbSchema];

  // FAQPage - only if real question headings exist in body
  if (body) {
    const faqPairs = extractFaqPairs(body);
    if (faqPairs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqPairs.map(({ question, answer }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      });
    }

    // HowTo - only if ordered list with 3+ steps (mutually exclusive with MedicalCondition)
    const howToSteps = extractHowToSteps(body);
    if (howToSteps && faqPairs.length === 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        description: description || '',
        step: howToSteps.map((s, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: s.name,
          text: s.text,
        })),
      });
    }
  }

  return (
    <>
      {schemas.map((s, i) => (
        <JsonLdScript key={i} schema={s} />
      ))}
    </>
  );
}

// ── WebSite JSON-LD with SearchAction ─────────────────────────────────────────

interface WebsiteJsonLdProps {
  name?: string;
  description?: string;
}

export function WebsiteJsonLd({ name = SITE_NAME, description }: WebsiteJsonLdProps) {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name,
      url: BASE_URL,
      description: description || 'Wisdom, practice, and honest inquiry for the second half of life.',
      author: AUTHOR_SCHEMA,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/articles?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // Organization sitewide
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: ORG_LOGO,
      },
      sameAs: [],
    },
    // Person (author)
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${AUTHOR_URL}/#person`,
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
      jobTitle: 'Writer and Conscious Aging Guide',
      description: 'The Editorial Team writes about conscious aging, longevity, and the wisdom of the second half of life.',
      knowsAbout: ['Conscious Aging', 'Longevity', 'Traditional Chinese Medicine', 'Ayurveda', 'Meditation', 'Elder Wisdom'],
      worksFor: PUBLISHER_SCHEMA,
    },
  ];

  return (
    <>
      {schemas.map((s, i) => (
        <JsonLdScript key={i} schema={s} />
      ))}
    </>
  );
}

// ── Organization JSON-LD (sitewide) ──────────────────────────────────────────

export function OrganizationJsonLd() {
  return (
    <JsonLdScript schema={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
    }} />
  );
}

// ── CollectionPage + ItemList JSON-LD (articles hub) ─────────────────────────

interface CollectionPageJsonLdProps {
  articles: Array<{ slug: string; title: string; description?: string | null }>;
}

export function CollectionPageJsonLd({ articles }: CollectionPageJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/articles`,
    name: 'Articles - The Conscious Elder',
    description: 'All published articles on conscious aging, longevity, and the wisdom of the second half of life.',
    url: `${BASE_URL}/articles`,
    author: AUTHOR_SCHEMA,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.slice(0, 50).map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}/articles/${a.slug}`,
        name: a.title,
        description: a.description || '',
      })),
    },
  };
  return <JsonLdScript schema={schema} />;
}

// ── AboutPage JSON-LD ─────────────────────────────────────────────────────────

export function AboutPageJsonLd() {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': `${BASE_URL}/about`,
      name: `About - ${SITE_NAME}`,
      description: 'The Conscious Elder is a publication dedicated to wisdom, practice, and honest inquiry for those aging with awareness.',
      url: `${BASE_URL}/about`,
      author: AUTHOR_SCHEMA,
      publisher: PUBLISHER_SCHEMA,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: SITE_NAME,
      url: BASE_URL,
      description: 'A publication dedicated to conscious aging, longevity, and the wisdom of the second half of life.',
      logo: { '@type': 'ImageObject', url: ORG_LOGO },
      founder: AUTHOR_SCHEMA,
    },
  ];
  return (
    <>
      {schemas.map((s, i) => (
        <JsonLdScript key={i} schema={s} />
      ))}
    </>
  );
}
