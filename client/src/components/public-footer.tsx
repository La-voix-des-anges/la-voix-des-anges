import { Link } from "wouter";
import { Newspaper, Heart } from "lucide-react";

export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Newspaper className="h-6 w-6 text-primary" />
              <span className="font-serif text-lg font-bold">Le Journal du Collège</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              Le journal en ligne de notre collège, rédigé par les élèves pour les élèves.
              Actualités, culture, sport et vie scolaire.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-home">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-categories">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/auteurs" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-authors">
                  Rédacteurs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/a-propos" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-about">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-legal">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground" data-testid="text-copyright">
            {currentYear} Le Journal du Collège. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Fait avec <Heart className="h-4 w-4 text-destructive" /> par les élèves
          </p>
        </div>
      </div>
    </footer>
  );
}
