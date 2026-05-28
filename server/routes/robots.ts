import express from 'express';
export const robotsRouter = express.Router();

robotsRouter.get('/', (_req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(`# The Conscious Elder\nUser-agent: *\nAllow: /\nDisallow: /api/\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Claude-Web\nAllow: /\n\nUser-agent: anthropic-ai\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Perplexity-User\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: CCBot\nAllow: /\n\nUser-agent: Applebot\nAllow: /\n\nUser-agent: Applebot-Extended\nAllow: /\n\nUser-agent: DuckAssistBot\nAllow: /\n\nUser-agent: Meta-ExternalAgent\nAllow: /\n\nUser-agent: YouBot\nAllow: /\n\nUser-agent: MistralAI-User\nAllow: /\n\nUser-agent: Cohere-AI\nAllow: /\n\nSitemap: https://consciouselder.com/sitemap.xml\nSitemap: https://consciouselder.com/llms.txt\nSitemap: https://consciouselder.com/llms-full.txt\n`);
});
