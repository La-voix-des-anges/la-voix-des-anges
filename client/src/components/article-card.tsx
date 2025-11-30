import { Link } from "wouter";
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ArticleWithAuthor } from "@shared/schema";

interface ArticleCardProps {
  article: ArticleWithAuthor;
  variant?: "default" | "featured" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  if (variant === "featured") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Card className="group overflow-hidden border-0 bg-transparent hover-elevate" data-testid={`card-article-featured-${article.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            {article.coverImageUrl ? (
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="font-serif text-4xl text-primary/30">J</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="mb-3" style={{ backgroundColor: article.category.color }}>
                {article.category.name}
              </Badge>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2" data-testid="text-article-title">
                {article.title}
              </h2>
              <p className="text-white/80 text-sm line-clamp-2 mb-4">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={article.author.avatarUrl} />
                    <AvatarFallback className="text-xs">
                      {article.author.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{article.author.displayName}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/article/${article.slug}`}>
        <Card className="group hover-elevate" data-testid={`card-article-compact-${article.id}`}>
          <CardContent className="p-4 flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
              {article.coverImageUrl ? (
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="font-serif text-xl text-primary/30">J</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2 text-xs">
                {article.category.name}
              </Badge>
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors" data-testid="text-article-title">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{article.author.displayName}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime} min
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/article/${article.slug}`}>
      <Card className="group overflow-hidden h-full hover-elevate" data-testid={`card-article-${article.id}`}>
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.coverImageUrl ? (
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="font-serif text-4xl text-primary/30">J</span>
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <Badge
            variant="secondary"
            className="mb-3"
            style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
          >
            {article.category.name}
          </Badge>
          <h3 className="font-serif text-xl font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors" data-testid="text-article-title">
            {article.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={article.author.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {article.author.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{article.author.displayName}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime} min
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
