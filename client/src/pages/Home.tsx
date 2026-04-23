import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import ArticleCard from '@/components/ArticleCard';
import SeoHead from '@/components/SeoHead';
import { WebsiteJsonLd } from '@/components/JsonLd';

// Home page hero: elder hands holding a cup of tea at dawn - warm, contemplative
const HERO_IMAGE = 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=90&auto=format&fit=crop';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const { data, isLoading } = trpc.articles.list.useQuery({ limit: 12, offset: 0 });
  const articles = data?.items ?? [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <>
      <SeoHead
        title="The Conscious Elder - Wisdom for the Second Half of Life"
        description="Wisdom, practice, and honest inquiry for those aging with awareness. Written by Kalesh."
        canonicalPath="/"
        type="website"
      />
      <WebsiteJsonLd />
      <SiteNav />

      {/* ── Full-Viewport Hero ── */}
      <section
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          minHeight: '600px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <img
          src={HERO_IMAGE}
          alt="Sunlight through ancient forest trees - a metaphor for the wisdom of age"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 40%',
          }}
          loading="eager"
          decoding="async"
        />
        {/* Gradient overlay: transparent top, warm dark bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 35%, rgba(20,16,12,0.72) 75%, rgba(20,16,12,0.88) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem 5rem',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'oklch(0.75 0.10 65)',
              marginBottom: '1rem',
            }}
          >
            Conscious Aging
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              marginBottom: '1.25rem',
              maxWidth: '680px',
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ display: 'block' }}>The second half of life</span>
            <span style={{ display: 'block' }}>is not a decline.</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              color: 'rgba(255,255,255,0.82)',
              lineHeight: 1.65,
              marginBottom: '2.25rem',
              maxWidth: '520px',
            }}
          >
            Wisdom, practice, and honest inquiry for those aging with awareness.
            Written by Kalesh.
          </p>
          <Link
            href="/articles"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'oklch(0.62 0.12 65)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.52 0.12 65)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'oklch(0.62 0.12 65)')}
          >
            Read the Articles
          </Link>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: scrolled ? 0 : 1,
            transition: 'opacity 0.4s',
          }}
        >
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
        </div>
      </section>

      {/* ── Main Content: warm cream background ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)', minHeight: '60vh' }} className="ce-main">

        {/* ── Section: Latest Articles ── */}
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }} className="ce-section">

          {/* Section header */}
          <div style={{ marginBottom: '3rem', borderBottom: '1px solid oklch(0.88 0.015 80)', paddingBottom: '1.5rem' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'oklch(0.62 0.12 65)',
              marginBottom: '0.5rem',
            }}>
              Latest Writing
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 700,
                color: 'oklch(0.18 0.015 240)',
                lineHeight: 1.2,
              }}>
                From the Journal
              </h2>
              <Link
                href="/articles"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'oklch(0.62 0.12 65)',
                  textDecoration: 'none',
                  borderBottom: '1px solid oklch(0.62 0.12 65)',
                  paddingBottom: '1px',
                  whiteSpace: 'nowrap',
                }}
              >
                View all articles
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid oklch(0.88 0.015 80)' }}>
                  <div style={{ width: '100%', paddingTop: '62%', background: 'oklch(0.94 0.01 80)', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ height: '12px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.75rem', width: '30%' }} />
                    <div style={{ height: '20px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.5rem', width: '90%' }} />
                    <div style={{ height: '20px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Featured article: full-width card */}
              {featured && (
                <Link
                  href={`/articles/${featured.slug}`}
                  style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}
                >
                  <article
                    className="ce-featured-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      borderRadius: '0.875rem',
                      overflow: 'hidden',
                      border: '1px solid oklch(0.88 0.015 80)',
                      background: '#fff',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(30,34,40,0.12)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '360px' }}>
                      <img
                        src={featured.imageUrl || featured.heroImageUrl || ''}
                        alt={featured.imageAlt || featured.title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        loading="lazy"
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    </div>
                    <div className="ce-featured-text" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'oklch(0.62 0.12 65)',
                        marginBottom: '0.75rem',
                      }}>
                        {(featured.category || 'conscious-aging').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                      <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)',
                        fontWeight: 700,
                        color: 'oklch(0.18 0.015 240)',
                        lineHeight: 1.25,
                        marginBottom: '1rem',
                      }}>
                        {featured.title}
                      </h2>
                      {featured.metaDescription && (
                        <p style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.9rem',
                          color: 'oklch(0.45 0.02 240)',
                          lineHeight: 1.65,
                          marginBottom: '1.5rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        } as React.CSSProperties}>
                          {featured.metaDescription}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.8rem',
                        color: 'oklch(0.55 0.02 240)',
                        paddingTop: '1.25rem',
                        borderTop: '1px solid oklch(0.92 0.01 80)',
                      }}>
                        <span style={{ fontWeight: 600, color: 'oklch(0.62 0.12 65)' }}>Kalesh</span>
                        {featured.publishedAt && (
                          <>
                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'oklch(0.75 0.01 240)', display: 'inline-block' }} />
                            <span>{new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </>
                        )}
                        {featured.readingTime && (
                          <>
                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'oklch(0.75 0.01 240)', display: 'inline-block' }} />
                            <span>{featured.readingTime} min read</span>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Two-column grid for remaining articles */}
              <div className="ce-article-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '2rem',
              }}>
                {rest.map(article => (
                  <ArticleCard key={article.id} {...article} />
                ))}
              </div>

              {/* View all link */}
              <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                <Link
                  href="/articles"
                  style={{
                    display: 'inline-block',
                    padding: '0.875rem 2.5rem',
                    border: '1px solid oklch(0.62 0.12 65)',
                    color: 'oklch(0.62 0.12 65)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'oklch(0.62 0.12 65)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'oklch(0.62 0.12 65)';
                  }}
                >
                  View All Articles
                </Link>
              </div>
            </>
          )}
        </section>

        {/* ── About strip ── */}
        <section
          style={{
            background: 'oklch(0.97 0.006 85)',
            borderTop: '1px solid oklch(0.88 0.015 80)',
            borderBottom: '1px solid oklch(0.88 0.015 80)',
            padding: '4rem 2rem',
          }}
        >
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'oklch(0.62 0.12 65)',
              marginBottom: '1rem',
            }}>
              About This Journal
            </p>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: 'oklch(0.18 0.015 240)',
              lineHeight: 1.3,
              marginBottom: '1.25rem',
            }}>
              Written by someone who is living it.
            </h2>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: 'oklch(0.45 0.02 240)',
              lineHeight: 1.75,
              marginBottom: '2rem',
            }}>
              I'm Kalesh. I write about aging consciously, because I think most of what our culture
              tells us about getting older is wrong. Not wrong in a small way. Wrong in a way that
              costs people their last decades. I'm trying to offer something different.
            </p>
            <Link
              href="/about"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'oklch(0.62 0.12 65)',
                textDecoration: 'none',
                borderBottom: '1px solid oklch(0.62 0.12 65)',
                paddingBottom: '2px',
              }}
            >
              Read more about Kalesh
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <SiteFooter />
      </main>
    </>
  );
}

function SiteFooter() {
  return (
    <footer style={{
      background: 'oklch(0.18 0.015 240)',
      color: 'rgba(255,255,255,0.65)',
      padding: '4rem 2rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="ce-footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              The Conscious Elder
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Wisdom, practice, and honest inquiry for those aging with awareness.
            </p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              As an Amazon Associate I earn from qualifying purchases.
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
              Explore
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[['/', 'Home'], ['/articles', 'Articles'], ['/recommended', 'Recommended'], ['/about', 'About']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.75 0.10 65)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
              Legal
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[['/privacy', 'Privacy Policy'], ['/privacy#affiliate', 'Affiliate Disclosure'], ['/privacy#health', 'Health Disclaimer']].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.75 0.10 65)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>
              Connect
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <li>
                <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.75 0.10 65)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                >
                  kalesh.love
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontFamily: 'var(--font-sans)',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span>&copy; {new Date().getFullYear()} The Conscious Elder. All rights reserved.</span>
          <span>ConsciousElder.com</span>
        </div>
      </div>
    </footer>
  );
}
