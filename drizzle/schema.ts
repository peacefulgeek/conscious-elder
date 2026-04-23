import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Articles table - stores all published and draft articles.
 * tags and asinsUsed are stored as JSON strings (text) for TiDB compatibility.
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  metaDescription: varchar("metaDescription", { length: 320 }),
  ogTitle: varchar("ogTitle", { length: 512 }),
  ogDescription: varchar("ogDescription", { length: 320 }),
  category: varchar("category", { length: 128 }),
  tags: text("tags").default("[]"),
  imageUrl: text("imageUrl"),
  imageAlt: varchar("imageAlt", { length: 320 }),
  heroImageUrl: text("heroImageUrl"),
  body: text("body").notNull(),
  wordCount: int("wordCount").default(0),
  readingTime: int("readingTime").default(0),
  author: varchar("author", { length: 64 }).default("Kalesh").notNull(),
  ctaPrimary: text("ctaPrimary"),
  asinsUsed: text("asinsUsed").default("[]"),
  openerType: mysqlEnum("openerType", ["gut-punch", "question", "story", "counterintuitive"]),
  conclusionType: mysqlEnum("conclusionType", ["call-to-action", "reflection", "question", "challenge", "benediction"]),
  hasKaleshBacklink: boolean("hasKaleshBacklink").default(false),
  faqCount: int("faqCount").default(0),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("published").notNull(),
  lastRefreshed30d: timestamp("lastRefreshed30d"),
  lastRefreshed90d: timestamp("lastRefreshed90d"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt").defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Products table - the affiliate product catalog.
 * tags stored as JSON string for TiDB compatibility.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  asin: varchar("asin", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 512 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  category: varchar("category", { length: 128 }).notNull(),
  tags: text("tags").default("[]"),
  verifiedAt: timestamp("verifiedAt"),
  lastChecked: timestamp("lastChecked"),
  status: mysqlEnum("status", ["valid", "invalid", "pending"]).default("pending").notNull(),
  lastSpotlightedAt: timestamp("lastSpotlightedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Quiz results table - stores assessment results for logged-in users.
 * answers stored as JSON string for TiDB compatibility.
 */
export const quizResults = mysqlTable("quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizId: varchar("quizId", { length: 64 }).notNull(),
  domain: varchar("domain", { length: 128 }).notNull(),
  score: int("score").notNull(),
  maxScore: int("maxScore").notNull(),
  tier: mysqlEnum("tier", ["thriving", "growing", "needs-attention"]).notNull(),
  answers: text("answers").default("[]"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = typeof quizResults.$inferInsert;
