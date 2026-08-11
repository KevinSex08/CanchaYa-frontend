import { signIn, signOut, getCurrentUser, signUp } from 'aws-amplify/auth';
import { CognitoLoginResponse, LoginCredentials } from '../interfaces/types';

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

/**
 * Servicio de Autenticación con AWS Cognito usando aws-amplify
 */
export const authService = {
  /**
   * Realiza el login del usuario utilizando aws-amplify
   */
  login: async (credentials: LoginCredentials): Promise<CognitoLoginResponse> => {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.username,
        password: credentials.password
      });

      return {
        AuthenticationResult: {
          AccessToken: 'managed-by-amplify',
          IdToken: 'managed-by-amplify',
          RefreshToken: 'managed-by-amplify',
          ExpiresIn: 3600,
          TokenType: 'Bearer'
        }
      };
    } catch (error: any) {
      console.error('Error durante el inicio de sesión en Cognito (Amplify):', error);
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario en Cognito
   */
  register: async (credentials: RegisterCredentials): Promise<void> => {
    try {
      await signUp({
        username: credentials.username,
        password: credentials.password,
        options: {
          userAttributes: {
            name: credentials.name
          }
        }
      });
    } catch (error: any) {
      console.error('Error durante el registro en Cognito (Amplify):', error);
      throw error;
    }
  },

  /**
   * Cierra la sesión
   */
  logout: async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  /**
   * Verifica si el usuario está autenticado comprobando el usuario actual
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      await getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
};
