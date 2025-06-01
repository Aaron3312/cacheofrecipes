// src/app/api/spoonacular/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerApiKeyManager } from '@/lib/server/api-key-manager';

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKeyManager = getServerApiKeyManager();
    const searchParams = request.nextUrl.searchParams;
    
    // Await params antes de usarlos (Next.js 15+)
    const resolvedParams = await params;
    
    // Construir la URL de Spoonacular
    const path = resolvedParams.path.join('/');
    const url = `${SPOONACULAR_BASE_URL}/${path}`;
    
    // Obtener la API key actual
    let apiKey = apiKeyManager.getCurrentApiKey();
    
    // Preparar parámetros
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    queryParams.apiKey = apiKey;

    // Incrementar contador
    apiKeyManager.incrementRequestCount(apiKey);

    console.log(`🔑 Proxy request to: /${path} with key: ${apiKey.substring(0, 4)}...`);

    let lastError: any;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        const response = await axios.get(url, {
          params: queryParams,
          timeout: 10000
        });

        return NextResponse.json(response.data);

      } catch (error: any) {
        lastError = error;

        if (error.response?.status === 402) {
          console.warn(`💳 Payment Required para key: ${apiKey.substring(0, 4)}...`);
          
          // Marcar key como bloqueada
          apiKeyManager.markKeyAsBlocked(apiKey);
          
          // Obtener nueva key
          const newApiKey = apiKeyManager.getCurrentApiKey();
          
          if (newApiKey !== apiKey && retryCount < maxRetries) {
            console.log(`🔄 Reintentando con nueva key: ${newApiKey.substring(0, 4)}...`);
            apiKey = newApiKey;
            queryParams.apiKey = newApiKey;
            apiKeyManager.incrementRequestCount(newApiKey);
            retryCount++;
            continue;
          } else {
            console.error('❌ No hay más API keys disponibles o se agotaron los reintentos');
            break;
          }
        } else {
          // Para otros errores, no reintentar
          break;
        }
      }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    if (lastError?.response) {
      return NextResponse.json(
        { error: 'API request failed', details: lastError.response.data },
        { status: lastError.response.status }
      );
    } else {
      return NextResponse.json(
        { error: 'Network error', details: lastError?.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error en proxy de Spoonacular:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// También agregar soporte para POST si es necesario
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKeyManager = getServerApiKeyManager();
    const searchParams = request.nextUrl.searchParams;
    const body = await request.json().catch(() => ({}));
    
    // Await params antes de usarlos (Next.js 15+)
    const resolvedParams = await params;
    
    // Construir la URL de Spoonacular
    const path = resolvedParams.path.join('/');
    const url = `${SPOONACULAR_BASE_URL}/${path}`;
    
    // Obtener la API key actual
    let apiKey = apiKeyManager.getCurrentApiKey();
    
    // Preparar parámetros
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    queryParams.apiKey = apiKey;

    // Incrementar contador
    apiKeyManager.incrementRequestCount(apiKey);

    console.log(`🔑 POST Proxy request to: /${path} with key: ${apiKey.substring(0, 4)}...`);

    let lastError: any;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        const response = await axios.post(url, body, {
          params: queryParams,
          timeout: 10000
        });

        return NextResponse.json(response.data);

      } catch (error: any) {
        lastError = error;

        if (error.response?.status === 402) {
          console.warn(`💳 Payment Required para key: ${apiKey.substring(0, 4)}...`);
          
          // Marcar key como bloqueada
          apiKeyManager.markKeyAsBlocked(apiKey);
          
          // Obtener nueva key
          const newApiKey = apiKeyManager.getCurrentApiKey();
          
          if (newApiKey !== apiKey && retryCount < maxRetries) {
            console.log(`🔄 Reintentando con nueva key: ${newApiKey.substring(0, 4)}...`);
            apiKey = newApiKey;
            queryParams.apiKey = newApiKey;
            apiKeyManager.incrementRequestCount(newApiKey);
            retryCount++;
            continue;
          } else {
            console.error('❌ No hay más API keys disponibles o se agotaron los reintentos');
            break;
          }
        } else {
          // Para otros errores, no reintentar
          break;
        }
      }
    }

    // Si llegamos aquí, todos los reintentos fallaron
    if (lastError?.response) {
      return NextResponse.json(
        { error: 'API request failed', details: lastError.response.data },
        { status: lastError.response.status }
      );
    } else {
      return NextResponse.json(
        { error: 'Network error', details: lastError?.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error en POST proxy de Spoonacular:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}