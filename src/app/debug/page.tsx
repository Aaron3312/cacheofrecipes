// src/app/debug/page.tsx
'use client';

import { ApiKeyDebug } from '@/components/debug/api-key-debug';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Bug, Code, Terminal } from 'lucide-react';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]); // Mantener solo 10 logs
  };

  const testApiRotation = async () => {
    addLog('🧪 Iniciando test de rotación de API keys...');
    
    try {
      // Hacer múltiples requests para forzar la rotación
      for (let i = 1; i <= 5; i++) {
        addLog(`📡 Request ${i}/5...`);
        const response = await fetch('/api/spoonacular/test');
        const result = await response.json();
        
        if (result.success) {
          addLog(`✅ Request ${i} exitoso con key: ${result.keyUsed}`);
        } else {
          addLog(`❌ Request ${i} falló: ${result.error}`);
        }
        
        // Esperar un poco entre requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addLog('🎉 Test de rotación completado');
    } catch (error) {
      addLog(`💥 Error en test: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bug className="h-8 w-8" />
          Debug Console
        </h1>
        <p className="text-muted-foreground">
          Panel de debugging para desarrolladores - Monitoreo de API keys de Spoonacular
        </p>
      </div>

      {/* Controles de debugging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Herramientas de Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={testApiRotation} variant="outline">
              🔄 Test Rotación de Keys
            </Button>
            <Button 
              onClick={() => window.open('/api/spoonacular/debug', '_blank')} 
              variant="outline"
            >
              📊 Ver Debug Raw
            </Button>
            <Button onClick={clearLogs} variant="outline">
              🗑️ Limpiar Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs en tiempo real */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Logs de Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Componente principal de debug */}
      <ApiKeyDebug />

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Endpoints Disponibles:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>/api/spoonacular/[...path]</code> - Proxy principal</li>
                <li>• <code>/api/spoonacular/stats</code> - Estadísticas</li>
                <li>• <code>/api/spoonacular/reset</code> - Reset de keys</li>
                <li>• <code>/api/spoonacular/test</code> - Test de API</li>
                <li>• <code>/api/spoonacular/debug</code> - Debug info</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Variables de Entorno:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>SPOONACULAR_API_KEY_1</code> - Key principal</li>
                <li>• <code>SPOONACULAR_API_KEY_2</code> - Key backup 1</li>
                <li>• <code>SPOONACULAR_API_KEY_3</code> - Key backup 2</li>
                <li>• <code>SPOONACULAR_API_KEY_4</code> - Key backup 3</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}