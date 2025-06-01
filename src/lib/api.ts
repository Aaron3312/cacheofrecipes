// src/lib/api.ts
import axios, { AxiosResponse } from 'axios';
import { Recipe, RecipeDetail, RecipeSearchResponse, RecipeSearchParams } from '@/types/recipe';

// Usar nuestro proxy en lugar de llamar directamente a Spoonacular
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const PROXY_PATH = '/api/spoonacular';

const apiClient = axios.create({
  baseURL: `${BASE_URL}${PROXY_PATH}`,
  timeout: 15000, // Timeout más largo para dar tiempo a los reintentos del servidor
});

// Interceptor para logging
apiClient.interceptors.request.use((config) => {
  console.log(`🌐 Proxy request: ${config.url}`);
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Proxy error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Funciones de la API
export const recipeApi = {
  // Buscar recetas
  searchRecipes: async (params: RecipeSearchParams): Promise<RecipeSearchResponse> => {
    try {
      const response = await apiClient.get<RecipeSearchResponse>('/recipes/complexSearch', { params });
      return response.data;
    } catch (error) {
      console.error('Error buscando recetas:', error);
      throw error;
    }
  },

  // Obtener receta por ID
  getRecipeById: async (id: number, includeNutrition: boolean = true): Promise<RecipeDetail> => {
    try {
      const response = await apiClient.get<RecipeDetail>(`/recipes/${id}/information`, {
        params: { includeNutrition }
      });
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo receta con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener múltiples recetas por IDs
  getRecipesByIds: async (ids: number[]): Promise<RecipeDetail[]> => {
    try {
      const response = await apiClient.get<RecipeDetail[]>('/recipes/informationBulk', {
        params: { ids: ids.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo recetas por IDs:', error);
      throw error;
    }
  },

  // Obtener recetas aleatorias
  getRandomRecipes: async (number: number = 12, tags?: string): Promise<{ recipes: Recipe[] }> => {
    try {
      const response = await apiClient.get<{ recipes: Recipe[] }>('/recipes/random', {
        params: { number, tags }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo recetas aleatorias:', error);
      throw error;
    }
  },

  // Obtener recetas similares
  getSimilarRecipes: async (id: number, number: number = 4): Promise<Recipe[]> => {
    try {
      const response = await apiClient.get<Recipe[]>(`/recipes/${id}/similar`, {
        params: { number }
      });
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo recetas similares para ID ${id}:`, error);
      throw error;
    }
  },

  // Autocompletar ingredientes
  autocompleteIngredients: async (query: string, number: number = 5): Promise<any[]> => {
    try {
      const response = await apiClient.get<any[]>('/food/ingredients/autocomplete', {
        params: { query, number }
      });
      return response.data;
    } catch (error) {
      console.error('Error en autocompletado de ingredientes:', error);
      throw error;
    }
  },

  // Obtener información nutricional
  getNutritionById: async (id: number): Promise<any> => {
    try {
      const response = await apiClient.get<any>(`/recipes/${id}/nutritionWidget.json`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo información nutricional para ID ${id}:`, error);
      throw error;
    }
  }
};

// Funciones para debugging (ahora hacen calls al servidor)
export const apiDebug = {
  // Obtener estadísticas de API keys
  getApiKeyStatistics: async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/spoonacular/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return [];
    }
  },

  // Reiniciar todas las keys
  resetApiKeys: async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/spoonacular/reset`);
      return response.data;
    } catch (error) {
      console.error('Error reiniciando keys:', error);
      throw error;
    }
  },

  // Test de la API (usando endpoint dedicado)
  testApi: async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/spoonacular/test`);
      return response.data;
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: error.response?.status
      };
    }
  }
};

export default recipeApi;