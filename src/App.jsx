import React, { useState, useEffect } from 'react';
import CosmicBackground from './components/common/CosmicBackground';
import AuthPage from './components/auth/AuthPage';
import StudentNavbar from './components/navigation/StudentNavbar';
import StudentDashboard from './components/dashboard/StudentDashboard';
import AboutSection from './components/landing/AboutSection';
import Phase1Section from './components/phases/Phase1Section';
import Phase2Section from './components/phases/Phase2Section';
import PrizesSection from './components/landing/PrizesSection';
import FAQSection from './components/landing/FAQSection';
import ContactSection from './components/landing/ContactSection';
import { soundFx } from './utils/audio';
import { Sparkles } from 'lucide-react';

export default function App() {
  // Navigation views: 'dashboard', 'about', 'phase1', 'phase2', 'rewards', 'faq', 'contact'
  const [currentView, setCurrentView] = useState('dashboard');
  const [team, setTeam] = useState(null);
  const [toast, setToast] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load and verify existing session from localStorage on initial boot
  useEffect(() => {
    const token = localStorage.getItem('elitex_token');
    const savedTeam = localStorage.getItem('elitex_team');

    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam));
      } catch {
        // ignore parse error
      }
    }

    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.team) {
          setTeam(data.team);
          localStorage.setItem('elitex_team', JSON.stringify(data.team));
        } else {
          localStorage.removeItem('elitex_token');
          localStorage.removeItem('elitex_team');
          setTeam(null);
        }
      })
      .catch(() => {
        // network fallback: keep saved local session if offline
      })
      .finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleAuthSuccess = (authenticatedTeam) => {
    setTeam(authenticatedTeam);
    setCurrentView('dashboard');
    showToast(`Welcome, Team ${authenticatedTeam.teamName}! Assigned ID: ${authenticatedTeam.teamId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('elitex_token');
    localStorage.removeItem('elitex_team');
    setTeam(null);
    setCurrentView('dashboard');
    showToast('You have been logged out. Session terminated.');
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      
      {/* High-Tech Background Circuit & Particle Canvas */}
      <CosmicBackground />

      {/* Floating System Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl bg-navy-900 text-white border border-emerald-400 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
              ELITEX SYSTEM DISPATCH
            </div>
            <div className="text-xs font-tech font-bold text-slate-100 mt-0.5 leading-snug">
              {toast}
            </div>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white text-xs font-mono ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------------- 1. BEFORE LOGIN: DEDICATED LOGIN / REGISTRATION PAGE ---------------- */}
      {!team ? (
        <AuthPage onAuthSuccess={handleAuthSuccess} onToast={showToast} />
      ) : (
        /* ---------------- 2. AFTER SUCCESSFUL LOGIN: AUTHENTICATED STUDENT PANEL ---------------- */
        <div className="relative z-10 min-h-screen flex flex-col justify-between">
          
          {/* Authenticated Student Panel Top Navigation Bar */}
          <StudentNavbar 
            currentView={currentView}
            onNavigate={setCurrentView}
            team={team}
            onLogout={handleLogout}
            onToast={showToast}
          />

          {/* Active Panel View */}
          <main className="flex-1">
            {currentView === 'dashboard' && (
              <StudentDashboard 
                team={team}
                onNavigate={setCurrentView}
                onToast={showToast}
                onTeamUpdate={setTeam}
              />
            )}

            {currentView === 'about' && (
              <div className="pt-6">
                <AboutSection onSelectPhase={setCurrentView} />
              </div>
            )}

            {currentView === 'phase1' && (
              <Phase1Section 
                team={team}
                onBack={() => setCurrentView('dashboard')}
                onToast={showToast}
                onTeamUpdate={setTeam}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'phase2' && (
              <Phase2Section 
                onBack={() => setCurrentView('dashboard')}
                onToast={showToast}
              />
            )}

            {currentView === 'rewards' && (
              <div className="pt-6">
                <PrizesSection />
              </div>
            )}

            {currentView === 'faq' && (
              <div className="pt-6">
                <FAQSection />
              </div>
            )}

            {currentView === 'contact' && (
              <div className="pt-6">
                <ContactSection onToast={showToast} />
              </div>
            )}
          </main>

          {/* Authenticated Footer */}
          <footer className="w-full py-4 border-t border-slate-200/80 bg-white/70 text-center text-xs font-mono text-slate-500">
            ELITEX HACKATHON 2026 · Francis Xavier Engineering College · Student Command Panel
          </footer>

        </div>
      )}

    </div>
  );
}
