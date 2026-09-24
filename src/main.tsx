import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>
);
