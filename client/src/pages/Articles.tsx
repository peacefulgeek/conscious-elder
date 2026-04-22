import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import ArticleCard from '@/components/ArticleCard';
import SeoHead from '@/components/SeoHead';

const CATEGORIES = [
  { value: '', label: 'All Topics' },
  { value: 'conscious-aging', label: 'Conscious Aging' },
  { value: 'practice', label: 'Practice' },
  { value: 'supplements', label: 'Supplements' },
  { value: 'tcm-herbs', label: 'TCM Herbs' },
  { value: 'cognitive-health', label: 'Cognitive Health' },
  { value: 'death-preparation', label: 'Death Preparation' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'grief', label: 'Grief' },
  { value: 'legacy', label: 'Legacy' },
  { value: 'financial', label: 'Financial Wisdom' },
  { value: 'downsizing', label: 'Downsizing' },
];

export default function Articles() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 18;

  const { data, isLoading } = trpc.articles.search.useQuery({
    query,
    category: category || undefined,
    limit: LIMIT,
    offset,
  });

  const articles = data ?? [];

  return (
    <>
      <SeoHead
        title="Articles | The Conscious Elder"
        description="All articles on conscious aging, elder wisdom, practice, and the second half of life. Written by Kalesh."
        canonicalPath="/articles"
        type="website"
      />

      <SiteNav alwaysSolid />

      <div style={{ paddingTop: '5rem' }}>
        {/* Page Header */}
        <div style={{
          background: 'oklch(0.97 0.006 85)',
          borderBottom: '1px solid oklch(0.88 0.015 80)',
          padding: '3rem 1.5rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'oklch(0.18 0.015 240)',
            marginBottom: '0.75rem'
          }}>
            All Articles
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'oklch(0.52 0.02 240)',
            maxWidth: '480px',
            margin: '0 auto 2rem'
          }}>
            Honest inquiry into aging, wisdom, practice, and the second half of life.
          </p>

          {/* Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: '640px',
            margin: '0 auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <input
              type="search"
              placeholder="Search articles..."
              value={query}
              onChange={e => { setQuery(e.target.value); setOffset(0); }}
              style={{
                flex: '1 1 240px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                padding: '0.625rem 1rem',
                border: '1px solid oklch(0.88 0.015 80)',
                borderRadius: '0.375rem',
                background: 'oklch(0.99 0.004 85)',
                color: 'oklch(0.18 0.015 240)',
                outline: 'none',
              }}
            />
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setOffset(0); }}
              style={{
                flex: '0 1 180px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                padding: '0.625rem 1rem',
                border: '1px solid oklch(0.88 0.015 80)',
                borderRadius: '0.375rem',
                background: 'oklch(0.99 0.004 85)',
                color: 'oklch(0.18 0.015 240)',
                cursor: 'pointer',
              }}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Article Grid */}
        <main style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{ background: 'oklch(0.94 0.01 80)', borderRadius: '0.75rem', height: '360px' }} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.52 0.02 240)', fontSize: '1.125rem' }}>
                {query || category ? 'No articles match your search.' : 'Articles are being prepared. Check back soon.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
              {articles.map(article => (
                <ArticleCard
                  key={article.slug}
                  slug={article.slug}
                  title={article.title}
                  metaDescription={article.metaDescription}
                  category={article.category}
                  imageUrl={article.imageUrl}
                  imageAlt={article.imageAlt}
                  readingTime={article.readingTime}
                  publishedAt={article.publishedAt}
                />
              ))}
            </div>
          )}

          {articles.length === LIMIT && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button
                onClick={() => setOffset(o => o + LIMIT)}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '0.625rem 1.75rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  background: 'oklch(0.62 0.12 65)',
                  color: 'oklch(0.99 0.004 85)',
                  cursor: 'pointer',
                }}
              >
                Load More
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid oklch(0.88 0.015 80)', padding: '2rem 1.5rem', textAlign: 'center', background: 'oklch(0.97 0.006 85)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.6 0.02 240)' }}>
          As an Amazon Associate, I earn from qualifying purchases.
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.65 0.02 240)', marginTop: '0.5rem' }}>
          &copy; {new Date().getFullYear()} The Conscious Elder
        </p>
      </footer>
    </>
  );
}
