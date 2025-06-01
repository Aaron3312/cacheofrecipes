// src/lib/image-utils.ts

/**
 * Procesa URLs de imágenes de Google para evitar problemas de CORS
 */
export function processGoogleImageUrl(url: string | null): string | null {
  if (!url) return null;
  
  // Si es una URL de Google, limpiarla y optimizarla
  if (url.includes('googleusercontent.com')) {
    // Remover parámetros problemáticos y agregar parámetros seguros
    const baseUrl = url.split('=')[0]; // Remover parámetros después del =
    return `${baseUrl}=s200-c`; // Agregar parámetros seguros: s200 (tamaño 200px), c (crop)
  }
  
  return url;
}

/**
 * Valida si una URL de imagen es válida
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Obtiene las iniciales de un usuario
 */
export function getUserInitials(user: { firstName?: string | null; lastName?: string | null; displayName?: string | null }): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  
  if (user.displayName) {
    const names = user.displayName.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.displayName[0].toUpperCase();
  }
  
  return 'U';
}

/**
 * Obtiene el nombre de display de un usuario
 */
export function getUserDisplayName(user: { firstName?: string | null; lastName?: string | null; displayName?: string | null }): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.displayName) {
    return user.displayName;
  }
  
  return 'Usuario';
}