import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldCheck, Check } from 'lucide-react';

interface BiometricPromptModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  isOpen,
  onSuccess
}) => {
  const [authenticating, setAuthenticating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setAuthenticating(true);
    setTimeout(() => {
      setAuthenticating(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h3 className="font-bold font-serif text-xl text-slate-900 dark:text-white mb-1">
          Biometric Lock Active
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Touch the sensor or scan Face ID to access your financial ledger.
        </p>

        <div className="my-6">
          <button
            onClick={handleSimulateScan}
            disabled={authenticating}
            className="w-20 h-20 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            {authenticating ? (
              <div className="w-8 h-8 border-3 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Fingerprint className="w-10 h-10" />
            )}
          </button>
        </div>

        <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
          {authenticating ? 'Verifying biometric credentials...' : 'Tap fingerprint sensor to unlock'}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Device Secure Enclave Protected</span>
        </div>
      </div>
    </div>
  );
};
