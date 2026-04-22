import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

const PAGE_HERO = 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1600&q=85&auto=format&fit=crop&crop=center';

const DOMAIN_COLORS: Record<string, string> = {
  'physical-wellness': 'oklch(0.55 0.14 145)',
  'mental-clarity': 'oklch(0.55 0.14 240)',
  'emotional-health': 'oklch(0.72 0.14 80)',
  'spiritual-practice': 'oklch(0.55 0.12 300)',
  'social-connection': 'oklch(0.58 0.14 20)',
  'legacy-and-purpose': 'oklch(0.52 0.10 55)',
};

const DOMAIN_IMAGES: Record<string, string> = {
  'physical-wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop',
  'mental-clarity': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop',
  'emotional-health': 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80&auto=format&fit=crop',
  'spiritual-practice': 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80&auto=format&fit=crop',
  'social-connection': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&auto=format&fit=crop',
  'legacy-and-purpose': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&auto=format&fit=crop',
};

export default function Assessments() {
  const { data: quizzes, isLoading } = trpc.assessments.list.useQuery();

  return (
    <>
      <SeoHead
        title="Life Assessments | The Conscious Elder"
        description="Six honest assessments covering every dimension of conscious aging: body, mind, emotion, spirit, connection, and legacy. Written by Kalesh."
        canonicalPath="/assessments"
        type="website"
      />
      <SiteNav alwaysSolid />

      {/* Hero */}
      <div style={{ paddingTop: '72px' }}>
        <div style={{ position: 'relative', width: '100%', height: '58vh', minHeight: '380px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
          <img
            src={PAGE_HERO}
            alt="Peaceful morning meditation space with warm candlelight"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%' }}
            loading="eager"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(20,16,12,0.75) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 3.5rem' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'oklch(0.75 0.10 65)', marginBottom: '0.75rem' }}>
              Know Yourself
            </p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12, marginBottom: '1rem', maxWidth: '680px' }}>
              Life Assessments for the Conscious Elder
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.05rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, maxWidth: '520px' }}>
              Six honest assessments. Six dimensions of a life well-lived. Each one ends with personalized guidance and resources matched to where you actually are.
            </p>
          </div>
        </div>
      </div>

      {/* Intro strip */}
      <div style={{ background: 'oklch(0.97 0.006 85)', borderBottom: '1px solid oklch(0.88 0.015 80)', padding: '2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', lineHeight: 1.75, color: 'oklch(0.35 0.02 240)', fontStyle: 'italic' }}>
            "I built these assessments because I kept meeting elders who were doing some things beautifully and struggling in ways they hadn't named yet. These questions are designed to help you see yourself clearly, without judgment, and to point you toward what might actually help."
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'oklch(0.62 0.12 65)', fontWeight: 600, marginTop: '1rem', letterSpacing: '0.04em' }}>
            Kalesh
          </p>
        </div>
      </div>

      {/* Quiz grid */}
      <main style={{ background: 'oklch(0.985 0.008 85)', padding: '4rem 2rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid oklch(0.88 0.015 80)', background: '#fff' }}>
                  <div style={{ width: '100%', paddingTop: '52%', background: 'oklch(0.94 0.01 80)' }} />
                  <div style={{ padding: '1.75rem' }}>
                    <div style={{ height: '12px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', marginBottom: '0.75rem', width: '30%' }} />
                    <div style={{ height: '20px', background: 'oklch(0.94 0.01 80)', borderRadius: '4px', width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.75rem' }}>
                  Choose Your Assessment
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'oklch(0.45 0.02 240)', lineHeight: 1.6 }}>
                  Each assessment takes about 5 minutes. You can take them in any order.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                {(quizzes ?? []).map((quiz) => {
                  const accentColor = DOMAIN_COLORS[quiz.id] ?? 'oklch(0.62 0.12 65)';
                  const cardImage = DOMAIN_IMAGES[quiz.id] ?? quiz.heroImage;

                  return (
                    <Link
                      key={quiz.id}
                      href={`/assessments/${quiz.id}`}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div style={{
                        background: '#fff',
                        border: '1px solid oklch(0.88 0.015 80)',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                        cursor: 'pointer',
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 36px oklch(0.18 0.015 240 / 0.12)';
                          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                        }}
                      >
                        {/* Card image */}
                        <div style={{ position: 'relative', width: '100%', paddingTop: '52%', overflow: 'hidden' }}>
                          <img
                            src={cardImage}
                            alt={quiz.heroAlt}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.45) 100%)' }} />
                          {/* Icon badge */}
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.92)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.35rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}>
                            {quiz.icon}
                          </div>
                        </div>

                        {/* Card body */}
                        <div style={{ padding: '1.5rem 1.75rem 1.75rem' }}>
                          <p style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: accentColor,
                            marginBottom: '0.5rem',
                          }}>
                            {quiz.domain}
                          </p>
                          <h3 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: 'oklch(0.18 0.015 240)',
                            lineHeight: 1.3,
                            marginBottom: '0.6rem',
                          }}>
                            {quiz.title}
                          </h3>
                          <p style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.875rem',
                            color: 'oklch(0.45 0.02 240)',
                            lineHeight: 1.6,
                            marginBottom: '1.25rem',
                          }}>
                            {quiz.subtitle}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '0.78rem',
                              color: 'oklch(0.55 0.02 240)',
                            }}>
                              {quiz.questionCount} questions &middot; ~5 min
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              color: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}>
                              Begin
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Take all CTA */}
              <div style={{
                marginTop: '4rem',
                padding: '3rem 2.5rem',
                background: 'oklch(0.99 0.004 85)',
                border: '1px solid oklch(0.88 0.015 80)',
                borderRadius: '1rem',
                textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.62 0.12 65)', marginBottom: '0.75rem' }}>
                  The Full Picture
                </p>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                  Take all six to see where you truly are.
                </h3>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'oklch(0.45 0.02 240)', lineHeight: 1.65, maxWidth: '520px', margin: '0 auto 1.75rem' }}>
                  Most people are thriving in one or two domains and quietly struggling in others. The full picture is always more useful than a partial one.
                </p>
                <Link href={`/assessments/${quizzes?.[0]?.id ?? 'physical-wellness'}`}
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    padding: '0.875rem 2.25rem',
                    background: 'oklch(0.62 0.12 65)',
                    color: '#fff',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.background = 'oklch(0.52 0.12 65)')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.background = 'oklch(0.62 0.12 65)')}
                >
                  Start with Physical Wellness
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <footer style={{ background: 'oklch(0.18 0.015 240)', color: 'rgba(255,255,255,0.65)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>The Conscious Elder</p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.5rem' }}>As an Amazon Associate I earn from qualifying purchases.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[['/', 'Home'], ['/articles', 'Articles'], ['/assessments', 'Assessments'], ['/recommended', 'Recommended'], ['/about', 'About'], ['/privacy', 'Privacy']].map(([href, label]) => (
              <Link key={href} href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
