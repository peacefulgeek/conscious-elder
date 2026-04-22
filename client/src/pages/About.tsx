import { Link } from 'wouter';
import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=85&auto=format&fit=crop&crop=center';
const KALESH_PHOTO = 'https://conscious-elder.b-cdn.net/images/kalesh-photo.webp';
const KALESH_FALLBACK = 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&q=80&auto=format&fit=crop&crop=face';

export default function About() {
  return (
    <>
      <SeoHead
        title="About Kalesh | The Conscious Elder"
        description="Kalesh writes about conscious aging, elder wisdom, and the second half of life. Based at kalesh.love."
        canonicalPath="/about"
        type="website"
      />
      <SiteNav />

      {/* ── Hero ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '60vh',
          minHeight: '400px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <img
          src={HERO_IMAGE}
          alt="A forest path at golden hour, light filtering through ancient trees"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }}
          loading="eager"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(18,14,10,0.78) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '860px', margin: '0 auto', padding: '0 2rem 3.5rem' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'oklch(0.78 0.10 65)', marginBottom: '0.75rem' }}>
            About
          </p>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', lineHeight: 1.12 }}>
            I'm Kalesh.
          </h1>
        </div>
      </div>

      {/* ── Bio section ── */}
      <main style={{ background: 'oklch(0.985 0.008 85)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>

          {/* Photo + intro grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '3.5rem', alignItems: 'start', marginBottom: '3.5rem' }} className="about-grid">
            <div>
              <img
                src={KALESH_PHOTO}
                alt="Kalesh, author of The Conscious Elder"
                onError={e => { (e.currentTarget as HTMLImageElement).src = KALESH_FALLBACK; }}
                style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '0.75rem', boxShadow: '0 8px 32px rgba(30,34,40,0.12)' }}
              />
              <div style={{ marginTop: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '0.25rem' }}>Kalesh</p>
                <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'oklch(0.52 0.12 65)', textDecoration: 'none', borderBottom: '1px solid oklch(0.52 0.12 65)', paddingBottom: '1px' }}>
                  kalesh.love
                </a>
              </div>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontStyle: 'italic', color: 'oklch(0.35 0.02 240)', lineHeight: 1.65, marginBottom: '1.75rem', paddingBottom: '1.75rem', borderBottom: '1px solid oklch(0.88 0.015 80)' }}>
                "I write about aging consciously, because I think most of what our culture tells us about getting older is wrong."
              </p>

              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'oklch(0.35 0.02 240)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p>
                  I came to this work the way most people come to the things that matter most: I had no choice. I watched people I loved move into the second half of their lives without any real map for it. I watched them shrink. I watched them fight the very thing that was happening to them. And I thought: there has to be a better way.
                </p>
                <p>
                  I've spent years studying what conscious aging actually looks like in practice. Not the greeting-card version of it, where everyone is serene and grateful. The real version, where you're still scared sometimes, still grieving sometimes, still figuring out who you are when the roles you've played for decades start to fall away.
                </p>
                <p>
                  I write about TCM herbs and supplements because I've tried most of them and I want to tell you honestly what I think. I write about meditation and practice because I believe the inner work matters as much as the physical work. I write about death and legacy and grief because I think we do each other a disservice when we pretend those things aren't part of the picture.
                </p>
                <p>
                  I'm not a doctor. I'm not a therapist. I'm someone who is living this, paying attention, and writing it down. That's what this journal is.
                </p>
                <p>
                  If you want more of my work on consciousness and inner life, you can find it at{' '}
                  <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer"
                    style={{ color: 'oklch(0.52 0.12 65)', textDecoration: 'underline', textDecorationColor: 'oklch(0.52 0.12 65 / 0.4)' }}>
                    kalesh.love
                  </a>.
                </p>
              </div>
            </div>
          </div>

          {/* What you'll find here */}
          <div style={{ background: 'oklch(0.97 0.006 85)', borderRadius: '0.875rem', padding: '2.5rem', border: '1px solid oklch(0.88 0.015 80)', marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'oklch(0.18 0.015 240)', marginBottom: '1.5rem' }}>
              What you'll find here
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }} className="about-topics-grid">
              {[
                ['Conscious Aging', 'What it actually means to age with awareness, not just acceptance.'],
                ['Practice', 'Meditation, Tai Chi, morning rituals, and the inner work that supports a good second half.'],
                ['Supplements and TCM', 'Honest reviews of the herbs and supplements worth knowing about after 60.'],
                ['Legacy and Grief', 'How to write what you want to leave behind, and how to grieve what you\'ve already lost.'],
                ['Relationships', 'Intergenerational friendship, talking to adult children, finding your people.'],
                ['Downsizing and Simplicity', 'The art of letting go without losing yourself in the process.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'oklch(0.62 0.12 65)', marginTop: '0.45rem', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, color: 'oklch(0.22 0.015 240)', marginBottom: '0.25rem' }}>{title}</p>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.825rem', color: 'oklch(0.48 0.02 240)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Affiliate note */}
          <div style={{ padding: '1.5rem', borderLeft: '3px solid oklch(0.88 0.015 80)', marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.825rem', color: 'oklch(0.52 0.02 240)', lineHeight: 1.7 }}>
              <strong style={{ color: 'oklch(0.35 0.02 240)' }}>A note on affiliate links:</strong> Some links on this site are Amazon affiliate links, labeled "(paid link)." If you buy something through one of those links, I earn a small commission at no extra cost to you. I only recommend things I've actually used or researched carefully.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: 'oklch(0.62 0.12 65)', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, borderRadius: '0.375rem', textDecoration: 'none' }}>
              Read the Articles
            </Link>
            <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', padding: '0.875rem 2rem', border: '1px solid oklch(0.88 0.015 80)', color: 'oklch(0.35 0.02 240)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500, borderRadius: '0.375rem', textDecoration: 'none' }}>
              Visit kalesh.love
            </a>
          </div>
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
        @media (max-width: 700px) {
          .about-grid { grid-template-columns: 1fr !important; }
          .about-topics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
