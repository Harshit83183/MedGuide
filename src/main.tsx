import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { LanguageProvider } from './apps/web-app/lib/language';
import AutoTranslate from './apps/web-app/components/AutoTranslate';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AutoTranslate />
      <App />
    </LanguageProvider>
  </StrictMode>
);
