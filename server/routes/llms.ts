/**
 * llms.ts - /llms.txt and /llms-full.txt routes
 *
 * /llms.txt       - Markdown index of all published articles grouped by category
 * /llms-full.txt  - Plain-text corpus of all article bodies, frontmatter-delimited
 *                   Ready for RAG pipeline ingestion
 */

import express from 'express';
import { getAllPublishedArticlesForLlms, getArticleBySlug, getAllPublishedSlugs } from '../db';

export const llmsRouter = express.Router();

// /llms.txt - Markdown index grouped by category
llmsRouter.get('/llms.txt', async (_req, res) => {
  try {
    const articles = await getAllPublishedArticlesForLlms();

    // Group by category
    const byCategory = new Map<string, typeof articles>();
    for (const a of articles) {
      const cat = a.category || 'Conscious Aging';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(a);
    }

    const lines: string[] = [
      '# The Conscious Elder - Article Index',
      '',
      '> Wisdom, practice, and honest inquiry for those aging with awareness.',
      '> Written by The Editorial Team. Published at https://consciouselder.com',
      '',
      `> ${articles.length} published articles as of ${new Date().toISOString().split('T')[0]}`,
      '',
    ];

    for (const [cat, arts] of Array.from(byCategory.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(`## ${cat}`, '');
      for (const a of arts) {
        const desc = a.metaDescription ? ` - ${a.metaDescription}` : '';
        lines.push(`- [${a.title}](https://consciouselder.com/articles/${a.slug})${desc}`);
      }
      lines.push('');
    }

    res.set('Content-Type', 'text/markdown; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(lines.join('\n'));
  } catch (err) {
    console.error('[llms.txt] error:', err);
    res.status(500).send('Error generating llms.txt');
  }
});

// /llms-full.txt - Full article corpus for RAG ingestion
llmsRouter.get('/llms-full.txt', async (_req, res) => {
  try {
    const slugMetas = await getAllPublishedSlugs();
    const parts: string[] = [
      '---',
      'source: https://consciouselder.com',
      'title: The Conscious Elder - Full Article Corpus',
      'description: Complete text of all published articles on conscious aging, longevity, and the second half of life.',
      `generated: ${new Date().toISOString()}`,
      `article_count: ${slugMetas.length}`,
      '---',
      '',
    ];

    for (const { slug } of slugMetas) {
      try {
        const article = await getArticleBySlug(slug);
        if (!article || !article.body) continue;
        parts.push(
          `---`,
          `slug: ${article.slug}`,
          `title: ${article.title}`,
          `category: ${article.category}`,
          `published: ${article.publishedAt ?? ''}`,
          `url: https://consciouselder.com/articles/${article.slug}`,
          `---`,
          '',
          article.body,
          '',
        );
      } catch {
        // Skip articles that fail to fetch
      }
    }

    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(parts.join('\n'));
  } catch (err) {
    console.error('[llms-full.txt] error:', err);
    res.status(500).send('Error generating llms-full.txt');
  }
});
