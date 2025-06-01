// src/components/debug/api-key-debug.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Key, AlertCircle, CheckCircle, Server } from 'lucide-react';
import { apiDebug } from '@/lib/api';

interface KeyStatistic {
  keyId: string;
  isBlocked: boolean;
  requestCount: number;
  blockedAt?: number;
  timeUntilUnblock?: number;
}

export function ApiKeyDebug() {
  const [stats, setStats] = useState<KeyStatistic[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshStats = async () => {
    setIsRefreshing(true);
    try {
      const newStats = await apiDebug.getApiKeyStatistics();
      setStats(newStats);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await apiDebug.resetApiKeys();
      await refreshStats();
    } catch (error) {
      console.error('Error resetting keys:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleTestApi = async () => {
    setIsTestingApi(true);
    try {
      const result = await apiDebug.testApi();
      if (result.success) {
        console.log('✅ Test de API exitoso:', result.data);
      } else {
        console.error('❌ Test de API falló:', result.error);
      }
      await refreshStats();
    } catch (error) {
      console.error('Error en test de API:', error);
    } finally {
      setIsTestingApi(false);
    }
  };

  useEffect(() => {
    refreshStats();
    // Actualizar stats cada 30 segundos
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeUntilUnblock = (timeLeft?: number) => {
    if (!timeLeft || timeLeft <= 0) return 'Desbloqueada';
    
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
  };

  const totalRequests = stats.reduce((sum, stat) => sum + stat.requestCount, 0);
  const blockedKeys = stats.filter(stat => stat.isBlocked).length;
  const activeKeys = stats.length - blockedKeys;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Estado de API Keys (Servidor Seguro)
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestApi}
            disabled={isTestingApi}
            className="flex items-center gap-2"
          >
            {isTestingApi ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Test API
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2"
          >
            {isResetting ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            Reset
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.length}</div>
            <div className="text-sm text-blue-600">Total Keys</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{activeKeys}</div>
            <div className="text-sm text-green-600">Activas</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{blockedKeys}</div>
            <div className="text-sm text-red-600">Bloqueadas</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-600">{totalRequests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
        </div>

        {/* Estado de cada key */}
        <div className="grid gap-4">
          {stats.map((keyInfo, index) => (
            <div
              key={keyInfo.keyId}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge variant={keyInfo.isBlocked ? 'destructive' : 'default'}>
                  {keyInfo.keyId}
                </Badge>
                <div className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
                  <Key className="h-3 w-3" />
                  <span>Servidor (Segura)</span>
                </div>
                {keyInfo.isBlocked ? (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Bloqueada</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Activa</span>
                  </div>
                )}
              </div>
              
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">
                  Requests: <span className="font-medium">{keyInfo.requestCount}</span>
                </div>
                {keyInfo.isBlocked && (
                  <>
                    <div className="text-sm text-red-600">
                      Bloqueada: {formatTime(keyInfo.blockedAt)}
                    </div>
                    <div className="text-sm text-orange-600">
                      Desbloqueo en: {formatTimeUntilUnblock(keyInfo.timeUntilUnblock)}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {stats.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay información de API keys disponible
          </div>
        )}
        
        {lastUpdate && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Server className="h-4 w-4" />
            🔒 Información Segura
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Las API keys están almacenadas de forma segura en el servidor</li>
            <li>• La rotación automática se maneja en el backend</li>
            <li>• Las keys nunca se exponen al cliente/navegador</li>
            <li>• El estado se mantiene en memoria del servidor</li>
            <li>• Reintentos automáticos cuando se detecta error 402</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}