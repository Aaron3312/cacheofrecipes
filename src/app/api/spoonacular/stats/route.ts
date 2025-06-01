// src/app/api/spoonacular/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerApiKeyManager } from '@/lib/server/api-key-manager';

export async function POST() {
  try {
    const apiKeyManager = getServerApiKeyManager();
    const stats = apiKeyManager.getKeyStatistics();
    
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error getting stats', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // También permitir GET para facilitar el debugging
  try {
    const apiKeyManager = getServerApiKeyManager();
    const stats = apiKeyManager.getKeyStatistics();
    
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error getting stats', details: error.message },
      { status: 500 }
    );
  }
}