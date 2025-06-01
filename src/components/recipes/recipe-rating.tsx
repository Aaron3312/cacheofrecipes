// src/components/recipes/recipe-rating.tsx
'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReviews } from '@/hooks/use-reviews';

interface RecipeRatingProps {
  recipeId: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
  // Nueva prop para controlar si debe cargar datos automáticamente
  autoLoad?: boolean;
}

export function RecipeRating({ 
  recipeId, 
  size = 'md', 
  showCount = true, 
  className,
  autoLoad = false // Por defecto NO carga automáticamente
}: RecipeRatingProps) {
  const [average, setAverage] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  // Solo usar el hook si autoLoad está habilitado
  const { reviews, getAverageRating, loading } = useReviews(autoLoad ? recipeId : undefined);
  
  useEffect(() => {
    if (autoLoad && !loading && reviews.length >= 0) {
      setAverage(getAverageRating());
      setReviewCount(reviews.length);
    }
  }, [reviews, getAverageRating, loading, autoLoad]);
  
  const starSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Si no está configurado para cargar automáticamente, mostrar placeholder
  if (!autoLoad) {
    return (
      <div className={cn("flex items-center", className)}>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(starSizes[size], "text-muted-foreground/30 fill-none")}
            />
          ))}
        </div>
        {showCount && (
          <span className={cn("ml-2 text-muted-foreground", textSizes[size])}>
            Sin reseñas
          </span>
        )}
      </div>
    );
  }

  // Si está cargando, mostrar esqueleto
  if (loading) {
    return (
      <div className={cn("flex items-center", className)}>
        <div className="flex animate-pulse">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(starSizes[size], "text-muted-foreground/20")}
            />
          ))}
        </div>
        {showCount && (
          <div className={cn("ml-2 bg-muted animate-pulse rounded h-4 w-16", textSizes[size])} />
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSizes[size],
              star <= Math.round(average) 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-muted-foreground/30 fill-none"
            )}
          />
        ))}
      </div>
      
      {showCount && (
        <span className={cn("ml-2 text-muted-foreground", textSizes[size])}>
          {average > 0 
            ? `${average.toFixed(1)} (${reviewCount})`
            : 'Sin reseñas'}
        </span>
      )}
    </div>
  );
}