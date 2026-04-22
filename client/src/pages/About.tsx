import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

export default function About() {
  return (
    <>
      <SeoHead
        title="About Kalesh | The Conscious Elder"
        description="Kalesh is a consciousness teacher and writer exploring what it means to age with awareness, purpose, and depth."
        canonicalPath="/about"
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
          }}>
            About Kalesh
          </h1>
        </div>

        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
          {/* Photo */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img
              src="https://conscious-elder.b-cdn.net/images/kalesh-photo.webp"
              alt="Kalesh, author of The Conscious Elder"
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid oklch(0.88 0.015 80)',
              }}
              loading="eager"
              decoding="async"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>

          {/* Bio */}
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.125rem', lineHeight: 1.8, color: 'oklch(0.18 0.015 240)' }}>
            <p style={{ marginBottom: '1.5rem' }}>
              I've been thinking about aging for a long time. Not the kind of thinking that happens in a doctor's office or a financial planner's spreadsheet, though those conversations have their place. I mean the kind that happens at three in the morning when you realize the person you were at forty is genuinely gone, and you're not entirely sure who showed up to take his place.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              My name is Kalesh. I'm a consciousness teacher and writer. For decades I've worked with people who are navigating what I think of as the second half of life, which is less a chronological category and more a state of awareness. You know you've arrived when the questions start mattering more than the answers.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              This site is where I write about aging consciously. That means honestly. It means without the toxic positivity that tells you decline is just a mindset problem, and without the resignation that says there's nothing to do but wait. It means sitting with what's actually true about getting older, and finding out what wisdom, practice, and genuine inquiry can offer.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              I write about supplements because I take them and I've done the research. I write about TCM herbs because I've used them for years and found some of them genuinely useful. I write about grief because I've lost people I loved, and the culture's approach to grief is mostly useless. I write about legacy because the question of what we leave behind is one of the most important questions we can ask, and most of us don't ask it until it's almost too late.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              I'm not a doctor. Nothing here is medical advice. I'm a person who has spent a long time paying attention, and I'm sharing what I've found.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              If you want more of my work on consciousness, inner life, and what it means to wake up in this particular body in this particular time, you can find it at{' '}
              <a
                href="https://kalesh.love"
                target="_blank"
                rel="noopener"
                style={{ color: 'oklch(0.62 0.12 65)', textDecoration: 'underline', textDecorationColor: 'oklch(0.62 0.12 65 / 0.4)' }}
              >
                kalesh.love
              </a>.
            </p>
            <p>
              Thanks for being here.
            </p>
          </div>

          {/* Affiliate Disclosure */}
          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'oklch(0.97 0.006 85)',
            border: '1px solid oklch(0.88 0.015 80)',
            borderRadius: '0.75rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.125rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
              color: 'oklch(0.18 0.015 240)'
            }}>
              Affiliate Disclosure
            </h2>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'oklch(0.45 0.02 240)'
            }}>
              Some links on this site are affiliate links, marked with "(paid link)." As an Amazon Associate, I earn from qualifying purchases. This costs you nothing extra and helps support the writing here. I only recommend products I've researched and believe are worth your consideration.
            </p>
          </div>
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
