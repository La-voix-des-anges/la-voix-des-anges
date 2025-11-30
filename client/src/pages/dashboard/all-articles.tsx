import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  FileText,
  CheckCircle,
  XCircle,
  Edit,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { StatusBadge } from "@/components/status-badge";
import type { Article, ArticleStatus, User } from "@shared/schema";

interface ArticleWithAuthor extends Article {
  author: User;
}

export default function AllArticlesPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | "all">("all");

  const { data: articles = [], isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ["/api/articles/all", { status: statusFilter === "all" ? undefined : statusFilter }],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      articleId,
      status,
    }: {
      articleId: string;
      status: ArticleStatus;
    }) => {
      return apiRequest("PATCH", `/api/articles/${articleId}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      const statusMessages: Record<ArticleStatus, string> = {
        published: "Article publié avec succès.",
        rejected: "Article rejeté.",
        draft: "Article mis en brouillon.",
        pending: "Article mis en attente.",
      };
      toast({
        title: "Statut mis à jour",
        description: statusMessages[variables.status],
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (articleId: string, status: ArticleStatus) => {
    updateStatusMutation.mutate({ articleId, status });
  };

  const filteredArticles =
    statusFilter === "all"
      ? articles
      : articles.filter((a) => a.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tous les articles</h1>
          <p className="text-muted-foreground mt-1">
            Gérez et validez les articles de l'équipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as ArticleStatus | "all")
            }
          >
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id} data-testid={`row-article-${article.id}`}>
                    <TableCell className="font-medium max-w-xs">
                      <Link
                        href={`/dashboard/article/${article.id}`}
                        className="hover:text-primary transition-colors line-clamp-1"
                      >
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/auteur/${article.author.username}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {article.author.displayName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={article.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updateStatusMutation.isPending}
                            data-testid={`menu-article-${article.id}`}
                          >
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/article/${article.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          {article.status === "published" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/article/${article.slug}`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Voir en ligne
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {article.status !== "published" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(article.id, "published")
                              }
                              data-testid={`action-publish-${article.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Publier
                            </DropdownMenuItem>
                          )}
                          {article.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(article.id, "rejected")
                              }
                              className="text-destructive"
                              data-testid={`action-reject-${article.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="font-semibold text-lg mb-2">Aucun article</h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "Aucun article n'a été créé."
                  : `Aucun article avec le statut "${statusFilter}".`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
