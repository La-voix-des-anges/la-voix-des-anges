import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import type { User } from "@shared/schema";

interface AuthorWithStats extends User {
  articleCount: number;
}

export default function AuthorsPage() {
  const { data: authors = [], isLoading } = useQuery<AuthorWithStats[]>({
    queryKey: ["/api/users/public"],
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold mb-4">Nos Rédacteurs</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Découvrez l'équipe de rédacteurs qui fait vivre le journal du collège.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : authors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {authors.map((author) => (
                <Link key={author.id} href={`/auteur/${author.username}`}>
                  <Card className="h-full hover-elevate" data-testid={`card-author-${author.id}`}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={author.avatarUrl} />
                        <AvatarFallback className="text-xl">
                          {author.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate" data-testid="text-author-name">
                          {author.displayName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {author.role === "admin" ? "Administrateur" : "Rédacteur"}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {author.articleCount} article{author.articleCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {author.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {author.bio}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <CardContent>
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground text-lg">
                  Aucun rédacteur pour le moment.
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
