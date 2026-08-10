import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';
import { CognitoLoginResponse, LoginCredentials } from '../interfaces/types';

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

      // aws-amplify maneja el almacenamiento de tokens automáticamente en LocalStorage/SessionStorage
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
