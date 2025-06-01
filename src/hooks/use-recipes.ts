// src/hooks/use-recipes.ts
'use client';

import { useState, useEffect } from 'react';
import { Recipe, RecipeDetail, RecipeSearchParams, RecipeSearchResponse } from '@/types/recipe';
import { recipeApi } from '@/lib/api';

export const useRecipeSearch = (initialParams: RecipeSearchParams = {}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [number] = useState(12); // Resultados por página
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams, setSearchParams] = useState<RecipeSearchParams>(initialParams);

  // Función para actualizar parámetros de búsqueda
  const updateSearchParams = (newParams: Partial<RecipeSearchParams>) => {
    const updatedParams = { ...searchParams, ...newParams };
    setSearchParams(updatedParams);
  };

  // Efecto para ejecutar búsqueda cuando cambian los parámetros
  useEffect(() => {
    const performSearch = async () => {
      // Si no hay parámetros, cargar recetas aleatorias
      if (Object.keys(searchParams).length === 0 || 
          (!searchParams.query && !searchParams.cuisine && !searchParams.diet && 
           !searchParams.type && !searchParams.intolerances)) {
        try {
          setIsLoading(true);
          setError(null);
          
          console.log('📱 Cargando recetas aleatorias...');
          const result = await recipeApi.getRandomRecipes(number);
          setRecipes(result.recipes);
          setTotalResults(result.recipes.length);
          setOffset(0);
          console.log(`✅ Cargadas ${result.recipes.length} recetas aleatorias`);
        } catch (err) {
          console.error('❌ Error loading random recipes:', err);
          setError(err as Error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const currentOffset = searchParams.offset || 0;
        
        // Configurar parámetros de búsqueda (simplificados)
        const searchConfig: RecipeSearchParams = {
          query: searchParams.query,
          cuisine: searchParams.cuisine,
          diet: searchParams.diet,
          intolerances: searchParams.intolerances,
          type: searchParams.type,
          maxReadyTime: searchParams.maxReadyTime,
          number,
          offset: currentOffset
        };

        // Filtrar parámetros undefined
        const cleanedConfig = Object.fromEntries(
          Object.entries(searchConfig).filter(([_, value]) => value !== undefined)
        ) as RecipeSearchParams;

        console.log('🔍 Búsqueda con parámetros:', cleanedConfig);
        
        const result: RecipeSearchResponse = await recipeApi.searchRecipes(cleanedConfig);
        
        if (currentOffset === 0) {
          // Nueva búsqueda - reemplazar recetas
          setRecipes(result.results);
        } else {
          // Cargar más - agregar recetas
          setRecipes(prev => [...prev, ...result.results]);
        }
        
        setTotalResults(result.totalResults);
        setOffset(currentOffset);
        
        console.log(`✅ Búsqueda completada: ${result.results.length} recetas, ${result.totalResults} total`);
        
      } catch (err) {
        console.error('❌ Error searching recipes:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [searchParams, number]);

  return {
    recipes,
    totalResults,
    offset,
    number,
    isLoading,
    error,
    searchParams,
    updateSearchParams,
  };
};

export const useRecipeDetail = (id?: number) => {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setRecipe(null);
      return;
    }

    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await recipeApi.getRecipeById(id, true);
        setRecipe(result);
      } catch (err) {
        console.error('Error fetching recipe detail:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  return { recipe, isLoading, error };
};

export const useSimilarRecipes = (recipeId: number, count: number = 4) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!recipeId) return;

    const fetchSimilarRecipes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await recipeApi.getSimilarRecipes(recipeId, count);
        setRecipes(result);
      } catch (err) {
        console.error('Error fetching similar recipes:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarRecipes();
  }, [recipeId, count]);

  return { recipes, isLoading, error };
};

export const useRandomRecipes = (count: number = 12, tags?: string) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRandomRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await recipeApi.getRandomRecipes(count, tags);
      setRecipes(result.recipes);
    } catch (err) {
      console.error('Error fetching random recipes:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomRecipes();
  }, [count, tags]);

  return { 
    recipes, 
    isLoading, 
    error, 
    refetch: fetchRandomRecipes 
  };
};