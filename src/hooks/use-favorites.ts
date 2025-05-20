// src/hooks/use-favorites.ts
'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Recipe, RecipeDetail } from '@/types/recipe';
import { UserFavorite } from '@/types/favorites';
import { recipeApi } from '@/lib/api';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar favoritos cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', user.uid));

    // Usar onSnapshot para actualizaciones en tiempo real
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          // Transformar documentos a UserFavorite y cargar datos de recetas
          const favoritesPromises = snapshot.docs.map(async (doc) => {
            const data = doc.data();
            let recipe: Recipe | null = null;

            try {
              // Intentar obtener los datos de la receta
              const recipeData = await recipeApi.getRecipeById(data.recipeId);
              recipe = recipeData;
            } catch (error) {
              console.error(`Error loading recipe ${data.recipeId}:`, error);
              // Continuar incluso si no se puede cargar una receta
            }

            return {
              id: doc.id,
              userId: data.userId,
              recipeId: data.recipeId,
              createdAt: data.createdAt.toDate(),
              recipe: recipe as Recipe,
            } as UserFavorite;
          });

          const loadedFavorites = await Promise.all(favoritesPromises);
          // Filtrar favoritos donde la receta se pudo cargar
          const validFavorites = loadedFavorites.filter(fav => fav.recipe);
          
          setFavorites(validFavorites);
          setLoading(false);
        } catch (err) {
          console.error('Error loading favorites:', err);
          setError('Error al cargar favoritos');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Favorites snapshot error:', err);
        setError('Error al escuchar cambios en favoritos');
        setLoading(false);
      }
    );

    // Limpiar la suscripción
    return () => unsubscribe();
  }, [user]);

  // Verificar si una receta está en favoritos
  const isFavorite = (recipeId: number): boolean => {
    return favorites.some((fav) => fav.recipeId === recipeId);
  };

  // Obtener el ID del documento de favorito
  const getFavoriteId = (recipeId: number): string | null => {
    const favorite = favorites.find((fav) => fav.recipeId === recipeId);
    return favorite ? favorite.id : null;
  };

  // Añadir a favoritos
  const addToFavorites = async (recipe: Recipe | RecipeDetail): Promise<void> => {
    if (!user) {
      setError('Debes iniciar sesión para guardar favoritos');
      throw new Error('Debes iniciar sesión para guardar favoritos');
    }

    try {
      // Comprobar si ya está en favoritos
      if (isFavorite(recipe.id)) {
        return;
      }

      // Añadir a la colección de favoritos
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        recipeId: recipe.id,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setError('Error al añadir a favoritos');
      throw new Error('Error al añadir a favoritos');
    }
  };

  // Eliminar de favoritos
  const removeFromFavorites = async (recipeId: number): Promise<void> => {
    if (!user) {
      setError('Debes iniciar sesión para gestionar favoritos');
      throw new Error('Debes iniciar sesión para gestionar favoritos');
    }

    try {
      const favoriteId = getFavoriteId(recipeId);
      if (!favoriteId) {
        return;
      }

      // Eliminar de la colección de favoritos
      await deleteDoc(doc(db, 'favorites', favoriteId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Error al eliminar de favoritos');
      throw new Error('Error al eliminar de favoritos');
    }
  };

  // Alternar favorito
  const toggleFavorite = async (recipe: Recipe | RecipeDetail): Promise<void> => {
    if (isFavorite(recipe.id)) {
      await removeFromFavorites(recipe.id);
    } else {
      await addToFavorites(recipe);
    }
  };

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
  };
};

