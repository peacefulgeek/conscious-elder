# The Conscious Elder - Project TODO

## Infrastructure
- [x] Database schema: articles, products, users tables (TiDB-compatible)
- [x] .do/app.yaml DigitalOcean config (port 3000, basic-xxs)
- [x] scripts/start-with-cron.mjs production entry point
- [x] scripts/seed-articles.mjs 30-article seed
- [x] scripts/seed-retry.mjs retry for quality gate failures
- [x] src/lib/db.mjs database query helper for cron jobs
- [x] src/data/verified-asins.json initial state

## Amazon Affiliate System
- [x] src/lib/amazon-verify.mjs with tag spankyspinola-20, soft-404 detection
- [x] src/lib/match-products.mjs named params, scoring engine
- [x] src/data/product-catalog.ts 150+ conscious aging products
- [x] src/lib/bunny-upload.mjs Bunny CDN upload helper
- [x] Amazon tag: spankyspinola-20
- [x] URL format: https://www.amazon.com/dp/[ASIN]?tag=spankyspinola-20
- [x] (paid link) label on every affiliate link

## Article Quality Gate & Generation
- [x] src/lib/article-quality-gate.mjs full gate with AI_FLAGGED_WORDS, voiceSignals
- [x] src/lib/anthropic-generate.mjs with HARD RULES block in prompt
- [x] Quality gate: em-dash detection, banned words, paid link labels, word count

## Cron Jobs (5 total, node-cron only, no setTimeout overflow)
- [x] src/cron/generate-article.mjs (Mon-Fri 06:00 UTC)
- [x] src/cron/product-spotlight.mjs (Saturday 08:00 UTC)
- [x] src/cron/refresh-monthly.mjs (1st of month 03:00 UTC)
- [x] src/cron/refresh-quarterly.mjs (Jan/Apr/Jul/Oct 1st 04:00 UTC)
- [x] src/cron/asin-health-check.mjs (Sunday 05:00 UTC)
- [x] src/cron/scheduler.mjs wires all 5 jobs
- [x] AUTO_GEN_ENABLED env var gates all cron jobs

## Server & Routes
- [x] server/db.ts Express server query helpers
- [x] server/routers.ts tRPC procedures: articles.list, articles.bySlug, articles.search, products.list, products.recommended
- [x] server/routes/health.ts /health endpoint
- [x] server/routes/sitemap.ts sitemap.xml (auto-generated from published articles)
- [x] server/routes/robots.ts robots.txt with sitemap reference

