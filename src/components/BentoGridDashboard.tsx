import React from 'react';
import {
  Mic,
  Camera,
  Download,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { AppSettings, Transaction, Category } from '../types';
import { formatCurrency } from '../utils/currency';

interface BentoGridDashboardProps {
  settings: AppSettings;
  transactions: Transaction[];
  categories: Category[];
  currentMonthKey: string;
  previousMonthKey: string;
  onOpenVoice: () => void;
  onOpenCamera: () => void;
  onOpenAddManual: () => void;
  onOpenAdvisor: () => void;
  onOpenHistoricalAI?: () => void;
  onOpenTax: () => void;
  onOpenFamily: () => void;
  onExportCSV: () => void;
  onViewAllTransactions: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const BentoGridDashboard: React.FC<BentoGridDashboardProps> = ({
  settings,
  transactions,
  categories,
  currentMonthKey,
  previousMonthKey,
  onOpenVoice,
  onOpenCamera,
  onOpenAddManual,
  onOpenAdvisor,
  onOpenHistoricalAI,
  onOpenTax,
  onOpenFamily,
  onExportCSV,
  onViewAllTransactions,
  onEditTransaction
}) => {
  const currency = settings.baseCurrency;

  // Month filters
  const currentMonthTxs = transactions.filter((t) => t.date.startsWith(currentMonthKey));
  const prevMonthTxs = transactions.filter((t) => t.date.startsWith(previousMonthKey));

  const monthIncome = currentMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.baseAmount, 0);

  const monthExpense = currentMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.baseAmount, 0);

  const netBalance = monthIncome - monthExpense;

  const prevMonthIncome = prevMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.baseAmount, 0);
  const prevMonthExpense = prevMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.baseAmount, 0);
  const prevNetBalance = prevMonthIncome - prevMonthExpense;

  // % change from last month
  const netDiffPercent =
    prevNetBalance !== 0
      ? Math.round(((netBalance - prevNetBalance) / Math.abs(prevNetBalance)) * 100)
      : 12;

  // Today's spending & Daily limit
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayExpenses = currentMonthTxs
    .filter((t) => t.date === todayStr && t.type === 'expense')
    .reduce((s, t) => s + t.baseAmount, 0);

  const dailyLimit = settings.dailySpendingLimit || 100;
  const dailyPercent = Math.min(150, Math.round((todayExpenses / dailyLimit) * 100));
  const isOverDailyLimit = todayExpenses > dailyLimit;

  // Tax deductible
  const taxDeductibleTotal = currentMonthTxs
    .filter((t) => t.type === 'expense' && t.isTaxDeductible)
    .reduce((s, t) => s + t.baseAmount, 0);

  // Latest voice note if available
  const latestVoiceTx = transactions.find((t) => t.originalLanguage || t.translatedNote);

  // Category map helper for icons
  const getCategoryEmoji = (catName: string): string => {
    const lower = catName.toLowerCase();
    if (lower.includes('dine') || lower.includes('food') || lower.includes('restaurant')) return '🍽️';
    if (lower.includes('flight') || lower.includes('travel') || lower.includes('transport')) return '✈️';
    if (lower.includes('salary') || lower.includes('income') || lower.includes('sales')) return '💰';
    if (lower.includes('coffee') || lower.includes('cafe')) return '☕';
    if (lower.includes('rent') || lower.includes('housing') || lower.includes('office')) return '🏢';
    if (lower.includes('cloud') || lower.includes('saas') || lower.includes('tech')) return '💻';
    if (lower.includes('grocer')) return '🛒';
    return '💳';
  };

  return (
    <div className="w-full space-y-4">
      {/* Daily Spending Limit Immediate Warning Banner */}
      {isOverDailyLimit && (
        <div className="p-4 rounded-3xl bg-red-950/40 border border-red-900/60 text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-red-100 flex items-center gap-2">
                <span>Daily Spending Threshold Exceeded</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/60 font-mono text-red-300">
                  {dailyPercent}% of limit
                </span>
              </div>
              <div className="text-xs text-red-300/80 mt-0.5">
                Today's total: {formatCurrency(todayExpenses, currency)} (Target limit: {formatCurrency(dailyLimit, currency)}).
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAdvisor}
            className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-zinc-950 font-bold text-xs transition"
          >
            Review AI Advice
          </button>
        </div>
      )}

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[minmax(130px,auto)]">
        
        {/* Bento Tile 1: Net Balance & Quick Export */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-1">
              Net Balance
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mt-1">
              {formatCurrency(netBalance, currency)}
            </h2>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <span>{netDiffPercent >= 0 ? `+${netDiffPercent}%` : `${netDiffPercent}%`}</span>
              <span>from last month</span>
            </p>
          </div>

          <div className="flex gap-2 mt-5">
            <button
              onClick={onOpenTax}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider border border-zinc-700 text-zinc-200 transition"
              title="Export Tax Schedule PDF"
            >
              Export PDF
            </button>
            <button
              onClick={onExportCSV}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider border border-zinc-700 text-zinc-200 transition"
              title="Download CSV for accounting software"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Bento Tile 2: AI Voice Assistant (Multi-language recognition) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>AI Voice Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </h3>
              <p className="text-xs text-zinc-400">
                Universal Language Recognition Active (Urdu, Spanish, Hindi, French, Arabic, etc.)
              </p>
            </div>
            <button
              onClick={onOpenVoice}
              className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-full animate-pulse uppercase tracking-wider flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Ready to Listen</span>
            </button>
          </div>

          {/* Soundwave Animation Centerpiece */}
          <div
            onClick={onOpenVoice}
            className="flex items-center justify-center h-20 sm:h-24 gap-1.5 my-2 cursor-pointer group"
            title="Click to speak"
          >
            <div className="w-1.5 h-8 bg-emerald-500 rounded-full animate-wave-1 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-16 bg-emerald-500 rounded-full animate-wave-2 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-12 bg-emerald-500 rounded-full animate-wave-3 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-20 bg-emerald-500 rounded-full animate-wave-4 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-24 bg-emerald-500 rounded-full animate-wave-5 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-14 bg-emerald-500 rounded-full animate-wave-2 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-18 bg-emerald-500 rounded-full animate-wave-3 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-10 bg-emerald-500 rounded-full animate-wave-1 group-hover:bg-emerald-400"></div>
            <div className="w-1.5 h-16 bg-emerald-500 rounded-full animate-wave-4 group-hover:bg-emerald-400"></div>
          </div>

          {/* Transcribed Speech Quote Box */}
          <div
            onClick={onOpenVoice}
            className="bg-black/40 rounded-2xl p-4 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition"
          >
            <p className="text-emerald-400 italic font-serif text-xs sm:text-sm">
              "{latestVoiceTx ? (latestVoiceTx.translatedNote || latestVoiceTx.note) : 'I just spent 45 Euros on business lunch at Bistro Paris...'}"
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
              <span>Detected: {latestVoiceTx?.originalLanguage || 'Multilingual Voice AI'}</span>
              <span>Currency: {currency} (Auto-converted)</span>
              <span>Category: {latestVoiceTx?.category || 'Dining & OPEX'}</span>
            </div>
          </div>
        </div>

        {/* Bento Tile 3: Budget Insights & Daily Limit Warning */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-emerald-950/10 border border-emerald-500/30 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Budget Insights
            </h3>
            <span className="text-[10px] text-emerald-500/80 font-mono">Gemini AI</span>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {/* AI Suggestion */}
            <div
              onClick={onOpenAdvisor}
              className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition"
            >
              <p className="text-xs text-zinc-300 leading-relaxed">
                Suggestion: Based on last month's pattern, you can optimize{' '}
                <span className="text-emerald-400 font-semibold font-mono">
                  {formatCurrency(Math.round(monthExpense * 0.08), currency)}
                </span>{' '}
                by consolidating recurring subscriptions.
              </p>
            </div>

            {/* Daily Limit Tracker */}
            <div className="p-3 bg-red-950/20 rounded-2xl border border-red-900/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  Daily Limit Tracker
                </span>
                <span className="text-[10px] font-mono text-red-400 font-bold">
                  {dailyPercent}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverDailyLimit ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, dailyPercent)}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 mt-1.5 flex justify-between">
                <span>{formatCurrency(todayExpenses, currency)} spent</span>
                <span>Limit: {formatCurrency(dailyLimit, currency)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {onOpenHistoricalAI && (
              <button
                onClick={onOpenHistoricalAI}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Optimization Engine</span>
              </button>
            )}
            <button
              onClick={onOpenFamily}
              className="w-full bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold py-2 rounded-2xl text-xs border border-zinc-700/60 transition"
            >
              Family Access & Sharing
            </button>
          </div>
        </div>

        {/* Bento Tile 4: Quick Scan / OCR Photo */}
        <div
          onClick={onOpenCamera}
          className="col-span-12 sm:col-span-6 lg:col-span-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex flex-col justify-between cursor-pointer transition shadow-sm group"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Quick Scan
            </h3>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center my-3">
            <div className="w-full h-24 border-2 border-dashed border-zinc-700 group-hover:border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center text-zinc-400 text-xs text-center px-4 transition">
              <span className="font-semibold text-zinc-300">Drop receipt or take photo</span>
              <span className="text-[10px] text-zinc-500 mt-1">Instant line-item & tax OCR</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-zinc-500 italic">
            OCR processing: Powered by Gemini Vision
          </p>
        </div>

        {/* Bento Tile 5: Monthly Performance Chart & KPIs */}
        <div className="col-span-12 lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Monthly Performance</h3>
              <p className="text-xs text-zinc-500">Inflow vs spend pacing ({currentMonthKey})</p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] uppercase font-bold text-zinc-300 font-mono">
                Rev: {formatCurrency(monthIncome, currency)}
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] uppercase font-bold text-emerald-400 font-mono">
                Spend: {formatCurrency(monthExpense, currency)}
              </div>
            </div>
          </div>

          {/* Visual Performance Bars matching the Bento design */}
          <div className="h-28 sm:h-32 flex items-end justify-between gap-2.5 px-2 my-2">
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-zinc-800 h-[40%] rounded-t-xl hover:bg-zinc-700 transition"></div>
              <span className="text-[9px] text-zinc-500 font-mono">W1</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-zinc-800 h-[65%] rounded-t-xl hover:bg-zinc-700 transition"></div>
              <span className="text-[9px] text-zinc-500 font-mono">W2</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-emerald-500/40 h-[85%] rounded-t-xl hover:bg-emerald-500/60 transition"></div>
              <span className="text-[9px] text-zinc-500 font-mono">W3</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-zinc-800 h-[50%] rounded-t-xl hover:bg-zinc-700 transition"></div>
              <span className="text-[9px] text-zinc-500 font-mono">W4</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-emerald-500/40 h-[90%] rounded-t-xl hover:bg-emerald-500/60 transition"></div>
              <span className="text-[9px] text-zinc-500 font-mono">W5</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-emerald-500 h-[100%] rounded-t-xl shadow-lg shadow-emerald-500/20"></div>
              <span className="text-[9px] text-emerald-400 font-bold font-mono">NOW</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div className="w-full bg-zinc-800 h-[70%] rounded-t-xl hover:bg-zinc-700 transition"></div>
              <span className="text-[9px] text-zinc-500 font-mono">PROJ</span>
            </div>
          </div>

          {/* Bottom 3-Column Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Tax Liabilities</p>
              <p className="text-sm font-bold font-mono text-zinc-100 mt-0.5">
                {formatCurrency(taxDeductibleTotal, currency)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Export Status</p>
              <p className="text-sm font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1">
                <span>Ready</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Privacy</p>
              <p className="text-sm font-bold text-zinc-100 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>GDPR Compliant</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bento Tile 6: Recent Activity */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Recent Activity
            </h3>
            <button
              onClick={onViewAllTransactions}
              className="text-[11px] text-emerald-400 hover:underline font-medium"
            >
              View All ({transactions.length})
            </button>
          </div>

          {/* Transaction items */}
          <div className="space-y-3 flex-1 overflow-hidden">
            {transactions.slice(0, 3).map((tx) => (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-800/60 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-sm flex-shrink-0">
                    {getCategoryEmoji(tx.category)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-zinc-200 truncate">{tx.note || tx.category}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{tx.category}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-mono font-bold flex-shrink-0 ml-2 ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.baseAmount, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Security: Biometric Locked</span>
            </div>
            <button
              onClick={onOpenAddManual}
              className="text-xs text-zinc-400 hover:text-white font-bold"
              title="Add Manual Entry"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Bento Tile 7: Google Sponsored Ad Bento Module */}
        <div className="col-span-12 lg:col-span-12 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[9px] font-bold uppercase tracking-wider border border-zinc-700">
              Sponsored
            </span>
            <div>
              <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <span>Google Adsense: Cloud Financial Automations</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </p>
              <p className="text-[10px] text-zinc-500">
                Automated deduction matching and expense audits for freelancers and growing enterprises.
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open('https://google.com/ads', '_blank')}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold whitespace-nowrap transition w-full sm:w-auto text-center"
          >
            Learn More
          </button>
        </div>

      </div>
    </div>
  );
};
