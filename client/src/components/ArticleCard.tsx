import { Link } from 'wouter';

interface ArticleCardProps {
  slug: string;
  title: string;
  metaDescription?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  readingTime?: number | null;
  publishedAt?: Date | string | null;
  author?: string;
}

export default function ArticleCard({
  slug, title, metaDescription, category, imageUrl, imageAlt, readingTime, publishedAt, author = 'Kalesh'
}: ArticleCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const categoryLabel = category
    ? category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Conscious Aging';

  return (
    <Link href={`/articles/${slug}`} className="article-card block no-underline">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={imageAlt || title}
          className="article-card__image"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="article-card__image"
          style={{ background: 'oklch(0.94 0.01 80)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'oklch(0.62 0.12 65)', opacity: 0.4 }}>
            CE
          </span>
        </div>
      )}
      <div className="article-card__body">
        <p className="article-card__category">{categoryLabel}</p>
        <h2 className="article-card__title">{title}</h2>
        {metaDescription && (
          <p className="article-card__excerpt">{metaDescription}</p>
        )}
        <div className="article-card__meta">
          <span>{author}</span>
          {formattedDate && <><span>·</span><span>{formattedDate}</span></>}
          {readingTime && <><span>·</span><span>{readingTime} min read</span></>}
        </div>
      </div>
    </Link>
  );
}
