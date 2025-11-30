import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, PenLine, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/lib/auth";
import type { Article } from "@shared/schema";

export default function MyArticlesPage() {
  const { user } = useAuth();

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { authorId: user?.id }],
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Mes articles</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos articles et suivez leur statut.
          </p>
        </div>
        <Button asChild data-testid="button-new-article">
          <Link href="/dashboard/nouveau">
            <PenLine className="h-4 w-4 mr-2" />
            Nouvel article
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière modification</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id} data-testid={`row-article-${article.id}`}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/article/${article.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={article.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`menu-article-${article.id}`}>
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
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore créé d'article.
              </p>
              <Button asChild>
                <Link href="/dashboard/nouveau" data-testid="button-first-article">
                  <PenLine className="h-4 w-4 mr-2" />
                  Créer mon premier article
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
