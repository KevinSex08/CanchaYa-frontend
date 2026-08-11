// @ts-nocheck
/**
 * ============================================================================
 * EJEMPLO 1: Usando la librería oficial 'aws-amplify' (Recomendado para React)
 * ============================================================================
 * 
 * Instalación: npm install aws-amplify
 */

import { Amplify } from 'aws-amplify';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';

// 1. Inicializar Amplify (Hacer esto una sola vez en el punto de entrada, ej: main.tsx o App.tsx)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_idLO2Of02',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '68qrn647taud3bmdrpl8769tta',
    }
  }
});

/**
 * Función de Login con aws-amplify v6
 */
export const loginWithAmplify = async (username: string, password: string) => {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username,
      password,
    });

    if (isSignedIn) {
      // Amplify guarda automáticamente el token en localStorage.
      // Si quieres obtenerlo explícitamente para el interceptor de Axios:
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();
      
      if (accessToken) {
        // Guardamos el token en una clave personalizada para asegurar que nuestro interceptor de Axios lo detecte inmediatamente
        localStorage.setItem('cognito_access_token', accessToken);
      }
      return { success: true, isSignedIn };
    }

    return { success: false, nextStep };
  } catch (error) {
    console.error('Error en login con Amplify:', error);
    throw error;
  }
};

/**
 * Función de Logout con aws-amplify
 */
export const logoutWithAmplify = async () => {
  try {
    await signOut();
    localStorage.removeItem('cognito_access_token');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};


/**
 * ============================================================================
 * EJEMPLO 2: Usando la librería ligera 'amazon-cognito-identity-js'
 * ============================================================================
 * 
 * Instalación: npm install amazon-cognito-identity-js
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_idLO2Of02',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '68qrn647taud3bmdrpl8769tta'
};

const userPool = new CognitoUserPool(poolData);

/**
 * Función de Login con amazon-cognito-identity-js
 */
export const loginWithCognitoSDK = (username: string, password: string): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const authenticationData = {
      Username: username,
      Password: password,
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    
    const userData = {
      Username: username,
      Pool: userPool,
    };
    
    const cognitoUser = new CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result: CognitoUserSession) => {
        // Obtener el AccessToken en formato JWT string
        const accessToken = result.getAccessToken().getJwtToken();
        
        // Guardarlo en localStorage para que el interceptor de Axios lo inyecte
        localStorage.setItem('cognito_access_token', accessToken);
        
        resolve(result);
      },
      onFailure: (err) => {
        console.error('Error de autenticación con Cognito SDK:', err);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // Manejar flujo de cambio de contraseña obligatoria si aplica
        reject({ message: 'Cambio de contraseña requerido', userAttributes, requiredAttributes });
      }
    });
  });
};
