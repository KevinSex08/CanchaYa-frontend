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
      const signInResult = await signIn({
        username: credentials.username,
        password: credentials.password
      });

      console.log('✅ Resultado crudo de Cognito signIn:', signInResult);

      if (!signInResult.isSignedIn) {
        console.warn('⚠️ ATENCIÓN: El usuario NO completó el login. Paso actual:', signInResult.nextStep);
      }

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
   * Confirma el registro del usuario con el código OTP
   */
  confirmRegister: async (username: string, code: string): Promise<void> => {
    try {
      const { confirmSignUp } = await import('aws-amplify/auth');
      await confirmSignUp({
        username,
        confirmationCode: code
      });
    } catch (error: any) {
      console.error('Error al confirmar registro:', error);
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
