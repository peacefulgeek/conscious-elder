/**
 * SSR Head Injection — injects structured data for AI crawlers.
 * BreadcrumbList, Person, CollectionPage, SpeakableSpecification JSON-LD.
 */
import { Request, Response, NextFunction } from "express";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const SITE_URL = "https://consciouselder.com";
const SITE_NAME = "Conscious Elder";

interface ArticleMeta {
  slug: string;
  title: string;
  metaDescription?: string;
  category?: string;
  dateISO?: string;
  heroImage?: string;
}

function getArticlesIndex(): ArticleMeta[] {
  const indexPath = resolve(__dirname, "../client/src/data/articles-index.json");
  if (!existsSync(indexPath)) return [];
  try {
    return JSON.parse(readFileSync(indexPath, "utf-8"));
  } catch {
    return [];
  }
}

function buildArticleJsonLd(article: ArticleMeta): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || "",
    url: `${SITE_URL}/articles/${article.slug}`,
    datePublished: article.dateISO || new Date().toISOString(),
    dateModified: article.dateISO || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: SITE_NAME + " Editorial Team",
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    image: article.heroImage || `${SITE_URL}/favicon.ico`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["[data-tldr]", "h1", ".article-body p:first-of-type"],
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`,
    },
  };
  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

function buildBreadcrumb(article: ArticleMeta): string {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Articles", item: `${SITE_URL}/articles` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${SITE_URL}/articles/${article.slug}` },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

function buildCollectionPage(): string {
  const articles = getArticlesIndex();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Articles`,
    url: `${SITE_URL}/articles`,
    description: `All published articles from ${SITE_NAME}.`,
    numberOfItems: articles.length,
    hasPart: articles.slice(0, 50).map((a) => ({
      "@type": "Article",
      headline: a.title,
      url: `${SITE_URL}/articles/${a.slug}`,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
}

export function ssrHeadMiddleware(req: Request, res: Response, next: NextFunction) {
  const url = req.path;

  // Only inject for HTML requests from crawlers
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  const isCrawler = /bot|crawl|spider|gpt|claude|perplexity|bing|google|duck|apple|meta|cohere|mistral/i.test(ua);
  if (!isCrawler) return next();

  // Article pages
  const articleMatch = url.match(/^\/articles\/([a-z0-9-]+)$/);
  if (articleMatch) {
    const slug = articleMatch[1];
    const articles = getArticlesIndex();
    const article = articles.find((a) => a.slug === slug);
    if (article) {
      const jsonLd = buildArticleJsonLd(article) + buildBreadcrumb(article);
      res.locals.ssrHead = jsonLd;
    }
  }

  // Articles hub
  if (url === "/articles" || url === "/articles/") {
    res.locals.ssrHead = buildCollectionPage();
  }

  next();
}
