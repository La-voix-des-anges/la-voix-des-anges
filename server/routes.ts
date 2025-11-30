import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import {
  loginSchema,
  insertUserSchema,
  insertCategorySchema,
  insertTagSchema,
  insertArticleSchema,
  articleStatuses,
  userRoles,
} from "@shared/schema";
import type { ArticleStatus } from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const SessionStore = MemoryStore(session);

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès interdit" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.seedData();

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "college-journal-secret-key",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  // ============== AUTH ROUTES ==============
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);

      if (!user) {
        return res.status(401).json({ error: "Identifiants incorrects" });
      }

      const validPassword = await bcrypt.compare(data.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Identifiants incorrects" });
      }

      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la déconnexion" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // ============== USER ROUTES ==============
  app.get("/api/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.get("/api/users/public", async (req, res) => {
    const users = await storage.getPublicUsers();
    res.json(users);
  });

  app.get("/api/users/by-username/:username", async (req, res) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);

      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ error: "Ce nom d'utilisateur existe déjà" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.patch("/api/users/:id/role", requireAdmin, async (req, res) => {
    const { role } = req.body;
    if (!userRoles.includes(role)) {
      return res.status(400).json({ error: "Rôle invalide" });
    }

    const user = await storage.updateUser(parseInt(req.params.id), { role });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    if (parseInt(req.params.id) === req.session.userId) {
      return res.status(400).json({ error: "Vous ne pouvez pas vous supprimer vous-même" });
    }

    try {
      const deleted = await storage.deleteUser(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: "Utilisateur non trouvé" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Impossible de supprimer cet utilisateur" });
    }
  });

  // ============== CATEGORY ROUTES ==============
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });

  app.get("/api/categories/with-count", async (req, res) => {
    const categories = await storage.getCategoriesWithCount();
    res.json(categories);
  });

  app.get("/api/categories/by-slug/:slug", async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    res.json(category);
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(data);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(parseInt(req.params.id), data);
      if (!category) {
        return res.status(404).json({ error: "Catégorie non trouvée" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteCategory(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Catégorie non trouvée" });
    }
    res.json({ success: true });
  });

  // ============== TAG ROUTES ==============
  app.get("/api/tags", async (req, res) => {
    const tags = await storage.getAllTags();
    res.json(tags);
  });

  app.post("/api/tags", requireAdmin, async (req, res) => {
    try {
      const data = insertTagSchema.parse(req.body);
      const tag = await storage.createTag(data);
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.delete("/api/tags/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteTag(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Tag non trouvé" });
    }
    res.json({ success: true });
  });

  // ============== ARTICLE ROUTES ==============
  app.get("/api/articles", async (req, res) => {
    const { authorId, categoryId, status, limit } = req.query;
    const filters: { authorId?: number; categoryId?: number; status?: ArticleStatus; limit?: number } = {};

    if (authorId) filters.authorId = parseInt(authorId as string);
    if (categoryId) filters.categoryId = parseInt(categoryId as string);
    if (limit) filters.limit = parseInt(limit as string);

    // Non-authenticated users can only see published articles
    if (!req.session.userId) {
      filters.status = "published";
    } else if (status) {
      filters.status = status as ArticleStatus;
    }

    const articles = await storage.getArticlesWithAuthor(filters);
    res.json(articles);
  });

  app.get("/api/articles/all", requireAdmin, async (req, res) => {
    const { status } = req.query;
    const articles = await storage.getArticlesWithAuthor({
      status: status as ArticleStatus | undefined,
    });
    res.json(articles);
  });

  app.get("/api/articles/recent", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const articles = await storage.getRecentArticles(
      user.role === "admin" ? undefined : user.id
    );
    res.json(articles);
  });

  app.get("/api/articles/by-slug/:slug", async (req, res) => {
    const article = await storage.getArticleBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    // Only allow viewing published articles for non-authenticated users
    if (!req.session.userId && article.status !== "published") {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    res.json(article);
  });

  app.get("/api/articles/:id", requireAuth, async (req, res) => {
    const article = await storage.getArticle(parseInt(req.params.id));
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    // Redacteurs can only see their own articles
    if (user.role !== "admin" && article.authorId !== user.id) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    res.json(article);
  });

  app.post("/api/articles", requireAuth, async (req, res) => {
    try {
      const data = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(data, req.session.userId!);
      res.status(201).json(article);
    } catch (error: any) {
      console.error("Article creation error:", error);
      res.status(400).json({ error: error.message || "Données invalides" });
    }
  });

  app.patch("/api/articles/:id", requireAuth, async (req, res) => {
    try {
      const article = await storage.getArticle(parseInt(req.params.id));
      if (!article) {
        return res.status(404).json({ error: "Article non trouvé" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé" });
      }

      // Redacteurs can only edit their own articles
      if (user.role !== "admin" && article.authorId !== user.id) {
        return res.status(403).json({ error: "Accès interdit" });
      }

      const updated = await storage.updateArticle(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.patch("/api/articles/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!articleStatuses.includes(status)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const article = await storage.updateArticleStatus(parseInt(req.params.id), status);
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.json(article);
  });

  app.delete("/api/articles/:id", requireAuth, async (req, res) => {
    const article = await storage.getArticle(parseInt(req.params.id));
    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    if (user.role !== "admin" && article.authorId !== user.id) {
      return res.status(403).json({ error: "Accès interdit" });
    }

    const deleted = await storage.deleteArticle(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    res.json({ success: true });
  });

  // ============== COMMENT ROUTES ==============
  app.get("/api/comments/:articleId", async (req, res) => {
    const comments = await storage.getCommentsByArticle(parseInt(req.params.articleId));
    res.json(comments);
  });

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const { articleId, parentId, content } = req.body;
      const comment = await storage.createComment({
        articleId: parseInt(articleId),
        parentId: parentId ? parseInt(parentId) : null,
        content,
      }, req.session.userId!);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.delete("/api/comments/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteComment(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Commentaire non trouvé" });
    }
    res.json({ success: true });
  });

  // ============== CHANNEL ROUTES ==============
  app.get("/api/channels", requireAuth, async (req, res) => {
    const channels = await storage.getAllChannels();
    res.json(channels);
  });

  app.post("/api/channels", requireAdmin, async (req, res) => {
    try {
      const { name, description, articleId, isPrivate } = req.body;
      const channel = await storage.createChannel({
        name,
        description: description || "",
        articleId: articleId ? parseInt(articleId) : null,
        isPrivate: isPrivate || false,
      });
      res.status(201).json(channel);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.delete("/api/channels/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteChannel(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Salon non trouvé" });
    }
    res.json({ success: true });
  });

  // ============== MESSAGE ROUTES ==============
  app.get("/api/messages/:channelId", requireAuth, async (req, res) => {
    const messages = await storage.getMessagesByChannel(parseInt(req.params.channelId));
    res.json(messages);
  });

  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const { channelId, content } = req.body;
      const message = await storage.createMessage({
        channelId: parseInt(channelId),
        content,
      }, req.session.userId!);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Données invalides" });
    }
  });

  app.delete("/api/messages/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteMessage(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Message non trouvé" });
    }
    res.json({ success: true });
  });

  // ============== DASHBOARD ROUTES ==============
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    const user = await storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const stats = await storage.getDashboardStats(user.id, user.role === "admin");
    res.json(stats);
  });

  return httpServer;
}
