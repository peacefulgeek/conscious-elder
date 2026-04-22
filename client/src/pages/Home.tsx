import { useState } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import ArticleCard from '@/components/ArticleCard';
import SeoHead from '@/components/SeoHead';
import { WebsiteJsonLd } from '@/components/JsonLd';

const HERO_IMAGE = 'https://conscious-elder.b-cdn.net/images/hero-home.webp';

export default function Home() {
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  const { data, isLoading } = trpc.articles.list.useQuery({ limit: LIMIT, offset });

  const articles = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasMore = offset + LIMIT < total;
  const hasPrev = offset > 0;

  return (
    <>
      <SeoHead
        title="The Conscious Elder"
        description="Wisdom, practice, and honest inquiry for the second half of life. Written by Kalesh."
        canonicalPath="/"
        type="website"
      />
      <WebsiteJsonLd />

      <SiteNav />

      {/* Hero Section */}
      <section className="hero-scroll" id="hero">
        <img
          src={HERO_IMAGE}
          alt="An elder sitting in quiet contemplation at dawn"
          className="hero-scroll__image"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.style.background = 'oklch(0.18 0.015 240)';
            t.style.display = 'block';
          }}
        />
        <div className="hero-scroll__overlay" />
        <div className="hero-scroll__content">
          <div style={{ maxWidth: '700px' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'oklch(0.62 0.12 65)',
              marginBottom: '1rem'
            }}>
              Conscious Aging
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: 'oklch(0.99 0.004 85)',
              lineHeight: 1.15,
              marginBottom: '1.25rem'
            }}>
              The second half of life<br />
              is not a decline.
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1.125rem',
              color: 'oklch(0.99 0.004 85 / 0.85)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '560px'
            }}>
              Wisdom, practice, and honest inquiry for those who are aging with awareness.
              Written by Kalesh.
            </p>
            <Link
              href="/articles"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: 'oklch(0.18 0.015 240)',
                backgroundColor: 'oklch(0.62 0.12 65)',
                padding: '0.75rem 1.75rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
            >
              Read the Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Article Feed */}
      <main style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }} id="articles">
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: 'oklch(0.18 0.015 240)',
            marginBottom: '0.75rem'
          }}>
            Recent Writing
          </h2>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'oklch(0.52 0.02 240)',
            maxWidth: '480px',
            margin: '0 auto'
          }}>
            Honest inquiry into what it means to age with awareness and depth.
          </p>
        </div>

        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: 'oklch(0.94 0.01 80)',
                borderRadius: '0.75rem',
                height: '380px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.52 0.02 240)', fontSize: '1.125rem' }}>
              Articles are being prepared. Check back soon.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
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

            {/* Pagination */}
            {(hasPrev || hasMore) && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                {hasPrev && (
                  <button
                    onClick={() => setOffset(o => Math.max(0, o - LIMIT))}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      padding: '0.625rem 1.5rem',
                      border: '1px solid oklch(0.88 0.015 80)',
                      borderRadius: '0.375rem',
                      background: 'transparent',
                      color: 'oklch(0.35 0.02 240)',
                      cursor: 'pointer',
                    }}
                  >
                    Previous
                  </button>
                )}
                {hasMore && (
                  <button
                    onClick={() => setOffset(o => o + LIMIT)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      padding: '0.625rem 1.5rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      background: 'oklch(0.62 0.12 65)',
                      color: 'oklch(0.99 0.004 85)',
                      cursor: 'pointer',
                    }}
                  >
                    Load More
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid oklch(0.88 0.015 80)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'oklch(0.97 0.006 85)'
      }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
          The Conscious Elder
        </p>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/articles', label: 'Articles' },
            { href: '/recommended', label: 'Recommended' },
            { href: '/about', label: 'About' },
            { href: '/privacy', label: 'Privacy Policy' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'oklch(0.52 0.02 240)', textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.6 0.02 240)' }}>
          As an Amazon Associate, I earn from qualifying purchases.
        </p>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.65 0.02 240)', marginTop: '0.5rem' }}>
          &copy; {new Date().getFullYear()} The Conscious Elder. All rights reserved.
        </p>
      </footer>
    </>
  );
}
