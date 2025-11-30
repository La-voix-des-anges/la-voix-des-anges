import { pgTable, text, varchar, boolean, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============== USERS ==============
export const userRoles = ["admin", "redacteur"] as const;
export type UserRole = (typeof userRoles)[number];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  displayName: varchar("display_name", { length: 200 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("redacteur"),
  bio: text("bio").default(""),
  avatarUrl: text("avatar_url").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  comments: many(comments),
  messages: many(messages),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true }).extend({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  displayName: z.string().min(2, "Le nom affiché doit contenir au moins 2 caractères"),
  role: z.enum(userRoles).default("redacteur"),
  bio: z.string().default(""),
  avatarUrl: z.string().default(""),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const loginSchema = z.object({
  username: z.string().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// ============== CATEGORIES ==============
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").default(""),
  color: varchar("color", { length: 20 }).default("#3b82f6"),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}));

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true }).extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères"),
  description: z.string().default(""),
  color: z.string().default("#3b82f6"),
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ============== TAGS ==============
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

export const insertTagSchema = createInsertSchema(tags).omit({ id: true }).extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères"),
});

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

// ============== ARTICLES ==============
export const articleStatuses = ["draft", "pending", "published", "rejected"] as const;
export type ArticleStatus = (typeof articleStatuses)[number];

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt").default(""),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url").default(""),
  authorId: integer("author_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  readTime: integer("read_time").default(1),
});

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
  articleTags: many(articleTags),
}));

export const insertArticleSchema = createInsertSchema(articles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true, 
  readTime: true,
  publishedAt: true,
  authorId: true,
}).extend({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères"),
  excerpt: z.string().default(""),
  content: z.string().min(50, "Le contenu doit contenir au moins 50 caractères"),
  coverImageUrl: z.string().default(""),
  categoryId: z.number().min(1, "Une catégorie est requise"),
  tagIds: z.array(z.number()).default([]),
  status: z.enum(articleStatuses).default("draft"),
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type UpdateArticle = Partial<InsertArticle>;

// ============== ARTICLE TAGS (Junction Table) ==============
export const articleTags = pgTable("article_tags", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

// ============== COMMENTS ==============
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  isApproved: boolean("is_approved").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const insertCommentSchema = createInsertSchema(comments).omit({ 
  id: true, 
  createdAt: true,
  isApproved: true,
  authorId: true,
}).extend({
  articleId: z.number().min(1),
  parentId: z.number().nullable().default(null),
  content: z.string().min(3, "Le commentaire doit contenir au moins 3 caractères"),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// ============== DISCUSSIONS (Internal Team Chat) ==============
export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").default(""),
  articleId: integer("article_id").references(() => articles.id, { onDelete: "set null" }),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const channelsRelations = relations(channels, ({ one, many }) => ({
  article: one(articles, {
    fields: [channels.articleId],
    references: [articles.id],
  }),
  messages: many(messages),
}));

export const insertChannelSchema = createInsertSchema(channels).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().default(""),
  articleId: z.number().nullable().default(null),
  isPrivate: z.boolean().default(false),
});

export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  channelId: integer("channel_id").notNull().references(() => channels.id, { onDelete: "cascade" }),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  author: one(users, {
    fields: [messages.authorId],
    references: [users.id],
  }),
}));

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, authorId: true }).extend({
  channelId: z.number().min(1),
  content: z.string().min(1, "Le message ne peut pas être vide"),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ============== API RESPONSE TYPES ==============
export type SafeUser = Omit<User, "password">;

export interface ArticleWithAuthor extends Article {
  author: SafeUser;
  category: Category;
  tags: Tag[];
}

export interface CommentWithAuthor extends Comment {
  author: SafeUser;
  replies?: CommentWithAuthor[];
}

export interface MessageWithAuthor extends Message {
  author: SafeUser;
}

export interface ChannelWithDetails extends Channel {
  article?: Article | null;
  lastMessage?: MessageWithAuthor | null;
  unreadCount?: number;
}

export interface DashboardStats {
  totalArticles: number;
  pendingReviews: number;
  publishedArticles: number;
  totalComments: number;
  totalUsers: number;
}
