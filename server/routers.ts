import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getPublishedArticles, getArticleBySlug, searchArticles,
  getArticleCount, getValidProducts, saveQuizResult, getQuizHistory, getLatestQuizResultByDomain
} from "./db";
import { getHerbs, getHerbCategories } from './bunny-store';
import { notifyOwner } from './_core/notification';
import { protectedProcedure } from "./_core/trpc";
import { QUIZZES, QUIZ_MAP, scoreToTier } from "../shared/quizzes";

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

    related: publicProcedure
      .input(z.object({ slug: z.string(), category: z.string().optional(), limit: z.number().min(1).max(6).default(3) }))
      .query(async ({ input }) => {
        const results = await searchArticles('', input.category, input.limit + 1, 0);
        // Exclude the current article (searchArticles returns array directly)
        return results.filter((a: { slug: string }) => a.slug !== input.slug).slice(0, input.limit);
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

  herbs: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        tradition: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(200).default(200),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { category, tradition, search, limit = 200, offset = 0 } = input ?? {};
        const items = await getHerbs({ category, tradition, search, limit, offset });
        return { items, total: items.length };
      }),

    categories: publicProcedure.query(async () => {
      return getHerbCategories();
    }),
  }),

  assessments: router({
    // Return all quiz definitions (metadata only, no answers)
    list: publicProcedure.query(() => {
      return QUIZZES.map(q => ({
        id: q.id,
        domain: q.domain,
        title: q.title,
        subtitle: q.subtitle,
        heroImage: q.heroImage,
        heroAlt: q.heroAlt,
        icon: q.icon,
        color: q.color,
        questionCount: q.questions.length,
      }));
    }),

    // Return a single quiz definition with all questions
    getQuiz: publicProcedure
      .input(z.object({ quizId: z.string() }))
      .query(({ input }) => {
        const quiz = QUIZ_MAP[input.quizId];
        if (!quiz) throw new Error('Quiz not found');
        return {
          id: quiz.id,
          domain: quiz.domain,
          title: quiz.title,
          subtitle: quiz.subtitle,
          heroImage: quiz.heroImage,
          heroAlt: quiz.heroAlt,
          icon: quiz.icon,
          color: quiz.color,
          questions: quiz.questions,
        };
      }),

    // Score a completed quiz and return results + recommendations
    // Works for anonymous users too (no DB save)
    score: publicProcedure
      .input(z.object({
        quizId: z.string(),
        answers: z.array(z.object({ questionId: z.string(), value: z.number().min(1).max(5) })),
      }))
      .mutation(async ({ input, ctx }) => {
        const quiz = QUIZ_MAP[input.quizId];
        if (!quiz) throw new Error('Quiz not found');

        const totalScore = input.answers.reduce((sum, a) => sum + a.value, 0);
        const maxScore = quiz.questions.length * 5;
        const tier = scoreToTier(totalScore, maxScore);
        const tierResult = quiz.tiers[tier];

        // Save to DB if user is logged in
        if (ctx.user) {
          try {
            await saveQuizResult({
              userId: ctx.user.id,
              quizId: input.quizId,
              domain: quiz.domain,
              score: totalScore,
              maxScore,
              tier,
              answers: JSON.stringify(input.answers),
            });
          } catch (err) {
            console.error('[assessments.score] Failed to save result:', err);
          }
        }

        return {
          quizId: input.quizId,
          domain: quiz.domain,
          score: totalScore,
          maxScore,
          percentage: Math.round((totalScore / maxScore) * 100),
          tier,
          tierLabel: tierResult.label,
          headline: tierResult.headline,
          narrative: tierResult.narrative,
          recommendations: tierResult.recommendations,
          saved: !!ctx.user,
        };
      }),

    // Get quiz history for logged-in user
    history: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        const { limit = 20 } = input ?? {};
        return getQuizHistory(ctx.user.id, limit);
      }),

    // Get latest result for a specific quiz (for logged-in user)
    latestResult: protectedProcedure
      .input(z.object({ quizId: z.string() }))
      .query(async ({ ctx, input }) => {
        return getLatestQuizResultByDomain(ctx.user.id, input.quizId);
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const BUNNY_STORAGE = 'https://ny.storage.bunnycdn.com/conscious-elder';
        const BUNNY_KEY = process.env.BUNNY_STORAGE_KEY || 'f6dbc11c-20dc-4c15-a39faabe3d28-a766-4a87';
        const CDN_BASE = 'https://conscious-elder.b-cdn.net';

        // Fetch existing subscribers (or start fresh)
        let subscribers: Array<{ email: string; subscribedAt: string }> = [];
        try {
          const res = await fetch(`${CDN_BASE}/data/subscribers.json`, {
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            subscribers = await res.json();
          }
        } catch {
          // File doesn't exist yet — start with empty array
        }

        // Duplicate check
        const alreadySubscribed = subscribers.some(
          s => s.email.toLowerCase() === input.email.toLowerCase()
        );
        if (alreadySubscribed) {
          return { success: true, alreadySubscribed: true };
        }

        // Append new subscriber
        subscribers.push({ email: input.email, subscribedAt: new Date().toISOString() });

        // Write back to Bunny CDN
        const putRes = await fetch(`${BUNNY_STORAGE}/data/subscribers.json`, {
          method: 'PUT',
          headers: {
            AccessKey: BUNNY_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscribers, null, 2),
        });

        if (!putRes.ok) {
          throw new Error(`Failed to save subscriber: HTTP ${putRes.status}`);
        }

        // Notify owner
        try {
          await notifyOwner({
            title: 'New newsletter subscriber',
            content: `${input.email} just signed up for The Conscious Elder newsletter. Total subscribers: ${subscribers.length}`,
          });
        } catch {
          // Non-fatal — don't fail the subscription if notification fails
        }

        return { success: true, alreadySubscribed: false };
      }),
  }),
});

export type AppRouter = typeof appRouter;

