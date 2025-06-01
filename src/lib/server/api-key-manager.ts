// src/lib/server/api-key-manager.ts

interface ApiKeyStatus {
  key: string;
  isBlocked: boolean;
  blockedAt?: number;
  requestCount: number;
}

class ServerApiKeyManager {
  private apiKeys: string[] = [
    process.env.SPOONACULAR_API_KEY_1 || '',
    process.env.SPOONACULAR_API_KEY_2 || '',
    process.env.SPOONACULAR_API_KEY_3 || '',
    process.env.SPOONACULAR_API_KEY_4 || '',
    process.env.SPOONACULAR_API_KEY_5 || '',
    process.env.SPOONACULAR_API_KEY_6 || '',
    process.env.SPOONACULAR_API_KEY_7 || '',
    process.env.SPOONACULAR_API_KEY_8 || '',
  ].filter(key => key.length > 0); // Filtrar keys vacías

  private keyStatuses: Map<string, ApiKeyStatus> = new Map();
  private currentKeyIndex: number = 0;
  private readonly BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 horas

  constructor() {
    if (this.apiKeys.length === 0) {
      throw new Error('No se encontraron API keys de Spoonacular en las variables de entorno');
    }

    // Inicializar estados de las keys
    this.apiKeys.forEach(key => {
      this.keyStatuses.set(key, {
        key,
        isBlocked: false,
        requestCount: 0
      });
    });

    console.log(`🔑 Inicializando con ${this.apiKeys.length} API keys de Spoonacular`);
    console.log(`🎯 API Keys disponibles: ${this.apiKeys.map(key => this.maskApiKey(key)).join(', ')}`);
  }

  /**
   * Obtiene la API key actual disponible
   */
  getCurrentApiKey(): string {
    this.checkBlockedKeys();
    
    // Buscar la primera key disponible empezando desde el índice actual
    let attempts = 0;
    while (attempts < this.apiKeys.length) {
      const keyIndex = (this.currentKeyIndex + attempts) % this.apiKeys.length;
      const key = this.apiKeys[keyIndex];
      const status = this.keyStatuses.get(key);
      
      if (status && !status.isBlocked) {
        if (attempts > 0) {
          // Solo actualizar el índice si rotamos
          this.currentKeyIndex = keyIndex;
          console.log(`🔄 Cambiando a API Key #${keyIndex + 1}: ${this.maskApiKey(key)}`);
        }
        return key;
      }
      attempts++;
    }

    // Si todas están bloqueadas, usar la que tenga más tiempo bloqueada
    console.warn('⚠️ Todas las API keys están bloqueadas, usando la más antigua');
    const oldestBlockedKey = this.getOldestBlockedKey();
    return oldestBlockedKey || this.apiKeys[0];
  }

  /**
   * Marca una API key como bloqueada
   */
  markKeyAsBlocked(apiKey: string): void {
    const status = this.keyStatuses.get(apiKey);
    if (status) {
      status.isBlocked = true;
      status.blockedAt = Date.now();
      this.keyStatuses.set(apiKey, status);
      
      const keyIndex = this.apiKeys.indexOf(apiKey);
      console.warn(`🔒 API Key #${keyIndex + 1} bloqueada: ${this.maskApiKey(apiKey)} (Payment Required)`);
      
      // Rotar inmediatamente a la siguiente key disponible
      this.rotateToNextKey();
    }
  }

  /**
   * Incrementa el contador de requests
   */
  incrementRequestCount(apiKey: string): void {
    const status = this.keyStatuses.get(apiKey);
    if (status) {
      status.requestCount++;
      this.keyStatuses.set(apiKey, status);
      
      const keyIndex = this.apiKeys.indexOf(apiKey);
      console.log(`📊 API Key #${keyIndex + 1} (${this.maskApiKey(apiKey)}): ${status.requestCount} requests`);
    }
  }

  /**
   * Obtiene estadísticas sin exponer las keys completas
   */
  getKeyStatistics(): Array<{
    keyId: string;
    isBlocked: boolean;
    requestCount: number;
    blockedAt?: number;
    timeUntilUnblock?: number;
  }> {
    return Array.from(this.keyStatuses.entries()).map(([key, status], index) => {
      const timeUntilUnblock = status.blockedAt 
        ? Math.max(0, (status.blockedAt + this.BLOCK_DURATION) - Date.now())
        : undefined;

      return {
        keyId: `Key #${index + 1} (${this.maskApiKey(key)})`,
        isBlocked: status.isBlocked,
        requestCount: status.requestCount,
        blockedAt: status.blockedAt,
        timeUntilUnblock
      };
    });
  }

