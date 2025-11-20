import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/use-toast'; // <-- add ToastProvider
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </LanguageProvider>
);
