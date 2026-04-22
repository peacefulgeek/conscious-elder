import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const AMAZON_TAG = 'spankyspinola-20';

function buildAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

interface ProductRec {
  asin: string;
  name: string;
  reason: string;
  category: string;
}

interface QuizResult {
  quizId: string;
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  tier: 'thriving' | 'growing' | 'needs-attention';
  tierLabel: string;
  headline: string;
  narrative: string;
  recommendations: ProductRec[];
  saved: boolean;
}

const TIER_CONFIG = {
  thriving: {
    color: 'oklch(0.50 0.14 145)',
    bg: 'oklch(0.96 0.04 145)',
    border: 'oklch(0.82 0.08 145)',
    label: 'Thriving',
    icon: '🌿',
  },
  growing: {
    color: 'oklch(0.55 0.14 65)',
    bg: 'oklch(0.97 0.04 65)',
    border: 'oklch(0.85 0.08 65)',
    label: 'Growing',
    icon: '🌱',
  },
  'needs-attention': {
    color: 'oklch(0.55 0.14 30)',
    bg: 'oklch(0.97 0.04 30)',
    border: 'oklch(0.85 0.08 30)',
    label: 'Needs Attention',
    icon: '💛',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  supplements: 'Supplement',
  'cognitive-health': 'Brain Health',
  movement: 'Movement',
  books: 'Book',
  legacy: 'Journal',
};

export default function QuizResults() {
  const [, params] = useRoute('/assessments/:quizId/results');
  const quizId = params?.quizId ?? '';
  const [result, setResult] = useState<QuizResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { isAuthenticated } = useAuth();

  // Try to load from backend for logged-in users when sessionStorage is empty
  const { data: backendResult } = trpc.assessments.latestResult.useQuery(
    { quizId },
    { enabled: isAuthenticated && !result && notFound && !!quizId }
  );

  useEffect(() => {
    if (!quizId) return;
    const stored = sessionStorage.getItem(`quiz-result-${quizId}`);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
        return;
      } catch {
        // fall through to backend
      }
    }
    // If not in sessionStorage, mark notFound so backend query fires
    setNotFound(true);
  }, [quizId]);

  // If backend returned a saved result, reconstruct the display data
  useEffect(() => {
    if (!backendResult || result) return;
    // backendResult is a raw DB row: { score, maxScore, tier, domain }
    // We need to re-derive the narrative from the quiz definition
    import('../../../shared/quizzes').then(({ QUIZ_MAP, scoreToTier }) => {
      const quiz = QUIZ_MAP[quizId];
      if (!quiz) return;
      const tier = backendResult.tier as 'thriving' | 'growing' | 'needs-attention';
      const tierResult = quiz.tiers[tier];
      setResult({
        quizId,
        domain: backendResult.domain,
        score: backendResult.score,
        maxScore: backendResult.maxScore,
        percentage: Math.round((backendResult.score / backendResult.maxScore) * 100),
        tier,
        tierLabel: tierResult.label,
        headline: tierResult.headline,
        narrative: tierResult.narrative,
        recommendations: tierResult.recommendations,
        saved: true,
      });
      setNotFound(false);
    });
  }, [backendResult, quizId, result]);

  if (notFound) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'oklch(0.35 0.02 240)', marginBottom: '1rem' }}>
              No results found. Please take the assessment first.
            </p>
            <Link href={`/assessments/${quizId}`} style={{ fontFamily: 'var(--font-sans)', color: 'oklch(0.62 0.12 65)', fontWeight: 600 }}>
              Take the Assessment
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!result) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid oklch(0.88 0.015 80)', borderTopColor: 'oklch(0.62 0.12 65)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </>
    );
  }

  const tierConfig = TIER_CONFIG[result.tier];
  const scoreBarWidth = `${result.percentage}%`;

  return (
    <>
      <SeoHead
        title={`Your ${result.domain} Results | The Conscious Elder`}
        description={`You scored ${result.percentage}% on the ${result.domain} assessment. ${result.headline}`}
        canonicalPath={`/assessments/${quizId}/results`}
        type="website"
        noindex={true}
      />
      <SiteNav alwaysSolid />

      <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)' }}>

        {/* Results hero */}
        <div style={{
          background: tierConfig.bg,
          borderBottom: `1px solid ${tierConfig.border}`,
          padding: '3.5rem 2rem',
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1.25rem',
              background: tierConfig.color,
              color: '#fff',
              borderRadius: '2rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              <span>{tierConfig.icon}</span>
              <span>{result.domain}: {tierConfig.label}</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 700,
              color: 'oklch(0.18 0.015 240)',
              lineHeight: 1.2,
              marginBottom: '1.5rem',
            }}>
              {result.headline}
            </h1>

            {/* Score gauge */}
            <div style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.45 0.02 240)' }}>
                  Your score
                </span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: tierConfig.color }}>
                  {result.score} / {result.maxScore} ({result.percentage}%)
                </span>
              </div>
              <div style={{ width: '100%', height: '10px', background: 'oklch(0.88 0.015 80)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: scoreBarWidth,
                  background: tierConfig.color,
                  borderRadius: '5px',
                  transition: 'width 1s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'oklch(0.62 0.02 240)' }}>Needs Attention</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'oklch(0.62 0.02 240)' }}>Growing</span>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'oklch(0.62 0.02 240)' }}>Thriving</span>
              </div>
            </div>

            {result.saved && (
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'oklch(0.55 0.02 240)', marginTop: '0.5rem' }}>
                Your result has been saved to your history.
              </p>
            )}
          </div>
        </div>

        <main style={{ padding: '3.5rem 2rem 6rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Kalesh narrative */}
            <div style={{
              background: '#fff',
              border: '1px solid oklch(0.88 0.015 80)',
              borderRadius: '1rem',
              padding: 'clamp(2rem, 4vw, 3rem)',
              marginBottom: '3rem',
              boxShadow: '0 4px 24px oklch(0.18 0.015 240 / 0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'oklch(0.94 0.01 80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  <img
                    src="https://conscious-elder.b-cdn.net/images/kalesh-photo.webp"
                    alt="Kalesh"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.15rem' }}>
                    A note from Kalesh
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'oklch(0.55 0.02 240)' }}>
                    {result.domain} Assessment
                  </p>
                </div>
              </div>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'oklch(0.25 0.015 240)',
              }}>
                {result.narrative}
              </p>
            </div>

            {/* Amazon recommendations */}
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'oklch(0.62 0.12 65)',
                  marginBottom: '0.5rem',
                }}>
                  Kalesh Recommends
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                  fontWeight: 700,
                  color: 'oklch(0.18 0.015 240)',
                  lineHeight: 1.25,
                  marginBottom: '0.5rem',
                }}>
                  Resources matched to your results
                </h2>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'oklch(0.45 0.02 240)', lineHeight: 1.6 }}>
                  These are the specific books, supplements, and tools I'd point to for someone in your position.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {result.recommendations.map((rec, i) => (
                  <div key={rec.asin} style={{
                    background: '#fff',
                    border: '1px solid oklch(0.88 0.015 80)',
                    borderRadius: '0.875rem',
                    padding: '1.5rem 1.75rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'flex-start',
                    transition: 'box-shadow 0.2s',
                  }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px oklch(0.18 0.015 240 / 0.08)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}
                  >
                    {/* Number badge */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'oklch(0.96 0.01 80)',
                      border: '1px solid oklch(0.88 0.015 80)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-serif)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'oklch(0.62 0.12 65)',
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            display: 'inline-block',
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'oklch(0.62 0.12 65)',
                            marginBottom: '0.35rem',
                          }}>
                            {CATEGORY_LABELS[rec.category] ?? rec.category}
                          </span>
                          <h3 style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'oklch(0.18 0.015 240)',
                            lineHeight: 1.3,
                            marginBottom: '0.5rem',
                          }}>
                            {rec.name}
                          </h3>
                          <p style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.875rem',
                            color: 'oklch(0.42 0.02 240)',
                            lineHeight: 1.65,
                            marginBottom: '1rem',
                          }}>
                            {rec.reason}
                          </p>
                        </div>
                      </div>

                      <a
                        href={buildAmazonUrl(rec.asin)}
                        target="_blank"
                        rel="nofollow noopener noreferrer sponsored"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: 'oklch(0.62 0.12 65)',
                          textDecoration: 'none',
                          padding: '0.5rem 1.1rem',
                          border: '1px solid oklch(0.62 0.12 65)',
                          borderRadius: '0.375rem',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLAnchorElement).style.background = 'oklch(0.62 0.12 65)';
                          (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                          (e.currentTarget as HTMLAnchorElement).style.color = 'oklch(0.62 0.12 65)';
                        }}
                      >
                        View on Amazon
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        <span style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.75 }}>(paid link)</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Amazon disclosure */}
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                color: 'oklch(0.62 0.02 240)',
                marginTop: '1.5rem',
                lineHeight: 1.6,
                padding: '1rem 1.25rem',
                background: 'oklch(0.97 0.006 85)',
                borderRadius: '0.5rem',
                border: '1px solid oklch(0.88 0.015 80)',
              }}>
                As an Amazon Associate, The Conscious Elder earns from qualifying purchases. Links marked (paid link) are affiliate links. This does not affect the price you pay or the honesty of these recommendations.
              </p>
            </div>

            {/* Next steps */}
            <div style={{
              marginTop: '3.5rem',
              padding: '2.5rem',
              background: 'oklch(0.99 0.004 85)',
              border: '1px solid oklch(0.88 0.015 80)',
              borderRadius: '1rem',
              textAlign: 'center',
            }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.75rem' }}>
                What's next?
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: 'oklch(0.45 0.02 240)', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem' }}>
                You've assessed one dimension of your life. Take the others to see the full picture.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/assessments"
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.75rem 1.75rem',
                    background: 'oklch(0.62 0.12 65)',
                    color: '#fff',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  All Assessments
                </Link>
                <Link
                  href="/articles"
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    padding: '0.75rem 1.75rem',
                    border: '1px solid oklch(0.88 0.015 80)',
                    background: '#fff',
                    color: 'oklch(0.35 0.02 240)',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                  }}
                >
                  Read Articles
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

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
