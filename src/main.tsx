import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Vincular la aplicación de React con el elemento #root del index.html
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
