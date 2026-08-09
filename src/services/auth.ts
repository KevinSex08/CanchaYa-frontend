import axios from 'axios';
import { CognitoLoginResponse, LoginCredentials, CognitoAuthResult } from '../interfaces/types';

// Declaración local para evitar errores de tipo en proyectos sin Node.js types
declare const process: any;

const getCognitoClientId = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_COGNITO_CLIENT_ID) {
      return import.meta.env.VITE_COGNITO_CLIENT_ID;
    }
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_COGNITO_CLIENT_ID) {
      return process.env.REACT_APP_COGNITO_CLIENT_ID;
    }
  } catch (e) {}

  return 'YOUR_COGNITO_CLIENT_ID'; // Valor por defecto
};

const COGNITO_CLIENT_ID = getCognitoClientId();

const COGNITO_URL = 'https://cognito-idp.us-east-1.amazonaws.com/';

// Claves de almacenamiento para los tokens (Fácil de migrar a Secure Storage de Ionic)
const ACCESS_TOKEN_KEY = 'canchaya_access_token';
const ID_TOKEN_KEY = 'canchaya_id_token';
const REFRESH_TOKEN_KEY = 'canchaya_refresh_token';

/**
 * Abstracción de almacenamiento de tokens para facilitar el cambio futuro a 
 * Secure Storage de Ionic / Capacitor Preferences.
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getIdToken: (): string | null => {
    return localStorage.getItem(ID_TOKEN_KEY);
  },
  setIdToken: (token: string): void => {
    localStorage.setItem(ID_TOKEN_KEY, token);
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Servicio de Autenticación con AWS Cognito
 */
export const authService = {
  /**
   * Realiza el login del usuario utilizando el flujo USER_PASSWORD_AUTH de AWS Cognito
   */
  login: async (credentials: LoginCredentials): Promise<CognitoLoginResponse> => {
    try {
      const response = await axios.post<CognitoLoginResponse>(
        COGNITO_URL,
        {
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
          },
        },
        {
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          },
        }
      );

      // Si la autenticación es exitosa, guardar los tokens en el almacenamiento abstracto
      if (response.data?.AuthenticationResult) {
        const result: CognitoAuthResult = response.data.AuthenticationResult;
        tokenStorage.setAccessToken(result.AccessToken);
        tokenStorage.setIdToken(result.IdToken);
        tokenStorage.setRefreshToken(result.RefreshToken);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error durante el inicio de sesión en Cognito:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Cierra la sesión limpiando los tokens almacenados
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },

  /**
   * Verifica si el usuario está autenticado comprobando la presencia del token de acceso
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  }
};
