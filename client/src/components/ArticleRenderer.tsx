import { useMemo } from 'react';
import AuthorBioCard from './AuthorBioCard';

interface ArticleRendererProps {
  body: string;
}

const AMAZON_TAG = 'spankyspinola-20';

/**
 * Renders article markdown/HTML body.
 * Injects AuthorBioCard at [AUTHOR_BIO_PLACEHOLDER].
 * Ensures all Amazon links use the correct tag.
 * Adds (paid link) label after affiliate links.
 */
export default function ArticleRenderer({ body }: ArticleRendererProps) {
  const { beforeBio, afterBio } = useMemo(() => {
    const PLACEHOLDER = '[AUTHOR_BIO_PLACEHOLDER]';
    const idx = body.indexOf(PLACEHOLDER);
    if (idx === -1) {
      return { beforeBio: body, afterBio: null };
    }
    return {
      beforeBio: body.slice(0, idx),
      afterBio: body.slice(idx + PLACEHOLDER.length),
    };
  }, [body]);

  const processHtml = (text: string) => {
    // Convert basic markdown to HTML
    let html = text
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Blockquote
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // HR
      .replace(/^---$/gm, '<hr />')
      // Unordered list items
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Ordered list items
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      // Links with paid link label
      .replace(
        /\[([^\]]+)\]\((https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}[^)]*)\)/g,
        (_, text, url) => {
          // Ensure tag is correct
          const cleanUrl = url.replace(/[?&]tag=[^&"'\s]*/g, '').replace(/\?$/, '');
          const finalUrl = `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}tag=${AMAZON_TAG}`;
          return `<a href="${finalUrl}" target="_blank" rel="nofollow noopener sponsored">${text}</a> <em class="paid-link-label">(paid link)</em>`;
        }
      )
      // Regular links
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        (_, text, url) => {
          const isExternal = !url.includes('consciouselder.com');
          const attrs = isExternal ? ' target="_blank" rel="noopener nofollow"' : '';
          return `<a href="${url}"${attrs}>${text}</a>`;
        }
      )
      // Paragraphs
      .replace(/\n\n+/g, '</p><p>')
      .replace(/^(?!<[h1-6|li|blockquote|hr|p])(.+)$/gm, (match) => {
        if (match.startsWith('<')) return match;
        return match;
      });

    // Wrap consecutive li items in ul
    html = html.replace(/(<li>[^]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

    // Wrap in paragraphs if not already wrapped
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    return html;
  };

  return (
    <div className="article-body">
      <div dangerouslySetInnerHTML={{ __html: processHtml(beforeBio) }} />
      <AuthorBioCard />
      {afterBio && <div dangerouslySetInnerHTML={{ __html: processHtml(afterBio) }} />}
    </div>
  );
}
