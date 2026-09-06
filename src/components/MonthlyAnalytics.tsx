import React from 'react';
import {
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Download
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface MonthlyAnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonthKey: string;
  baseCurrency: string;
  onExportCSV: () => void;
  onOpenTaxReport: () => void;
}

export const MonthlyAnalytics: React.FC<MonthlyAnalyticsProps> = ({
  transactions,
  categories,
  currentMonthKey,
  baseCurrency,
  onExportCSV,
  onOpenTaxReport
}) => {
  const monthTxs = transactions.filter((t) => t.date.startsWith(currentMonthKey));
  const expenses = monthTxs.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((s, t) => s + t.baseAmount, 0);
  const totalIncome = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.baseAmount, 0);

  // Group by category
  const catTotals: Record<string, number> = {};
  expenses.forEach((t) => {
    catTotals[t.category] = (catTotals[t.category] || 0) + t.baseAmount;
  });

  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxVal = Math.max(1, ...Object.values(catTotals));

  const getCategoryColor = (name: string) => {
    const cat = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
    return cat?.color || '#64748b';
  };

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800 mb-6">
        <div>
          <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Monthly Analytics & Category Breakdown</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Comprehensive expense shares, income vs burn rate for {currentMonthKey}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>CSV Data</span>
          </button>
          <button
            onClick={onOpenTaxReport}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <span>Tax Schedule PDF</span>
          </button>
        </div>
      </div>

      {sortedCats.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs">
          No expenses logged in this monthly cycle yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCats.map(([catName, amt]) => {
            const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
            const barWidth = Math.round((amt / maxVal) * 100);
            const color = getCategoryColor(catName);

            return (
              <div key={catName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-zinc-200 truncate max-w-[160px] sm:max-w-xs">
                      {catName}
                    </span>
                    <span className="text-zinc-500 text-[11px] font-mono">({pct}%)</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-100">
                    {formatCurrency(amt, baseCurrency)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly Summary Footer */}
      <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-800">
          <div className="text-zinc-400 text-[10px] uppercase font-semibold">Total Outflows</div>
          <div className="text-sm font-bold font-mono text-red-400 mt-0.5">
            {formatCurrency(totalExpense, baseCurrency)}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-800">
          <div className="text-zinc-400 text-[10px] uppercase font-semibold">Total Inflows</div>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
            {formatCurrency(totalIncome, baseCurrency)}
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-800 col-span-2 sm:col-span-1">
          <div className="text-zinc-400 text-[10px] uppercase font-semibold">Net Retained</div>
          <div className="text-sm font-bold font-mono text-zinc-100 mt-0.5">
            {formatCurrency(totalIncome - totalExpense, baseCurrency)}
          </div>
        </div>
      </div>
    </div>
  );
};
