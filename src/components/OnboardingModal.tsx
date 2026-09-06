import React, { useState } from 'react';
import {
  Home,
  Building2,
  Check,
  ArrowRight,
  Sparkles,
  Store,
  UtensilsCrossed,
  Laptop,
  Briefcase,
  HardHat
} from 'lucide-react';
import { LedgerMode } from '../types';
import { BUSINESS_INDUSTRIES } from '../data/defaults';

interface OnboardingModalProps {
  isOpen: boolean;
  currentMode: LedgerMode;
  currentIndustry: string;
  onComplete: (mode: LedgerMode, industry: string) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  currentMode,
  currentIndustry,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState<'mode' | 'industry'>(currentMode === 'business' ? 'industry' : 'mode');
  const [selectedMode, setSelectedMode] = useState<LedgerMode>(currentMode);
  const [selectedIndustry, setSelectedIndustry] = useState<string>(currentIndustry || 'retail');

  if (!isOpen) return null;

  const industryIcons: Record<string, React.ReactNode> = {
    retail: <Store className="w-6 h-6 text-orange-500" />,
    restaurant: <UtensilsCrossed className="w-6 h-6 text-amber-500" />,
    tech: <Laptop className="w-6 h-6 text-blue-500" />,
    services: <Briefcase className="w-6 h-6 text-purple-500" />,
    construction: <HardHat className="w-6 h-6 text-amber-600" />,
    general: <Building2 className="w-6 h-6 text-emerald-500" />
  };

  const handleNextFromMode = () => {
    if (selectedMode === 'home') {
      onComplete('home', 'general');
    } else {
      setStep('industry');
    }
  };

  const handleFinish = () => {
    onComplete(selectedMode, selectedIndustry);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {step === 'mode' ? (
          <div>
            <div className="text-center mb-8">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 inline-flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tailor Your Financial Ledger</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
                How will you use Pocket Accountant?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                We configure tailored voice categories, tax rules, and tracking metrics based on your purpose.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Home Card */}
              <div
                onClick={() => setSelectedMode('home')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                  selectedMode === 'home'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                {selectedMode === 'home' && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Home & Personal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    Daily grocery runs, utility bills, family budget limits, dining, healthcare, and household savings goals.
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Includes: Family Sub-Accounts & Daily Limit Alerts
                  </div>
                </div>
              </div>

              {/* Business Card */}
              <div
                onClick={() => setSelectedMode('business')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                  selectedMode === 'business'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                {selectedMode === 'business' && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Business & Commercial
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    Revenue vs COGS, runway, profit margins, inventory, receipt OCR, employee payroll, and tax deductions.
                  </p>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    ✓ Includes: Industry-Specific KPIs & Tax Schedules
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleNextFromMode}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium flex items-center gap-2 shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <span>{selectedMode === 'home' ? 'Launch Home Dashboard' : 'Next: Select Industry'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 inline-flex items-center gap-1.5 mb-2">
                <Building2 className="w-3.5 h-3.5" />
                <span>Business Operating Mode</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
                Which industry are you operating in?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Pocket Accountant will automatically calibrate your financial metrics, chart widgets, and cost accounts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {Object.values(BUSINESS_INDUSTRIES).map((ind) => {
                const isSelected = selectedIndustry === ind.id;
                return (
                  <div
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {industryIcons[ind.id] || <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {ind.name}
                          </h4>
                          {isSelected && <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {ind.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ind.kpiFocus.slice(0, 2).map((kpi, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            >
                              {kpi}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep('mode')}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              >
                ← Back to Mode Choice
              </button>

              <button
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium flex items-center gap-2 shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Populate Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
