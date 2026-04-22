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
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [alwaysSolid]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const solid = scrolled || alwaysSolid || menuOpen;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/assessments', label: 'Assessments' },
    { href: '/recommended', label: 'Recommended' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          background: solid ? 'oklch(0.985 0.008 85)' : 'transparent',
          boxShadow: solid ? '0 1px 0 oklch(0.88 0.015 80)' : 'none',
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: solid ? 'oklch(0.18 0.015 240)' : '#fff',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            transition: 'color 0.3s',
            flexShrink: 0,
          }}
        >
          The Conscious Elder
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginLeft: 'auto' }} className="ce-desktop-nav">
          {navLinks.map(link => {
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: solid
                    ? (isActive ? 'oklch(0.52 0.12 65)' : 'oklch(0.35 0.02 240)')
                    : (isActive ? 'oklch(0.85 0.10 65)' : 'rgba(255,255,255,0.85)'),
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  borderBottom: isActive
                    ? `1px solid ${solid ? 'oklch(0.52 0.12 65)' : 'oklch(0.85 0.10 65)'}`
                    : '1px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="ce-hamburger-btn"
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: solid ? 'oklch(0.18 0.015 240)' : '#fff',
            display: 'none',
          }}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          zIndex: 99,
          background: 'oklch(0.985 0.008 85)',
          borderBottom: '1px solid oklch(0.88 0.015 80)',
          padding: '1rem 2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {navLinks.map(link => {
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.1rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'oklch(0.52 0.12 65)' : 'oklch(0.25 0.02 240)',
                  textDecoration: 'none',
                  padding: '0.875rem 0',
                  borderBottom: '1px solid oklch(0.92 0.01 80)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .ce-desktop-nav { display: none !important; }
          .ce-hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
