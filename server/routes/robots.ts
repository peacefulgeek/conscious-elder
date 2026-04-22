import express from 'express';
export const robotsRouter = express.Router();

robotsRouter.get('/', (_req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /

Sitemap: https://consciouselder.com/sitemap.xml
`);
});
