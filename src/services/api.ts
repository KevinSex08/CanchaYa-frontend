import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const getApiBaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
    }
  } catch (e) { }
  return 'https://canchaya.duckdns.org/api/v1'; // URL de fallback apuntando al backend seguro
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
});

/**
 * Interceptor de Peticiones (Request Interceptor)
 * Inyecta automáticamente el token JWT Bearer si existe en la sesión de Amplify
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await fetchAuthSession();
      // Algunos backends de Spring Boot requieren el IdToken para leer el email/roles
      const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // El usuario no está autenticado, continuar sin token
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
      console.warn(`Error de autenticación detectado (${status}). Redirigiendo al login...`);

      const unauthorizedEvent = new CustomEvent('canchaya-unauthorized', {
        detail: { status }
      });
      window.dispatchEvent(unauthorizedEvent);

      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;