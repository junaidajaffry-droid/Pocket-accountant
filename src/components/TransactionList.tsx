import React, { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  FileCheck,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  CloudOff,
  CloudCheck,
  Camera
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  baseCurrency: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onViewPhoto: (photoUrl: string, transaction?: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  baseCurrency,
  onEdit,
  onDelete,
  onViewPhoto
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'tax'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter
  const filtered = transactions.filter((t) => {
    if (filterType === 'expense' && t.type !== 'expense') return false;
    if (filterType === 'income' && t.type !== 'income') return false;
    if (filterType === 'tax' && !t.isTaxDeductible) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNote = t.note.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchMember = (t.addedByMemberName || '').toLowerCase().includes(q);
      const matchMerchant = (t.receiptDetails?.merchant || '').toLowerCase().includes(q);
      if (!matchNote && !matchCat && !matchMember && !matchMerchant) return false;
    }
    return true;
  });

  // Group by date
  const byDate = filtered.reduce((acc, t) => {
    acc[t.date] = acc[t.date] || [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  const getCategoryColor = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return found?.color || '#10b981';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 text-zinc-100 shadow-xl space-y-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-4 border-b border-zinc-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search note, category, store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Type Filter Pills */}
          <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700/60 text-xs">
            {(['all', 'expense', 'income', 'tax'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                  filterType === t
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t === 'tax' ? 'Tax Deductions' : t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700/60 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Rows */}
      {dates.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs">
          No transactions match your search filter.
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((dateStr) => {
            const dayTxs = byDate[dateStr];
            const dateObj = new Date(dateStr + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={dateStr}>
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{formattedDate}</span>
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {dayTxs.map((t) => {
                    const isIncome = t.type === 'income';
                    const catColor = getCategoryColor(t.category);
                    const isOffline = t.syncStatus === 'offline_created' || t.synced === false;

                    return (
                      <div
                        key={t.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-800/50 px-3 rounded-2xl transition group"
                      >
                        {/* Category badge & details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: catColor }}
                          >
                            {t.category.slice(0, 2).toUpperCase()}
                          </div>

                          {/* Photo Thumbnail if attached */}
                          {t.photoUrl ? (
                            <button
                              onClick={() => onViewPhoto(t.photoUrl!, t)}
                              className="w-10 h-10 rounded-xl overflow-hidden border border-zinc-700 flex-shrink-0 hover:scale-105 transition relative group/img shadow-sm"
                              title="View full receipt photo & breakdown"
                            >
                              <img src={t.photoUrl} alt="Receipt" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                                <Camera className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">
                                {t.note}
                              </span>
                              {t.isTaxDeductible && (
                                <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                                  <FileCheck className="w-2.5 h-2.5" />
                                  <span>Tax Deductible</span>
                                </span>
                              )}
                              {isOffline && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                  <CloudOff className="w-2.5 h-2.5" />
                                  <span>Offline Record</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                              <span className="font-medium text-zinc-300">
                                {t.category}
                              </span>
                              {t.addedByMemberName && (
                                <>
                                  <span>•</span>
                                  <span>By {t.addedByMemberName}</span>
                                </>
                              )}
                              {t.originalLanguage && t.originalLanguage !== 'auto' && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-[10px]">Lang: {t.originalLanguage}</span>
                                </>
                              )}
                              {t.receiptDetails?.merchant && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-400 italic font-mono text-[10px] truncate max-w-[120px]">
                                    {t.receiptDetails.merchant}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={`font-mono font-bold text-sm sm:text-base ${
                                isIncome ? 'text-emerald-400' : 'text-zinc-100'
                              }`}
                            >
                              {isIncome ? '+' : '-'}{formatCurrency(t.baseAmount, baseCurrency)}
                            </div>
                          </div>

                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEdit(t)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-100"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(t.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
