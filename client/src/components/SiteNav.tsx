import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';

interface SiteNavProps {
  alwaysSolid?: boolean;
}

export default function SiteNav({ alwaysSolid = false }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    if (alwaysSolid) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [alwaysSolid]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const solid = scrolled || alwaysSolid || menuOpen;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/assessments', label: 'Assessments' },
    { href: '/recommended', label: 'Recommended' },
    { href: '/herbs', label: 'Herbs & Supplements' },
    { href: '/about', label: 'About' },
  ];

  // When transparent (over hero): add a subtle dark gradient behind the nav for legibility
  const bgStyle = solid
    ? { background: 'oklch(0.985 0.008 85)', boxShadow: '0 1px 0 oklch(0.88 0.015 80)' }
    : { background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)', boxShadow: 'none' };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          ...bgStyle,
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: solid ? 'oklch(0.18 0.015 240)' : '#fff',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            transition: 'color 0.3s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          The Conscious Elder
        </Link>

        {/* Desktop nav — hidden below 860px */}
        <div
          className="ce-desktop-nav"
          style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', marginLeft: 'auto' }}
        >
          {navLinks.map(link => {
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: '0.01em',
                  color: solid
                    ? (isActive ? 'oklch(0.48 0.12 65)' : 'oklch(0.30 0.02 240)')
                    : (isActive ? 'oklch(0.92 0.08 65)' : 'rgba(255,255,255,0.95)'),
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  borderBottom: isActive
                    ? `2px solid ${solid ? 'oklch(0.48 0.12 65)' : 'oklch(0.85 0.10 65)'}`
                    : '2px solid transparent',
                  paddingBottom: '2px',
                  textShadow: solid ? 'none' : '0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Hamburger — shown below 860px */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="ce-hamburger-btn"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: solid ? 'oklch(0.18 0.015 240)' : '#fff',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            filter: solid ? 'none' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
          }}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile full-screen dropdown */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
            background: 'oklch(0.985 0.008 85)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '0.5rem 0 2rem',
          }}
        >
          {navLinks.map(link => {
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.15rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'oklch(0.48 0.12 65)' : 'oklch(0.22 0.02 240)',
                  textDecoration: 'none',
                  padding: '1rem 2rem',
                  borderBottom: '1px solid oklch(0.92 0.01 80)',
                  display: 'block',
                  background: isActive ? 'oklch(0.97 0.01 80)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .ce-desktop-nav { display: none !important; }
          .ce-hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
