import { Category, CurrencyInfo, FamilyMember, LedgerMode } from '../types';

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', rateToUSD: 0.79 },
  PKR: { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee', flag: '🇵🇰', rateToUSD: 278.5 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', rateToUSD: 83.4 },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rateToUSD: 3.67 },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rateToUSD: 3.75 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', rateToUSD: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', rateToUSD: 1.52 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', rateToUSD: 155.0 }
};

export const HOME_DEFAULT_CATEGORIES: Category[] = [
  { name: 'Groceries', color: '#10b981', type: 'expense', keywords: ['food', 'grocery', 'supermarket', 'market', 'vegetables', 'fruit', 'khana', 'sauda'], builtin: true },
  { name: 'Housing & Rent', color: '#3b82f6', type: 'expense', keywords: ['rent', 'mortgage', 'maintenance', 'hoa', 'kiraya'], builtin: true },
  { name: 'Utilities & Bills', color: '#f59e0b', type: 'expense', keywords: ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'bill', 'bijli'], builtin: true },
  { name: 'Transport & Fuel', color: '#6366f1', type: 'expense', keywords: ['petrol', 'fuel', 'gas', 'uber', 'taxi', 'bus', 'train', 'parking', 'metro'], builtin: true },
  { name: 'Dining & Cafes', color: '#ec4899', type: 'expense', keywords: ['restaurant', 'coffee', 'cafe', 'dinner', 'lunch', 'pizza', 'takeout'], builtin: true },
  { name: 'Healthcare & Pharma', color: '#ef4444', type: 'expense', keywords: ['doctor', 'medicine', 'hospital', 'clinic', 'dentist', 'pharmacy', 'dawai'], builtin: true },
  { name: 'Shopping & Apparel', color: '#8b5cf6', type: 'expense', keywords: ['clothes', 'shoes', 'amazon', 'mall', 'shopping', 'kapray'], builtin: true },
  { name: 'Entertainment', color: '#06b6d4', type: 'expense', keywords: ['movie', 'netflix', 'game', 'spotify', 'cinema', 'fun'], builtin: true },
  { name: 'Salary & Income', color: '#10b981', type: 'income', keywords: ['salary', 'paycheck', 'bonus', 'tanqah', 'wages'], builtin: true },
  { name: 'Investments & Gifts', color: '#84cc16', type: 'income', keywords: ['dividend', 'interest', 'gift', 'profit', 'crypto'], builtin: true },
  { name: 'Other', color: '#64748b', type: 'both', keywords: [], builtin: true }
];

export const DEFAULT_HOME_CATEGORIES = HOME_DEFAULT_CATEGORIES;
export const SUPPORTED_CURRENCIES = Object.values(CURRENCIES);

export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  kpiFocus: string[];
  categories: Category[];
  suggestedCategories: string[];
}

