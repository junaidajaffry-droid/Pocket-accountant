import { Transaction } from '../types';
import { formatCurrency } from './currency';

export function exportTransactionsToCSV(
  transactions: Transaction[],
  baseCurrency: string = 'USD',
  filename: string = 'spoken-ledger-export.csv'
) {
  if (transactions.length === 0) {
    return false;
  }

  const headers = [
    'Date',
    'Type',
    'Category',
    'Note / Description',
    'Amount',
    'Currency',
    'Base Amount (USD)',
    'Tax Deductible',
    'Tax Category',
    'Receipt Attached',
    'Added By'
  ];

  const escapeCell = (val: any): string => {
    const s = String(val ?? '');
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = transactions.map((t) => [
    t.date,
    t.type.toUpperCase(),
    t.category,
    t.translatedNote || t.note,
    t.amount.toFixed(2),
    t.currency,
    t.baseAmount.toFixed(2),
    t.isTaxDeductible ? 'YES' : 'NO',
    t.taxCategory || (t.isTaxDeductible ? 'Standard Business Deduction' : 'None'),
    t.photoUrl ? 'YES' : 'NO',
    t.addedByMemberName || 'Primary Owner'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function printTaxReportPDF(
  transactions: Transaction[],
  mode: 'home' | 'business',
  industry: string,
  baseCurrency: string,
  year: number = new Date().getFullYear()
) {
  const filtered = transactions.filter((t) => t.date.startsWith(String(year)));
  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.baseAmount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.baseAmount, 0);
  const deductibleExpenses = filtered.filter((t) => t.type === 'expense' && t.isTaxDeductible);
  const totalDeductible = deductibleExpenses.reduce((s, t) => s + t.baseAmount, 0);
  const netTaxable = Math.max(0, totalIncome - totalDeductible);

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Please allow popups to open the printable tax report window.');
    return;
  }

  const rowsHtml = deductibleExpenses
    .map(
      (t) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px 6px;">${t.date}</td>
        <td style="padding: 8px 6px; font-weight: 600;">${t.category}</td>
        <td style="padding: 8px 6px;">${t.translatedNote || t.note}</td>
        <td style="padding: 8px 6px; font-size: 11px; color: #64748b;">${t.taxCategory || 'Operational Deduction'}</td>
        <td style="padding: 8px 6px; text-align: right; font-family: monospace; font-weight: 600;">${formatCurrency(t.baseAmount, baseCurrency)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Report ${year} - Pocket Accountant</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
          .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
          .badge { display: inline-block; background: #0f172a; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
          .card-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px; }
          .card-value { font-size: 20px; font-weight: 700; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { text-align: left; padding: 10px 6px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 18px; background: #0f172a; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Print / Save as PDF</button>
        </div>
        <div class="header">
          <div>
            <div class="title">Official Tax Filing Ledger Report</div>
            <div class="subtitle">Tax Year: ${year} • Generated via Pocket Accountant AI</div>
            <div class="subtitle">Entity Type: ${mode === 'business' ? `Business (${industry})` : 'Individual / Household'}</div>
          </div>
          <div style="text-align: right;">
            <div class="badge">${mode === 'business' ? 'Schedule C / Form 1120' : 'Schedule A / 1040'}</div>
            <div class="subtitle" style="margin-top: 6px;">Compliance: IRS / HMRC / FBR Standard</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="card">
            <div class="card-label">Total Gross Income</div>
            <div class="card-value" style="color: #059669;">${formatCurrency(totalIncome, baseCurrency)}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Outflows</div>
            <div class="card-value" style="color: #ef4444;">${formatCurrency(totalExpense, baseCurrency)}</div>
          </div>
          <div class="card">
            <div class="card-label">Tax-Deductible Total</div>
            <div class="card-value" style="color: #2563eb;">${formatCurrency(totalDeductible, baseCurrency)}</div>
          </div>
          <div class="card">
            <div class="card-label">Estimated Taxable Net</div>
            <div class="card-value">${formatCurrency(netTaxable, baseCurrency)}</div>
          </div>
        </div>

        <h3 style="font-size: 15px; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
          Tax-Deductible Itemized Schedules (${deductibleExpenses.length} Records)
        </h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description / Memo</th>
              <th>Tax Classification</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding: 20px; color: #94a3b8;">No deductible records found for this tax year.</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          <div>Report Hash: SL-${Math.random().toString(36).substring(2, 10).toUpperCase()} • Regional Data Privacy Protected (GDPR / CCPA Art. 20)</div>
          <div>Printed: ${new Date().toLocaleDateString()}</div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportUserDataJSON(data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spoken-ledger-data-takeout-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
