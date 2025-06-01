// src/app/api/spoonacular/reset/route.ts
import { NextResponse } from 'next/server';
import { getServerApiKeyManager } from '@/lib/server/api-key-manager';

export async function POST() {
  try {
    const apiKeyManager = getServerApiKeyManager();
    apiKeyManager.resetAllKeys();
    
    console.log('🔄 API keys reset via endpoint');
    
    return NextResponse.json({ 
      message: 'API keys reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error reiniciando keys:', error);
    return NextResponse.json(
      { error: 'Error resetting keys', details: error.message },
      { status: 500 }
    );
  }
}