// src/app/(main)/favorites/page.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/context/auth-context';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { favorites, loading, error } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!user) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl">Iniciando sesión...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mis Recetas Favoritas</h1>
        <p className="text-muted-foreground">
          Tu colección personal de recetas guardadas.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-red-500">Error al cargar favoritos: {error}</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-12 text-center space-y-4">
          <div className="inline-flex h-20 w-20 rounded-full bg-muted items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-xl">Aún no tienes recetas favoritas</p>
          <p className="text-muted-foreground">
            Explora nuestras recetas y guarda tus favoritas para acceder a ellas fácilmente.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/recipes">Explorar Recetas</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((favorite) => (
            <RecipeCard key={favorite.id} recipe={favorite.recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
