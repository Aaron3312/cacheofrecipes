// src/app/api/spoonacular/debug/route.ts
import { NextResponse } from 'next/server';
import { getServerApiKeyManager } from '@/lib/server/api-key-manager';

export async function GET() {
  try {
    const apiKeyManager = getServerApiKeyManager();
    
    // Obtener estado detallado
    apiKeyManager.getDetailedStatus();
    
    const stats = apiKeyManager.getKeyStatistics();
    const currentKey = apiKeyManager.getCurrentApiKey();
    
    return NextResponse.json({ 
      success: true,
      currentKey: `${currentKey.substring(0, 4)}...${currentKey.substring(currentKey.length - 4)}`,
      stats,
      timestamp: new Date().toISOString(),
      totalKeys: stats.length,
      activeKeys: stats.filter(s => !s.isBlocked).length,
      blockedKeys: stats.filter(s => s.isBlocked).length
    });
  } catch (error: any) {
    console.error('Error en debug endpoint:', error);
    return NextResponse.json(
      { error: 'Error getting debug info', details: error.message },
      { status: 500 }
    );
  }
}