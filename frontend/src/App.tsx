import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimationProvider } from './context/AnimationContext';

import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import AnimatedRoutes from './routes';

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const toggleLang = () => setLang(l => l === 'en' ? 'ar' : 'en');

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
