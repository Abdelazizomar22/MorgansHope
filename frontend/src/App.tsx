import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AnimationProvider } from './context/AnimationContext';
import { AnimatePresence, motion } from 'framer-motion';

// Guards
import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';
import AdminGuard from './components/AdminGuard';
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
          {/* ── Guest-only pages (redirect to / if already logged in) ── */}
          <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
          <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />

          {/* ── Public pages (with Navbar, no auth needed) ── */}
          <Route path="/about" element={<Layout lang={lang} onLangToggle={toggleLang}><AboutPage lang={lang} /></Layout>} />
          <Route path="/contact" element={<Layout lang={lang} onLangToggle={toggleLang}><ContactPage lang={lang} /></Layout>} />
          <Route path="/faqs" element={<Layout lang={lang} onLangToggle={toggleLang}><FAQsPage lang={lang} /></Layout>} />
          <Route path="/privacy" element={<Layout lang={lang} onLangToggle={toggleLang}><PrivacyPage lang={lang} /></Layout>} />

          {/* ── Protected pages ── */}
          <Route path="/" element={
            <Layout lang={lang} onLangToggle={toggleLang}>
              <AuthGuard><HomePage lang={lang} /></AuthGuard>
            </Layout>
          } />
          <Route path="/upload" element={
            <Layout lang={lang} onLangToggle={toggleLang}>
              <AuthGuard><UploadPage lang={lang} /></AuthGuard>
            </Layout>
          } />
          <Route path="/results" element={
            <Layout lang={lang} onLangToggle={toggleLang}>
              <AuthGuard><ResultsPage lang={lang} /></AuthGuard>
            </Layout>
          } />
          <Route path="/hospitals" element={
            <Layout lang={lang} onLangToggle={toggleLang}>
              <AuthGuard><HospitalsPage lang={lang} /></AuthGuard>
            </Layout>
          } />
          <Route path="/chat" element={
            <Layout lang={lang} onLangToggle={toggleLang}>
              <AuthGuard><ChatBot lang={lang} /></AuthGuard>
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout lang={lang} onLangToggle={toggleLang}>
              <AuthGuard><ProfilePage lang={lang} /></AuthGuard>
            </Layout>
          } />
          <Route path="/onboarding" element={
            <AuthGuard><OnboardingPage /></AuthGuard>
          } />

          {/* ── Admin-only example (AdminGuard drops in wherever needed) ── */}
          {/* <Route path="/admin" element={<AuthGuard><AdminGuard><AdminPage /></AdminGuard></AuthGuard>} /> */}

          {/* ── Redirects ── */}
          <Route path="/analysis" element={<Navigate to="/upload" replace />} />

          {/* ── 404 ── */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '80px 40px', fontFamily: 'Sora, sans-serif' }}>
              <div style={{ marginBottom: 16, color: '#9ca3af' }}>
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
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