  /**
   * Reinicia todas las keys (para debugging)
   */
  resetAllKeys(): void {
    this.keyStatuses.forEach((status, key) => {
      status.isBlocked = false;
      status.blockedAt = undefined;
      status.requestCount = 0;
      this.keyStatuses.set(key, status);
    });
    this.currentKeyIndex = 0;
    console.log('🔄 Todas las API keys han sido reiniciadas');
  }

  /**
   * Verifica y desbloquea keys que han pasado el período de bloqueo
   */
  private checkBlockedKeys(): void {
    const now = Date.now();
    let unblocked = false;
    
    this.keyStatuses.forEach((status, key) => {
      if (status.isBlocked && status.blockedAt) {
        const timeSinceBlocked = now - status.blockedAt;
        if (timeSinceBlocked >= this.BLOCK_DURATION) {
          status.isBlocked = false;
          status.blockedAt = undefined;
          this.keyStatuses.set(key, status);
          
          const keyIndex = this.apiKeys.indexOf(key);
          console.log(`🔓 API Key #${keyIndex + 1} desbloqueada: ${this.maskApiKey(key)}`);
          unblocked = true;
        }
      }
    });

    if (unblocked) {
      this.logCurrentStatus();
    }
  }

  /**
   * Rota a la siguiente API key disponible
   */
  private rotateToNextKey(): void {
    const originalIndex = this.currentKeyIndex;
    
    for (let i = 1; i < this.apiKeys.length; i++) {
      const nextIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
      const nextKey = this.apiKeys[nextIndex];
      const status = this.keyStatuses.get(nextKey);
      
      if (status && !status.isBlocked) {
        this.currentKeyIndex = nextIndex;
        console.log(`🔄 Rotando de Key #${originalIndex + 1} a Key #${nextIndex + 1}: ${this.maskApiKey(nextKey)}`);
        this.logCurrentStatus();
        return;
      }
    }
    
    console.warn('⚠️ No hay más API keys disponibles para rotar');
    this.logCurrentStatus();
  }

  /**
   * Obtiene la key bloqueada más antigua
   */
  private getOldestBlockedKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    this.keyStatuses.forEach((status, key) => {
      if (status.isBlocked && status.blockedAt && status.blockedAt < oldestTime) {
        oldestTime = status.blockedAt;
        oldestKey = key;
      }
    });
    
    return oldestKey;
  }

  /**
   * Enmascara la API key para logging seguro
   */
  private maskApiKey(key: string): string {
    if (key.length <= 8) return '***';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Log del estado actual para debugging
   */
  private logCurrentStatus(): void {
    const activeKeys = Array.from(this.keyStatuses.values()).filter(s => !s.isBlocked).length;
    const blockedKeys = Array.from(this.keyStatuses.values()).filter(s => s.isBlocked).length;
    
    console.log(`📊 Estado actual: ${activeKeys} activas, ${blockedKeys} bloqueadas de ${this.apiKeys.length} total`);
    console.log(`🎯 Key actual: #${this.currentKeyIndex + 1} (${this.maskApiKey(this.apiKeys[this.currentKeyIndex])})`);
  }

  /**
   * Información detallada para debugging
   */
  getDetailedStatus(): void {
    console.log('\n📋 Estado detallado de API Keys:');
    this.apiKeys.forEach((key, index) => {
      const status = this.keyStatuses.get(key);
      const isCurrent = index === this.currentKeyIndex;
      const statusIcon = status?.isBlocked ? '🔒' : '✅';
      const currentIcon = isCurrent ? '👉' : '  ';
      
      console.log(
        `${currentIcon} ${statusIcon} Key #${index + 1} (${this.maskApiKey(key)}): ` +
        `${status?.requestCount || 0} requests, ` +
        `${status?.isBlocked ? 'BLOQUEADA' : 'ACTIVA'}`
      );
    });
    console.log('');
  }
}

// Singleton instance
let serverApiKeyManager: ServerApiKeyManager | null = null;

export function getServerApiKeyManager(): ServerApiKeyManager {
  if (!serverApiKeyManager) {
    serverApiKeyManager = new ServerApiKeyManager();
  }
  return serverApiKeyManager;
}