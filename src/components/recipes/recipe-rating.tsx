
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
}

export function RecipeRating({ recipeId, size = 'md', showCount = true, className }: RecipeRatingProps) {
  const { reviews, getAverageRating } = useReviews(recipeId);
  const [average, setAverage] = useState(0);
  
  useEffect(() => {
    setAverage(getAverageRating());
  }, [reviews, getAverageRating]);
  
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
                : "text-muted stroke-muted-foreground fill-none"
            )}
          />
        ))}
      </div>
      
      {showCount && (
        <span className={cn("ml-2 text-muted-foreground", textSizes[size])}>
          {average > 0 
            ? `${average.toFixed(1)} (${reviews.length} ${reviews.length === 1 ? 'reseña' : 'reseñas'})`
            : 'Sin reseñas'}
        </span>
      )}
    </div>
  );
}

