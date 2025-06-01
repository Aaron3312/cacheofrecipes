// src/types/favorites.ts
export interface UserFavorite {
  id: string;
  userId: string;
  recipeId: number;
  createdAt: Date;
  recipe: Recipe;
}

