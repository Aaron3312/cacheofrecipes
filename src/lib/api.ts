// src/lib/api.ts
import axios from 'axios';
import { Recipe, RecipeDetail, RecipeSearchParams, RecipeSearchResponse } from '@/types/recipe';

const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

// Cliente axios configurado
const apiClient = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

// Funciones de la API
export const recipeApi = {
  // Buscar recetas
  searchRecipes: async (params: RecipeSearchParams): Promise<RecipeSearchResponse> => {
    try {
      const response = await apiClient.get('/recipes/complexSearch', {
        params: {
          ...params,
          addRecipeInformation: true, // Incluir información detallada de las recetas
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error buscando recetas:', error);
      throw error;
    }
  },

  // Obtener detalle de una receta
  getRecipeById: async (id: number): Promise<RecipeDetail> => {
    try {
      const response = await apiClient.get(`/recipes/${id}/information`, {
        params: {
          includeNutrition: true, // Incluir información nutricional
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo receta con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener recetas aleatorias
  getRandomRecipes: async (number: number = 10): Promise<{ recipes: Recipe[] }> => {
    try {
      const response = await apiClient.get('/recipes/random', {
        params: {
          number,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo recetas aleatorias:', error);
      throw error;
    }
  },

  // Obtener recetas similares
  getSimilarRecipes: async (id: number, number: number = 5): Promise<Recipe[]> => {
    try {
      const response = await apiClient.get(`/recipes/${id}/similar`, {
        params: {
          number,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo recetas similares a ID ${id}:`, error);
      throw error;
    }
  },

  // Autocompletar búsqueda de recetas
  autocompleteRecipeSearch: async (query: string, number: number = 5): Promise<any[]> => {
    try {
      const response = await apiClient.get('/recipes/autocomplete', {
        params: {
          query,
          number,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en autocompletar búsqueda:', error);
      throw error;
    }
  },
};

// Funciones para obtener información de ingredientes, nutrición, etc.
export const foodApi = {
  // Autocompletar ingredientes
  autocompleteIngredient: async (query: string, number: number = 5): Promise<any[]> => {
    try {
      const response = await apiClient.get('/food/ingredients/autocomplete', {
        params: {
          query,
          number,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error en autocompletar ingrediente:', error);
      throw error;
    }
  },

  // Obtener información de un ingrediente
  getIngredientInformation: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.get(`/food/ingredients/${id}/information`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo información del ingrediente ID ${id}:`, error);
      throw error;
    }
  },
};