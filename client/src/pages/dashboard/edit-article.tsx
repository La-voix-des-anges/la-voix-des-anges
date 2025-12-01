import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleEditor } from "@/components/article-editor";
import type { Article } from "@shared/schema";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const articleId = id ? parseInt(id, 10) : undefined;

  console.log("EditArticlePage - raw id:", id, "parsed articleId:", articleId);

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ["/api/articles", articleId],
    enabled: !!articleId,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-[600px] rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-16">
        <h1 className="font-serif text-2xl font-bold mb-4">Article non trouvé</h1>
        <p className="text-muted-foreground mb-8">
          L'article que vous cherchez n'existe pas ou a été supprimé.
        </p>
        <Button asChild>
          <Link href="/dashboard/articles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à mes articles
          </Link>
        </Button>
      </div>
    );
  }

  return <ArticleEditor article={article} mode="edit" articleId={articleId} />;
}
