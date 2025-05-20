// src/components/recipes/recipe-card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      await toggleFavorite(recipe);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para asegurar que la URL de la imagen sea válida
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    
    // Si ya es una URL completa, usarla
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Si es una ruta relativa, convertirla a una URL completa de Spoonacular
    return `https://spoonacular.com/recipeImages/${imageUrl}`;
  };

  const imageUrl = getImageUrl(recipe.image);

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm",
              isFavorite(recipe.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            <Heart className={cn("h-5 w-5", isFavorite(recipe.id) ? "fill-current" : "fill-none")} />
            <span className="sr-only">Favorito</span>
          </Button>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2 text-base mb-1">{recipe.title}</h3>
          
          <div className="flex items-center text-sm text-muted-foreground">
            {recipe.readyInMinutes && (
              <span className="mr-4">{recipe.readyInMinutes} minutos</span>
            )}
            {recipe.servings && (
              <span>{recipe.servings} porciones</span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between text-xs">
          <div className="flex flex-wrap gap-1">
            {recipe.vegetarian && (
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Vegetariano</span>
            )}
            {recipe.vegan && (
              <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Vegano</span>
            )}
            {recipe.glutenFree && (
              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Sin Gluten</span>
            )}
            {recipe.dairyFree && (
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Sin Lácteos</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}