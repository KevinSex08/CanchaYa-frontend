import React from 'react';
import { createRoot } from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App';

// Configuración de AWS Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID as string,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID as string,
    }
  }
});

// Vincular la aplicación de React con el elemento #root del index.html
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
