import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Calendar, Clock, User, ArrowLeft, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { CommentSection } from "@/components/comment-section";
import { ArticleCard } from "@/components/article-card";
import type { ArticleWithAuthor } from "@shared/schema";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<ArticleWithAuthor>({
    queryKey: ["/api/articles/by-slug", slug],
    enabled: !!slug,
  });

  const { data: relatedArticles = [] } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles", { categoryId: article?.categoryId, limit: 3 }],
    enabled: !!article?.categoryId,
  });

  const filteredRelated = relatedArticles.filter((a) => a.id !== article?.id).slice(0, 2);

  const formattedDate = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1">
          <Skeleton className="w-full h-[28rem]" />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-12 w-3/4 mb-6" />
              <Skeleton className="h-6 w-48 mb-8" />
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="font-serif text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              L'article que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {article.coverImageUrl ? (
          <div className="relative h-[28rem] overflow-hidden">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12">
              <Badge
                className="mb-4"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </Badge>
              <h1
                className="font-serif text-4xl md:text-5xl font-bold text-white max-w-4xl leading-tight"
                data-testid="text-article-title"
              >
                {article.title}
              </h1>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 pt-12">
            <Badge
              className="mb-4"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name}
            </Badge>
            <h1
              className="font-serif text-4xl md:text-5xl font-bold max-w-4xl leading-tight"
              data-testid="text-article-title"
            >
              {article.title}
            </h1>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link href={`/auteur/${article.author.username}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={article.author.avatarUrl} />
                    <AvatarFallback>
                      {article.author.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link href={`/auteur/${article.author.username}`}>
                    <span className="font-medium hover:text-primary transition-colors" data-testid="text-author-name">
                      {article.author.displayName}
                    </span>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime} min de lecture
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" data-testid="button-bookmark">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" data-testid="button-share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-4">
                {article.excerpt}
              </p>
            )}

            <article
              className="prose prose-lg dark:prose-invert max-w-none"
              data-testid="article-content"
            >
              {article.content.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </article>

            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      <Badge variant="secondary" data-testid={`tag-${tag.id}`}>
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Card className="mt-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Link href={`/auteur/${article.author.username}`}>
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={article.author.avatarUrl} />
                      <AvatarFallback className="text-xl">
                        {article.author.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Écrit par</p>
                    <Link href={`/auteur/${article.author.username}`}>
                      <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                        {article.author.displayName}
                      </h3>
                    </Link>
                    {article.author.bio && (
                      <p className="text-muted-foreground mt-2">{article.author.bio}</p>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <Link href={`/auteur/${article.author.username}`}>
                        Voir tous ses articles
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <CommentSection articleId={article.id} />

            {filteredRelated.length > 0 && (
              <div className="mt-12">
                <h2 className="font-serif text-2xl font-bold mb-6">
                  Articles similaires
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredRelated.map((relatedArticle) => (
                    <ArticleCard key={relatedArticle.id} article={relatedArticle} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
