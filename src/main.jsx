import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { WatchHistoryProvider } from './context/WatchHistoryContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <WatchlistProvider>
          <WatchHistoryProvider>
          <App />
          </WatchHistoryProvider>
        </WatchlistProvider>
      </FavoritesProvider>
    </AuthProvider>
  </StrictMode>
);