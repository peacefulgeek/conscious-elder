import { useState } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

const AMAZON_TAG = 'spankyspinola-20';

function buildAmazonUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

const HERO_IMAGE = 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1600&q=85&auto=format&fit=crop&crop=center';

const CATEGORY_ORDER = [
  'All',
  'Western Herbs',
  'TCM',
  'Ayurvedic',
  'Mushrooms & Adaptogens',
  'Core Supplements',
];

const TRADITION_COLORS: Record<string, string> = {
  'Western': 'oklch(0.55 0.14 145)',
  'TCM': 'oklch(0.52 0.18 25)',
  'Ayurvedic': 'oklch(0.55 0.14 65)',
};

const TRADITION_BG: Record<string, string> = {
  'Western': 'oklch(0.95 0.04 145)',
  'TCM': 'oklch(0.97 0.04 25)',
  'Ayurvedic': 'oklch(0.97 0.04 65)',
};

export default function Herbs() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = trpc.herbs.list.useQuery({
    category: activeCategory === 'All' ? undefined : activeCategory,
    search: search || undefined,
    limit: 200,
    offset: 0,
  });

  const items = data?.items ?? [];

  // Group by category for display
  const grouped = items.reduce((acc, h) => {
    const cat = h.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(h);
    return acc;
  }, {} as Record<string, typeof items>);

  // Ordered categories present in results
  const displayCategories = activeCategory === 'All'
    ? CATEGORY_ORDER.filter(c => c !== 'All' && grouped[c]?.length > 0)
    : [activeCategory];

  return (
    <>
      <SeoHead
        title="Herbs & Supplements | The Conscious Elder"
        description="200 curated herbs and supplements for conscious aging: Western herbs, Traditional Chinese Medicine, Ayurvedic botanicals, medicinal mushrooms, and core supplements for ages 50+."
        canonicalPath="/herbs"
        type="website"
      />
      <SiteNav />

      {/* ── Hero ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '55vh',
          minHeight: '360px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <img
          src={HERO_IMAGE}
          alt="Herbs, roots, and botanical supplements arranged on a wooden surface"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
          loading="eager"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(18,14,10,0.82) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 3.5rem' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'oklch(0.78 0.10 65)', marginBottom: '0.75rem' }}>
            200 Curated Botanicals
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: '0.875rem' }}>
            Herbs &amp; Supplements
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, maxWidth: '560px' }}>
            Western herbs, Traditional Chinese Medicine, Ayurvedic botanicals, medicinal mushrooms, and core supplements — curated for the second half of life.
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)', padding: '3rem 2rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Affiliate disclosure */}
          <div style={{ background: 'oklch(0.97 0.006 85)', border: '1px solid oklch(0.88 0.015 80)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.62 0.12 65)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.825rem', color: 'oklch(0.45 0.02 240)', lineHeight: 1.65, margin: 0 }}>
              All product links on this page are Amazon affiliate links, labeled (paid link). As an Amazon Associate, I earn from qualifying purchases at no extra cost to you. These are products I have personally researched for their quality, tradition, and relevance to conscious aging.
            </p>
          </div>

          {/* Search */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ position: 'relative', maxWidth: '480px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(0.62 0.08 240)" strokeWidth="2" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search herbs, benefits, or traditions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  color: 'oklch(0.18 0.015 240)',
                  background: '#fff',
                  border: '1px solid oklch(0.85 0.015 80)',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '3rem' }} className="ce-filter-row">
            {CATEGORY_ORDER.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.5rem 1.125rem',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  color: activeCategory === cat ? '#fff' : 'oklch(0.38 0.02 240)',
                  background: activeCategory === cat ? 'oklch(0.62 0.12 65)' : '#fff',
                  border: `1px solid ${activeCategory === cat ? 'oklch(0.62 0.12 65)' : 'oklch(0.85 0.015 80)'}`,
                  borderRadius: '2rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!isLoading && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.55 0.02 240)', marginBottom: '2rem' }}>
              {items.length} {items.length === 1 ? 'product' : 'products'}{search ? ` matching "${search}"` : ''}
            </p>
          )}

          {/* Loading skeleton */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="product-grid">
              {[...Array(12)].map((_, i) => (
                <div key={i} style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid oklch(0.88 0.015 80)', background: '#fff', padding: '1.5rem' }}>
                  <div style={{ height: '14px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.75rem', width: '40%' }} />
                  <div style={{ height: '16px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: '90%' }} />
                  <div style={{ height: '12px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: '70%' }} />
                  <div style={{ height: '12px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', width: '80%' }} />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'oklch(0.45 0.02 240)', marginBottom: '1rem' }}>
                No products found.
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                style={{ padding: '0.75rem 1.75rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            displayCategories.map(cat => (
              <section key={cat} style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '1.75rem', paddingBottom: '0.875rem', borderBottom: '1px solid oklch(0.88 0.015 80)' }}>
                  {cat}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="product-grid">
                  {(grouped[cat] ?? []).map(herb => (
                    <article
                      key={herb.id}
                      style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid oklch(0.88 0.015 80)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(30,34,40,0.10)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      <div style={{ padding: '1.25rem 1.25rem 0' }}>
                        {/* Tradition badge */}
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: TRADITION_COLORS[herb.tradition] ?? 'oklch(0.62 0.12 65)',
                          background: TRADITION_BG[herb.tradition] ?? 'oklch(0.97 0.04 65)',
                          borderRadius: '2rem',
                          marginBottom: '0.75rem',
                        }}>
                          {herb.tradition}
                        </span>
                      </div>
                      <div style={{ padding: '0 1.25rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(0.62 0.12 65)', marginBottom: '0.375rem' }}>
                          {herb.brand}
                        </p>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', lineHeight: 1.35, marginBottom: '0.625rem' }}>
                          {herb.name}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.48 0.02 240)', lineHeight: 1.6, marginBottom: '0.875rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                          {herb.description}
                        </p>
                        {/* Tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                          {herb.tags.slice(0, 3).map(tag => (
                            <span key={tag} style={{ padding: '0.2rem 0.5rem', fontFamily: 'var(--font-sans)', fontSize: '0.65rem', color: 'oklch(0.45 0.02 240)', background: 'oklch(0.95 0.008 85)', borderRadius: '0.25rem', border: '1px solid oklch(0.88 0.015 80)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href={buildAmazonUrl(herb.asin)}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          style={{ display: 'block', textAlign: 'center', padding: '0.625rem 1rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600, borderRadius: '0.375rem', textDecoration: 'none', marginTop: 'auto' }}
                        >
                          View on Amazon (paid link)
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      <footer style={{ background: 'oklch(0.18 0.015 240)', color: 'rgba(255,255,255,0.65)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>The Conscious Elder</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>As an Amazon Associate I earn from qualifying purchases.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['/', 'Home'], ['/articles', 'Articles'], ['/recommended', 'Recommended'], ['/herbs', 'Herbs & Supplements'], ['/about', 'About'], ['/privacy', 'Privacy']].map(([href, label]) => (
              <Link key={href} href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) { .product-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .product-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
