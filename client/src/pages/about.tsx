import { Link } from "wouter";
import { Newspaper, Users, PenLine, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Newspaper className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
              Le Journal du Collège
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Bienvenue sur le journal en ligne de notre collège ! Ce projet est
              entièrement rédigé et géré par les élèves, pour les élèves.
            </p>
          </div>
        </section>

        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">
              Notre mission
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                    <PenLine className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Informer</h3>
                  <p className="text-muted-foreground">
                    Partager les actualités du collège, les événements et les
                    projets de notre communauté scolaire.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Rassembler</h3>
                  <p className="text-muted-foreground">
                    Créer un lien entre les élèves, les enseignants et les
                    familles autour de notre vie scolaire.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Exprimer</h3>
                  <p className="text-muted-foreground">
                    Donner la parole aux élèves et leur permettre de s'exprimer
                    sur les sujets qui les concernent.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-center mb-8">
              Rejoindre l'équipe
            </h2>
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground mb-6 text-center">
                  Vous êtes passionné par l'écriture, la photo ou simplement
                  curieux ? Rejoignez notre équipe de rédaction ! Contactez un
                  professeur référent ou un membre de l'équipe pour en savoir
                  plus.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link href="/connexion">Se connecter</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/auteurs">Voir l'équipe</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
