import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FolderOpen, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import type { Category } from "@shared/schema";

interface CategoryWithCount extends Category {
  articleCount: number;
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery<CategoryWithCount[]>({
    queryKey: ["/api/categories/with-count"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold mb-4">Catégories</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explorez nos articles par thématique.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/categorie/${category.slug}`}>
                  <Card
                    className="h-full hover-elevate group"
                    data-testid={`card-category-${category.id}`}
                  >
                    <CardContent className="p-6">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <FolderOpen
                          className="h-6 w-6"
                          style={{ color: category.color }}
                        />
                      </div>
                      <h3 className="font-semibold text-lg mb-1" data-testid="text-category-name">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {category.articleCount} article{category.articleCount !== 1 ? "s" : ""}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <CardContent>
                <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground text-lg">
                  Aucune catégorie pour le moment.
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
