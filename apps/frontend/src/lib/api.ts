/**
 * API Client — Frontend to Backend
 *
 * Security best practice: La autenticación se realiza via cookie httpOnly
 * (Set-Cookie del backend). No se almacena JWT en localStorage para
 * prevenir exfiltración por XSS. (ISO 25010 - Security - Confidentiality)
 *
 * Las cookies httpOnly via credentials: 'include' se envían automáticamente
 * en cada petición, sin intervención de JavaScript.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    // Security: Envía cookies httpOnly automáticamente
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
};

export const uploadFile = async (endpoint: string, formData: FormData, method: string = 'POST') => {
  const headers: Record<string, string> = {};

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    // Security: Cookies httpOnly via credentials
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
};
