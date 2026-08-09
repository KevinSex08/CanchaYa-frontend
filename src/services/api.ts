import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './auth';

// Declaración local para evitar errores de tipo en proyectos sin Node.js types
declare const process: any;

const getApiBaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
      }
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
    }
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  } catch (e) {}

  return 'https://api.canchaya.com'; // URL de fallback predeterminada
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Creación de la instancia base de Axios
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

/**
 * Interceptor de Peticiones (Request Interceptor)
 * Inyecta automáticamente el token JWT Bearer si existe en el almacenamiento
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtenemos el token (usualmente el IdToken contiene los claims del usuario en Cognito,
    // pero también podemos usar el AccessToken. Probamos con IdToken primero, luego AccessToken)
    const token = tokenStorage.getIdToken() || tokenStorage.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de Respuestas (Response Interceptor)
 * Captura errores globales, específicamente 401 (No autorizado) y 403 (Prohibido)
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      console.warn(`Error de autenticación detectado (${status}). Limpiando sesión y redirigiendo al login...`);
      
      // Limpiar tokens expirados o no válidos
      tokenStorage.clearTokens();

      // Emitir un evento global para que componentes de React/Ionic puedan reaccionar
      // sin necesidad de refrescar la página completa (ej. mostrar alerta, actualizar estado de auth context)
      const unauthorizedEvent = new CustomEvent('canchaya-unauthorized', {
        detail: { status }
      });
      window.dispatchEvent(unauthorizedEvent);

      // Redirección directa al login como fallback, evitando bucle si ya estamos en /login
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
