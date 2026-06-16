import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import AuthGuard from './components/AuthGuard';
import GuestGuard from './components/GuestGuard';
import { NotFoundPage } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import HospitalsPage from './pages/HospitalsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import ChatBot from './pages/ChatBot';
import OnboardingPage from './pages/OnboardingPage';
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage').then(m => ({ default: m.FAQsPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));

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

export default function AnimatedRoutes({ lang, toggleLang }: { lang: 'en' | 'ar', toggleLang: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#F7FAFC]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-[#E2E8F0]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2E5C5A] animate-spin" />
            </div>
            <p className="text-sm font-medium text-[#475569] tracking-wide">Loading…</p>
          </div>
        </div>}>
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

          {/* ── Redirects ── */}
          <Route path="/analysis" element={<Navigate to="/upload" replace />} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
