// src/app/api/spoonacular/test/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import { getServerApiKeyManager } from '@/lib/server/api-key-manager';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export async function POST() {
  try {
    const apiKeyManager = getServerApiKeyManager();
    const apiKey = apiKeyManager.getCurrentApiKey();
    
    console.log('🧪 Testing API with current key...');
    
    // Hacer una request simple para probar
    const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/random`, {
      params: {
        apiKey,
        number: 1
      },
      timeout: 10000
    });

    // Incrementar contador si fue exitoso
    apiKeyManager.incrementRequestCount(apiKey);

    return NextResponse.json({
      success: true,
      message: 'API test successful',
      keyUsed: `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`,
      recipe: response.data.recipes[0]?.title || 'No recipe returned',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('🧪 API test failed:', error.response?.status, error.message);
    
    // Si es error 402, marcar la key como bloqueada
    if (error.response?.status === 402) {
      const apiKeyManager = getServerApiKeyManager();
      const apiKey = apiKeyManager.getCurrentApiKey();
      apiKeyManager.markKeyAsBlocked(apiKey);
    }

    return NextResponse.json({
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      timestamp: new Date().toISOString()
    }, { status: error.response?.status || 500 });
  }
}

export async function GET() {
  // También permitir GET para facilitar testing desde el navegador
  return POST();
}