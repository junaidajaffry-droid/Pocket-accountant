import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  PiggyBank,
  Wallet,
  Calendar,
  Building2,
  Home,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { AppSettings, Transaction } from '../types';
import { BUSINESS_INDUSTRIES } from '../data/defaults';
import { formatCurrency } from '../utils/currency';

interface DashboardKPIsProps {
  settings: AppSettings;
  transactions: Transaction[];
  currentMonthKey: string; // YYYY-MM
  onOpenVoice: () => void;
  onOpenCamera: () => void;
  onOpenAddManual: () => void;
  onOpenAdvisor: () => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  settings,
  transactions,
  currentMonthKey,
  onOpenVoice,
  onOpenCamera,
  onOpenAddManual,
  onOpenAdvisor
}) => {
  const currency = settings.baseCurrency;
  const industryConfig = BUSINESS_INDUSTRIES[settings.businessIndustry] || BUSINESS_INDUSTRIES.general;

  // Filter current month transactions
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonthKey));
  const monthIncome = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.baseAmount, 0);
  const monthExpense = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.baseAmount, 0);
  const netSavings = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? Math.round((netSavings / monthIncome) * 100) : 0;

  // Today's spending
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenses = monthTxs
    .filter((t) => t.date === todayStr && t.type === 'expense')
    .reduce((s, t) => s + t.baseAmount, 0);

  const dailyLimit = settings.dailySpendingLimit || 100;
  const dailyPercent = Math.min(100, Math.round((todayExpenses / dailyLimit) * 100));
  const isOverDailyLimit = todayExpenses > dailyLimit;

  // Days calculations
  const today = new Date();
  const currentDay = today.getDate();
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthlyBudget = settings.monthlyBudget || 3000;
  const monthlyPercent = Math.min(100, Math.round((monthExpense / monthlyBudget) * 100));
  const isOverMonthlyBudget = monthExpense > monthlyBudget;

  // Industry-specific derived metrics
  const cogsExpenses = monthTxs
    .filter((t) => t.type === 'expense' && (t.category.toLowerCase().includes('cogs') || t.category.toLowerCase().includes('inventory') || t.category.toLowerCase().includes('ingredient') || t.category.toLowerCase().includes('material')))
    .reduce((s, t) => s + t.baseAmount, 0);

  const estimatedRunwayMonths = monthExpense > 0 ? ((netSavings > 0 ? 12 : Math.max(1, Math.round((monthIncome * 3) / monthExpense))) ) : 6;
  const taxDeductibleTotal = monthTxs.filter((t) => t.type === 'expense' && t.isTaxDeductible).reduce((s, t) => s + t.baseAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Daily Spending Limit Immediate Warning Banner */}
      {isOverDailyLimit && (
        <div className="p-4 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 flex items-center justify-between animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Daily Spending Limit Exceeded!</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-mono">
                  {formatCurrency(todayExpenses, currency)} / {formatCurrency(dailyLimit, currency)}
                </span>
              </div>
              <div className="text-xs text-rose-100 mt-0.5">
                Immediate Alert: Today's outflows surpassed your target limit by {formatCurrency(todayExpenses - dailyLimit, currency)}.
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAdvisor}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 shadow-sm"
          >
            <span>Ask AI Advice</span>
          </button>
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Income / Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{settings.ledgerMode === 'business' ? 'Gross Inflows' : 'Monthly Income'}</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(monthIncome, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{monthTxs.filter((t) => t.type === 'income').length} deposits logged</span>
            </div>
          </div>
        </div>

        {/* Total Outflows / OPEX */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{settings.ledgerMode === 'business' ? 'Operating Expenses' : 'Total Spent'}</span>
            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(monthExpense, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{monthTxs.filter((t) => t.type === 'expense').length} expenses recorded</span>
            </div>
          </div>
        </div>

        {/* Net Savings / Net Margin */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{settings.ledgerMode === 'business' ? 'Net Operating Margin' : 'Net Cashflow'}</span>
            <div className={`p-1.5 rounded-lg ${netSavings >= 0 ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'}`}>
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatCurrency(netSavings, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>{savingsRate}% margin / rate</span>
            </div>
          </div>
        </div>

        {/* Industry Focus Metric / Tax Reserve */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>{settings.ledgerMode === 'business' ? 'Tax Deductions Tracked' : 'Daily Spend Velocity'}</span>
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {settings.ledgerMode === 'business'
                ? formatCurrency(taxDeductibleTotal, currency)
                : formatCurrency(currentDay > 0 ? Math.round(monthExpense / currentDay) : 0, currency)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{settings.ledgerMode === 'business' ? 'Schedule C ready' : 'Avg spent / day'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Dual Progress Gauges: Daily Limit & Monthly Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Daily Limit Gauge */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${isOverDailyLimit ? 'text-rose-500' : 'text-amber-500'}`} />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Today's Daily Spending Tracker
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(todayExpenses, currency)} / {formatCurrency(dailyLimit, currency)}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverDailyLimit
                  ? 'bg-rose-500'
                  : dailyPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${dailyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {isOverDailyLimit ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Exceeded limit by {formatCurrency(todayExpenses - dailyLimit, currency)}!</span>
              ) : (
                <span>{formatCurrency(dailyLimit - todayExpenses, currency)} remaining today</span>
              )}
            </span>
            <span>Day {currentDay} of {totalDaysInMonth}</span>
          </div>
        </div>

        {/* Monthly Budget Gauge */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Monthly Target Budget
              </span>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {formatCurrency(monthExpense, currency)} / {formatCurrency(monthlyBudget, currency)}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isOverMonthlyBudget
                  ? 'bg-rose-500'
                  : monthlyPercent > 85
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${monthlyPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {isOverMonthlyBudget ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Over monthly cap</span>
              ) : (
                <span>{formatCurrency(monthlyBudget - monthExpense, currency)} left in budget</span>
              )}
            </span>
            <span>{Math.round((currentDay / totalDaysInMonth) * 100)}% of month elapsed</span>
          </div>
        </div>

      </div>

    </div>
  );
};
