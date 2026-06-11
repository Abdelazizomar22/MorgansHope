import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimationProvider } from './context/AnimationContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import AnimatedRoutes from './routes';

function AppContent() {
  const { lang, toggleLang } = useLanguage();

  return (
    <AnimationProvider>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <AnimatedRoutes lang={lang} toggleLang={toggleLang} />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AnimationProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
