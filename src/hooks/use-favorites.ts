// src/hooks/use-favorites.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { UserFavorite } from '@/types/favorites';
import { Recipe } from '@/types/recipe';
import { recipeApi } from '@/lib/api';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar solo los IDs de favoritos primero (sin detalles de recetas)
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const favoritesRef = collection(db, 'favorites');
    const q = query(favoritesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const favoriteData = snapshot.docs.map((doc) => ({
            id: doc.id,
            userId: doc.data().userId,
            recipeId: doc.data().recipeId,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }));

          // Crear Set de IDs para verificación rápida
          const newFavoriteIds = new Set(favoriteData.map(fav => fav.recipeId));
          setFavoriteIds(newFavoriteIds);

          // Solo cargar detalles de recetas si estamos en la página de favoritos
          // (determinado por si hay favoritos y necesitamos mostrarlos)
          const shouldLoadRecipeDetails = window.location.pathname === '/favorites';
          
          if (shouldLoadRecipeDetails && favoriteData.length > 0) {
            console.log('📱 Cargando detalles de recetas favoritas...');
            
            // Cargar detalles de recetas en lotes para evitar muchas requests
            const recipeIds = favoriteData.map(fav => fav.recipeId);
            const batchSize = 3; // Procesar de 3 en 3 para no sobrecargar
            const allRecipes: Recipe[] = [];
            
            for (let i = 0; i < recipeIds.length; i += batchSize) {
              const batch = recipeIds.slice(i, i + batchSize);
              const promises = batch.map(async (recipeId) => {
                try {
                  return await recipeApi.getRecipeById(recipeId, false); // Sin nutrición para ser más rápido
                } catch (error) {
                  console.warn(`Error loading recipe ${recipeId}:`, error);
                  return null;
                }
              });
              
              const batchResults = await Promise.all(promises);
              allRecipes.push(...batchResults.filter(Boolean) as Recipe[]);
              
              // Pequeña pausa entre lotes
              if (i + batchSize < recipeIds.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }

            // Combinar datos de favoritos con detalles de recetas
            const favoritesWithRecipes = favoriteData
              .map(fav => {
                const recipe = allRecipes.find(r => r.id === fav.recipeId);
                return recipe ? { ...fav, recipe } : null;
              })
              .filter(Boolean) as UserFavorite[];

            setFavorites(favoritesWithRecipes);
          } else {
            // Solo guardar los IDs sin cargar detalles
            setFavorites([]);
          }

          setIsLoading(false);
        } catch (err) {
          console.error('Error loading favorites:', err);
          setError('Error al cargar favoritos');
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Favorites snapshot error:', err);
        setError('Error al escuchar cambios en favoritos');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Verificar si una receta es favorita (usando el Set para búsqueda O(1))
  const isFavorite = useCallback((recipeId: number): boolean => {
    return favoriteIds.has(recipeId);
  }, [favoriteIds]);

  // Alternar estado de favorito
  const toggleFavorite = async (recipe: Recipe): Promise<void> => {
    if (!user) {
      throw new Error('Debes iniciar sesión para gestionar favoritos');
    }

    try {
      if (isFavorite(recipe.id)) {
        // Eliminar de favoritos
        const favoritesRef = collection(db, 'favorites');
        const q = query(
          favoritesRef, 
          where('userId', '==', user.uid),
          where('recipeId', '==', recipe.id)
        );
        
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map(docSnapshot => 
          deleteDoc(doc(db, 'favorites', docSnapshot.id))
        );
        
        await Promise.all(deletePromises);
      } else {
        // Añadir a favoritos
        await addDoc(collection(db, 'favorites'), {
          userId: user.uid,
          recipeId: recipe.id,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw new Error('Error al actualizar favoritos');
    }
  };

  // Cargar detalles de favoritos bajo demanda
  const loadFavoriteDetails = async (): Promise<UserFavorite[]> => {
    if (!user || favoriteIds.size === 0) {
      return [];
    }

    setIsLoading(true);
    try {
      const recipeIds = Array.from(favoriteIds);
      const recipes = await Promise.all(
        recipeIds.map(async (recipeId) => {
          try {
            return await recipeApi.getRecipeById(recipeId, false);
          } catch (error) {
            console.warn(`Error loading recipe ${recipeId}:`, error);
            return null;
          }
        })
      );

      // Obtener datos de favoritos de Firestore
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const favoriteData = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        recipeId: doc.data().recipeId,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      // Combinar datos
      const favoritesWithRecipes = favoriteData
        .map(fav => {
          const recipe = recipes.find(r => r?.id === fav.recipeId);
          return recipe ? { ...fav, recipe } : null;
        })
        .filter(Boolean) as UserFavorite[];

      setFavorites(favoritesWithRecipes);
      return favoritesWithRecipes;
    } catch (err) {
      console.error('Error loading favorite details:', err);
      throw new Error('Error al cargar detalles de favoritos');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    favorites,
    favoriteIds: Array.from(favoriteIds),
    isLoading,
    error,
    isFavorite,
    toggleFavorite,
    loadFavoriteDetails,
  };
};