export type TransactionType = 'expense' | 'income';

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ReceiptDetails {
  merchant?: string;
  date?: string;
  taxAmount?: number;
  items?: ReceiptItem[];
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  baseAmount: number; // Normalized to user's base currency
  type: TransactionType;
  category: string;
  note: string;
  originalLanguage?: string;
  translatedNote?: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  photoUrl?: string;
  receiptDetails?: ReceiptDetails;
  isTaxDeductible?: boolean;
  taxCategory?: string;
  addedByMemberName?: string;
  synced?: boolean;
  syncStatus?: 'synced' | 'pending' | 'offline_created';
}

export interface Category {
  name: string;
  color: string;
  icon?: string;
  type?: TransactionType | 'both';
  keywords?: string[];
  builtin?: boolean;
}

export type LedgerMode = 'home' | 'business';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'contributor' | 'viewer';
  permissions: {
    canView: boolean;
    canAdd: boolean;
    canEditDelete: boolean;
    canViewAnalytics: boolean;
    canExportReports: boolean;
    canManageBudget: boolean;
  };
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'guest' | 'email';
  isLoggedIn: boolean;
}

export type ColorTheme = 'classic' | 'emerald' | 'indigo' | 'crimson' | 'amber' | 'cyber';

export interface AppSettings {
  ledgerMode: LedgerMode;
  businessIndustry: string;
  themeColor: ColorTheme;
  colorTheme?: ColorTheme;
  darkMode: boolean;
  baseCurrency: string;
  dailySpendingLimit: number;
  monthlyBudget: number;
  biometricEnabled: boolean;
  biometricAuthEnabled?: boolean;
  pushNotificationsEnabled: boolean;
  taxRatePercentage: number;
  isOnboarded: boolean;
}

export interface SavingsTip {
  title: string;
  advice: string;
  potentialSavings: number;
  priority: string;
}

export interface AIAdvisorData {
  summary: string;
  pacingAnalysis: string;
  budgetStatus?: string;
  savingsTips: SavingsTip[];
  analyzedAt?: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  rateToUSD: number;
}

export interface BudgetOptimizationItem {
  category: string;
  currentMonthlySpend: number;
  recommendedSpend: number;
  potentialMonthlySavings: number;
  annualImpact: number;
  actionStep: string;
  difficulty: 'Easy' | 'Moderate' | 'Strict';
}

export interface SpendingLeak {
  title: string;
  description: string;
  estimatedWastedMonthly: number;
  urgency: 'Immediate' | 'Warning' | 'Consideration';
}

export interface HistoricalAIAnalysisResult {
  financialHealthScore: number;
  healthRating: 'Exceptional' | 'Strong' | 'Moderate' | 'At Risk' | 'Critical';
  executiveSummary: string;
  historicalTrends: {
    monthlyIncomeAverage: number;
    monthlyExpenseAverage: number;
    savingsRatePercentage: number;
    volatilityIndex: 'Low' | 'Moderate' | 'High';
    burnRateTrajectory: string;
  };
  spendingLeaks: SpendingLeak[];
  optimizationRecommendations: BudgetOptimizationItem[];
  totalPotentialMonthlySavings: number;
  totalAnnualSavingsProjection: number;
  runwayAndMilestones: {
    currentEmergencyRunwayMonths: number;
    optimizedRunwayMonths: number;
    milestoneMessage: string;
  };
  analyzedAt: string;
}
