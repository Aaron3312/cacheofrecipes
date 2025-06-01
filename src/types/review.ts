
// src/types/review.ts
export interface Review {
  id: string;
  userId: string;
  recipeId: number;
  rating: number;
  comment: string;
  createdAt: Date;
  userName: string;
  userPhotoURL?: string;
}

