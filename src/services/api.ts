<<<<<<< HEAD
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Obtener la URL base desde las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://184.73.14.40:9090';

const api: AxiosInstance = axios.create({
=======
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const getApiBaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
      }
    }
  } catch (e) {}
  return 'http://localhost:9090'; // URL de fallback apuntando a Nginx
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Creación de la instancia base de Axios
 */
const api = axios.create({
>>>>>>> origin/main
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
// Interceptor para inyectar el token JWT de Cognito (AccessToken) en cada petición
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Intentar obtener el token desde la clave personalizada
    let token = localStorage.getItem('cognito_access_token');

    // 2. O alternativamente, si usas aws-amplify, buscar la estructura por defecto que crea Amplify en localStorage
    if (!token) {
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      // Recorrer el localStorage para buscar la clave que coincida con el patrón de Amplify
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`CognitoIdentityServiceProvider.${clientId}`) && key.endsWith('.accessToken')) {
          token = localStorage.getItem(key);
          break;
        }
      }
    }

    // Inyectar el token en el header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
=======
/**
 * Interceptor de Peticiones (Request Interceptor)
 * Inyecta automáticamente el token JWT Bearer si existe en la sesión de Amplify
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // El usuario no está autenticado, continuar sin token
>>>>>>> origin/main
    }
    return config;
  },
<<<<<<< HEAD
  (error) => {
=======
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

>>>>>>> origin/main
    return Promise.reject(error);
  }
);

export default api;
