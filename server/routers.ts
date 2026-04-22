import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getPublishedArticles, getArticleBySlug, searchArticles,
  getArticleCount, getValidProducts
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  articles: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }).optional())
      .query(async ({ input }) => {
        const { limit = 20, offset = 0 } = input ?? {};
        const [items, total] = await Promise.all([
          getPublishedArticles(limit, offset),
          getArticleCount(),
        ]);
        return { items, total };
      }),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const article = await getArticleBySlug(input.slug);
        if (!article) throw new Error('Article not found');
        return article;
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string().default(''),
        category: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        return searchArticles(input.query, input.category, input.limit, input.offset);
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return getValidProducts();
    }),
    recommended: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(40) }).optional())
      .query(async ({ input }) => {
        const { limit = 40 } = input ?? {};
        return getValidProducts(limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
