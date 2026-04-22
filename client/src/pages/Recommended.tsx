import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

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
  }, {} as Record<string, any[]>);

  return (
    <>
      <SeoHead
        title="Tools We Recommend | The Conscious Elder"
        description="Products Kalesh personally uses and recommends for conscious aging: supplements, books, movement tools, and more."
        canonicalPath="/recommended"
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
            Tools We Recommend
          </h1>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'oklch(0.52 0.02 240)',
            maxWidth: '560px',
            margin: '0 auto 1rem'
          }}>
            These are products I use or have researched carefully. I only recommend things I believe are genuinely worth your attention.
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            color: 'oklch(0.62 0.02 240)',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            As an Amazon Associate, I earn from qualifying purchases. Links marked (paid link) are affiliate links.
          </p>
        </div>

        <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.52 0.02 240)' }}>Loading recommendations...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.52 0.02 240)', fontSize: '1.125rem' }}>
                Recommendations are being curated. Check back soon.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <section key={cat} style={{ marginBottom: '3.5rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: 'oklch(0.18 0.015 240)',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid oklch(0.62 0.12 65)'
                }}>
                  {CATEGORY_LABELS[cat] || cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {(items as any[]).map((product: any) => (
                    <div key={product.asin} style={{
                      background: 'oklch(0.99 0.004 85)',
                      border: '1px solid oklch(0.88 0.015 80)',
                      borderRadius: '0.75rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{ width: '100%', height: '160px', objectFit: 'contain', borderRadius: '0.375rem', background: 'oklch(0.97 0.006 85)' }}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <h3 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'oklch(0.18 0.015 240)',
                        lineHeight: 1.3
                      }}>
                        {product.name}
                      </h3>
                      {product.description && (
                        <p style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.875rem',
                          color: 'oklch(0.45 0.02 240)',
                          lineHeight: 1.5,
                          flex: 1
                        }}>
                          {product.description}
                        </p>
                      )}
                      <a
                        href={buildAmazonUrl(product.asin)}
                        target="_blank"
                        rel="nofollow noopener sponsored"
                        style={{
                          display: 'inline-block',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: 'oklch(0.62 0.12 65)',
                          textDecoration: 'underline',
                          textDecorationColor: 'oklch(0.62 0.12 65 / 0.4)',
                        }}
                      >
                        View on Amazon <em style={{ fontStyle: 'normal', color: 'oklch(0.55 0.02 240)', fontWeight: 400 }}>(paid link)</em>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            ))
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
