import { useParams, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import ArticleRenderer from '@/components/ArticleRenderer';
import SeoHead from '@/components/SeoHead';
import { ArticleJsonLd } from '@/components/JsonLd';

const KALESH_PHOTO = 'https://conscious-elder.b-cdn.net/images/kalesh-photo.webp';
const KALESH_FALLBACK = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=300&q=80&auto=format&fit=crop&crop=face';

export default function ArticleDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px' }}>
          <div style={{ width: '100%', height: '60vh', background: 'oklch(0.92 0.01 80)' }} />
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '3rem' }}>
            <div>
              <div style={{ height: '12px', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '1.5rem', width: '20%' }} />
              <div style={{ height: '2.5rem', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '0.75rem', width: '90%' }} />
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '14px', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: i % 3 === 2 ? '80%' : '100%' }} />
              ))}
            </div>
            <div style={{ height: '320px', background: 'oklch(0.92 0.01 80)', borderRadius: '0.75rem' }} />
          </div>
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.985 0.008 85)' }}>
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'oklch(0.18 0.015 240)', marginBottom: '1rem' }}>
              Article Not Found
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.52 0.02 240)', marginBottom: '2rem' }}>
              This article may have been moved or is no longer available.
            </p>
            <Link href="/articles" style={{
              display: 'inline-block',
              padding: '0.75rem 1.75rem',
              background: 'oklch(0.62 0.12 65)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '0.375rem',
              textDecoration: 'none',
            }}>
              Browse all articles
            </Link>
          </div>
        </div>
      </>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const categoryLabel = article.category
    ? article.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Conscious Aging';

  const heroImage = article.heroImageUrl || article.imageUrl;

  return (
    <>
      <SeoHead
        title={article.ogTitle || article.title}
        description={article.metaDescription || undefined}
        ogTitle={article.ogTitle || article.title}
        ogDescription={article.ogDescription || article.metaDescription || undefined}
        ogImage={heroImage || undefined}
        canonicalPath={`/articles/${article.slug}`}
        type="article"
      />
      <ArticleJsonLd
        title={article.title}
        description={article.metaDescription || undefined}
        slug={article.slug}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        imageUrl={heroImage}
        category={article.category}
      />

      <SiteNav />

      {/* ── Full-viewport hero with title overlay ── */}
      <div
        className="ce-article-hero"
        style={{
          position: 'relative',
          width: '100%',
          height: '75vh',
          minHeight: '520px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt={article.imageAlt || article.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
            }}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, oklch(0.88 0.02 80) 0%, oklch(0.82 0.03 75) 100%)',
          }} />
        )}

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.15) 40%, rgba(18,14,10,0.85) 100%)',
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 2rem 4rem',
        }}>
          <nav style={{ marginBottom: '1rem' }}>
            <Link href="/articles" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
              Articles
            </Link>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', margin: '0 0.5rem' }}>/</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{categoryLabel}</span>
          </nav>

          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'oklch(0.78 0.10 65)',
            marginBottom: '0.875rem',
          }}>
            {categoryLabel}
          </p>

          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.875rem, 4.5vw, 3rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.12,
            marginBottom: '1.5rem',
            letterSpacing: '-0.015em',
            maxWidth: '760px',
          }}>
            {article.title}
          </h1>

          {/* Byline in hero */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <img
              src={KALESH_PHOTO}
              alt="Kalesh"
              onError={e => { (e.currentTarget as HTMLImageElement).src = KALESH_FALLBACK; }}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}
            />
            <div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Kalesh
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', margin: 0, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {formattedDate && <span>{formattedDate}</span>}
                {article.readingTime && (
                  <>
                    {formattedDate && <span style={{ opacity: 0.4 }}>·</span>}
                    <span>{article.readingTime} min read</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column article body ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)' }}>
        <div
          className="ce-article-columns"
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '3.5rem 2rem 5rem',
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: '4rem',
            alignItems: 'start',
          }}
        >
          {/* ── Left: article content ── */}
          <div>
            {article.metaDescription && (
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.2rem',
                fontStyle: 'italic',
                color: 'oklch(0.38 0.02 240)',
                lineHeight: 1.7,
                marginBottom: '2.5rem',
                paddingBottom: '2.5rem',
                borderBottom: '1px solid oklch(0.88 0.015 80)',
              }}>
                {article.metaDescription}
              </p>
            )}

            <ArticleRenderer body={article.body} />

            {/* Navigation footer */}
            <div style={{
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '1px solid oklch(0.88 0.015 80)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <Link href="/articles" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'oklch(0.62 0.12 65)',
                textDecoration: 'none',
              }}>
                &larr; Back to all articles
              </Link>
              <Link href="/recommended" style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'oklch(0.45 0.02 240)',
                textDecoration: 'none',
              }}>
                Tools We Recommend &rarr;
              </Link>
            </div>
          </div>

          {/* ── Right: sticky author sidebar ── */}
          <aside
            className="ce-author-sidebar"
            style={{
              position: 'sticky',
              top: '88px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}
          >
            <div style={{
              background: '#fff',
              border: '1px solid oklch(0.90 0.012 80)',
              borderRadius: '0.875rem',
              padding: '1.75rem 1.5rem',
              boxShadow: '0 2px 12px oklch(0.18 0.015 240 / 0.05)',
              textAlign: 'center',
            }}>
              {/* Author photo */}
              <img
                src={KALESH_PHOTO}
                alt="Kalesh"
                onError={e => { (e.currentTarget as HTMLImageElement).src = KALESH_FALLBACK; }}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid oklch(0.90 0.012 80)',
                  marginBottom: '1rem',
                }}
              />

              {/* Name */}
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'oklch(0.18 0.015 240)',
                marginBottom: '0.25rem',
              }}>
                Kalesh
              </p>

              {/* Role label */}
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'oklch(0.62 0.12 65)',
                marginBottom: '1rem',
              }}>
                Founding Voice
              </p>

              {/* Short bio */}
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: 'oklch(0.42 0.02 240)',
                lineHeight: 1.65,
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}>
                Writing about conscious aging, inner practice, and the second half of life. Not a doctor — someone living this, paying attention, and writing it down.
              </p>

              {/* Book a Session CTA */}
              <a
                href="https://kalesh.love"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'oklch(0.62 0.12 65)',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  letterSpacing: '0.01em',
                  marginBottom: '0.75rem',
                  transition: 'background 0.2s',
                }}
              >
                Book a Session
              </a>

              {/* Secondary link */}
              <a
                href="https://kalesh.love"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  color: 'oklch(0.52 0.12 65)',
                  textDecoration: 'none',
                  borderBottom: '1px solid oklch(0.52 0.12 65 / 0.4)',
                  paddingBottom: '1px',
                }}
              >
                kalesh.love
              </a>
            </div>

            {/* Article meta below card */}
            {(formattedDate || article.readingTime) && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'oklch(0.97 0.006 85)',
                border: '1px solid oklch(0.90 0.012 80)',
                borderRadius: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                {formattedDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.55 0.02 240)' }}>Published</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'oklch(0.30 0.02 240)' }}>{formattedDate}</span>
                  </div>
                )}
                {article.readingTime && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.55 0.02 240)' }}>Reading time</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'oklch(0.30 0.02 240)' }}>{article.readingTime} min</span>
                  </div>
                )}
                {article.category && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.55 0.02 240)' }}>Category</span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 500, color: 'oklch(0.62 0.12 65)' }}>{categoryLabel}</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: 'oklch(0.18 0.015 240)', color: 'rgba(255,255,255,0.65)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            The Conscious Elder
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>
            As an Amazon Associate I earn from qualifying purchases.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['/', 'Home'], ['/articles', 'Articles'], ['/recommended', 'Recommended'], ['/about', 'About'], ['/privacy', 'Privacy']].map(([href, label]) => (
              <Link key={href} href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      {/* Responsive: collapse sidebar below 860px */}
      <style>{`
        @media (max-width: 860px) {
          .ce-article-columns {
            grid-template-columns: 1fr !important;
          }
          .ce-author-sidebar {
            position: static !important;
            order: -1;
          }
          .ce-author-sidebar > div:first-child {
            display: flex;
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: 1.25rem;
          }
          .ce-author-sidebar > div:first-child img {
            flex-shrink: 0;
          }
        }
      `}</style>
    </>
  );
}
