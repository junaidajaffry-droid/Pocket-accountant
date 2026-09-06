import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { AppSettings, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';
import { exportTransactionsToCSV, printTaxReportPDF, exportUserDataJSON } from '../utils/export';

interface TaxReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: AppSettings;
  onPurgeData: () => void;
}

export const TaxReportModal: React.FC<TaxReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
  onPurgeData
}) => {
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());
  const [showPrivacyOptions, setShowPrivacyOptions] = useState<boolean>(false);

  if (!isOpen) return null;

  const yearTxs = transactions.filter((t) => t.date.startsWith(String(taxYear)));
  const totalIncome = yearTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.baseAmount, 0);
  const totalExpense = yearTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.baseAmount, 0);
  const deductibleTxs = yearTxs.filter((t) => t.type === 'expense' && t.isTaxDeductible);
  const totalDeductible = deductibleTxs.reduce((s, t) => s + t.baseAmount, 0);
  const estimatedTaxSavings = Math.round(totalDeductible * (settings.taxRatePercentage / 100));

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      yearTxs,
      settings.baseCurrency,
      `spoken-ledger-tax-${taxYear}.csv`
    );
  };

  const handlePrintPDF = () => {
    printTaxReportPDF(
      transactions,
      settings.ledgerMode,
      settings.businessIndustry,
      settings.baseCurrency,
      taxYear
    );
  };

  const handleDownloadGDPRJson = () => {
    exportUserDataJSON({
      exportedAt: new Date().toISOString(),
      compliance: 'GDPR Article 20 / CCPA Data Portability',
      settings,
      transactionsCount: transactions.length,
      transactions
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-lg sm:text-xl text-slate-900 dark:text-white">
                Tax Reporting & Compliance Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                IRS / HMRC / FBR accounting software export & regional data privacy.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Year Selector & Overview */}
        <div className="flex items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Selected Tax Filing Year:
            </div>
            <div className="text-[11px] text-slate-400">
              Entity: {settings.ledgerMode === 'business' ? `Business (${settings.businessIndustry})` : 'Individual Household'}
            </div>
          </div>
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm font-bold"
          >
            {[2026, 2025, 2024, 2023].map((y) => (
              <option key={y} value={y}>
                Tax Year {y}
              </option>
            ))}
          </select>
        </div>

        {/* Tax Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Gross Income</div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatCurrency(totalIncome, settings.baseCurrency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Outflows</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(totalExpense, settings.baseCurrency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Deductible Claims</div>
            <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
              {formatCurrency(totalDeductible, settings.baseCurrency)}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Est. Tax Savings</div>
            <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
              ~{formatCurrency(estimatedTaxSavings, settings.baseCurrency)}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-500" />
            <span>Generate Accounting Reports</span>
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
            Exports match standard double-entry bookkeeping structures for QuickBooks, Xero, TurboTax, and Excel spreadsheets.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV (QuickBooks / Xero)</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Tax Schedule PDF</span>
            </button>
          </div>
        </div>

        {/* Regional Data Privacy (GDPR / CCPA) Accordion */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={() => setShowPrivacyOptions(!showPrivacyOptions)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-1"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Regional Data Privacy Compliance (GDPR & CCPA Rights)</span>
            </div>
            <span className="text-slate-400">{showPrivacyOptions ? 'Hide' : 'Manage Rights'}</span>
          </button>

          {showPrivacyOptions && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3 animate-in fade-in">
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                Under GDPR (Article 15, 17, 20) and CCPA, you retain sovereign rights over your financial records. Your entries are stored locally on your device with optional encrypted cloud replication. You can take out all data at any time or request permanent local erasure.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={handleDownloadGDPRJson}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Portability Data Takeout (JSON)</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to purge all local records? This cannot be undone.')) {
                      onPurgeData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Right to be Forgotten (Purge Local Data)</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
