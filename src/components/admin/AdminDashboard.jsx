import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Award, 
  AlertTriangle, 
  UserCheck, 
  Megaphone, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  RotateCcw, 
  ExternalLink, 
  Sparkles,
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

// Sub-views
import AdminOverviewView from './views/AdminOverviewView';
import AdminTeamsView from './views/AdminTeamsView';
import AdminParticipantsView from './views/AdminParticipantsView';
import AdminSlotsView from './views/AdminSlotsView';
import AdminAssessmentsView from './views/AdminAssessmentsView';
import AdminMalpracticeView from './views/AdminMalpracticeView';
import AdminApprovalsView from './views/AdminApprovalsView';
import AdminAnnouncementsView from './views/AdminAnnouncementsView';
import AdminSettingsView from './views/AdminSettingsView';

export default function AdminDashboard({ admin, onLogout, onSwitchToStudent, onToast, onUpdateAdmin }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Mandatory First-Login Password Change Modal State
  const [forcePasswordModal, setForcePasswordModal] = useState(Boolean(admin?.mustChangePassword));
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');

  // Fetch telemetry overview statistics
  const fetchTelemetry = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('elitex_admin_token');
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.warn('Failed to load admin telemetry:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    soundFx.playClick();
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  // Handle First-Login Mandatory Password Change
  const handleMandatoryPasswordChange = async (e) => {
    e.preventDefault();
    setChangeError('');

    if (!curPass || !newPass || !confPass) {
      setChangeError('All fields are required.');
      return;
    }

    if (newPass !== confPass) {
      setChangeError('New password and confirmation do not match.');
      return;
    }

    if (newPass.length < 8) {
      setChangeError('New password must be at least 8 characters in length.');
      return;
    }

    try {
      setChangeLoading(true);
      soundFx.playClick();
      const token = localStorage.getItem('elitex_admin_token');

      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: curPass,
          newPassword: newPass,
          confirmPassword: confPass
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rotate password.');

      soundFx.playSuccess();
      if (data.token) localStorage.setItem('elitex_admin_token', data.token);
      if (data.admin) {
        localStorage.setItem('elitex_admin_profile', JSON.stringify(data.admin));
        if (onUpdateAdmin) onUpdateAdmin(data.admin);
      }

      setForcePasswordModal(false);
      if (onToast) onToast('Administrator password updated. Account secured!');

    } catch (err) {
      soundFx.playError();
      setChangeError(err.message);
    } finally {
      setChangeLoading(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'approvals', label: 'Pending Approvals', icon: UserCheck, badge: stats?.pendingApprovals },
    { id: 'teams', label: 'Teams', icon: ShieldCheck, badge: stats?.totalTeams },
    { id: 'participants', label: 'Participants', icon: Users, badge: stats?.totalParticipants },
    { id: 'slots', label: 'Phase 1 Slot Bookings', icon: Calendar },
    { id: 'assessments', label: 'Assessment Results', icon: Award, badge: stats?.availableResults },
    { id: 'malpractice', label: 'Malpractice Records', icon: AlertTriangle, badge: stats?.flaggedMalpractice, badgeColor: 'bg-rose-500' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-navy-900 text-emerald-400 flex items-center justify-center font-bold text-base shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600">
                FXEC × ELITE BATCH 2025-29
              </div>
              <h1 className="text-sm sm:text-base font-display font-black text-navy-900 leading-tight">
                ELITEX <span className="text-emerald-500">ADMIN</span> COMMAND
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={fetchTelemetry}
            title="Refresh System Telemetry"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
          >
            <RotateCcw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onSwitchToStudent}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </button>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">{admin?.email}</span>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout Shell */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white/95 lg:bg-white/80 backdrop-blur-md border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
              COMMAND SECTIONS
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-tech font-bold transition-all
                    ${isActive 
                      ? 'bg-navy-900 text-white shadow-md shadow-navy-900/10' 
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100/80'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.badgeColor 
                        ? `${item.badgeColor} text-white` 
                        : isActive 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] font-mono text-slate-500 flex justify-between items-center">
            <div>
              <span className="font-bold text-navy-900">ELITEX 2026</span>
              <div className="text-[10px] text-slate-400">v1.2 · Admin Core</div>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-navy-950/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverviewView 
              stats={stats} 
              onNavigate={setActiveTab} 
              onRefresh={fetchTelemetry}
              loading={loadingStats}
            />
          )}

          {activeTab === 'approvals' && (
            <AdminApprovalsView onToast={onToast} />
          )}

          {activeTab === 'teams' && (
            <AdminTeamsView onToast={onToast} />
          )}

          {activeTab === 'participants' && (
            <AdminParticipantsView onToast={onToast} />
          )}

          {activeTab === 'slots' && (
            <AdminSlotsView onToast={onToast} />
          )}

          {activeTab === 'assessments' && (
            <AdminAssessmentsView onToast={onToast} />
          )}

          {activeTab === 'malpractice' && (
            <AdminMalpracticeView onToast={onToast} />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsView onToast={onToast} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView 
              admin={admin} 
              onLogout={onLogout} 
              onToast={onToast}
              onPasswordChanged={onUpdateAdmin}
            />
          )}
        </main>

      </div>

      {/* ----------------- MANDATORY FIRST-LOGIN PASSWORD ROTATION MODAL ----------------- */}
      {forcePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-emerald-400 p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 mb-1">
              SECURITY ENFORCEMENT PROTOCOL
            </div>
            <h3 className="text-xl font-display font-black text-navy-900 mb-2">
              Mandatory First-Login Password Rotation
            </h3>
            <p className="text-xs text-slate-600 font-tech leading-relaxed mb-5">
              To protect the ELITEX Hackathon database and participant records, you must replace the initial default password (<code className="bg-slate-100 px-1 py-0.5 rounded text-navy-900">elitexadmin</code>) with a strong, secure administrator password.
            </p>

            {changeError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{changeError}</span>
              </div>
            )}

            <form onSubmit={handleMandatoryPasswordChange} className="space-y-4 text-xs font-tech">
              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  Current Default Password *
                </label>
                <input 
                  type="password"
                  value={curPass}
                  onChange={(e) => setCurPass(e.target.value)}
                  placeholder="elitexadmin"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  New Secure Password * (Min 8 Characters)
                </label>
                <input 
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter strong new password"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block font-mono font-bold text-slate-700 uppercase mb-1">
                  Confirm New Password *
                </label>
                <input 
                  type="password"
                  value={confPass}
                  onChange={(e) => setConfPass(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={changeLoading}
                className="w-full mt-3 py-3 rounded-xl bg-navy-900 hover:bg-slate-900 text-white font-display font-bold text-xs tracking-wider shadow-lg flex items-center justify-center space-x-2 border border-emerald-400/40 transition-all disabled:opacity-50"
              >
                {changeLoading ? (
                  <span>Securing Administrator Account...</span>
                ) : (
                  <>
                    <span>SAVE & SECURE ACCOUNT</span>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
