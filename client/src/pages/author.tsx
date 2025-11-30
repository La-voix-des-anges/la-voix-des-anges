import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArticleCard } from "@/components/article-card";
import type { User, ArticleWithAuthor } from "@shared/schema";

export default function AuthorPage() {
  const { username } = useParams<{ username: string }>();

  const { data: author, isLoading: authorLoading, error } = useQuery<User>({
    queryKey: ["/api/users/by-username", username],
    enabled: !!username,
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles", { authorId: author?.id, status: "published" }],
    enabled: !!author?.id,
  });

  if (authorLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 mb-12">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="font-serif text-3xl font-bold mb-4">Auteur non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              L'auteur que vous recherchez n'existe pas.
            </p>
            <Button asChild>
              <Link href="/auteurs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voir tous les auteurs
              </Link>
            </Button>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const joinDate = new Date(author.createdAt).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={author.avatarUrl} />
                  <AvatarFallback className="text-4xl">
                    {author.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-serif text-3xl font-bold mb-2" data-testid="text-author-name">
                    {author.displayName}
                  </h1>
                  <p className="text-muted-foreground mb-4" data-testid="text-author-role">
                    {author.role === "admin" ? "Administrateur" : "Rédacteur"}
                  </p>
                  {author.bio && (
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {author.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {articles.length} article{articles.length !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Membre depuis {joinDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl font-bold mb-6">
              Articles de {author.displayName}
            </h2>

            {articlesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <CardContent>
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Aucun article publié pour le moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