export const BUSINESS_INDUSTRIES: Record<string, IndustryConfig> = {
  retail: {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'Physical shops, online storefronts, inventory & shipping',
    icon: 'Store',
    kpiFocus: ['Gross Revenue', 'Cost of Goods (COGS)', 'Net Profit Margin', 'Inventory Turnover', 'Shipping & Returns'],
    suggestedCategories: ['COGS & Inventory', 'Shipping & Packaging', 'Storefront Rent', 'Advertising & Marketing', 'Product Sales', 'Other'],
    categories: [
      { name: 'COGS & Inventory', color: '#f97316', type: 'expense', builtin: true },
      { name: 'Shipping & Packaging', color: '#3b82f6', type: 'expense', builtin: true },
      { name: 'Storefront / Warehouse Rent', color: '#6366f1', type: 'expense', builtin: true },
      { name: 'Payment Fees (Stripe/POS)', color: '#8b5cf6', type: 'expense', builtin: true },
      { name: 'Advertising & Marketing', color: '#ec4899', type: 'expense', builtin: true },
      { name: 'Staff Wages & Payroll', color: '#ef4444', type: 'expense', builtin: true },
      { name: 'Product Sales', color: '#10b981', type: 'income', builtin: true },
      { name: 'Wholesale Orders', color: '#059669', type: 'income', builtin: true },
      { name: 'Other Business Expense', color: '#64748b', type: 'expense', builtin: true }
    ]
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant & Hospitality',
    description: 'Cafes, catering, bakeries, food trucks, and dining',
    icon: 'UtensilsCrossed',
    kpiFocus: ['Daily Covers & Revenue', 'Food Cost %', 'Labor Cost %', 'Kitchen Equipment Reserve', 'Beverage Margin'],
    suggestedCategories: ['Food & Raw Ingredients', 'Beverages & Stock', 'Kitchen Wages', 'Rent & Utilities', 'Dine-In Revenue', 'Takeout Orders'],
    categories: [
      { name: 'Food & Raw Ingredients', color: '#f97316', type: 'expense', builtin: true },
      { name: 'Beverages & Stock', color: '#eab308', type: 'expense', builtin: true },
      { name: 'Kitchen Staff & Wages', color: '#ef4444', type: 'expense', builtin: true },
      { name: 'Restaurant Rent & Utilities', color: '#3b82f6', type: 'expense', builtin: true },
      { name: 'Equipment & Maintenance', color: '#64748b', type: 'expense', builtin: true },
      { name: 'Licensing & Permits', color: '#8b5cf6', type: 'expense', builtin: true },
      { name: 'Dine-In Revenue', color: '#10b981', type: 'income', builtin: true },
      { name: 'Delivery / Takeout Orders', color: '#059669', type: 'income', builtin: true },
      { name: 'Catering Events', color: '#14b8a6', type: 'income', builtin: true }
    ]
  },
  tech: {
    id: 'tech',
    name: 'Technology & SaaS',
    description: 'Software dev, cloud apps, digital agencies, digital products',
    icon: 'Laptop',
    kpiFocus: ['Monthly Recurring Revenue (MRR)', 'Cash Runway (Months)', 'Cloud Infrastructure Burn', 'Customer Acquisition Cost', 'R&D Ratio'],
    suggestedCategories: ['Cloud Hosting', 'Developer Payroll', 'Software Subscriptions', 'Ad Spend', 'SaaS Subscriptions', 'Contract Engineering'],
    categories: [
      { name: 'Cloud Hosting (AWS/GCP)', color: '#3b82f6', type: 'expense', builtin: true },
      { name: 'Developer & Team Payroll', color: '#ef4444', type: 'expense', builtin: true },
      { name: 'Software Subscriptions (SaaS)', color: '#8b5cf6', type: 'expense', builtin: true },
      { name: 'Marketing & Ad Spend', color: '#ec4899', type: 'expense', builtin: true },
      { name: 'Legal, Compliance & IP', color: '#64748b', type: 'expense', builtin: true },
      { name: 'SaaS Subscriptions Revenue', color: '#10b981', type: 'income', builtin: true },
      { name: 'Contract Engineering', color: '#059669', type: 'income', builtin: true },
      { name: 'Enterprise Licenses', color: '#14b8a6', type: 'income', builtin: true }
    ]
  },
  services: {
    id: 'services',
    name: 'Consulting, Agency & Freelance',
    description: 'Client retainers, design, marketing, legal, accounting',
    icon: 'Briefcase',
    kpiFocus: ['Retainer Invoiced', 'Billable Utilization', 'Software Overhead', 'Tax Reserve Allocation', 'Effective Hourly Rate'],
    suggestedCategories: ['Subcontractors', 'Creative Tools', 'Office Space', 'Client Entertainment', 'Client Retainers', 'Consulting Fees'],
    categories: [
      { name: 'Subcontractors & Freelancers', color: '#8b5cf6', type: 'expense', builtin: true },
      { name: 'Creative Tools & Licenses', color: '#3b82f6', type: 'expense', builtin: true },
      { name: 'Office / Co-working Space', color: '#6366f1', type: 'expense', builtin: true },
      { name: 'Client Entertainment & Travel', color: '#f59e0b', type: 'expense', builtin: true },
      { name: 'Client Retainers', color: '#10b981', type: 'income', builtin: true },
      { name: 'Project Milestones', color: '#059669', type: 'income', builtin: true },
      { name: 'Consulting Fees', color: '#14b8a6', type: 'income', builtin: true }
    ]
  },
  construction: {
    id: 'construction',
    name: 'Construction, Real Estate & Trades',
    description: 'Contractors, plumbing, electrical, property development',
    icon: 'HardHat',
    kpiFocus: ['Project Margin', 'Material Outlay', 'Subcontractor Costs', 'Equipment Depreciation', 'Receivables Outstanding'],
    suggestedCategories: ['Building Materials', 'Subcontractor Labor', 'Tool & Fleet Rental', 'Fuel & Transport', 'Contract Milestones'],
    categories: [
      { name: 'Building Materials & Supplies', color: '#f97316', type: 'expense', builtin: true },
      { name: 'Subcontractor Labor', color: '#ef4444', type: 'expense', builtin: true },
      { name: 'Heavy Tool & Fleet Rental', color: '#64748b', type: 'expense', builtin: true },
      { name: 'Fuel & Transportation', color: '#eab308', type: 'expense', builtin: true },
      { name: 'Permits, Safety & Insurance', color: '#3b82f6', type: 'expense', builtin: true },
      { name: 'Contract Milestones', color: '#10b981', type: 'income', builtin: true },
      { name: 'Service Calls & Repairs', color: '#059669', type: 'income', builtin: true }
    ]
  },
  general: {
    id: 'general',
    name: 'General Commercial Enterprise',
    description: 'Small to mid-sized trading, logistics, or multi-sector business',
    icon: 'Building2',
    kpiFocus: ['Net Operating Margin', 'Cash Flow Buffer', 'Operating Expenses (OPEX)', 'Tax Withholding', 'Payables'],
    suggestedCategories: ['Operating Expenses', 'Staff Salaries', 'Office Rent', 'Utilities', 'Commercial Sales', 'Service Contracts'],
    categories: [
      { name: 'Operating Expenses', color: '#f97316', type: 'expense', builtin: true },
      { name: 'Staff Salaries & Benefits', color: '#ef4444', type: 'expense', builtin: true },
      { name: 'Office Rent & Facilities', color: '#3b82f6', type: 'expense', builtin: true },
      { name: 'Utilities & Telecom', color: '#eab308', type: 'expense', builtin: true },
      { name: 'Commercial Sales', color: '#10b981', type: 'income', builtin: true },
      { name: 'Service Contracts', color: '#059669', type: 'income', builtin: true }
    ]
  }
};

