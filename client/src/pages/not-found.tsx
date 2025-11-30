import { Link } from "wouter";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="font-serif text-2xl font-semibold mb-4">
            Page introuvable
          </h2>
          <p className="text-muted-foreground mb-8">
            Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                <Search className="h-4 w-4 mr-2" />
                Parcourir les articles
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