## Frontend - Archetype D Scroll Design
- [x] client/src/index.css design tokens (bg #FAFAF5, text #1E2228, accent #C48F3A)
- [x] Fonts: Lora (heading) + Inter (body) via Bunny CDN (no Google Fonts)
- [x] Full-viewport hero with warm gradient on homepage
- [x] Sticky nav (appears after hero scroll, transparent then solid)
- [x] Mobile hamburger menu
- [x] Mid-article author bio card (AuthorBioCard injected at [AUTHOR_BIO_PLACEHOLDER])
- [x] Single-column content max-width 720px centered

## Pages
- [x] Homepage: scrollable feed of latest articles with full-viewport hero
- [x] Articles index: searchable and filterable by category
- [x] Individual article page with JSON-LD, SEO, and ArticleRenderer
- [x] Tools We Recommend: products grouped by category
- [x] About: Kalesh bio, WebP photo, link to kalesh.love
- [x] Privacy Policy with affiliate disclosure and health disclaimer

## Navigation
- [x] Desktop: sticky nav (Home | Articles | Recommended | About)
- [x] Mobile: hamburger menu
- [x] Footer: Amazon Associates disclosure

## SEO
- [x] JSON-LD Article schema with author Kalesh on every article
- [x] Canonical URLs on every page
- [x] Open Graph tags on every article
- [x] Auto-generated sitemap.xml
- [x] robots.txt allowing all crawlers

## Content - 30 Seed Articles (all generated and inserted)
- [x] What Conscious Aging Really Means and Why It Matters
- [x] The TCM Herbs That Support Longevity After 60
- [x] Why Lion's Mane Mushroom Is Worth Considering for Brain Health
- [x] How to Build a Morning Ritual That Actually Fits Your Age
- [x] The Art of Letting Go: Downsizing Without Losing Yourself
- [x] How Meditation Changes the Aging Brain
- [x] Legacy Letters: How to Write What You Actually Want to Leave Behind
- [x] The Quiet Power of Intergenerational Friendship
- [x] What Ram Dass Taught Me About Getting Older
- [x] CoQ10, Magnesium, and the Supplements Worth Knowing About
- [x] How to Talk to Your Adult Children About End-of-Life Wishes
- [x] The Balance Problem Nobody Talks About After 65
- [x] Grief Is Not a Problem to Solve
- [x] Why Retirement Is the Wrong Frame for the Next Chapter
- [x] The Japanese Concept of Ikigai and What It Means for Elders
- [x] How to Find Your People After 70
- [x] The Case for Slowing Down Deliberately
- [x] What Tai Chi Actually Does for the Aging Body
- [x] The Wisdom of Swedish Death Cleaning
- [x] How to Be a Good Elder in a World That Ignores Elders
- [x] The Science of Loneliness and What Elders Can Do About It
- [x] Why Your Sleep Changes After 60 and What Helps
- [x] Astragalus and the Longevity Herbs of Traditional Chinese Medicine
- [x] The Art of Mentoring: Passing What You Know to the Next Generation
- [x] How to Write Your Memoir When You Think You Have Nothing to Say
- [x] The Spiritual Dimension of Physical Decline
- [x] What Happens When You Stop Fighting Your Age
- [x] The Financial Wisdom Nobody Teaches You Before Retirement
- [x] How to Stay Curious When the World Feels Like It's Moving Too Fast
- [x] The Gift of Limitations: What Constraint Teaches Conscious Elders

## Post-Build Verification (Section 13)
- [x] No Paul Wagner references in source files
- [x] No Manus artifacts in source files
- [x] No hardcoded credentials
- [x] No em-dashes in article bodies
- [x] No Google Fonts (removed from index.html)
- [x] No CloudFront references
- [x] Amazon tag spankyspinola-20 in all affiliate URLs
- [x] No shrikrishna references
- [x] /health returns 200 with status:ok
- [x] /sitemap.xml returns valid XML
- [x] /robots.txt returns correct content
- [x] All 30 articles pass quality gate (correct Amazon URLs, paid link labels, no em-dashes)
- [x] TypeScript check passes (pnpm check)
- [x] Vitest tests pass (22 tests in 2 files)
- [x] .do/app.yaml committed

## Design Rebuild (Critical Fixes)
- [x] Remove all dark/black colors from CSS - full warm cream palette throughout
- [x] Source unique Unsplash images for all 30 articles (topic-matched)
- [x] Source unique hero images for Home, Articles, Recommended, About pages
- [x] Update all article imageUrl and heroImageUrl in database
- [x] Rebuild Home page: warm hero, two-column article feed with images + bylines
- [x] Rebuild Articles index: two-column grid, images, bylines, category badges
- [x] Rebuild ArticleDetail: full-width hero image, byline header, warm body
- [x] Rebuild SiteNav: cream/warm background, no dark overlay
- [x] Rebuild Recommended page with warm design
- [x] Rebuild About page with warm design
- [x] Rebuild Footer with warm design
- [x] Epic, unique, stunning visual identity throughout

## Assessment and Quizzes Feature
- [x] DB table: quiz_results (id, userId, quizId, domain, score, tier, answers JSON, createdAt)
- [x] 6 quiz definitions in shared/quizzes.ts with scored questions
- [x] Quiz scoring engine: domain score, tier (Thriving/Growing/Needs Attention), narrative
- [x] tRPC router: assessments.list, assessments.getQuiz, assessments.score, assessments.history, assessments.latestResult
- [x] Assessment Hub page (/assessments) with hero image and 6 quiz cards
- [x] Quiz page (/assessments/[quizId]) with progress bar and animated question flow
- [x] Results page with score breakdown, personalized narrative, 4-6 Amazon recommendations
- [x] Amazon recommendations: verified ASINs, tag=spankyspinola-20, labeled (paid link)
- [x] Nav link added: Assessments in SiteNav
- [x] Route registered in App.tsx
- [x] Vitest tests for scoring engine (27 tests, all passing)

## Fixes and Deployment
- [x] Hero title: split onto two lines (block spans, guaranteed at all viewports)
- [x] Push to GitHub: peacefulgeek/conscious-elder (HTTPS with token, commit 154ba5f)

- [x] Push to peacefulgeek/conscious-elder on GitHub (HTTPS with token)
- [x] Mobile responsiveness audit complete: all pages have responsive class hooks
- [x] Home: ce-featured-grid, ce-article-grid, ce-footer-grid, ce-section
- [x] Articles: ce-filter-row, ce-article-grid
- [x] ArticleDetail: ce-article-hero (55vw height on mobile)
- [x] Recommended: product-grid (1-col on mobile, 2-col on tablet)
- [x] About: about-grid, about-topics-grid
- [x] Assessments: ce-quiz-grid
- [x] Quiz: ce-quiz-card, ce-likert-row
- [x] QuizResults: flex-column recommendation list (wraps naturally)
- [x] Privacy: single-column, already mobile-safe
- [x] SiteNav: hamburger menu at 768px breakpoint

## About Page Fixes
- [x] Hero title: remove Kalesh's name, use editorial title instead
- [x] Editorial team section above Kalesh bio (3-4 fake team members with roles)
- [x] Kalesh photo: use https://conscious-elder.b-cdn.net/images/kalesh-photo.webp

## Assessment History Page
- [x] Route /assessments/history in App.tsx
- [x] Nav link in Assessments hub page (View my history button)
- [x] Recharts line chart: scores over time per domain
- [x] Table of past results with date, quiz, tier, score
- [x] tRPC: assessments.history already exists

## Products Table Seed
- [x] scripts/seed-products.mjs: 38 products seeded with description and imageUrl
- [x] Verify Tools We Recommend page shows real product cards (38 products, 10 categories)

## SEO / Server Fixes
- [ ] Server-side 301 redirect: www.consciouselder.com -> consciouselder.com
