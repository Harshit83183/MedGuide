import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { LanguageProvider } from './apps/web-app/lib/language';
import AutoTranslate from './apps/web-app/components/AutoTranslate';

if (performance.getEntriesByType('navigation').some(entry => (entry as PerformanceNavigationTiming).type === 'reload')) {
  sessionStorage.removeItem('medguide_triage_result');
  sessionStorage.removeItem('medguide_common_problem_result');
  sessionStorage.removeItem('medguide_intake');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AutoTranslate />
      <App />
    </LanguageProvider>
  </StrictMode>
);
