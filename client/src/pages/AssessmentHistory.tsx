import { useState } from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';
import { getLoginUrl } from '@/const';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DOMAIN_COLORS: Record<string, string> = {
  'Physical Wellness': '#C48F3A',
  'Mental Clarity': '#5B8DB8',
  'Emotional Health': '#B85B8D',
  'Spiritual Practice': '#8DB85B',
  'Social Connection': '#B8845B',
  'Legacy and Purpose': '#5BB8A8',
};

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  thriving: { bg: 'oklch(0.92 0.08 145)', text: 'oklch(0.28 0.10 145)' },
  growing: { bg: 'oklch(0.94 0.06 75)', text: 'oklch(0.38 0.10 65)' },
  'needs-attention': { bg: 'oklch(0.94 0.05 25)', text: 'oklch(0.38 0.10 25)' },
};

function formatDate(ts: number | Date | null | undefined): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssessmentHistory() {
  const { user, loading: authLoading } = useAuth();
  const [activeLines, setActiveLines] = useState<Record<string, boolean>>({});

  const { data: history, isLoading } = trpc.assessments.history.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Build chart data: group by date, one point per quiz attempt
  const chartData = (() => {
    if (!history || history.length === 0) return [];

    // Sort oldest first
    const sorted = [...history].sort((a, b) =>
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );

    // Build a map of date -> { domain: percentage }
    const byDate: Record<string, Record<string, number>> = {};
    sorted.forEach(r => {
      const date = formatDate(r.createdAt);
      if (!byDate[date]) byDate[date] = {};
      const pct = Math.round((r.score / r.maxScore) * 100);
      byDate[date][r.domain] = pct;
    });

    return Object.entries(byDate).map(([date, domains]) => ({ date, ...domains }));
  })();

  // Get unique domains from history
  const domains = history
    ? Array.from(new Set(history.map(r => r.domain)))
    : [];

  function toggleLine(domain: string) {
    setActiveLines(prev => ({ ...prev, [domain]: !prev[domain] }));
  }

  if (authLoading) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.985 0.008 85)' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid oklch(0.88 0.015 80)', borderTopColor: 'oklch(0.62 0.12 65)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteNav alwaysSolid />
        <div style={{ paddingTop: '72px', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'oklch(0.985 0.008 85)' }}>
          <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '480px' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', marginBottom: '1.5rem' }}>📊</p>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '1rem', lineHeight: 1.3 }}>
              Sign in to view your history
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'oklch(0.48 0.02 240)', lineHeight: 1.7, marginBottom: '2rem' }}>
              Your assessment results are saved when you're signed in. Sign in to track your progress across all six life domains over time.
            </p>
            <a
              href={getLoginUrl()}
              style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', textDecoration: 'none' }}
            >
              Sign in to continue
            </a>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/assessments" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'oklch(0.52 0.12 65)', textDecoration: 'underline' }}>
                Take an assessment first
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="My Assessment History | The Conscious Elder"
        description="Track your progress across all six life domains over time."
        canonicalPath="/assessments/history"
        type="website"
      />
      <SiteNav alwaysSolid />

      <div style={{ paddingTop: '72px', minHeight: '100vh', background: 'oklch(0.985 0.008 85)' }}>
        {/* Page header */}
        <div style={{ background: '#fff', borderBottom: '1px solid oklch(0.90 0.012 80)', padding: '2.5rem 2rem 2rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <nav style={{ marginBottom: '0.75rem' }}>
              <Link href="/assessments" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.55 0.02 240)', textDecoration: 'none' }}>
                Assessments
              </Link>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.70 0.01 240)', margin: '0 0.5rem' }}>/</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.35 0.02 240)' }}>History</span>
            </nav>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, color: 'oklch(0.18 0.015 240)', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              Your Assessment History
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'oklch(0.48 0.02 240)', lineHeight: 1.6 }}>
              Track how your scores across the six life domains change over time.
            </p>
          </div>
        </div>

        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem 6rem' }}>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid oklch(0.88 0.015 80)', borderTopColor: 'oklch(0.62 0.12 65)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : !history || history.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px solid oklch(0.90 0.012 80)' }}>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '3rem', marginBottom: '1.5rem' }}>🌱</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.875rem' }}>
                No results yet
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.95rem', color: 'oklch(0.48 0.02 240)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                Complete your first assessment to start tracking your progress across the six life domains.
              </p>
              <Link
                href="/assessments"
                style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', textDecoration: 'none' }}
              >
                Take your first assessment
              </Link>
            </div>
          ) : (
            <>
              {/* Line chart */}
              {chartData.length >= 2 && (
                <div style={{ background: '#fff', border: '1px solid oklch(0.90 0.012 80)', borderRadius: '1rem', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 2px 12px oklch(0.18 0.015 240 / 0.04)' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.5rem' }}>
                    Progress Over Time
                  </h2>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', color: 'oklch(0.55 0.02 240)', marginBottom: '1.75rem' }}>
                    Score percentage (0-100) per domain. Click a domain in the legend to show or hide its line.
                  </p>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 80)" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'oklch(0.55 0.02 240)' }}
                        tickLine={false}
                        axisLine={{ stroke: 'oklch(0.88 0.015 80)' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontFamily: 'var(--font-sans)', fontSize: 11, fill: 'oklch(0.55 0.02 240)' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={v => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.8rem',
                          border: '1px solid oklch(0.88 0.015 80)',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                      <Legend
                        wrapperStyle={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', paddingTop: '1rem', cursor: 'pointer' }}
                        onClick={e => toggleLine(e.value as string)}
                      />
                      {domains.map(domain => (
                        <Line
                          key={domain}
                          type="monotone"
                          dataKey={domain}
                          stroke={DOMAIN_COLORS[domain] ?? '#888'}
                          strokeWidth={2.5}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                          hide={activeLines[domain] === true}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Summary cards: latest score per domain */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '1.25rem' }}>
                  Latest Scores by Domain
                </h2>
                <div className="ce-quiz-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {domains.map(domain => {
                    const latest = [...history]
                      .filter(r => r.domain === domain)
                      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
                    if (!latest) return null;
                    const pct = Math.round((latest.score / latest.maxScore) * 100);
                    const tierStyle = TIER_COLORS[latest.tier] ?? TIER_COLORS['growing'];
                    return (
                      <div
                        key={domain}
                        style={{
                          background: '#fff',
                          border: '1px solid oklch(0.90 0.012 80)',
                          borderRadius: '0.875rem',
                          padding: '1.5rem',
                          boxShadow: '0 2px 8px oklch(0.18 0.015 240 / 0.04)',
                        }}
                      >
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: DOMAIN_COLORS[domain] ?? 'oklch(0.62 0.12 65)', marginBottom: '0.5rem' }}>
                          {domain}
                        </p>
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', lineHeight: 1, marginBottom: '0.5rem' }}>
                          {pct}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'oklch(0.55 0.02 240)' }}>%</span>
                        </p>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: tierStyle.bg,
                          color: tierStyle.text,
                          marginBottom: '0.75rem',
                        }}>
                          {latest.tier === 'thriving' ? 'Thriving' : latest.tier === 'growing' ? 'Growing' : 'Needs Attention'}
                        </span>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.62 0.02 240)' }}>
                          {formatDate(latest.createdAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full history table */}
              <div style={{ background: '#fff', border: '1px solid oklch(0.90 0.012 80)', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 2px 12px oklch(0.18 0.015 240 / 0.04)' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid oklch(0.92 0.01 80)' }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)' }}>
                    All Results
                  </h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'oklch(0.97 0.006 85)' }}>
                        {['Date', 'Domain', 'Score', 'Tier', 'Action'].map(h => (
                          <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'oklch(0.55 0.02 240)', borderBottom: '1px solid oklch(0.90 0.012 80)', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...history]
                        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
                        .map((r, i) => {
                          const pct = Math.round((r.score / r.maxScore) * 100);
                          const tierStyle = TIER_COLORS[r.tier] ?? TIER_COLORS['growing'];
                          return (
                            <tr key={r.id} style={{ borderBottom: i < history.length - 1 ? '1px solid oklch(0.94 0.008 80)' : 'none', transition: 'background 0.12s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.99 0.004 85)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'oklch(0.48 0.02 240)', whiteSpace: 'nowrap' }}>
                                {formatDate(r.createdAt)}
                              </td>
                              <td style={{ padding: '1rem 1.25rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: DOMAIN_COLORS[r.domain] ?? '#888', flexShrink: 0 }} />
                                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500, color: 'oklch(0.25 0.015 240)' }}>{r.domain}</span>
                                </span>
                              </td>
                              <td style={{ padding: '1rem 1.25rem', fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)' }}>
                                {pct}%
                              </td>
                              <td style={{ padding: '1rem 1.25rem' }}>
                                <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '999px', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600, background: tierStyle.bg, color: tierStyle.text, whiteSpace: 'nowrap' }}>
                                  {r.tier === 'thriving' ? 'Thriving' : r.tier === 'growing' ? 'Growing' : 'Needs Attention'}
                                </span>
                              </td>
                              <td style={{ padding: '1rem 1.25rem' }}>
                                <Link
                                  href={`/assessments/${r.quizId}`}
                                  style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'oklch(0.52 0.12 65)', textDecoration: 'none', fontWeight: 500 }}
                                >
                                  Retake
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <Link
                  href="/assessments"
                  style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', textDecoration: 'none' }}
                >
                  Take another assessment
                </Link>
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
