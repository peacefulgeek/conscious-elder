import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85&auto=format&fit=crop&crop=center';
const AMAZON_TAG = 'spankyspinola-20';

function buildAmazonUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  'cognitive-health': 'Cognitive Health',
  'supplements': 'Supplements',
  'tcm-herbs': 'TCM Herbs',
  'movement': 'Movement',
  'sleep': 'Sleep',
  'books': 'Books',
  'meditation': 'Meditation',
  'nutrition': 'Nutrition',
  'balance': 'Balance',
  'grief': 'Grief',
  'legacy': 'Legacy',
};

export default function Recommended() {
  const { data: products, isLoading } = trpc.products.recommended.useQuery();

  const grouped = (products ?? []).reduce((acc, p) => {
    const cat = p.category || 'supplements';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, typeof products>);

  const categories = Object.keys(grouped).sort();

  return (
    <>
      <SeoHead
        title="Tools We Recommend | The Conscious Elder"
        description="Supplements, herbs, books, and tools Kalesh recommends for conscious aging. All links are affiliate links labeled (paid link)."
        canonicalPath="/recommended"
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
          alt="Fresh herbs and supplements arranged on a warm wooden surface"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
          loading="eager"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(18,14,10,0.78) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 3.5rem' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'oklch(0.78 0.10 65)', marginBottom: '0.75rem' }}>
            Curated by Kalesh
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: '0.875rem' }}>
            Tools We Recommend
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, maxWidth: '520px' }}>
            Supplements, herbs, books, and tools I've researched and found genuinely useful for the second half of life.
          </p>
        </div>
      </div>

      {/* ── Products ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)', padding: '4rem 2rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {/* Affiliate disclosure */}
          <div style={{ background: 'oklch(0.97 0.006 85)', border: '1px solid oklch(0.88 0.015 80)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '3rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="oklch(0.62 0.12 65)" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
            </svg>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.825rem', color: 'oklch(0.45 0.02 240)', lineHeight: 1.65, margin: 0 }}>
              All product links on this page are Amazon affiliate links, labeled (paid link). As an Amazon Associate, I earn from qualifying purchases at no extra cost to you. I only list products I've personally researched and believe are worth your consideration.
            </p>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {[...Array(9)].map((_, i) => (
                <div key={i} style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid oklch(0.88 0.015 80)', background: '#fff', padding: '1.5rem' }}>
                  <div style={{ height: '160px', background: 'oklch(0.94 0.01 80)', borderRadius: '0.5rem', marginBottom: '1rem' }} />
                  <div style={{ height: '14px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: '80%' }} />
                  <div style={{ height: '12px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', width: '60%' }} />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'oklch(0.45 0.02 240)', marginBottom: '1rem' }}>
                Product recommendations are being curated.
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'oklch(0.55 0.02 240)', marginBottom: '2rem' }}>
                Check back soon, or browse the articles for inline recommendations.
              </p>
              <Link href="/articles" style={{ display: 'inline-block', padding: '0.75rem 1.75rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', textDecoration: 'none' }}>
                Browse Articles
              </Link>
            </div>
          ) : (
            categories.map(cat => (
              <section key={cat} style={{ marginBottom: '4rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '1.75rem', paddingBottom: '0.875rem', borderBottom: '1px solid oklch(0.88 0.015 80)' }}>
                  {CATEGORY_LABELS[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="product-grid">
                  {(grouped[cat] ?? []).map((product: any) => product && (
                    <article
                      key={product.asin}
                      style={{ background: '#fff', borderRadius: '0.75rem', border: '1px solid oklch(0.88 0.015 80)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(30,34,40,0.10)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      {product.imageUrl && (
                        <div style={{ padding: '1.25rem 1.25rem 0', display: 'flex', justifyContent: 'center' }}>
                          <img src={product.imageUrl} alt={product.name || product.title} style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '0.375rem' }} loading="lazy" />
                        </div>
                      )}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'oklch(0.62 0.12 65)', marginBottom: '0.5rem' }}>
                          {CATEGORY_LABELS[product.category || ''] || (product.category || '').replace(/-/g, ' ')}
                        </p>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', lineHeight: 1.35, marginBottom: '0.625rem', flex: 1 }}>
                          {product.name || product.title}
                        </h3>
                        {product.description && (
                          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.48 0.02 240)', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                            {product.description}
                          </p>
                        )}
                        <a
                          href={buildAmazonUrl(product.asin)}
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
            {[['/', 'Home'], ['/articles', 'Articles'], ['/recommended', 'Recommended'], ['/about', 'About'], ['/privacy', 'Privacy']].map(([href, label]) => (
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
