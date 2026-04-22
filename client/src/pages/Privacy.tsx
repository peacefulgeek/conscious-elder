import SiteNav from '@/components/SiteNav';
import SeoHead from '@/components/SeoHead';

export default function Privacy() {
  return (
    <>
      <SeoHead
        title="Privacy Policy | The Conscious Elder"
        description="Privacy policy, affiliate disclosure, and health disclaimer for The Conscious Elder."
        canonicalPath="/privacy"
        type="website"
        noindex={true}
      />

      <SiteNav alwaysSolid />

      <div style={{ paddingTop: '5rem' }}>
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
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'oklch(0.55 0.02 240)', marginTop: '0.5rem' }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <main style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.7, color: 'oklch(0.25 0.015 240)' }}>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                Affiliate Disclosure
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                The Conscious Elder participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you click a link marked with "(paid link)" and make a purchase, we may earn a commission at no additional cost to you.
              </p>
              <p>
                We only recommend products we have researched and believe may be genuinely useful to our readers. Affiliate relationships do not influence our editorial content or opinions.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                Health Disclaimer
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                The content on this website is for informational and educational purposes only. Nothing on this site constitutes medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before starting any supplement, herbal protocol, or health practice, especially if you have existing health conditions or take prescription medications.
              </p>
              <p>
                The author is not a licensed medical professional. Personal experiences and research shared on this site reflect the author's own inquiry and should not be taken as clinical guidance.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                Information We Collect
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                This site does not collect personal information beyond what is standard for web analytics. We may use anonymized analytics to understand how readers use the site. We do not sell or share personal data with third parties.
              </p>
              <p>
                If you contact us via email, we retain that correspondence only as long as necessary to respond to your inquiry.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                Cookies
              </h2>
              <p>
                This site may use cookies for basic functionality and analytics. By using this site, you consent to the use of cookies in accordance with this policy. You can disable cookies in your browser settings, though this may affect site functionality.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                External Links
              </h2>
              <p>
                This site contains links to external websites, including Amazon.com and other resources. We are not responsible for the privacy practices or content of those sites. We encourage you to review the privacy policies of any external sites you visit.
              </p>
            </section>

            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                Changes to This Policy
              </h2>
              <p>
                We may update this privacy policy from time to time. Changes will be reflected by the "Last updated" date at the top of this page. Continued use of the site after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'oklch(0.18 0.015 240)' }}>
                Contact
              </h2>
              <p>
                Questions about this policy can be directed to the site owner via the contact information available at{' '}
                <a href="https://kalesh.love" target="_blank" rel="noopener" style={{ color: 'oklch(0.62 0.12 65)' }}>
                  kalesh.love
                </a>.
              </p>
            </section>
          </div>
        </main>
      </div>

      <footer style={{ borderTop: '1px solid oklch(0.88 0.015 80)', padding: '2rem 1.5rem', textAlign: 'center', background: 'oklch(0.97 0.006 85)' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: 'oklch(0.65 0.02 240)' }}>
          &copy; {new Date().getFullYear()} The Conscious Elder
        </p>
      </footer>
    </>
  );
}
