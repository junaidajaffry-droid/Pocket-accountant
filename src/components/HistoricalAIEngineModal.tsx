import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { Transaction, AppSettings, HistoricalAIAnalysisResult } from '../types';
import { formatCurrency } from '../utils/currency';

interface HistoricalAIEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: AppSettings;
  onApplyRecommendedBudget?: (newMonthlyBudget: number, newDailyLimit: number) => void;
}

export const HistoricalAIEngineModal: React.FC<HistoricalAIEngineModalProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
  onApplyRecommendedBudget
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<HistoricalAIAnalysisResult | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | '6months' | '3months'>('all');
  const [appliedBudgetSuccess, setAppliedBudgetSuccess] = useState<boolean>(false);

  const currency = settings.baseCurrency;

  const runHistoricalAnalysis = async () => {
    setLoading(true);
    setAppliedBudgetSuccess(false);

    let filteredTxs = [...transactions];
    const now = new Date();

    if (timeframe === '3months') {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 7);
      filteredTxs = filteredTxs.filter((t) => t.date >= cutoff);
    } else if (timeframe === '6months') {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 7);
      filteredTxs = filteredTxs.filter((t) => t.date >= cutoff);
    }

    try {
      const response = await fetch('/api/ai/historical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: filteredTxs,
          monthlyBudget: settings.monthlyBudget,
          dailyLimit: settings.dailySpendingLimit,
          mode: settings.ledgerMode,
          industry: settings.businessIndustry,
          currency: settings.baseCurrency,
        }),
      });

      if (!response.ok) {
        throw new Error('AI analysis error: ' + response.status);
      }

      const data: HistoricalAIAnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.warn('Historical AI analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysisResult) {
      runHistoricalAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyCaps = () => {
    if (!analysisResult || !onApplyRecommendedBudget) return;
    const recTotal = analysisResult.optimizationRecommendations.reduce(
      (s, r) => s + r.recommendedSpend,
      0
    );
    const calculatedBudget = recTotal > 0 ? recTotal : Math.max(100, Math.round(settings.monthlyBudget * 0.85));
    const calculatedDaily = Math.round(calculatedBudget / 30);
    onApplyRecommendedBudget(calculatedBudget, calculatedDaily);
    setAppliedBudgetSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 text-zinc-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">AI Historical Financial Engine</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase tracking-wider">
                  Deep Optimization
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Audits all historical income & outflows to detect leakages, structural trends, and savings milestones.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter / Trigger Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-800/50 border border-zinc-800 mb-6">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-medium">Historical Range:</span>
            <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-700/60">
              <button
                onClick={() => { setTimeframe('all'); runHistoricalAnalysis(); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  timeframe === 'all' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Records
              </button>
              <button
                onClick={() => { setTimeframe('6months'); runHistoricalAnalysis(); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  timeframe === '6months' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Past 6 Months
              </button>
              <button
                onClick={() => { setTimeframe('3months'); runHistoricalAnalysis(); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  timeframe === '3months' ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Past 3 Months
              </button>
            </div>
          </div>

          <button
            onClick={runHistoricalAnalysis}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 text-xs font-bold flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Historical Data...' : 'Re-run AI Analysis'}</span>
          </button>
        </div>

        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
            <div className="text-sm font-semibold text-zinc-200">Evaluating multi-month income & expense patterns...</div>
            <div className="text-xs text-zinc-500">Formulating custom savings opportunities and budget optimization caps</div>
          </div>
        )}

        {!loading && analysisResult && (
          <div className="space-y-6">
            {/* Health Score & Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-850/80 bg-zinc-800/40 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono text-zinc-400 font-bold">Health Score</span>
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="my-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-mono text-emerald-400">
                      {analysisResult.financialHealthScore}
                    </span>
                    <span className="text-zinc-500 font-mono">/100</span>
                  </div>
                  <div className="mt-1">
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {analysisResult.healthRating} Condition
                    </span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, analysisResult.financialHealthScore)}%` }}
                  />
                </div>
              </div>

              <div className="md:col-span-2 p-5 rounded-2xl bg-zinc-850/80 bg-zinc-800/40 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Executive Financial Summary</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {analysisResult.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-zinc-800/80 text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Avg Inflow</div>
                    <div className="font-mono font-bold text-emerald-400">
                      {formatCurrency(analysisResult.historicalTrends.monthlyIncomeAverage, currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Avg Outflow</div>
                    <div className="font-mono font-bold text-red-400">
                      {formatCurrency(analysisResult.historicalTrends.monthlyExpenseAverage, currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase">Savings Rate</div>
                    <div className="font-mono font-bold text-zinc-100">
                      {analysisResult.historicalTrends.savingsRatePercentage}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Leaks & Irregularities */}
            {analysisResult.spendingLeaks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Detected Spending Leaks & Inefficiencies
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.spendingLeaks.map((leak, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-800/30 border border-amber-500/20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span>{leak.title}</span>
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold uppercase">
                            {leak.urgency}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{leak.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-500">Estimated Monthly Drag:</span>
                        <span className="text-red-400 font-bold">
                          -{formatCurrency(leak.estimatedWastedMonthly, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Budget Optimization Plan */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Actionable Category Budget Optimization
                  </h3>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Potential: +{formatCurrency(analysisResult.totalPotentialMonthlySavings, currency)}/mo (
                  {formatCurrency(analysisResult.totalAnnualSavingsProjection, currency)}/yr)
                </div>
              </div>

              <div className="space-y-3">
                {analysisResult.optimizationRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span className="font-bold text-sm text-zinc-100">{rec.category}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {rec.difficulty} Effort
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-zinc-500">Current: </span>
                          <span className="text-zinc-300 font-bold">{formatCurrency(rec.currentMonthlySpend, currency)}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                        <div>
                          <span className="text-zinc-500">Target: </span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(rec.recommendedSpend, currency)}</span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                          +{formatCurrency(rec.potentialMonthlySavings, currency)}/mo
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/70">
                      💡 <strong className="text-zinc-200">Recommended Action:</strong> {rec.actionStep}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Milestone & Runway Expansion */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Reserve Runway & Goal Acceleration</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300">
                  {analysisResult.runwayAndMilestones.milestoneMessage}
                </p>
                <div className="text-xs text-zinc-500 mt-1 font-mono">
                  Current Runway: {analysisResult.runwayAndMilestones.currentEmergencyRunwayMonths} mo → Optimized Runway: <span className="text-emerald-400 font-bold">{analysisResult.runwayAndMilestones.optimizedRunwayMonths} mo</span>
                </div>
              </div>

              {onApplyRecommendedBudget && (
                <button
                  onClick={handleApplyCaps}
                  disabled={appliedBudgetSuccess}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap transition ${
                    appliedBudgetSuccess
                      ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 shadow-md'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{appliedBudgetSuccess ? '✓ Budget Caps Applied' : 'Apply Recommended Caps'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
