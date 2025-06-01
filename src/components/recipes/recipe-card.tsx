// src/components/recipes/recipe-card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Recipe } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, Users, DollarSign, Zap, Leaf } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';
import { RecipeRating } from '@/components/recipes/recipe-rating';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  variant?: 'default' | 'compact';
}

export function RecipeCard({ recipe, variant = 'default' }: RecipeCardProps) {
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
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return `https://spoonacular.com/recipeImages/${imageUrl}`;
  };

  // Función para obtener el nivel de dificultad basado en tiempo
  const getDifficultyLevel = (readyInMinutes: number) => {
    if (readyInMinutes <= 15) return { label: 'Rápido', color: 'bg-green-100 text-green-800' };
    if (readyInMinutes <= 30) return { label: 'Fácil', color: 'bg-blue-100 text-blue-800' };
    if (readyInMinutes <= 60) return { label: 'Medio', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Largo', color: 'bg-red-100 text-red-800' };
  };

  // Función para obtener el indicador de precio
  const getPriceLevel = (pricePerServing?: number) => {
    if (!pricePerServing) return null;
    
    const price = pricePerServing / 100; // Convertir centavos a dólares
    if (price <= 2) return { label: 'Económico', icon: DollarSign, color: 'text-green-600' };
    if (price <= 5) return { label: 'Moderado', icon: DollarSign, color: 'text-yellow-600' };
    return { label: 'Premium', icon: DollarSign, color: 'text-red-600' };
  };

  const imageUrl = getImageUrl(recipe.image);
  const difficulty = getDifficultyLevel(recipe.readyInMinutes || 30);
  const priceLevel = getPriceLevel(recipe.pricePerServing);

  // Obtener etiquetas principales (máximo 3 para no saturar)
  const getMainTags = () => {
    const tags = [];
    if (recipe.vegetarian) tags.push({ label: 'Vegetariano', color: 'bg-green-100 text-green-800', icon: Leaf });
    if (recipe.vegan) tags.push({ label: 'Vegano', color: 'bg-green-100 text-green-800', icon: Leaf });
    if (recipe.glutenFree) tags.push({ label: 'Sin Gluten', color: 'bg-yellow-100 text-yellow-800' });
    if (recipe.dairyFree) tags.push({ label: 'Sin Lácteos', color: 'bg-blue-100 text-blue-800' });
    if (recipe.veryHealthy) tags.push({ label: 'Saludable', color: 'bg-emerald-100 text-emerald-800', icon: Zap });
    if (recipe.cheap) tags.push({ label: 'Económico', color: 'bg-orange-100 text-orange-800' });
    
    return tags.slice(0, 3); // Máximo 3 etiquetas
  };

  const mainTags = getMainTags();

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className={cn(
        "overflow-hidden h-full transition-all hover:shadow-lg hover:scale-[1.02] group",
        variant === 'compact' ? 'max-w-sm' : ''
      )}>
        <div className="relative aspect-video overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Sin imagen</span>
            </div>
          )}
          
          {/* Badge de dificultad */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className={cn("text-xs", difficulty.color)}>
              {difficulty.label}
            </Badge>
          </div>

          {/* Botón de favorito */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90",
              isFavorite(recipe.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleFavoriteClick}
            disabled={isLoading}
          >
            <Heart className={cn("h-5 w-5", isFavorite(recipe.id) ? "fill-current" : "fill-none")} />
            <span className="sr-only">Favorito</span>
          </Button>

          {/* Health Score si está disponible */}
          {recipe.healthScore && recipe.healthScore > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  recipe.healthScore >= 80 ? "bg-green-100 text-green-800" :
                  recipe.healthScore >= 60 ? "bg-yellow-100 text-yellow-800" :
                  "bg-orange-100 text-orange-800"
                )}
              >
                ❤️ {recipe.healthScore}
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-1">
          {/* Título */}
          <h3 className="font-semibold line-clamp-2 text-base mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          
          {/* Rating - SIN auto-load para evitar requests innecesarios */}
          <div className="mb-3">
            <RecipeRating 
              recipeId={recipe.id} 
              size="sm" 
              showCount={false}
              autoLoad={true} // NO cargar automáticamente en las cards
              className="justify-start"

            />
          </div>

          {/* Información básica */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              {recipe.readyInMinutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.readyInMinutes}m</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings}</span>
                </div>
              )}
            </div>
            
            {/* Precio */}
            {priceLevel && (
              <div className="flex items-center gap-1">
                <priceLevel.icon className={cn("h-4 w-4", priceLevel.color)} />
                <span className={cn("text-xs", priceLevel.color)}>{priceLevel.label}</span>
              </div>
            )}
          </div>

          {/* Etiquetas principales */}
          {mainTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mainTags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary" 
                  className={cn("text-xs px-2 py-0.5", tag.color)}
                >
                  {tag.icon && <tag.icon className="h-3 w-3 mr-1" />}
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Footer con información adicional */}
        <CardFooter className="p-4 pt-0 border-t bg-muted/30">
          <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {/* Spoonacular Score */}
              {recipe.spoonacularScore && (
                <span className="font-medium">
                  📊 {Math.round(recipe.spoonacularScore)}
                </span>
              )}
              
              {/* Cuisines */}
              {recipe.cuisines && recipe.cuisines.length > 0 && (
                <span className="capitalize">
                  🍽️ {recipe.cuisines[0]}
                </span>
              )}
            </div>

            {/* Indicadores adicionales */}
            <div className="flex items-center gap-1">
              {recipe.veryPopular && (
                <span title="Muy popular">🔥</span>
              )}
              {recipe.sustainable && (
                <span title="Sostenible">🌱</span>
              )}
              {recipe.ketogenic && (
                <span title="Keto">🥑</span>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}