import { useEffect } from 'react';

interface SeoHeadProps {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedAt?: string | null;
  updatedAt?: string | null;
  author?: string | null;
  category?: string | null;
}

const BASE_URL = 'https://consciouselder.com';
const SITE_NAME = 'The Conscious Elder';
const DEFAULT_OG_IMAGE = 'https://conscious-elder.b-cdn.net/images/og-default.webp';
const AUTHOR_NAME = 'The Editorial Team';
const AUTHOR_URL = 'https://shrikrishna.com';

export default function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalPath,
  type = 'website',
  noindex = false,
  publishedAt,
  updatedAt,
  author,
  category,
}: SeoHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // Canonical: always strip UTM and tracking params
  const canonical = (() => {
    const path = canonicalPath || '/';
    return `${BASE_URL}${path}`;
  })();

  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;
  const resolvedAuthor = author || AUTHOR_NAME;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.rel = rel;
        document.head.appendChild(el);
      }
      el.href = href;
    };

    // ── Core meta ────────────────────────────────────────────────────────────
    if (description) setMeta('description', description);
    setMeta('author', resolvedAuthor);

    // Robots: allow indexing with rich snippet hints
    if (noindex) {
      setMeta('robots', 'noindex,nofollow');
    } else {
      setMeta('robots', 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1');
    }

    // ── Open Graph ────────────────────────────────────────────────────────────
    setMeta('og:type', type, true);
    setMeta('og:title', ogTitle || fullTitle, true);
    setMeta('og:description', ogDescription || description || '', true);
    setMeta('og:image', resolvedOgImage, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
    setMeta('og:url', canonical, true);
    setMeta('og:site_name', SITE_NAME, true);
    setMeta('og:locale', 'en_US', true);

    // Article-specific OG tags
    if (type === 'article') {
      if (publishedAt) setMeta('article:published_time', new Date(publishedAt).toISOString(), true);
      if (updatedAt) setMeta('article:modified_time', new Date(updatedAt).toISOString(), true);
      setMeta('article:author', AUTHOR_URL, true);
      if (category) setMeta('article:section', category, true);
      setMeta('article:publisher', BASE_URL, true);
    }

    // ── Twitter Card ──────────────────────────────────────────────────────────
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', ogTitle || fullTitle);
    setMeta('twitter:description', ogDescription || description || '');
    setMeta('twitter:image', resolvedOgImage);
    setMeta('twitter:image:alt', ogTitle || fullTitle);
    setMeta('twitter:site', '@consciouselder');
    setMeta('twitter:creator', '@consciouselder');

    // ── Canonical (UTM-stripped) ──────────────────────────────────────────────
    setLink('canonical', canonical);
  }, [fullTitle, description, ogTitle, ogDescription, resolvedOgImage, canonical, type, noindex, publishedAt, updatedAt, resolvedAuthor, category]);

  return null;
}
