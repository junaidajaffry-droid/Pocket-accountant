import React from 'react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Laptop,
  Fingerprint,
  Bell,
  Coins,
  Shield,
  Check,
  Percent
} from 'lucide-react';
import { AppSettings, ColorTheme } from '../types';
import { SUPPORTED_CURRENCIES } from '../data/defaults';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

const COLOR_THEMES: { id: ColorTheme; name: string; hex: string; bgClass: string }[] = [
  { id: 'classic', name: 'Navy & Gold', hex: '#f59e0b', bgClass: 'bg-amber-500' },
  { id: 'emerald', name: 'Emerald Forest', hex: '#10b981', bgClass: 'bg-emerald-500' },
  { id: 'indigo', name: 'Electric Indigo', hex: '#6366f1', bgClass: 'bg-indigo-500' },
  { id: 'crimson', name: 'Ruby Crimson', hex: '#f43f5e', bgClass: 'bg-rose-500' },
  { id: 'amber', name: 'Sunset Bronze', hex: '#ea580c', bgClass: 'bg-orange-500' },
  { id: 'cyber', name: 'Cyber Teal', hex: '#06b6d4', bgClass: 'bg-cyan-500' }
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg sm:text-xl text-slate-900 dark:text-white">
                Personalization & Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize colors, currencies, spending alerts, and biometrics.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Accent Colors */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Interface Color Palette
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {COLOR_THEMES.map((theme) => {
                const isSelected = (settings.colorTheme || settings.themeColor) === theme.id;

                return (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ colorTheme: theme.id, themeColor: theme.id })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition ${
                      isSelected
                        ? 'border-slate-900 dark:border-white shadow-sm scale-105'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${theme.bgClass} flex items-center justify-center text-white shadow-sm`}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                      {theme.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Light / Dark / System */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Appearance Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
                { id: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> }
              ].map((m) => {
                const isSelected = settings.darkMode === (m.id === 'dark');

                return (
                  <button
                    key={m.id}
                    onClick={() => onUpdateSettings({ darkMode: m.id === 'dark' })}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency & Tax Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span>Base Currency</span>
              </label>
              <select
                value={settings.baseCurrency}
                onChange={(e) => onUpdateSettings({ baseCurrency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-blue-500" />
                <span>Tax Deduction Bracket (%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={settings.taxRatePercentage}
                onChange={(e) => onUpdateSettings({ taxRatePercentage: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Spending Limits (Daily & Monthly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Daily Spending Limit ({settings.baseCurrency})
              </label>
              <input
                type="number"
                value={settings.dailySpendingLimit}
                onChange={(e) => onUpdateSettings({ dailySpendingLimit: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Immediate warning triggers if today's expense exceeds this.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Monthly Budget Cap ({settings.baseCurrency})
              </label>
              <input
                type="number"
                value={settings.monthlyBudget}
                onChange={(e) => onUpdateSettings({ monthlyBudget: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">
                Monthly budget progress gauge target.
              </span>
            </div>
          </div>

          {/* Security & Notifications Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Biometric Authentication
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Require Face ID / Touch ID when unlocking the ledger.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.biometricAuthEnabled}
                onChange={(e) => onUpdateSettings({ biometricAuthEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">
                    Real-time Spending Alerts
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Push notifications when nearing daily or monthly limit.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.pushNotificationsEnabled}
                onChange={(e) => onUpdateSettings({ pushNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500"
              />
            </label>
          </div>

        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
