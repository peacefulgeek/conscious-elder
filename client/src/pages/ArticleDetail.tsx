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
        <div style={{ paddingTop: '5rem', maxWidth: '720px', margin: '0 auto', padding: '6rem 1.5rem' }}>
          <div style={{ background: 'oklch(0.94 0.01 80)', height: '2.5rem', borderRadius: '0.375rem', marginBottom: '1rem', width: '80%' }} />
          <div style={{ background: 'oklch(0.94 0.01 80)', height: '1rem', borderRadius: '0.375rem', marginBottom: '0.5rem' }} />
          <div style={{ background: 'oklch(0.94 0.01 80)', height: '1rem', borderRadius: '0.375rem', marginBottom: '0.5rem', width: '90%' }} />
          <div style={{ background: 'oklch(0.94 0.01 80)', height: '1rem', borderRadius: '0.375rem', width: '70%' }} />
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '5rem', textAlign: 'center', padding: '6rem 1.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>Article Not Found</h1>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.52 0.02 240)', marginBottom: '2rem' }}>
            This article may have been moved or is no longer available.
          </p>
          <Link href="/articles" style={{ color: 'oklch(0.62 0.12 65)', fontFamily: 'var(--font-sans)' }}>
            Browse all articles
          </Link>
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

  return (
    <>
      <SeoHead
        title={article.ogTitle || article.title}
        description={article.metaDescription || undefined}
        ogTitle={article.ogTitle || article.title}
        ogDescription={article.ogDescription || article.metaDescription || undefined}
        ogImage={article.heroImageUrl || article.imageUrl || undefined}
        canonicalPath={`/articles/${article.slug}`}
        type="article"
      />
      <ArticleJsonLd
        title={article.title}
        description={article.metaDescription || undefined}
        slug={article.slug}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        imageUrl={article.heroImageUrl || article.imageUrl}
        category={article.category}
      />

      <SiteNav alwaysSolid />

      {/* Hero Image */}
      {(article.heroImageUrl || article.imageUrl) && (
        <div style={{ width: '100%', height: '50vh', minHeight: '320px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={article.heroImageUrl || article.imageUrl || ''}
            alt={article.imageAlt || article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
            loading="eager"
            decoding="async"
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, oklch(0.985 0.008 85) 100%)'
          }} />
        </div>
      )}

      <main style={{ paddingTop: article.heroImageUrl || article.imageUrl ? '0' : '5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: '1.5rem' }}>
            <Link href="/articles" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.62 0.12 65)', textDecoration: 'none' }}>
              Articles
            </Link>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.65 0.02 240)', margin: '0 0.5rem' }}>
              /
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.65 0.02 240)' }}>
              {categoryLabel}
            </span>
          </nav>

          {/* Article Meta */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'oklch(0.62 0.12 65)',
              marginBottom: '0.75rem'
            }}>
              {categoryLabel}
            </p>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              color: 'oklch(0.55 0.02 240)',
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span>By Kalesh</span>
              {formattedDate && <><span>·</span><span>{formattedDate}</span></>}
              {article.readingTime && <><span>·</span><span>{article.readingTime} min read</span></>}
              {article.wordCount && <><span>·</span><span>{article.wordCount.toLocaleString()} words</span></>}
            </div>
          </div>

          {/* Article Body */}
          <ArticleRenderer body={article.body} />

          {/* Back to Articles */}
          <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid oklch(0.88 0.015 80)' }}>
            <Link
              href="/articles"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'oklch(0.62 0.12 65)',
                textDecoration: 'none',
              }}
            >
              &larr; Back to all articles
            </Link>
          </div>
        </div>
      </main>

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
