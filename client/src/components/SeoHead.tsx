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
}

const BASE_URL = 'https://consciouselder.com';
const SITE_NAME = 'The Conscious Elder';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-default.webp`;

export default function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalPath,
  type = 'website',
  noindex = false,
}: SeoHeadProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonical = canonicalPath ? `${BASE_URL}${canonicalPath}` : BASE_URL;
  const resolvedOgImage = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
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

    if (description) setMeta('description', description);
    // Meta author uses site editorial name, NOT Kalesh
    setMeta('author', SITE_NAME);
    if (noindex) setMeta('robots', 'noindex,nofollow');

    // Open Graph
    setMeta('og:type', type, true);
    setMeta('og:title', ogTitle || fullTitle, true);
    setMeta('og:description', ogDescription || description || '', true);
    setMeta('og:image', resolvedOgImage, true);
    setMeta('og:url', canonical, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', ogTitle || fullTitle);
    setMeta('twitter:description', ogDescription || description || '');
    setMeta('twitter:image', resolvedOgImage);

    // Canonical
    setLink('canonical', canonical);
  }, [fullTitle, description, ogTitle, ogDescription, resolvedOgImage, canonical, type, noindex]);

  return null;
}
