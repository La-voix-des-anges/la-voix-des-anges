import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { ArticleCard } from "@/components/article-card";
import type { Category, ArticleWithAuthor } from "@shared/schema";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading, error } = useQuery<Category>({
    queryKey: ["/api/categories/by-slug", slug],
    enabled: !!slug,
  });

  const { data: articles = [], isLoading: articlesLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles", { categoryId: category?.id, status: "published" }],
    enabled: !!category?.id,
  });

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="font-serif text-3xl font-bold mb-4">Catégorie non trouvée</h1>
            <p className="text-muted-foreground mb-8">
              La catégorie que vous recherchez n'existe pas.
            </p>
            <Button asChild>
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voir toutes les catégories
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
        <div
          className="py-12"
          style={{ backgroundColor: `${category.color}10` }}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${category.color}30` }}
              >
                <FolderOpen className="h-6 w-6" style={{ color: category.color }} />
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold" data-testid="text-category-name">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-muted-foreground mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <CardContent>
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground text-lg">
                  Aucun article dans cette catégorie pour le moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
