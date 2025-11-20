import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './hooks/useAuth'; // <-- import your AuthProvider
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <LanguageProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </LanguageProvider>
);
