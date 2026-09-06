import React from 'react';
import {
  Mic,
  Camera,
  Plus,
  RefreshCw,
  Bell,
  Palette,
  ShieldCheck,
  Moon,
  Sun,
  Globe2,
  Users,
  FileSpreadsheet,
  Building2,
  Home,
  LogOut,
  ChevronDown,
  Sparkles,
  Wifi,
  WifiOff,
  CloudUpload
} from 'lucide-react';
import { AppSettings, UserProfile, LedgerMode } from '../types';
import { CURRENCIES, BUSINESS_INDUSTRIES } from '../data/defaults';

interface NavbarProps {
  user: UserProfile | null;
  settings: AppSettings;
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'offline';
  isOnline?: boolean;
  pendingOfflineCount?: number;
  onOpenAuth: () => void;
  onOpenTheme: () => void;
  onOpenOnboarding: () => void;
  onOpenVoice: () => void;
  onOpenCamera: () => void;
  onOpenAddManual: () => void;
  onSyncTrigger: () => void;
  onOpenHistoricalAI?: () => void;
  onOpenFamily?: () => void;
  onOpenTax?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  cloudSyncStatus,
  isOnline = true,
  pendingOfflineCount = 0,
  onOpenAuth,
  onOpenTheme,
  onOpenOnboarding,
  onOpenVoice,
  onOpenCamera,
  onOpenAddManual,
  onSyncTrigger,
  onOpenHistoricalAI,
  onOpenFamily,
  onOpenTax,
  onLogout
}) => {
  const [profileOpen, setProfileOpen] = React.useState(false);
  const currentCurr = CURRENCIES[settings.baseCurrency] || CURRENCIES.USD;
  const industryInfo = BUSINESS_INDUSTRIES[settings.businessIndustry];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-zinc-950/90 border-b border-zinc-800 text-zinc-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Mode Badge in Bento Aesthetic */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenOnboarding}>
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-zinc-950 text-xl shadow-lg shadow-emerald-500/20">
                $
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold leading-tight tracking-tight text-white flex items-center gap-1.5">
                    <span>FINANZA</span>
                    <span className="text-emerald-400">AI</span>
                  </h1>
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  {!isOnline ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <WifiOff className="w-3 h-3" />
                      <span>Offline Mode</span>
                    </span>
                  ) : pendingOfflineCount > 0 ? (
                    <span className="flex items-center gap-1 text-amber-300 font-medium">
                      <CloudUpload className="w-3 h-3 animate-pulse" />
                      <span>{pendingOfflineCount} Pending Sync</span>
                    </span>
                  ) : (
                    <>
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          cloudSyncStatus === 'syncing'
                            ? 'bg-amber-400 animate-ping'
                            : cloudSyncStatus === 'synced'
                            ? 'bg-emerald-400'
                            : 'bg-zinc-500'
                        }`}
                      />
                      <span>
                        Cloud: {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Synced'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Business / Home Mode Bento Pill */}
            <button
              onClick={onOpenOnboarding}
              className="hidden md:flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3.5 py-1.5 rounded-xl text-xs font-medium border border-zinc-800 transition"
              title="Click to switch between Home and Business industry modes"
            >
              {settings.ledgerMode === 'business' ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Business: {industryInfo?.name || 'SaaS Tech'}</span>
                </>
              ) : (
                <>
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Home & Household</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-zinc-500 ml-0.5" />
            </button>
          </div>

          {/* Quick Voice & Action Hub */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
              title="Speak in any language to log expense or income"
            >
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Voice Assistant</span>
            </button>

            {onOpenHistoricalAI && (
              <button
                onClick={onOpenHistoricalAI}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
                title="AI Historical Income & Expense Optimization Engine"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Financial Engine</span>
              </button>
            )}

            <button
              onClick={onOpenCamera}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition flex items-center gap-1.5"
              title="Quick Scan receipt with AI OCR"
            >
              <Camera className="w-4 h-4 text-zinc-400" />
              <span className="hidden md:inline">Quick Scan</span>
            </button>

            <button
              onClick={onOpenAddManual}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
              title="Record Manual Transaction"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Right Bento Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Theme palette dots preview */}
            <div
              onClick={onOpenTheme}
              className="hidden lg:flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition"
              title="Theme Personalization"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500" />
              <div className="w-3.5 h-3.5 rounded-full bg-purple-500" />
            </div>

            {/* Currency Pill */}
            <button
              onClick={onOpenTheme}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800 transition"
              title="Change Currency"
            >
              <span>{currentCurr.symbol}</span>
              <span>{currentCurr.code}</span>
            </button>

            {/* Force Sync */}
            <button
              onClick={onSyncTrigger}
              className={`p-2 rounded-xl text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition relative ${
                cloudSyncStatus === 'syncing' ? 'animate-spin text-emerald-400' : ''
              }`}
              title="Sync with Cloud"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {pendingOfflineCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Avatar Stack / User Auth */}
            {user && user.isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-zinc-800 transition"
                  title={`${user.name} (${user.email})`}
                >
                  <div className="flex -space-x-2">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-zinc-950 object-cover"
                    />
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                      {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 text-zinc-100"
                    onClick={() => setProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <div className="font-bold text-sm text-zinc-100">{user.name}</div>
                      <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-1 uppercase">
                        {user.authProvider} Account
                      </div>
                    </div>

                    <div className="py-1">
                      {onOpenHistoricalAI && (
                        <button
                          onClick={onOpenHistoricalAI}
                          className="w-full px-4 py-2 text-left text-xs text-emerald-400 hover:bg-zinc-800 flex items-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>AI Financial Engine</span>
                        </button>
                      )}
                      <button
                        onClick={onOpenTheme}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <Palette className="w-4 h-4 text-zinc-400" />
                        <span>Theme & Colors</span>
                      </button>
                      {onOpenTax && (
                        <button
                          onClick={onOpenTax}
                          className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
                          <span>Tax Export (PDF / CSV)</span>
                        </button>
                      )}
                      {onOpenFamily && (
                        <button
                          onClick={onOpenFamily}
                          className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                        >
                          <Users className="w-4 h-4 text-zinc-400" />
                          <span>Family & Sub-Accounts</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-zinc-800 pt-1">
                      <button
                        onClick={onLogout}
                        className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Reset</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
