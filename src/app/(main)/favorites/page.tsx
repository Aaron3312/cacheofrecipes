// src/app/(main)/favorites/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useFavorites } from '@/hooks/use-favorites';
import { RecipeGrid } from '@/components/recipes/recipe-grid';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Search } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { favorites, isLoading, error } = useFavorites();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="py-12 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Inicia sesión para ver tus favoritos</h1>
        <p className="text-muted-foreground mb-4">
          Necesitas iniciar sesión para guardar y ver tus recetas favoritas.
        </p>
        <Button asChild>
          <Link href="/login">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          Mis Recetas Favoritas
        </h1>
        <p className="text-muted-foreground">
          Todas las recetas que has guardado como favoritas.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-red-500 text-xl mb-2">Error al cargar favoritos</p>
          <p className="text-muted-foreground mb-4">
            No se pudieron cargar tus recetas favoritas. Por favor, intenta de nuevo.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </Button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-12 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No tienes recetas favoritas aún</h2>
          <p className="text-muted-foreground mb-6">
            Explora nuestra colección de recetas y marca las que más te gusten como favoritas.
          </p>
          <Button asChild>
            <Link href="/recipes" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorar Recetas
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'receta favorita' : 'recetas favoritas'}
            </p>
            <Button variant="outline" asChild>
              <Link href="/recipes" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Buscar más recetas
              </Link>
            </Button>
          </div>

          {/* Usar RecipeGrid para consistencia visual */}
          <RecipeGrid 
            recipes={favorites.map(fav => fav.recipe)} 
            className="animate-in fade-in-50 duration-500"
          />
        </>
      )}
    </div>
  );
}