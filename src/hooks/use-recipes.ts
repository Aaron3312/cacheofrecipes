// src/hooks/use-recipes.ts
'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { recipeApi } from '@/lib/api';
import { Recipe, RecipeDetail, RecipeSearchParams } from '@/types/recipe';

export const useRecipeSearch = (initialParams?: RecipeSearchParams) => {
  const [searchParams, setSearchParams] = useState<RecipeSearchParams>(initialParams || {
    number: 10,
    offset: 0,
  });

  const { data, isLoading, error, refetch } = useQuery(
    ['recipes', searchParams],
    () => recipeApi.searchRecipes(searchParams),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const updateSearchParams = (newParams: Partial<RecipeSearchParams>) => {
    setSearchParams((prev) => ({
      ...prev,
      ...newParams,
      // Resetear offset al cambiar otros parámetros de búsqueda
      offset: newParams.hasOwnProperty('offset') ? newParams.offset : 0,
    }));
  };

  return {
    recipes: data?.results || [],
    totalResults: data?.totalResults || 0,
    offset: data?.offset || 0,
    number: data?.number || 10,
    isLoading,
    error,
    searchParams,
    updateSearchParams,
    refetch,
  };
};

export const useRecipeDetail = (id?: number) => {
  const { data, isLoading, error } = useQuery(
    ['recipe', id],
    () => (id ? recipeApi.getRecipeById(id) : null),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  return {
    recipe: data,
    isLoading,
    error,
  };
};

export const useRandomRecipes = (count: number = 10) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['randomRecipes', count],
    () => recipeApi.getRandomRecipes(count),
    {
      refetchOnWindowFocus: false,
    }
  );

  return {
    recipes: data?.recipes || [],
    isLoading,
    error,
    refetch,
  };
};

export const useSimilarRecipes = (id?: number, count: number = 4) => {
  const { data, isLoading, error } = useQuery(
    ['similarRecipes', id, count],
    () => (id ? recipeApi.getSimilarRecipes(id, count) : []),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  return {
    recipes: data || [],
    isLoading,
    error,
  };
};

