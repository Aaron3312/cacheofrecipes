// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronRight, Utensils, Heart, Search, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Descubre, Guarda y Comparte<br />
            Recetas Deliciosas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            CacheOfRecipes te ayuda a encontrar inspiración culinaria, guardar tus recetas favoritas y compartir tus opiniones con la comunidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/recipes">
                Explorar Recetas
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">
                Crear Cuenta
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Busca Recetas</h3>
            <p className="text-muted-foreground">
              Encuentra miles de recetas para cualquier ocasión, dieta o preferencia.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Guarda Favoritos</h3>
            <p className="text-muted-foreground">
              Guarda tus recetas favoritas para acceder a ellas fácilmente después.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Califica y Comenta</h3>
            <p className="text-muted-foreground">
              Comparte tus experiencias y opiniones sobre las recetas con la comunidad.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Recetas Detalladas</h3>
            <p className="text-muted-foreground">
              Accede a instrucciones paso a paso, información nutricional e ingredientes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 bg-primary/5 rounded-2xl">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a nuestra comunidad y comienza a descubrir nuevas delicias culinarias hoy mismo.
          </p>
          <Button size="lg" asChild>
            <Link href="/recipes">
              Explorar Recetas
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}




