import { useEffect } from 'react';

interface ArticleJsonLdProps {
  title: string;
  description?: string;
  slug: string;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  imageUrl?: string | null;
  category?: string | null;
}

export function ArticleJsonLd({ title, description, slug, publishedAt, updatedAt, imageUrl, category }: ArticleJsonLdProps) {
  const baseUrl = 'https://consciouselder.com';
  const url = `${baseUrl}/articles/${slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || '',
    url,
    author: {
      '@type': 'Person',
      name: 'Kalesh',
      url: 'https://kalesh.love',
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Conscious Elder',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.webp`,
      },
    },
    datePublished: publishedAt ? new Date(publishedAt).toISOString() : undefined,
    dateModified: updatedAt ? new Date(updatedAt).toISOString() : undefined,
    image: imageUrl || `${baseUrl}/og-default.webp`,
    articleSection: category || 'Conscious Aging',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}

interface WebsiteJsonLdProps {
  name?: string;
  description?: string;
}

export function WebsiteJsonLd({ name = 'The Conscious Elder', description }: WebsiteJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: 'https://consciouselder.com',
    description: description || 'Wisdom, practice, and honest inquiry for the second half of life.',
    author: {
      '@type': 'Person',
      name: 'Kalesh',
      url: 'https://kalesh.love',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
}
