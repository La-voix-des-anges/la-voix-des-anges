import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  FileText,
  Clock,
  CheckCircle,
  Users,
  PenLine,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";
import type { Article, DashboardStats } from "@shared/schema";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
            {value}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentArticles = [], isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles/recent"],
  });

  const { data: pendingArticles = [], isLoading: pendingLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { status: "pending" }],
    enabled: isAdmin,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold" data-testid="text-dashboard-title">
          Bonjour, {user?.displayName} !
        </h1>
        <p className="text-muted-foreground mt-1">
          Voici un aperçu de votre activité.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total articles"
          value={stats?.totalArticles ?? 0}
          icon={FileText}
          isLoading={statsLoading}
        />
        <StatCard
          title="En attente"
          value={stats?.pendingReviews ?? 0}
          icon={Clock}
          isLoading={statsLoading}
        />
        <StatCard
          title="Publiés"
          value={stats?.publishedArticles ?? 0}
          icon={CheckCircle}
          isLoading={statsLoading}
        />
        {isAdmin && (
          <StatCard
            title="Rédacteurs"
            value={stats?.totalUsers ?? 0}
            icon={Users}
            isLoading={statsLoading}
          />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Mes derniers articles</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/articles" data-testid="link-view-all-articles">
                Voir tout <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentArticles.length > 0 ? (
              <div className="space-y-3">
                {recentArticles.slice(0, 5).map((article) => (
                  <Link
                    key={article.id}
                    href={`/dashboard/article/${article.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                    data-testid={`link-article-${article.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{article.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <StatusBadge status={article.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore d'articles.
                </p>
                <Button asChild>
                  <Link href="/dashboard/nouveau" data-testid="link-create-article">
                    <PenLine className="h-4 w-4 mr-2" />
                    Créer mon premier article
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg">Articles en attente</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/tous-les-articles" data-testid="link-pending-articles">
                  Voir tout <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : pendingArticles.length > 0 ? (
                <div className="space-y-3">
                  {pendingArticles.slice(0, 5).map((article) => (
                    <Link
                      key={article.id}
                      href={`/dashboard/article/${article.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover-elevate"
                      data-testid={`link-pending-${article.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{article.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <StatusBadge status={article.status} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Aucun article en attente de validation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href="/dashboard/nouveau" data-testid="link-new-article">
                  <PenLine className="h-4 w-4 mr-2" />
                  Écrire un nouvel article
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard/discussions" data-testid="link-discussions">
                  Accéder aux discussions
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
