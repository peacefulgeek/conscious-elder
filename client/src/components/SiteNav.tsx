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
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isSolid = alwaysSolid || scrolled;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/recommended', label: 'Recommended' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className={`site-nav ${isSolid ? 'site-nav--solid' : 'site-nav--transparent'}`}>
      <div className="site-nav__inner">
        <Link href="/" className="site-nav__logo">
          The Conscious Elder
        </Link>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          style={{ color: isSolid ? 'oklch(0.18 0.015 240)' : 'oklch(0.99 0.004 85)' }}
        >
          <span className="hamburger__line" />
          <span className="hamburger__line" />
          <span className="hamburger__line" />
        </button>

        <ul className={`site-nav__links ${menuOpen ? 'site-nav__links--open' : ''}`}>
          {navLinks.map(link => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="site-nav__link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
