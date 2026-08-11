import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Obtener la URL base desde las variables de entorno de Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://184.73.14.40:9090';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
