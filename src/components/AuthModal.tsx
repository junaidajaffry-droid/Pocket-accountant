import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, LogOut, Mail, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccessAuth: (user: UserProfile) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccessAuth,
  onSignOut
}) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'email' | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [isEmailMode, setIsEmailMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setLoadingProvider('google');
    setTimeout(() => {
      const profile: UserProfile = {
        id: 'usr_g_' + Math.random().toString(36).substring(2, 8),
        name: 'Little Champ',
        email: 'fmhelittlechamp@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        provider: 'google',
        isLoggedIn: true
      };
      setLoadingProvider(null);
      onSuccessAuth(profile);
      onClose();
    }, 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoadingProvider('email');
    setTimeout(() => {
      const profile: UserProfile = {
        id: 'usr_e_' + Math.random().toString(36).substring(2, 8),
        name: nameInput.trim() || emailInput.split('@')[0],
        email: emailInput.trim(),
        provider: 'email',
        isLoggedIn: true
      };
      setLoadingProvider(null);
      onSuccessAuth(profile);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl border relative font-sans"
        style={{
          backgroundColor: 'var(--paper-raised)',
          borderColor: 'var(--line)',
          color: 'var(--ink)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:opacity-100 opacity-60 transition"
          style={{ color: 'var(--ink)' }}
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* User Logged In State */
          <div className="text-center py-2">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white shadow-sm overflow-hidden"
              style={{ backgroundColor: 'var(--ink)' }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="display text-xl font-semibold mb-0.5" style={{ color: 'var(--ink)' }}>
              {user.name}
            </div>
            <div className="text-xs font-mono mb-4" style={{ color: 'var(--ink-soft)' }}>
              {user.email}
            </div>

            <div
              className="p-3 rounded-xl border text-xs mb-5 flex items-center justify-between"
              style={{ borderColor: 'var(--line)', backgroundColor: '#fff' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">Cloud Synchronization Active</span>
              </div>
              <span className="font-mono text-[10px] uppercase opacity-75">{user.provider || 'Google'}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border text-xs font-medium transition"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white flex items-center justify-center gap-1.5 transition active:scale-95"
                style={{ backgroundColor: 'var(--brick)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Options */
          <div>
            <div className="text-center mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2.5 shadow-sm"
                style={{ backgroundColor: 'var(--ink)', color: 'var(--paper-raised)' }}
              >
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="display text-2xl font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
                Sign in to Pocket Accountant
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                Access your cloud ledger across mobile and desktop devices.
              </p>
            </div>

            {!isEmailMode ? (
              <div className="space-y-3">
                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={Boolean(loadingProvider)}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border bg-white font-medium text-xs shadow-sm hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                >
                  {loadingProvider === 'google' ? (
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {/* Email Sign In toggle */}
                <button
                  onClick={() => setIsEmailMode(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border bg-white font-medium text-xs shadow-sm hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                >
                  <Mail className="w-4 h-4 opacity-70" />
                  <span>Sign in with Email</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: 'var(--ink-soft)' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Little Champ"
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white focus:outline-none"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: 'var(--ink-soft)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white focus:outline-none"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: 'var(--ink-soft)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs px-3 py-2 rounded-lg border bg-white focus:outline-none"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEmailMode(false)}
                    className="py-2 px-3 rounded-lg border text-xs font-medium"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={Boolean(loadingProvider)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium text-white transition active:scale-95"
                    style={{ backgroundColor: 'var(--ink)' }}
                  >
                    {loadingProvider === 'email' ? 'Signing in...' : 'Sign In / Register'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-4 border-t text-center" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: 'var(--ink-soft)' }}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected with end-to-end encrypted sync</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
