import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";
import bcrypt from "bcrypt";
import {
  users,
  categories,
  tags,
  articles,
  articleTags,
  comments,
  channels,
  messages,
  type User,
  type SafeUser,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Tag,
  type InsertTag,
  type Article,
  type InsertArticle,
  type UpdateArticle,
  type ArticleStatus,
  type Comment,
  type InsertComment,
  type Channel,
  type InsertChannel,
  type Message,
  type InsertMessage,
  type ArticleWithAuthor,
  type CommentWithAuthor,
  type MessageWithAuthor,
  type ChannelWithDetails,
  type DashboardStats,
} from "@shared/schema";

function stripPassword(user: User): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}

function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<SafeUser[]>;
  getPublicUsers(): Promise<(SafeUser & { articleCount: number })[]>;

  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;
  getCategoriesWithCount(): Promise<(Category & { articleCount: number })[]>;

  // Tags
  getTag(id: number): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  deleteTag(id: number): Promise<boolean>;
  getAllTags(): Promise<Tag[]>;

  // Articles
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleWithAuthor | undefined>;
  createArticle(article: InsertArticle, authorId: number): Promise<Article>;
  updateArticle(id: number, data: UpdateArticle): Promise<Article | undefined>;
  updateArticleStatus(id: number, status: ArticleStatus): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  getArticles(filters?: { authorId?: number; categoryId?: number; status?: ArticleStatus; limit?: number }): Promise<Article[]>;
  getArticlesWithAuthor(filters?: { authorId?: number; categoryId?: number; status?: ArticleStatus; limit?: number }): Promise<ArticleWithAuthor[]>;
  getRecentArticles(authorId?: number): Promise<Article[]>;

  // Comments
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment, authorId: number): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  approveComment(id: number): Promise<Comment | undefined>;
  getCommentsByArticle(articleId: number): Promise<CommentWithAuthor[]>;

  // Channels
  getChannel(id: number): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  deleteChannel(id: number): Promise<boolean>;
  getAllChannels(): Promise<ChannelWithDetails[]>;

  // Messages
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage, authorId: number): Promise<Message>;
  deleteMessage(id: number): Promise<boolean>;
  getMessagesByChannel(channelId: number): Promise<MessageWithAuthor[]>;

  // Dashboard
  getDashboardStats(userId?: number, isAdmin?: boolean): Promise<DashboardStats>;

  // Seed
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async seedData(): Promise<void> {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      // Even if users exist, ensure MATBRION account exists
      const matbrionUser = await this.getUserByUsername("MATBRION");
      if (!matbrionUser) {
        const hashedPassword = await bcrypt.hash("438564", 10);
        await db.insert(users).values({
          username: "MATBRION",
          password: hashedPassword,
          displayName: "MATBRION",
          role: "admin",
          bio: "Administrateur principal",
          avatarUrl: "",
        });
      }
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const matbrionPassword = await bcrypt.hash("438564", 10);

    const [admin] = await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      displayName: "Administrateur",
      role: "admin",
      bio: "Responsable du journal du collège.",
      avatarUrl: "",
    }).returning();

    const [matbrion] = await db.insert(users).values({
      username: "MATBRION",
      password: matbrionPassword,
      displayName: "MATBRION",
      role: "admin",
      bio: "Administrateur principal",
      avatarUrl: "",
    }).returning();

    const [redacteur] = await db.insert(users).values({
      username: "redacteur",
      password: hashedPassword,
      displayName: "Marie Dupont",
      role: "redacteur",
      bio: "Élève de 3ème passionnée par l'écriture.",
      avatarUrl: "",
    }).returning();

    const categoriesData = [
      { name: "Actualités", slug: "actualites", description: "Les dernières nouvelles du collège", color: "#3b82f6" },
      { name: "Sport", slug: "sport", description: "Résultats et événements sportifs", color: "#22c55e" },
      { name: "Culture", slug: "culture", description: "Arts, musique et littérature", color: "#8b5cf6" },
      { name: "Vie scolaire", slug: "vie-scolaire", description: "Événements et vie au quotidien", color: "#f59e0b" },
    ];

    const insertedCategories = await db.insert(categories).values(categoriesData).returning();

    const tagsData = [
      { name: "Interview", slug: "interview" },
      { name: "Événement", slug: "evenement" },
      { name: "Projet", slug: "projet" },
      { name: "Concours", slug: "concours" },
    ];

    const insertedTags = await db.insert(tags).values(tagsData).returning();

    const [article1] = await db.insert(articles).values({
      title: "La rentrée scolaire : ce qui change cette année",
      slug: "rentree-scolaire-nouveautes",
      excerpt: "Découvrez toutes les nouveautés pour cette nouvelle année scolaire au collège.",
      content: "Cette année, de nombreuses nouveautés attendent les élèves du collège. Entre les nouveaux aménagements de la cour, les activités périscolaires enrichies et les projets pédagogiques innovants, il y a beaucoup à découvrir.\n\nLe nouveau CDI a été entièrement rénové avec un espace lecture plus confortable et des ordinateurs flambant neufs. Les élèves pourront également profiter d'un club journal animé par des élèves volontaires.\n\nCôté sport, l'association sportive propose désormais de nouvelles activités : escalade, badminton et danse moderne rejoignent les sports traditionnels.",
      coverImageUrl: "",
      authorId: admin.id,
      categoryId: insertedCategories[0].id,
      status: "published",
      publishedAt: new Date(),
      readTime: 3,
    }).returning();

    const [article2] = await db.insert(articles).values({
      title: "L'équipe de football remporte le tournoi inter-collèges",
      slug: "victoire-football-tournoi",
      excerpt: "Une victoire mémorable pour nos joueurs face à 8 autres établissements de la région.",
      content: "C'est une victoire historique ! Notre équipe de football a remporté le tournoi inter-collèges après une finale palpitante.\n\nMenés par le capitaine Lucas Martin, les joueurs ont fait preuve d'une détermination sans faille tout au long de la compétition. En finale, ils ont affronté le collège Jean Moulin dans un match serré qui s'est terminé 2-1.\n\nTous les élèves et enseignants félicitent l'équipe pour cette belle performance !",
      coverImageUrl: "",
      authorId: redacteur.id,
      categoryId: insertedCategories[1].id,
      status: "published",
      publishedAt: new Date(Date.now() - 86400000),
      readTime: 2,
    }).returning();

    await db.insert(articleTags).values([
      { articleId: article1.id, tagId: insertedTags[1].id },
      { articleId: article1.id, tagId: insertedTags[2].id },
      { articleId: article2.id, tagId: insertedTags[0].id },
      { articleId: article2.id, tagId: insertedTags[3].id },
    ]);

    await db.insert(channels).values({
      name: "général",
      description: "Discussions générales de l'équipe",
      articleId: null,
      isPrivate: false,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getAllUsers(): Promise<SafeUser[]> {
    const allUsers = await db.select().from(users);
    return allUsers.map(stripPassword);
  }

  async getPublicUsers(): Promise<(SafeUser & { articleCount: number })[]> {
    const allUsers = await db.select().from(users);
    const result: (SafeUser & { articleCount: number })[] = [];

    for (const user of allUsers) {
      const userArticles = await db
        .select()
        .from(articles)
        .where(and(eq(articles.authorId, user.id), eq(articles.status, "published")));
      result.push({ ...stripPassword(user), articleCount: userArticles.length });
    }

    return result;
  }

  // Categories
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoriesWithCount(): Promise<(Category & { articleCount: number })[]> {
    const allCategories = await db.select().from(categories);
    const result: (Category & { articleCount: number })[] = [];

    for (const category of allCategories) {
      const categoryArticles = await db
        .select()
        .from(articles)
        .where(and(eq(articles.categoryId, category.id), eq(articles.status, "published")));
      result.push({ ...category, articleCount: categoryArticles.length });
    }

    return result;
  }

  // Tags
  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag;
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db.insert(tags).values(insertTag).returning();
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    await db.delete(tags).where(eq(tags.id, id));
    return true;
  }

  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tags);
  }

  // Articles
  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticleBySlug(slug: string): Promise<ArticleWithAuthor | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    if (!article) return undefined;

    const author = await this.getUser(article.authorId);
    const category = await this.getCategory(article.categoryId);
    
    if (!author || !category) return undefined;

    const tagJoins = await db
      .select()
      .from(articleTags)
      .where(eq(articleTags.articleId, article.id));
    
    const articleTagsList: Tag[] = [];
    for (const join of tagJoins) {
      const tag = await this.getTag(join.tagId);
      if (tag) articleTagsList.push(tag);
    }

    return {
      ...article,
      author: stripPassword(author),
      category,
      tags: articleTagsList,
    };
  }

  async createArticle(insertArticle: InsertArticle, authorId: number): Promise<Article> {
    const { tagIds, ...articleData } = insertArticle;
    const now = new Date();

    const [article] = await db.insert(articles).values({
      ...articleData,
      authorId,
      publishedAt: insertArticle.status === "published" ? now : null,
      readTime: calculateReadTime(insertArticle.content),
    }).returning();

    if (tagIds && tagIds.length > 0) {
      await db.insert(articleTags).values(
        tagIds.map((tagId) => ({ articleId: article.id, tagId }))
      );
    }

    return article;
  }

  async updateArticle(id: number, data: UpdateArticle): Promise<Article | undefined> {
    const { tagIds, ...articleData } = data;

    const updateData: any = {
      ...articleData,
      updatedAt: new Date(),
    };

    if (data.content) {
      updateData.readTime = calculateReadTime(data.content);
    }

    const [article] = await db.update(articles).set(updateData).where(eq(articles.id, id)).returning();
    
    if (tagIds !== undefined) {
      await db.delete(articleTags).where(eq(articleTags.articleId, id));
      if (tagIds.length > 0) {
        await db.insert(articleTags).values(
          tagIds.map((tagId) => ({ articleId: id, tagId }))
        );
      }
    }

    return article;
  }

  async updateArticleStatus(id: number, status: ArticleStatus): Promise<Article | undefined> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "published") {
      updateData.publishedAt = new Date();
    }

    const [article] = await db.update(articles).set(updateData).where(eq(articles.id, id)).returning();
    return article;
  }

  async deleteArticle(id: number): Promise<boolean> {
    await db.delete(articles).where(eq(articles.id, id));
    return true;
  }

  async getArticles(filters?: { authorId?: number; categoryId?: number; status?: ArticleStatus; limit?: number }): Promise<Article[]> {
    let query = db.select().from(articles);
    const conditions = [];

    if (filters?.authorId) {
      conditions.push(eq(articles.authorId, filters.authorId));
    }
    if (filters?.categoryId) {
      conditions.push(eq(articles.categoryId, filters.categoryId));
    }
    if (filters?.status) {
      conditions.push(eq(articles.status, filters.status));
    }

    let result;
    if (conditions.length > 0) {
      result = await db.select().from(articles).where(and(...conditions)).orderBy(desc(articles.updatedAt));
    } else {
      result = await db.select().from(articles).orderBy(desc(articles.updatedAt));
    }

    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  }

  async getArticlesWithAuthor(filters?: { authorId?: number; categoryId?: number; status?: ArticleStatus; limit?: number }): Promise<ArticleWithAuthor[]> {
    const articleList = await this.getArticles(filters);
    const result: ArticleWithAuthor[] = [];

    for (const article of articleList) {
      const author = await this.getUser(article.authorId);
      const category = await this.getCategory(article.categoryId);
      
      if (!author || !category) continue;

      const tagJoins = await db
        .select()
        .from(articleTags)
        .where(eq(articleTags.articleId, article.id));
      
      const articleTagsList: Tag[] = [];
      for (const join of tagJoins) {
        const tag = await this.getTag(join.tagId);
        if (tag) articleTagsList.push(tag);
      }

      result.push({
        ...article,
        author: stripPassword(author),
        category,
        tags: articleTagsList,
      });
    }

    return result;
  }

  async getRecentArticles(authorId?: number): Promise<Article[]> {
    return this.getArticles({ authorId, limit: 10 });
  }

  // Comments
  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }

  async createComment(insertComment: InsertComment, authorId: number): Promise<Comment> {
    const [comment] = await db.insert(comments).values({
      ...insertComment,
      authorId,
      isApproved: true,
    }).returning();
    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    await db.delete(comments).where(eq(comments.id, id));
    return true;
  }

  async approveComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db.update(comments).set({ isApproved: true }).where(eq(comments.id, id)).returning();
    return comment;
  }

  async getCommentsByArticle(articleId: number): Promise<CommentWithAuthor[]> {
    const allComments = await db
      .select()
      .from(comments)
      .where(and(eq(comments.articleId, articleId), eq(comments.isApproved, true)))
      .orderBy(comments.createdAt);

    const rootComments = allComments.filter((c) => !c.parentId);
    const result: CommentWithAuthor[] = [];

    for (const comment of rootComments) {
      const author = await this.getUser(comment.authorId);
      if (!author) continue;

      const replies: CommentWithAuthor[] = [];
      for (const reply of allComments.filter((c) => c.parentId === comment.id)) {
        const replyAuthor = await this.getUser(reply.authorId);
        if (replyAuthor) {
          replies.push({ ...reply, author: stripPassword(replyAuthor) });
        }
      }

      result.push({ ...comment, author: stripPassword(author), replies });
    }

    return result;
  }

  // Channels
  async getChannel(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel;
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const [channel] = await db.insert(channels).values(insertChannel).returning();
    return channel;
  }

  async deleteChannel(id: number): Promise<boolean> {
    await db.delete(channels).where(eq(channels.id, id));
    return true;
  }

  async getAllChannels(): Promise<ChannelWithDetails[]> {
    const allChannels = await db.select().from(channels);
    const result: ChannelWithDetails[] = [];

    for (const channel of allChannels) {
      const channelMessages = await this.getMessagesByChannel(channel.id);
      const lastMessage = channelMessages[channelMessages.length - 1] || null;
      const article = channel.articleId ? await this.getArticle(channel.articleId) : null;

      result.push({
        ...channel,
        article,
        lastMessage,
        unreadCount: 0,
      });
    }

    return result;
  }

  // Messages
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(insertMessage: InsertMessage, authorId: number): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      authorId,
    }).returning();
    return message;
  }

  async deleteMessage(id: number): Promise<boolean> {
    await db.delete(messages).where(eq(messages.id, id));
    return true;
  }

  async getMessagesByChannel(channelId: number): Promise<MessageWithAuthor[]> {
    const channelMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.channelId, channelId))
      .orderBy(messages.createdAt);

    const result: MessageWithAuthor[] = [];
    for (const message of channelMessages) {
      const author = await this.getUser(message.authorId);
      if (author) {
        result.push({ ...message, author: stripPassword(author) });
      }
    }

    return result;
  }

  // Dashboard
  async getDashboardStats(userId?: number, isAdmin?: boolean): Promise<DashboardStats> {
    const allArticles = await db.select().from(articles);
    const allUsers = await db.select().from(users);
    const allComments = await db.select().from(comments);

    const articlesToCount = isAdmin
      ? allArticles
      : userId
        ? allArticles.filter((a) => a.authorId === userId)
        : allArticles;

    return {
      totalArticles: articlesToCount.length,
      pendingReviews: allArticles.filter((a) => a.status === "pending").length,
      publishedArticles: articlesToCount.filter((a) => a.status === "published").length,
      totalComments: allComments.length,
      totalUsers: allUsers.length,
    };
  }
}

export const storage = new DatabaseStorage();
