import { useParams, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import ArticleRenderer from '@/components/ArticleRenderer';
import SeoHead from '@/components/SeoHead';
import { ArticleJsonLd } from '@/components/JsonLd';

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
          <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
            <div style={{ height: '12px', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '1.5rem', width: '20%' }} />
            <div style={{ height: '2.5rem', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '0.75rem', width: '90%' }} />
            <div style={{ height: '2.5rem', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '1.5rem', width: '70%' }} />
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '14px', background: 'oklch(0.92 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: i % 3 === 2 ? '80%' : '100%' }} />
            ))}
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

        {/* Gradient: transparent top to warm dark bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.15) 40%, rgba(18,14,10,0.85) 100%)',
        }} />

        {/* Title block */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '860px',
          margin: '0 auto',
          padding: '0 2rem 4rem',
        }}>
          {/* Breadcrumb */}
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
          }}>
            {article.title}
          </h1>

          {/* Prominent byline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'oklch(0.62 0.12 65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>K</span>
            </div>
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

      {/* ── Article body ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3.5rem 1.5rem 5rem' }}>
          {/* Lead paragraph / meta description */}
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
    </>
  );
}
