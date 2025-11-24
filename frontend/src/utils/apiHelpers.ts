// src/utils/apiHelpers.ts
/**
 * Extrae el array de resultados de una respuesta paginada de Django REST Framework
 * o devuelve el array directo si ya viene así
 */
export const extractResults = <T>(data: any): T[] => {
  if (data && typeof data === 'object' && 'results' in data) {
    return data.results as T[];
  }
  if (Array.isArray(data)) {
    return data;
  }
  console.error('Formato de respuesta inesperado:', data);
  return [];
};