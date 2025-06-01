// src/components/recipes/recipe-grid.tsx
'use client';

import { Recipe } from '@/types/recipe';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { cn } from '@/lib/utils';

interface RecipeGridProps {
  recipes: Recipe[];
  variant?: 'default' | 'compact';
  className?: string;
}

export function RecipeGrid({ recipes, variant = 'default', className }: RecipeGridProps) {
  const gridClasses = variant === 'compact' 
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={cn(
      'grid gap-6',
      gridClasses,
      className
    )}>
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          variant={variant}
        />
      ))}
    </div>
  );
}