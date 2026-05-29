import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimationProvider } from './context/AnimationContext';
import { AnimatePresence, motion } from 'framer-motion';
import { HiMagnifyingGlass } from 'react-icons/hi2';

// Guards
import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HospitalsPage from './pages/HospitalsPage';
import ProfilePage from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import ChatBot from './pages/ChatBot';
import { FAQsPage } from './pages/FAQsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import OnboardingPage from './pages/OnboardingPage';

function Layout({ lang, onLangToggle, children }: {
  lang: 'en' | 'ar'; onLangToggle: () => void; children: React.ReactNode;
}) {
  return (
    <>
      <Navbar lang={lang} onLangToggle={onLangToggle} />
      {children}
      <Footer lang={lang} />
    </>
  );
}

function AnimatedRoutes({ lang, toggleLang }: { lang: 'en' | 'ar', toggleLang: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}>
        <Routes location={location} key={location.pathname}>
          {/* ── Public routes ── */}
          <Route path="/" element={<Layout lang={lang} onLangToggle={toggleLang}><HomePage lang={lang} /></Layout>} />
          <Route path="/about" element={<Layout lang={lang} onLangToggle={toggleLang}><AboutPage lang={lang} /></Layout>} />
          <Route path="/contact" element={<Layout lang={lang} onLangToggle={toggleLang}><ContactPage lang={lang} /></Layout>} />
          <Route path="/privacy" element={<Layout lang={lang} onLangToggle={toggleLang}><PrivacyPage lang={lang} /></Layout>} />
          <Route path="/faqs" element={<Layout lang={lang} onLangToggle={toggleLang}><FAQsPage lang={lang} /></Layout>} />

          {/* ── Guest routes (redirect to / if logged in) ── */}
          <Route element={<GuestGuard />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Protected routes with Layout (redirect to /login if not logged in) ── */}
          <Route element={<AuthGuard />}>
            <Route path="/upload" element={<Layout lang={lang} onLangToggle={toggleLang}><UploadPage lang={lang} /></Layout>} />
            <Route path="/results" element={<Layout lang={lang} onLangToggle={toggleLang}><ResultsPage lang={lang} /></Layout>} />
            <Route path="/chat" element={<Layout lang={lang} onLangToggle={toggleLang}><ChatBot lang={lang} /></Layout>} />
            <Route path="/hospitals" element={<Layout lang={lang} onLangToggle={toggleLang}><HospitalsPage lang={lang} /></Layout>} />
            <Route path="/profile" element={<Layout lang={lang} onLangToggle={toggleLang}><ProfilePage lang={lang} /></Layout>} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          {/* ── Admin-only example ── */}
          {/* <Route path="/admin" element={<AuthGuard><AdminGuard><AdminPage /></AdminGuard></AuthGuard>} /> */}

          {/* ── Redirects ── */}
          <Route path="/analysis" element={<Navigate to="/upload" replace />} />

          {/* ── 404 ── */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '80px 40px', fontFamily: 'Sora, sans-serif' }}>
              <div style={{ marginBottom: 16, color: '#9ca3af' }}>
                <HiMagnifyingGlass size={72} className="opacity-60" />
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 900, color: 'var(--primary-dark)', marginBottom: 10 }}>404 — Not Found</h1>
              <a href="/" style={{ color: 'var(--primary)', fontWeight: 700 }}>← Home</a>
            </div>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

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
