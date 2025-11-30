import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, Loader2, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArticleCard } from "@/components/article-card";
import type { ArticleWithAuthor, Category } from "@shared/schema";

function ArticleCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/9]" />
      <CardContent className="p-5">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-4" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { data: articles = [], isLoading: articlesLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles", { status: "published" }],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const featuredArticle = articles[0];
  const latestArticles = articles.slice(1, 7);
  const trendingArticles = articles.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {articlesLoading ? (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="aspect-[16/9] rounded-lg" />
              </div>
              <div className="space-y-4">
                <ArticleCardSkeleton />
              </div>
            </div>
          </div>
        ) : featuredArticle ? (
          <section className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ArticleCard article={featuredArticle} variant="featured" />
              </div>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Tendances
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {trendingArticles.slice(0, 3).map((article, index) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="flex gap-3 group"
                        data-testid={`link-trending-${article.id}`}
                      >
                        <span className="text-3xl font-serif font-bold text-muted-foreground/30">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min
                          </p>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        ) : (
          <section className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="font-serif text-4xl font-bold mb-4">
                Bienvenue sur Le Journal du Collège
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Le journal en ligne de notre collège, rédigé par les élèves pour les élèves.
                Actualités, culture, sport et vie scolaire.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild>
                  <Link href="/connexion">Rejoindre l'équipe</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/a-propos">En savoir plus</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {!categoriesLoading && categories.length > 0 && (
          <section className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold">Catégories</h2>
              <Button variant="ghost" asChild>
                <Link href="/categories" data-testid="link-all-categories">
                  Voir tout <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Link key={category.id} href={`/categorie/${category.slug}`}>
                  <Badge
                    variant="secondary"
                    className="px-4 py-2 text-sm cursor-pointer hover-elevate"
                    style={{
                      backgroundColor: `${category.color}15`,
                      color: category.color,
                      borderColor: `${category.color}30`,
                    }}
                    data-testid={`badge-category-${category.id}`}
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold">Derniers articles</h2>
            <Button variant="ghost" asChild>
              <Link href="/articles" data-testid="link-all-articles">
                Voir tout <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          ) : latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <CardContent>
                <p className="text-muted-foreground">
                  Aucun article pour le moment. Revenez bientôt !
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
