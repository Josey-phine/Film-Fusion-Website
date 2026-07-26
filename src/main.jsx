import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <FavoritesProvider>
        <AuthProvider>
         <App />
        </AuthProvider>
      </FavoritesProvider>
  </StrictMode>
);