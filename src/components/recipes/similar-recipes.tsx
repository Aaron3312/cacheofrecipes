// src/components/recipes/similar-recipes.tsx (continuación)
'use client';

import { useSimilarRecipes } from '@/hooks/use-recipes';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Skeleton } from '@/components/ui/skeleton';

interface SimilarRecipesProps {
  recipeId: number;
  count?: number;
}

export function SimilarRecipes({ recipeId, count = 4 }: SimilarRecipesProps) {
  const { recipes, isLoading, error } = useSimilarRecipes(recipeId, count);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(count).fill(null).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">Error al cargar recetas similares.</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">No se encontraron recetas similares.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}