export const DEFAULT_SETTINGS = {
  ledgerMode: 'home' as LedgerMode,
  businessIndustry: 'retail',
  themeColor: 'classic' as const,
  colorTheme: 'classic' as const,
  darkMode: false,
  baseCurrency: 'USD',
  dailySpendingLimit: 120,
  monthlyBudget: 3500,
  biometricEnabled: false,
  biometricAuthEnabled: false,
  pushNotificationsEnabled: true,
  taxRatePercentage: 20,
  isOnboarded: false
};

const todayISO = new Date().toISOString().slice(0, 10);
const yesterdayISO = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

export const INITIAL_SAMPLE_TRANSACTIONS = [
  {
    id: 'tx_sample_1',
    amount: 5400,
    currency: 'USD',
    baseAmount: 5400,
    type: 'income' as const,
    category: 'Salary & Income',
    note: 'Bi-weekly Direct Deposit Payroll',
    date: yesterdayISO,
    timestamp: new Date().toISOString(),
    isTaxDeductible: false,
    addedByMemberName: 'Primary Owner',
    synced: true
  },
  {
    id: 'tx_sample_2',
    amount: 86.45,
    currency: 'USD',
    baseAmount: 86.45,
    type: 'expense' as const,
    category: 'Groceries',
    note: 'Whole Foods organic produce & pantry restock',
    date: todayISO,
    timestamp: new Date().toISOString(),
    isTaxDeductible: false,
    addedByMemberName: 'Primary Owner',
    synced: true
  },
  {
    id: 'tx_sample_3',
    amount: 45.0,
    currency: 'USD',
    baseAmount: 45.0,
    type: 'expense' as const,
    category: 'Transport & Fuel',
    note: 'Chevron gasoline refill',
    date: todayISO,
    timestamp: new Date().toISOString(),
    isTaxDeductible: true,
    taxCategory: 'Business Travel Deductible',
    addedByMemberName: 'Primary Owner',
    synced: true
  },
  {
    id: 'tx_sample_4',
    amount: 145.2,
    currency: 'USD',
    baseAmount: 145.2,
    type: 'expense' as const,
    category: 'Utilities & Bills',
    note: 'High-speed fiber internet & cloud backup',
    date: yesterdayISO,
    timestamp: new Date().toISOString(),
    isTaxDeductible: true,
    taxCategory: 'Home Office Deduction',
    addedByMemberName: 'Sarah (Partner)',
    synced: true
  }
];

export const THEME_PALETTES = {
  classic: {
    id: 'classic',
    name: 'Navy & Gold',
    primary: 'from-amber-600 to-amber-500',
    accent: '#d97706',
    border: 'border-amber-400/30',
    ring: 'focus:ring-amber-500',
    card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
  },
  emerald: {
    id: 'emerald',
    name: 'Forest Emerald',
    primary: 'from-emerald-600 to-teal-500',
    accent: '#059669',
    border: 'border-emerald-400/30',
    ring: 'focus:ring-emerald-500',
    card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
  },
  indigo: {
    id: 'indigo',
    name: 'Electric Indigo',
    primary: 'from-indigo-600 to-blue-500',
    accent: '#4f46e5',
    border: 'border-indigo-400/30',
    ring: 'focus:ring-indigo-500',
    card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
  },
  crimson: {
    id: 'crimson',
    name: 'Ruby Crimson',
    primary: 'from-rose-600 to-red-500',
    accent: '#e11d48',
    border: 'border-rose-400/30',
    ring: 'focus:ring-rose-500',
    card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
  },
  amber: {
    id: 'amber',
    name: 'Sunset Bronze',
    primary: 'from-orange-500 to-amber-600',
    accent: '#ea580c',
    border: 'border-orange-400/30',
    ring: 'focus:ring-orange-500',
    card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Slate',
    primary: 'from-cyan-500 to-blue-600',
    accent: '#06b6d4',
    border: 'border-cyan-400/30',
    ring: 'focus:ring-cyan-500',
    card: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300'
  }
};

export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 'mem_1',
    name: 'You (Primary Owner)',
    email: 'fmhelittlechamp@gmail.com',
    role: 'owner',
    permissions: {
      canView: true,
      canAdd: true,
      canEditDelete: true,
      canViewAnalytics: true,
      canExportReports: true,
      canManageBudget: true
    },
    joinedAt: '2026-01-01'
  },
  {
    id: 'mem_2',
    name: 'Sarah (Partner / Sub-Access)',
    email: 'sarah.family@example.com',
    role: 'manager',
    permissions: {
      canView: true,
      canAdd: true,
      canEditDelete: true,
      canViewAnalytics: true,
      canExportReports: false,
      canManageBudget: false
    },
    joinedAt: '2026-02-15'
  }
];
