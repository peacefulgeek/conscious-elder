import { useState } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import ArticleCard from '@/components/ArticleCard';
import SeoHead from '@/components/SeoHead';

// Articles page hero: warm library with golden light
const PAGE_HERO = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=85&auto=format&fit=crop&crop=center';

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

      {/* ── Page Hero ── */}
      <div style={{ paddingTop: '72px' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '52vh',
            minHeight: '340px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <img
            src={PAGE_HERO}
            alt="Warm library shelves filled with books"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
            }}
            loading="eager"
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(20,16,12,0.72) 100%)',
          }} />
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem 3rem',
          }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'oklch(0.75 0.10 65)',
              marginBottom: '0.75rem',
            }}>
              The Journal
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '0.75rem',
            }}>
              All Articles
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.6,
              maxWidth: '480px',
            }}>
              Honest inquiry into aging, wisdom, practice, and the second half of life.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search + Category Filter ── */}
      <div style={{
        background: 'oklch(0.97 0.006 85)',
        borderBottom: '1px solid oklch(0.88 0.015 80)',
        padding: '1.25rem 2rem',
        position: 'sticky',
        top: '72px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: '0 1 280px' }}>
            <svg style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'oklch(0.62 0.02 240)', pointerEvents: 'none' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search articles..."
              value={query}
              onChange={e => { setQuery(e.target.value); setOffset(0); }}
              style={{
                width: '100%',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                padding: '0.5rem 1rem 0.5rem 2.4rem',
                border: '1px solid oklch(0.88 0.015 80)',
                borderRadius: '0.375rem',
                background: '#fff',
                color: 'oklch(0.18 0.015 240)',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'oklch(0.62 0.12 65)')}
              onBlur={e => (e.target.style.borderColor = 'oklch(0.88 0.015 80)')}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setOffset(0); }}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.35rem 0.875rem',
                  borderRadius: '2rem',
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  letterSpacing: '0.02em',
                  borderColor: category === cat.value ? 'oklch(0.62 0.12 65)' : 'oklch(0.88 0.015 80)',
                  background: category === cat.value ? 'oklch(0.62 0.12 65)' : '#fff',
                  color: category === cat.value ? '#fff' : 'oklch(0.45 0.02 240)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Article Grid ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)', padding: '3.5rem 2rem 5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid oklch(0.88 0.015 80)', background: '#fff' }}>
                  <div style={{ width: '100%', paddingTop: '62%', background: 'oklch(0.94 0.01 80)' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ height: '10px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.75rem', width: '25%' }} />
                    <div style={{ height: '18px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: '85%' }} />
                    <div style={{ height: '18px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', width: '65%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'oklch(0.45 0.02 240)' }}>
                No articles found. Try a different search or category.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.55 0.02 240)', marginBottom: '2rem' }}>
                {articles.length} article{articles.length !== 1 ? 's' : ''}
                {category ? ` in ${CATEGORIES.find(c => c.value === category)?.label}` : ''}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                {articles.map(article => (
                  <ArticleCard key={article.id} {...article} />
                ))}
              </div>
              {(offset > 0 || articles.length === LIMIT) && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3.5rem' }}>
                  {offset > 0 && (
                    <button onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.75rem', border: '1px solid oklch(0.88 0.015 80)', borderRadius: '0.375rem', background: '#fff', color: 'oklch(0.35 0.02 240)', cursor: 'pointer' }}>
                      Previous
                    </button>
                  )}
                  {articles.length === LIMIT && (
                    <button onClick={() => setOffset(o => o + LIMIT)}
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.75rem', border: 'none', borderRadius: '0.375rem', background: 'oklch(0.62 0.12 65)', color: '#fff', cursor: 'pointer' }}>
                      Load More
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer style={{ background: 'oklch(0.18 0.015 240)', color: 'rgba(255,255,255,0.65)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>The Conscious Elder</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>As an Amazon Associate I earn from qualifying purchases.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['/', 'Home'], ['/articles', 'Articles'], ['/recommended', 'Recommended'], ['/about', 'About'], ['/privacy', 'Privacy']].map(([href, label]) => (
              <Link key={href} href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
