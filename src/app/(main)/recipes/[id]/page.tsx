// src/app/(main)/recipes/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useRecipeDetail } from '@/hooks/use-recipes';
import { RecipeDetailView } from '@/components/recipes/recipe-detail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RecipeDetailPage() {
  const params = useParams();
  const recipeId = params?.id ? parseInt(params.id as string) : undefined;
  
  const { recipe, isLoading, error } = useRecipeDetail(recipeId);

  return (
    <div className="mb-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/recipes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a recetas
        </Link>
      </Button>

      {isLoading ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ) : error ? (
        <div className="py-12 text-center">
          <p className="text-xl text-red-500">Error al cargar la receta</p>
          <p className="text-muted-foreground mt-2">
            No se pudo cargar la información de esta receta. Por favor, intenta de nuevo más tarde.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/recipes">Volver a recetas</Link>
          </Button>
        </div>
      ) : recipe ? (
        <RecipeDetailView recipe={recipe} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-xl">Receta no encontrada</p>
          <p className="text-muted-foreground mt-2">
            La receta que buscas no existe o no está disponible.
          </p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/recipes">Volver a recetas</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
