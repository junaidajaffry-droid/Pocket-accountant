import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Camera,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Users,
  Building2,
  Home,
  CloudUpload,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  X,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';

import {
  Category,
  FamilyMember,
  LedgerMode,
  Transaction,
  UserProfile
} from './types';
import {
  BUSINESS_INDUSTRIES,
  DEFAULT_SETTINGS
} from './data/defaults';
import {
  isOnline,
  getPendingSyncCount,
  enqueueOfflineTransaction,
  performCloudSync
} from './utils/offlineSync';

// Modals
import { CameraReceiptModal } from './components/CameraReceiptModal';
import { ReceiptPhotoViewerModal } from './components/ReceiptPhotoViewerModal';
import { HistoricalAIEngineModal } from './components/HistoricalAIEngineModal';
import { TaxReportModal } from './components/TaxReportModal';
import { FamilyAccessModal } from './components/FamilyAccessModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdBanner } from './components/AdBanner';
import { AuthModal } from './components/AuthModal';

interface CurrencyDef {
  symbol: string;
  label: string;
}

const CURRENCIES: Record<string, CurrencyDef> = {
  PKR: { symbol: 'Rs', label: 'PKR — Rs' },
  USD: { symbol: '$', label: 'USD — $' },
  GBP: { symbol: '£', label: 'GBP — £' },
  EUR: { symbol: '€', label: 'EUR — €' },
  INR: { symbol: '₹', label: 'INR — ₹' },
  AED: { symbol: 'د.إ', label: 'AED — د.إ' },
  SAR: { symbol: '﷼', label: 'SAR — ﷼' },
  CAD: { symbol: 'CA$', label: 'CAD — CA$' },
  AUD: { symbol: 'A$', label: 'AUD — A$' },
  JPY: { symbol: '¥', label: 'JPY — ¥' }
};

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Food', color: '#A85238', keywords: ['food','lunch','dinner','breakfast','grocery','groceries','restaurant','coffee','tea','snack','pizza','burger','meal','eat','eating','cafe','khana','nashta','khaana','کھانا','ناشتہ','چائے','ہوٹل'], builtin: true },
  { name: 'Transport', color: '#3B6E8F', keywords: ['uber','taxi','cab','bus','fuel','petrol','gas station','transport','fare','rickshaw','careem','parking','train','ride','kiraya','petrol pump','رکشہ','کرایہ','پٹرول','ٹیکسی'], builtin: true },
  { name: 'Shopping', color: '#8A5FA0', keywords: ['shopping','clothes','clothing','shoes','amazon','mall','shirt','bag','shop','bought','kapray','خریداری','کپڑے','جوتے'], builtin: true },
  { name: 'Bills', color: '#B8902E', keywords: ['bill','electricity','rent','internet','wifi','phone bill','recharge','utility','water bill','gas bill','bijli','kiraya ghar','بل','بجلی','گیس','انٹرنیٹ'], builtin: true },
  { name: 'Entertainment', color: '#5F7F62', keywords: ['movie','netflix','cinema','game','concert','party','entertainment','subscription','spotify','فلم','تفریح'], builtin: true },
  { name: 'Health', color: '#C1546B', keywords: ['doctor','medicine','pharmacy','hospital','health','clinic','medical','dentist','dawai','دوائی','ڈاکٹر','ہسپتال'], builtin: true },
  { name: 'Other', color: '#6B6558', keywords: [], builtin: true }
];

const INCOME_CATEGORIES: Category[] = [
  { name: 'Salary', color: '#3B6E8F' },
  { name: 'Business', color: '#5F7F62' },
  { name: 'Freelance', color: '#8A5FA0' },
  { name: 'Gift', color: '#B8902E' },
  { name: 'Other Income', color: '#6B6558' }
];

const CUSTOM_PALETTE = ['#4C6B8A','#946B3F','#5B7A5E','#82527A','#B0555F','#3F7F73','#8C7A2E','#6A5A8C','#7A8C4C','#5E6B8C'];

const I18N = {
  en: {
    sub: "say it, and it's logged",
    totalLabel: 'Spent this month',
    incomeLabel: 'Income',
    netLabel: 'Net',
    voiceHintIdle: 'Tap and say something like "450 on groceries"',
    voiceHintListening: 'Listening… speak now',
    manualLink: 'or type it in instead',
    cameraLink: 'or snap a receipt photo',
    nospeech: "Voice input isn't available in this browser — use the text entry below.",
    byCategory: 'By category',
    manageCategories: 'manage categories',
    ledgerAdvice: "Ledger's advice",
    thisMonthEntries: "This month's entries",
    emptyTitle: 'The page is blank',
    emptyBody: 'Tap the mic above and speak your first expense for ',
    confirmHeard: 'Confirm what I heard',
    addExpense: 'Add an entry',
    amount: 'Amount',
    category: 'Category',
    note: 'Note',
    notePlaceholder: 'What was this for?',
    cancel: 'Cancel',
    save: 'Save entry',
    addPhoto: '📷 Add photo',
    expense: 'Expense',
    income: 'Income',
    dlMonthCsv: 'Download this month (CSV)',
    dlMonthXlsx: 'Download this month (Excel)',
    dlAllXlsx: 'Download all records (Excel)',
    catPlaceholder: 'e.g. Home, Office, Kids',
    add: 'Add',
    loggedToast: 'Logged',
    enterAmount: 'Enter an amount first',
    newCatPlaceholder: 'e.g. Home, Office, Kids'
  },
  ur: {
    sub: 'بولیں، اور یہ درج ہو جائے',
    totalLabel: 'اس مہینے خرچ',
    incomeLabel: 'آمدنی',
    netLabel: 'بچت',
    voiceHintIdle: 'مائیک دبائیں اور بولیں جیسے "450 groceries پر"',
    voiceHintListening: 'سن رہا ہوں… اب بولیں',
    manualLink: 'یا خود لکھیں',
    cameraLink: 'یا رسید کی تصویر لیں',
    nospeech: 'اس براؤزر میں وائس ان پٹ دستیاب نہیں — نیچے لکھ کر درج کریں۔',
    byCategory: 'کیٹیگری کے مطابق',
    manageCategories: 'کیٹیگریز مینج کریں',
    ledgerAdvice: 'لیجر کی رائے',
    thisMonthEntries: 'اس مہینے کی اندراجات',
    emptyTitle: 'صفحہ خالی ہے',
    emptyBody: 'مائیک دبائیں اور اپنا پہلا خرچ بولیں: ',
    confirmHeard: 'جو سنا اسے تصدیق کریں',
    addExpense: 'اندراج شامل کریں',
    amount: 'رقم',
    category: 'کیٹیگری',
    note: 'نوٹ',
    notePlaceholder: 'یہ کس لیے تھا؟',
    cancel: 'منسوخ',
    save: 'محفوظ کریں',
    addPhoto: '📷 تصویر شامل کریں',
    expense: 'خرچ',
    income: 'آمدنی',
    dlMonthCsv: 'اس مہینے کا CSV ڈاؤن لوڈ کریں',
    dlMonthXlsx: 'اس مہینے کا Excel ڈاؤن لوڈ کریں',
    dlAllXlsx: 'تمام ریکارڈ Excel میں ڈاؤن لوڈ کریں',
    catPlaceholder: 'مثلاً گھر، دفتر، بچے',
    add: 'شامل کریں',
    loggedToast: 'درج ہوگیا',
    enterAmount: 'پہلے رقم درج کریں',
    newCatPlaceholder: 'مثلاً گھر، دفتر، بچے'
  }
};

const WORD_NUMS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90
};

function normalizeDigits(text: string): string {
  const eastern = '٠١٢٣٤٥٦٧٨٩';
  const urdu = '۰۱۲۳۴۵۶۷۸۹';
  return text.replace(/[٠-٩۰-۹]/g, (ch) => {
    let idx = eastern.indexOf(ch);
    if (idx === -1) idx = urdu.indexOf(ch);
    return idx === -1 ? ch : String(idx);
  });
}

function wordsToNumber(text: string): number | null {
  const tokens = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  let total = 0;
  let current = 0;
  let found = false;
  for (const tok of tokens) {
    if (tok in WORD_NUMS) {
      current += WORD_NUMS[tok];
      found = true;
    } else if (tok === 'hundred') {
      current = (current || 1) * 100;
      found = true;
    } else if (tok === 'thousand') {
      total += (current || 1) * 1000;
      current = 0;
      found = true;
    }
  }
  return found ? total + current : null;
}

function monthKey(d: Date): string {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export const App: React.FC = () => {
  // Core Settings
  const [lang, setLang] = useState<'en' | 'ur'>(() => {
    return (localStorage.getItem('sl_lang') as 'en' | 'ur') || 'en';
  });
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('sl_currency') || 'PKR';
  });
  const [ledgerMode, setLedgerMode] = useState<LedgerMode>(() => {
    return (localStorage.getItem('sl_mode') as LedgerMode) || 'home';
  });
  const [businessIndustry, setBusinessIndustry] = useState<string>(() => {
    return localStorage.getItem('sl_industry') || 'retail';
  });

  // State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('spoken_ledger_txs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'tx_sample_1',
        amount: 450,
        currency: 'PKR',
        baseAmount: 450,
        type: 'expense',
        category: 'Food',
        note: 'Groceries and milk',
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
        synced: true
      },
      {
        id: 'tx_sample_2',
        amount: 2500,
        currency: 'PKR',
        baseAmount: 2500,
        type: 'expense',
        category: 'Bills',
        note: 'Electricity Bill',
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
        synced: true,
        isTaxDeductible: true
      }
    ];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('sl_categories');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('sl_family');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'mem_owner',
        name: 'Account Owner',
        email: 'owner@spokenledger.io',
        role: 'owner',
        permissions: {
          canView: true,
          canAdd: true,
          canEditDelete: true,
          canViewAnalytics: true,
          canExportReports: true,
          canManageBudget: true
        },
        joinedAt: new Date().toISOString()
      }
    ];
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => monthKey(new Date()));

  // Active form state (manual, voice confirmation, or receipt OCR)
  interface FormState {
    id?: string;
    amount: string;
    category: string;
    note: string;
    type: 'expense' | 'income';
    photo: string | null;
    isTaxDeductible?: boolean;
    isManual: boolean;
  }
  const [formState, setFormState] = useState<FormState | null>(null);

  // Speech Recognition state
  const [listening, setListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [noSpeechSupport, setNoSpeechSupport] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Categories manager panel toggle
  const [manageOpen, setManageOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isHistoricalAIOpen, setIsHistoricalAIOpen] = useState<boolean>(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState<boolean>(false);
  const [viewingPhotoTx, setViewingPhotoTx] = useState<Transaction | null>(null);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState<boolean>(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('spoken_ledger_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Offline / sync status
  const [isOnlineState, setIsOnlineState] = useState<boolean>(isOnline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = (key: keyof typeof I18N['en']) => {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key];
  };

  const getCurrencySymbol = () => {
    return CURRENCIES[currency]?.symbol || 'Rs';
  };

  const fmt = (n: number) => {
    return `${getCurrencySymbol()} ${Math.round(n).toLocaleString()}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sl_lang', lang);
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('sl_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('sl_mode', ledgerMode);
    localStorage.setItem('sl_industry', businessIndustry);
  }, [ledgerMode, businessIndustry]);

  useEffect(() => {
    localStorage.setItem('spoken_ledger_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('sl_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sl_family', JSON.stringify(familyMembers));
  }, [familyMembers]);

  // Network & Sync listeners
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnlineState(true);
      showToast('Online: synchronizing records to cloud...');
      setIsSyncing(true);
      const res = await performCloudSync('default_user', transactions, categories, {
        ...DEFAULT_SETTINGS,
        baseCurrency: currency,
        ledgerMode,
        businessIndustry,
        darkMode: false,
        biometricAuthEnabled: false,
        monthlyBudget: 50000,
        dailySpendingLimit: 2500,
        pushNotificationsEnabled: true
      }, familyMembers);
      setIsSyncing(false);
      if (res.success && res.mergedTransactions) {
        setTransactions(res.mergedTransactions);
        setPendingSyncCount(0);
      }
    };
    const handleOffline = () => {
      setIsOnlineState(false);
      showToast('Device is offline. Entries saved locally.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [transactions, categories, currency, ledgerMode, businessIndustry, familyMembers]);

  // Setup Web Speech API
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setNoSpeechSupport(true);
      return;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang === 'ur' ? 'ur-PK' : 'en-US';

    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };

    rec.onerror = (e: any) => {
      setListening(false);
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        showToast('Microphone access was blocked');
      } else if (e.error !== 'no-speech') {
        showToast('Voice input had an issue — try again or type');
      }
    };

    rec.onend = () => {
      setListening(false);
      setTranscript((current) => {
        const trimmed = current.trim();
        if (trimmed) {
          handleParsedInput(trimmed);
        }
        return '';
      });
    };

    recognitionRef.current = rec;
  }, [lang, categories]);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      if (noSpeechSupport) {
        showToast('Speech recognition not available on this browser');
      }
      return;
    }
    if (listening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setListening(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
        recognitionRef.current.start();
        setListening(true);
        setTranscript('');
      } catch {
        setListening(false);
      }
    }
  };

  const parseTranscript = (rawText: string) => {
    const text = normalizeDigits(rawText);
    const digitMatch = text.match(/(\d+(\.\d+)?)/);
    let amount = digitMatch ? parseFloat(digitMatch[1]) : wordsToNumber(text);
    if (!amount) amount = 0;

    const lower = text.toLowerCase();
    let bestCat = 'Other';
    let bestScore = 0;
    for (const cat of categories) {
      let score = 0;
      if (cat.keywords) {
        for (const kw of cat.keywords) {
          if (lower.includes(kw.toLowerCase())) score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestCat = cat.name;
      }
    }

    const incomeHints = ['salary', 'income', 'tanqah', 'got paid', 'received', 'freelance', 'payment received', 'تنخواہ', 'آمدنی', 'ملی', 'وصول'];
    const looksLikeIncome = incomeHints.some((w) => lower.includes(w.toLowerCase()));

    return {
      amount: amount || '',
      category: looksLikeIncome ? 'Salary' : bestCat,
      note: text.trim(),
      type: looksLikeIncome ? ('income' as const) : ('expense' as const)
    };
  };

  const handleParsedInput = (text: string) => {
    const parsed = parseTranscript(text);
    setFormState({
      amount: String(parsed.amount || ''),
      category: parsed.category,
      note: parsed.note,
      type: parsed.type,
      photo: null,
      isTaxDeductible: false,
      isManual: false
    });
  };

  // Photo compression helper to fit in localStorage safely
  const compressPhoto = (file: File, onDone: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 540;
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          onDone(canvas.toDataURL('image/jpeg', 0.65));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = () => {
    if (!formState) return;
    const amt = parseFloat(formState.amount);
    if (!amt || amt <= 0) {
      showToast(t('enterAmount'));
      return;
    }

    const now = new Date();
    const isEdit = Boolean(formState.id);
    const online = isOnline();

    if (isEdit && formState.id) {
      const updated = transactions.map((t) =>
        t.id === formState.id
          ? {
              ...t,
              amount: amt,
              baseAmount: amt,
              currency: currency,
              type: formState.type,
              category: formState.category,
              note: formState.note.trim() || formState.category,
              photoUrl: formState.photo || undefined,
              isTaxDeductible: formState.isTaxDeductible,
              synced: online
            }
          : t
      );
      setTransactions(updated);
      showToast(`${t('loggedToast')} ${fmt(amt)} — ${formState.category}`);
    } else {
      const newTx: Transaction = {
        id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
        amount: amt,
        currency: currency,
        baseAmount: amt,
        type: formState.type,
        category: formState.category,
        note: formState.note.trim() || formState.category,
        date: now.toISOString().slice(0, 10),
        timestamp: now.toISOString(),
        photoUrl: formState.photo || undefined,
        isTaxDeductible: formState.isTaxDeductible,
        synced: online,
        syncStatus: online ? 'synced' : 'offline_created'
      };
      setTransactions([newTx, ...transactions]);

      if (!online) {
        enqueueOfflineTransaction('create', newTx);
        setPendingSyncCount(getPendingSyncCount());
      }
      showToast(`${t('loggedToast')} ${fmt(amt)} — ${formState.category}`);
    }

    setSelectedMonth(monthKey(now));
    setFormState(null);
  };

  const handleDeleteExpense = (id: string) => {
    if (!isOnline()) {
      enqueueOfflineTransaction('delete', undefined, id);
      setPendingSyncCount(getPendingSyncCount());
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditExpense = (tx: Transaction) => {
    setFormState({
      id: tx.id,
      amount: String(tx.amount),
      category: tx.category,
      note: tx.note,
      type: tx.type,
      photo: tx.photoUrl || null,
      isTaxDeductible: tx.isTaxDeductible,
      isManual: true
    });
  };

  // Category addition/deletion
  const handleAddCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('That category already exists');
      return;
    }
    const color = CUSTOM_PALETTE[categories.length % CUSTOM_PALETTE.length];
    const newCats = [...categories];
    newCats.splice(newCats.length - 1, 0, { name: trimmed, color, keywords: [], builtin: false });
    setCategories(newCats);
    setNewCatName('');
    showToast('Category added');
  };

  const handleDeleteCategory = (catName: string) => {
    if (catName === 'Other') return;
    setCategories((prev) => prev.filter((c) => c.name !== catName));
    setTransactions((prev) =>
      prev.map((t) => (t.category === catName ? { ...t, category: 'Other' } : t))
    );
  };

  // Month navigation & calculations
  const allMonthKeys = () => {
    const set = new Set(transactions.map((e) => e.date.slice(0, 7)));
    set.add(selectedMonth);
    return Array.from(set).sort();
  };

  const handlePrevMonth = () => {
    const keys = allMonthKeys();
    const idx = keys.indexOf(selectedMonth);
    if (idx > 0) {
      setSelectedMonth(keys[idx - 1]);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      setSelectedMonth(monthKey(new Date(y, m - 2, 1)));
    }
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = monthKey(new Date(y, m, 1));
    if (next <= monthKey(new Date())) {
      setSelectedMonth(next);
    }
  };

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const currentMonthRecords = transactions.filter((t) => t.date.slice(0, 7) === selectedMonth);
  const currentMonthExpenses = currentMonthRecords.filter((t) => t.type !== 'income');
  const currentMonthIncomes = currentMonthRecords.filter((t) => t.type === 'income');
  const totalSpent = currentMonthExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = currentMonthIncomes.reduce((s, t) => s + t.amount, 0);
  const netSaved = totalIncome - totalSpent;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  categories.forEach((c) => (categoryTotals[c.name] = 0));
  currentMonthExpenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  const maxCategoryVal = Math.max(1, ...Object.values(categoryTotals));

  // Build Insights
  const buildInsights = () => {
    const keys = allMonthKeys();
    const priorKeys = keys.filter((k) => k < selectedMonth).slice(-3);
    const insights: Array<{ mark: string; text: string; action?: () => void }> = [];

    if (currentMonthExpenses.length === 0) {
      insights.push({
        mark: '—',
        text: 'Nothing logged for this month yet. Speak or type your first expense to get started.'
      });
      return insights;
    }

    if (priorKeys.length === 0) {
      insights.push({
        mark: '—',
        text: "This is your first month on record. Keep logging daily — I'll compare your spending and flag where you can save."
      });
    } else {
      let priorSum = 0;
      for (const k of priorKeys) {
        for (const t of transactions) {
          if (t.date.slice(0, 7) === k && t.type !== 'income') {
            priorSum += t.amount;
          }
        }
      }
      const priorTotal = priorSum / (priorKeys.length || 1);

      const today = new Date();
      if (selectedMonth === monthKey(today)) {
        const dayOfMonth = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const projected = (totalSpent / dayOfMonth) * daysInMonth;

        if (projected > priorTotal * 1.05) {
          const pct = Math.round(((projected - priorTotal) / priorTotal) * 100);
          insights.push({
            mark: '▲',
            text: `At your current pace you're on track to spend ${fmt(projected)} this month — about ${pct}% above your recent average of ${fmt(priorTotal)}.`
          });
        } else if (projected < priorTotal * 0.95) {
          const pct = Math.round(((priorTotal - projected) / priorTotal) * 100);
          insights.push({
            mark: '▼',
            text: `Good pace — you're tracking toward ${fmt(projected)} this month, roughly ${pct}% under your recent average.`
          });
        } else {
          insights.push({
            mark: '≈',
            text: `You're tracking close to your usual monthly spend of ${fmt(priorTotal)}.`
          });
        }
      }

      // Check category variances
      const catDiffs = categories
        .map((c) => {
          const curVal = categoryTotals[c.name] || 0;
          let catSum = 0;
          for (const k of priorKeys) {
            for (const t of transactions) {
              if (t.date.slice(0, 7) === k && t.category === c.name && t.type !== 'income') {
                catSum += t.amount;
              }
            }
          }
          const avgVal = catSum / (priorKeys.length || 1);
          return { cat: c.name, current: curVal, avg: avgVal, diff: curVal - avgVal };
        })
        .filter((d) => d.avg > 0 || d.current > 0);

      const overspent = catDiffs.filter((d) => d.avg > 0 && d.current > d.avg * 1.15 && d.diff > priorTotal * 0.03).sort((a, b) => b.diff - a.diff);
      if (overspent.length > 0) {
        const top = overspent[0];
        insights.push({
          mark: '$',
          text: `${top.cat} is running ${fmt(top.diff)} higher than usual (${fmt(top.current)} vs your average ${fmt(top.avg)}). Trimming this back is your fastest way to save this month.`
        });
      }

      const improved = catDiffs.filter((d) => d.avg > 0 && d.current < d.avg * 0.85).sort((a, b) => a.diff - b.diff);
      if (improved.length > 0) {
        const sav = improved[0];
        insights.push({
          mark: '✓',
          text: `You cut ${sav.cat} spending to ${fmt(sav.current)}, down from your usual ${fmt(sav.avg)}. That saved you ${fmt(sav.avg - sav.current)}.`
        });
      }
    }

    return insights;
  };

  // Group transactions by day
  const byDay = currentMonthRecords.reduce((acc, t) => {
    acc[t.date] = acc[t.date] || [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);
  const daysSorted = Object.keys(byDay).sort().reverse();

  // Excel / CSV Export
  const exportRecordsToRows = (list: Transaction[]) => {
    return list.slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((e) => ({
      Date: e.date,
      Type: e.type === 'income' ? 'Income' : 'Expense',
      Category: e.category,
      Note: e.note,
      Amount: e.amount,
      Currency: currency,
      TaxDeductible: e.isTaxDeductible ? 'Yes' : 'No',
      PhotoAttached: e.photoUrl ? 'Yes' : 'No'
    }));
  };

  const handleExportMonthCSV = () => {
    const rows = exportRecordsToRows(currentMonthRecords);
    if (rows.length === 0) {
      showToast('No records this month');
      return;
    }
    const headers = Object.keys(rows[0]);
    const escapeCell = (v: any) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const csv = [headers.join(','), ...rows.map((r: any) => headers.map((h) => escapeCell(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pocket-accountant-${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    showToast('Downloaded CSV');
  };

  const handleExportXLSX = (list: Transaction[], filename: string) => {
    const rows = exportRecordsToRows(list);
    if (rows.length === 0) {
      showToast('No records to export');
      return;
    }
    const XLSX = (window as any).XLSX;
    if (typeof XLSX === 'undefined') {
      showToast('Excel exporter is loading...');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    XLSX.writeFile(wb, filename);
    showToast('Downloaded Excel file');
  };

  const getCategoryColor = (catName: string, isIncome: boolean) => {
    if (isIncome) {
      const found = INCOME_CATEGORIES.find((c) => c.name === catName);
      return found?.color || '#5F7F62';
    }
    const found = categories.find((c) => c.name === catName);
    return found?.color || '#6B6558';
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: 'var(--paper)',
        color: 'var(--ink)'
      }}
    >
      <div className="max-w-[560px] mx-auto px-5 py-7 pb-20">
        
        {/* Header matching attached UI */}
        <div
          className="flex items-baseline justify-between pb-4 mb-5 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <div>
            <div className="display text-[26px] font-semibold tracking-tight leading-none">
              Pocket <span style={{ color: 'var(--gold)' }}>Accountant</span>
            </div>
            <div
              className="text-[11px] uppercase tracking-[0.12em] mt-1 font-medium"
              style={{ color: 'var(--ink-soft)' }}
            >
              {t('sub')}
            </div>
          </div>

          {/* Discreet status indicators & Sign In */}
          <div className="flex items-center gap-2">
            {!isOnlineState && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono font-medium"
                style={{ backgroundColor: 'var(--paper-raised)', color: 'var(--brick)', border: '1px solid var(--line)' }}
                title="Offline entries will sync automatically"
              >
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </span>
            )}
            {pendingSyncCount > 0 && isOnlineState && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-mono font-medium"
                style={{ backgroundColor: 'var(--paper-raised)', color: 'var(--gold)', border: '1px solid var(--line)' }}
              >
                <CloudUpload className="w-3 h-3 animate-bounce" />
                <span>Syncing ({pendingSyncCount})</span>
              </span>
            )}

            {/* Sign in / Profile button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition font-medium cursor-pointer shadow-xs hover:opacity-90"
              style={{
                backgroundColor: 'var(--paper-raised)',
                borderColor: 'var(--line)',
                color: 'var(--ink)'
              }}
              title={user ? `Signed in as ${user.email}` : 'Sign in / Register'}
            >
              {user ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center text-[9px] text-white font-bold"
                    style={{ backgroundColor: 'var(--ink)' }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[85px] truncate">{user.name}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 opacity-70" />
                  <span>{lang === 'ur' ? 'سائن ان' : 'Sign In'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Settings row: Language toggle, Currency selector & subtle action pills */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition"
              style={{
                backgroundColor: 'var(--paper-raised)',
                borderColor: 'var(--line)',
                color: 'var(--ink-soft)'
              }}
              title="Switch Household or Business mode"
            >
              {ledgerMode === 'business' ? (
                <>
                  <Building2 className="w-3 h-3" />
                  <span className="capitalize">{businessIndustry}</span>
                </>
              ) : (
                <>
                  <Home className="w-3 h-3" />
                  <span>Household</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsFamilyModalOpen(true)}
              className="text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition"
              style={{
                backgroundColor: 'var(--paper-raised)',
                borderColor: 'var(--line)',
                color: 'var(--ink-soft)'
              }}
              title="Family access & shared permissions"
            >
              <Users className="w-3 h-3" />
              <span>Family</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div
              className="flex rounded-md overflow-hidden border"
              style={{ borderColor: 'var(--line)', backgroundColor: '#fff' }}
            >
              <button
                onClick={() => setLang('en')}
                className={`text-[11px] px-2.5 py-1 transition font-medium ${
                  lang === 'en' ? 'text-white' : 'hover:opacity-75'
                }`}
                style={{
                  backgroundColor: lang === 'en' ? 'var(--ink)' : '#fff',
                  color: lang === 'en' ? 'var(--paper-raised)' : 'var(--ink-soft)'
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ur')}
                className={`text-[11px] px-2.5 py-1 transition font-medium ${
                  lang === 'ur' ? 'text-white' : 'hover:opacity-75'
                }`}
                style={{
                  backgroundColor: lang === 'ur' ? 'var(--ink)' : '#fff',
                  color: lang === 'ur' ? 'var(--paper-raised)' : 'var(--ink-soft)'
                }}
              >
                اردو
              </button>
            </div>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="text-[11px] px-2 py-1 rounded-md border bg-white cursor-pointer focus:outline-none"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>
                  {CURRENCIES[code].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Navigation & Spent Total Block */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-full border flex items-center justify-center transition hover:opacity-80 active:scale-95"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)', backgroundColor: 'transparent' }}
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="display text-base font-medium min-w-[130px] text-center">
              {monthLabel(selectedMonth)}
            </div>
            <button
              onClick={handleNextMonth}
              disabled={selectedMonth >= monthKey(new Date())}
              className="w-7 h-7 rounded-full border flex items-center justify-center transition hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:cursor-default"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)', backgroundColor: 'transparent' }}
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right">
            <div
              className="text-[10px] uppercase tracking-[0.1em] font-medium"
              style={{ color: 'var(--ink-soft)' }}
            >
              {t('totalLabel')}
            </div>
            <div className="mono text-[22px] font-semibold leading-tight">
              {fmt(totalSpent)}
            </div>
            {totalIncome > 0 && (
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                {t('incomeLabel')}: <b className="mono" style={{ color: 'var(--sage)' }}>{fmt(totalIncome)}</b>
                &nbsp;·&nbsp;
                {t('netLabel')}: <b className={`mono ${netSaved < 0 ? 'text-[#A85238]' : ''}`} style={{ color: netSaved >= 0 ? 'var(--sage)' : 'var(--brick)' }}>{fmt(netSaved)}</b>
              </div>
            )}
          </div>
        </div>

        {/* Primary Central Voice & Quick-Actions Card */}
        <div
          className="rounded-[14px] border p-6 mb-5 text-center relative overflow-hidden shadow-sm"
          style={{
            backgroundColor: 'var(--paper-raised)',
            borderColor: 'var(--line)'
          }}
        >
          {/* Animated Microphone button with wave rings */}
          <div className="relative w-[84px] h-[84px] mx-auto mb-3.5 flex items-center justify-center">
            <div className={`sl-wave-ring r1 ${listening ? 'active' : ''}`} />
            <div className={`sl-wave-ring r2 ${listening ? 'active' : ''}`} />
            <div className={`sl-wave-ring r3 ${listening ? 'active' : ''}`} />
            <button
              onClick={handleToggleMic}
              className="w-[60px] h-[60px] rounded-full border-none flex items-center justify-center relative z-10 transition-transform active:scale-95 cursor-pointer shadow-md"
              style={{
                backgroundColor: listening ? 'var(--brick)' : 'var(--ink)',
                color: 'var(--paper-raised)'
              }}
              title={listening ? 'Stop listening' : 'Tap to speak'}
            >
              <Mic className="w-6 h-6" />
            </button>
          </div>

          {/* Voice Hint */}
          <div className="text-[13px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            {listening ? (
              <span className="font-semibold" style={{ color: 'var(--brick)' }}>
                {t('voiceHintListening')}
              </span>
            ) : (
              <span>
                Tap mic and say e.g. <b style={{ color: 'var(--ink)' }}>"450 on groceries"</b>
              </span>
            )}
          </div>

          {/* Live transcript */}
          <div
            className="display text-base italic min-h-[24px] mt-3"
            style={{ color: 'var(--ink)' }}
          >
            {transcript}
          </div>

          {/* Few direct options for user right at first place */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-2">
            <button
              onClick={() => {
                setFormState({
                  amount: '',
                  category: 'Food',
                  note: '',
                  type: 'expense',
                  photo: null,
                  isTaxDeductible: false,
                  isManual: true
                });
              }}
              className="text-xs underline hover:opacity-80 transition cursor-pointer"
              style={{ color: 'var(--steel)' }}
            >
              {t('manualLink')}
            </button>

            <span style={{ color: 'var(--line)' }}>•</span>

            <button
              onClick={() => setIsCameraModalOpen(true)}
              className="text-xs underline hover:opacity-80 transition cursor-pointer flex items-center gap-1"
              style={{ color: 'var(--steel)' }}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('cameraLink')}</span>
            </button>
          </div>

          {noSpeechSupport && (
            <div className="text-xs mt-2" style={{ color: 'var(--brick)' }}>
              {t('nospeech')}
            </div>
          )}
        </div>

        {/* In-place Form for confirmation / manual entry */}
        {formState && (
          <div
            className="rounded-xl border border-dashed p-4 mb-5 animate-in fade-in duration-200"
            style={{
              backgroundColor: 'var(--paper-raised)',
              borderColor: 'var(--line)'
            }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.1em] font-medium mb-3 flex items-center justify-between"
              style={{ color: 'var(--ink-soft)' }}
            >
              <span>{formState.isManual ? t('addExpense') : t('confirmHeard')}</span>
              {formState.id && <span className="font-mono text-[10px]">Editing</span>}
            </div>

            {/* Type toggle: Expense vs Income */}
            <div className="flex gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => setFormState({ ...formState, type: 'expense' })}
                className="flex-1 py-1.5 rounded-md text-xs font-medium border transition"
                style={{
                  backgroundColor: formState.type === 'expense' ? 'var(--ink)' : '#fff',
                  color: formState.type === 'expense' ? 'var(--paper-raised)' : 'var(--ink-soft)',
                  borderColor: formState.type === 'expense' ? 'var(--ink)' : 'var(--line)'
                }}
              >
                {t('expense')}
              </button>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, type: 'income', category: 'Salary' })}
                className="flex-1 py-1.5 rounded-md text-xs font-medium border transition"
                style={{
                  backgroundColor: formState.type === 'income' ? 'var(--ink)' : '#fff',
                  color: formState.type === 'income' ? 'var(--paper-raised)' : 'var(--ink-soft)',
                  borderColor: formState.type === 'income' ? 'var(--ink)' : 'var(--line)'
                }}
              >
                {t('income')}
              </button>
            </div>

            {/* Amount and Category */}
            <div className="flex gap-2.5 mb-2.5">
              <div className="w-[120px] flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--ink-soft)' }}>
                  {t('amount')} ({getCurrencySymbol()})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={formState.amount}
                  onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
                  placeholder="0"
                  className="mono text-sm px-2.5 py-1.5 border rounded-md bg-white focus:outline-none"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  autoFocus={formState.isManual && !formState.amount}
                />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--ink-soft)' }}>
                  {t('category')}
                </label>
                <select
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="text-sm px-2.5 py-1.5 border rounded-md bg-white focus:outline-none"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                >
                  {(formState.type === 'income' ? INCOME_CATEGORIES : categories).map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1 mb-2.5">
              <label className="text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--ink-soft)' }}>
                {t('note')}
              </label>
              <textarea
                rows={2}
                value={formState.note}
                onChange={(e) => setFormState({ ...formState, note: e.target.value })}
                placeholder={t('notePlaceholder')}
                className="text-xs px-2.5 py-1.5 border rounded-md bg-white focus:outline-none resize-none"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
              />
            </div>

            {/* Tax Deductible Toggle */}
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(formState.isTaxDeductible)}
                  onChange={(e) => setFormState({ ...formState, isTaxDeductible: e.target.checked })}
                  className="rounded accent-zinc-900 w-3.5 h-3.5"
                />
                <span style={{ color: 'var(--ink-soft)' }}>Mark as Tax Deductible (Schedule C / Individual)</span>
              </label>
            </div>

            {/* Photo Attachment Row */}
            <div className="flex items-center gap-2.5 mb-3">
              {formState.photo ? (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--line)' }}>
                  <img src={formState.photo} alt="Receipt" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormState({ ...formState, photo: null })}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] leading-none"
                    style={{ backgroundColor: 'var(--brick)' }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 rounded-md border border-dashed flex items-center gap-1.5 transition"
                  style={{
                    backgroundColor: '#fff',
                    borderColor: 'var(--line)',
                    color: 'var(--ink-soft)'
                  }}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('addPhoto')}</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) {
                    compressPhoto(f, (url) => {
                      setFormState({ ...formState, photo: url });
                    });
                  }
                }}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-1 border-t" style={{ borderColor: 'var(--line)' }}>
              <button
                type="button"
                onClick={() => setFormState(null)}
                className="text-xs px-3.5 py-1.5 rounded-md border transition hover:opacity-80"
                style={{
                  borderColor: 'var(--line)',
                  color: 'var(--ink-soft)',
                  backgroundColor: 'transparent'
                }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="text-xs font-medium px-4 py-1.5 rounded-md text-white transition active:scale-95"
                style={{
                  backgroundColor: 'var(--ink)',
                  color: 'var(--paper-raised)'
                }}
              >
                {t('save')}
              </button>
            </div>
          </div>
        )}

        {/* Ledger's Advice Section */}
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-[0.12em] font-medium flex items-center justify-between gap-2 mb-2 pb-1 border-b"
            style={{ color: 'var(--ink-soft)', borderColor: 'var(--line)' }}
          >
            <span>{t('ledgerAdvice')}</span>
            <button
              onClick={() => setIsHistoricalAIOpen(true)}
              className="text-[11px] underline flex items-center gap-1 transition lowercase tracking-normal"
              style={{ color: 'var(--steel)' }}
              title="Open full health score & AI spending leaks analysis"
            >
              <Sparkles className="w-3 h-3 text-[#B8902E]" />
              <span>Full AI Audit Engine</span>
            </button>
          </div>

          <div className="space-y-2">
            {buildInsights().map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 py-1.5 border-b border-dotted"
                style={{ borderColor: 'var(--line)' }}
              >
                <div
                  className="display text-[15px] font-semibold w-4 flex-shrink-0 text-center"
                  style={{ color: 'var(--gold)' }}
                >
                  {insight.mark}
                </div>
                <div className="text-[13.5px] leading-relaxed flex-1" style={{ color: 'var(--ink)' }}>
                  {insight.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category Section */}
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-[0.12em] font-medium flex items-center justify-between gap-2 mb-3 pb-1 border-b"
            style={{ color: 'var(--ink-soft)', borderColor: 'var(--line)' }}
          >
            <span>{t('byCategory')}</span>
            <button
              onClick={() => setManageOpen(!manageOpen)}
              className="text-[11px] underline transition lowercase tracking-normal"
              style={{ color: 'var(--steel)' }}
            >
              {manageOpen ? 'close manager' : t('manageCategories')}
            </button>
          </div>

          {/* Manage categories panel */}
          {manageOpen && (
            <div
              className="rounded-xl border p-3.5 mb-3.5 animate-in fade-in duration-150"
              style={{ backgroundColor: 'var(--paper-raised)', borderColor: 'var(--line)' }}
            >
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border bg-white"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <span>{c.name}</span>
                    {c.name !== 'Other' && (
                      <button
                        onClick={() => handleDeleteCategory(c.name)}
                        className="text-xs opacity-60 hover:opacity-100 hover:text-red-600 ml-0.5"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder={t('newCatPlaceholder')}
                  maxLength={24}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-md border bg-white focus:outline-none"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                />
                <button
                  onClick={handleAddCategory}
                  className="text-xs px-3 py-1.5 rounded-md text-white font-medium"
                  style={{ backgroundColor: 'var(--ink)', color: 'var(--paper-raised)' }}
                >
                  {t('add')}
                </button>
              </div>
            </div>
          )}

          {/* Category progress bars */}
          <div className="space-y-2">
            {Object.entries(categoryTotals)
              .filter(([, val]) => val > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([catName, val]) => {
                const color = getCategoryColor(catName, false);
                const percent = (val / maxCategoryVal) * 100;
                return (
                  <div key={catName} className="flex items-center gap-2.5 text-xs">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 display"
                      style={{ backgroundColor: color }}
                    >
                      {getInitials(catName)}
                    </div>
                    <div className="w-20 truncate font-medium" style={{ color: 'var(--ink)' }}>
                      {catName}
                    </div>
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: 'var(--paper-raised)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="mono text-xs w-16 text-right font-medium">
                      {fmt(val)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* This Month's Entries Section */}
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-[0.12em] font-medium flex items-center justify-between gap-2 mb-2 pb-1 border-b"
            style={{ color: 'var(--ink-soft)', borderColor: 'var(--line)' }}
          >
            <span>{t('thisMonthEntries')}</span>
            <span className="text-[10px] font-mono">({currentMonthRecords.length})</span>
          </div>

          {currentMonthRecords.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--ink-soft)' }}>
              <div className="display text-lg mb-1" style={{ color: 'var(--ink)' }}>
                {t('emptyTitle')}
              </div>
              <div className="text-xs">
                {t('emptyBody')} {monthLabel(selectedMonth)}.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {daysSorted.map((dayStr) => {
                const dayTxs = byDay[dayStr];
                const dateObj = new Date(dayStr + 'T00:00:00');
                const formattedDay = dateObj.toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div key={dayStr}>
                    <div
                      className="text-[11px] uppercase tracking-[0.08em] font-medium mb-1"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {formattedDay}
                    </div>

                    <div className="divide-y divide-dotted" style={{ borderColor: 'var(--line)' }}>
                      {dayTxs.map((e) => {
                        const isIncome = e.type === 'income';
                        const color = getCategoryColor(e.category, isIncome);

                        return (
                          <div
                            key={e.id}
                            className="flex items-center gap-2.5 py-2 group hover:bg-black/5 rounded-lg px-1 transition"
                          >
                            {/* Initials Badge */}
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 display"
                              style={{ backgroundColor: color }}
                            >
                              {getInitials(e.category)}
                            </div>

                            {/* Photo Thumbnail if attached */}
                            {e.photoUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingPhotoTx(e);
                                  setIsPhotoViewerOpen(true);
                                }}
                                className="w-7 h-7 rounded-full overflow-hidden border flex-shrink-0 hover:scale-105 transition"
                                style={{ borderColor: 'var(--line)' }}
                                title="Click to view full photo"
                              >
                                <img src={e.photoUrl} alt="Receipt" className="w-full h-full object-cover" />
                              </button>
                            ) : null}

                            {/* Note & Category */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium truncate" style={{ color: 'var(--ink)' }}>
                                  {e.note}
                                </span>
                                {e.isTaxDeductible && (
                                  <span
                                    className="text-[9px] px-1 py-0.2 rounded font-bold uppercase"
                                    style={{
                                      backgroundColor: 'var(--paper-raised)',
                                      color: 'var(--sage)',
                                      border: '1px solid var(--line)'
                                    }}
                                  >
                                    Tax
                                  </span>
                                )}
                              </div>
                              <div className="text-[10.5px] uppercase tracking-wider font-mono opacity-70">
                                {e.category}
                              </div>
                            </div>

                            {/* Amount */}
                            <div
                              className="mono text-[13.5px] font-medium flex-shrink-0"
                              style={{ color: isIncome ? 'var(--sage)' : 'var(--ink)' }}
                            >
                              {isIncome ? '+' : '-'}{fmt(e.amount)}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition gap-1">
                              <button
                                onClick={() => handleEditExpense(e)}
                                className="p-1 hover:opacity-100 opacity-60"
                                title="Edit entry"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(e.id)}
                                className="p-1 hover:opacity-100 opacity-60 hover:text-red-700"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
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

        {/* Download & Export Row */}
        <div className="flex flex-wrap gap-2 pt-2 mb-6">
          <button
            onClick={handleExportMonthCSV}
            className="text-[11px] px-3 py-1.5 rounded-md border transition hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--line)',
              color: 'var(--ink-soft)'
            }}
          >
            {t('dlMonthCsv')}
          </button>
          <button
            onClick={() => handleExportXLSX(currentMonthRecords, `pocket-accountant-${selectedMonth}.xlsx`)}
            className="text-[11px] px-3 py-1.5 rounded-md border transition hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--line)',
              color: 'var(--ink-soft)'
            }}
          >
            {t('dlMonthXlsx')}
          </button>
          <button
            onClick={() => handleExportXLSX(transactions, 'pocket-accountant-all-records.xlsx')}
            className="text-[11px] px-3 py-1.5 rounded-md border transition hover:opacity-80"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--line)',
              color: 'var(--ink-soft)'
            }}
          >
            {t('dlAllXlsx')}
          </button>
          <button
            onClick={() => setIsTaxModalOpen(true)}
            className="text-[11px] px-3 py-1.5 rounded-md border transition hover:opacity-80 flex items-center gap-1"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--line)',
              color: 'var(--ink-soft)'
            }}
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Tax Filing Summary</span>
          </button>
        </div>

        {/* Google AdSense live unit */}
        <AdBanner adSlot="YOUR_AD_SLOT_ID" />

      </div>

      {/* Floating Action Button for Mobile Quick Capture */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 sm:hidden">
        <button
          onClick={() => setIsCameraModalOpen(true)}
          className="w-11 h-11 rounded-full border shadow-lg flex items-center justify-center transition active:scale-95"
          style={{ backgroundColor: 'var(--paper-raised)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          title="Snap receipt"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          onClick={handleToggleMic}
          className="w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition active:scale-95"
          style={{
            backgroundColor: listening ? 'var(--brick)' : 'var(--ink)',
            color: 'var(--paper-raised)'
          }}
          title="Voice record"
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-medium shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 pointer-events-none"
          style={{
            backgroundColor: 'var(--ink)',
            color: 'var(--paper-raised)'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Camera Receipt Modal with OCR Line-Item Extraction */}
      <CameraReceiptModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        categories={categories}
        baseCurrency={currency}
        onSaveTransaction={(txData) => {
          const now = new Date();
          const newTx: Transaction = {
            id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
            amount: txData.amount,
            currency: currency,
            baseAmount: txData.amount,
            type: txData.type,
            category: txData.category,
            note: txData.note,
            date: txData.date || now.toISOString().slice(0, 10),
            timestamp: now.toISOString(),
            photoUrl: txData.photoUrl,
            receiptDetails: txData.receiptDetails,
            isTaxDeductible: txData.isTaxDeductible,
            synced: isOnline()
          };
          setTransactions([newTx, ...transactions]);
          setIsCameraModalOpen(false);
          showToast(`${t('loggedToast')} ${fmt(txData.amount)} — ${txData.category}`);
        }}
      />

      {/* Receipt Photo Viewer Modal (Zoom / Rotate / Item breakdown) */}
      <ReceiptPhotoViewerModal
        isOpen={isPhotoViewerOpen}
        onClose={() => {
          setIsPhotoViewerOpen(false);
          setViewingPhotoTx(null);
        }}
        transaction={viewingPhotoTx}
        baseCurrency={currency}
      />

      {/* Historical AI Financial Engine Modal (Health Score / Spending Leaks / Budget Caps) */}
      <HistoricalAIEngineModal
        isOpen={isHistoricalAIOpen}
        onClose={() => setIsHistoricalAIOpen(false)}
        transactions={transactions}
        settings={{
          baseCurrency: currency,
          ledgerMode,
          businessIndustry,
          darkMode: false,
          biometricAuthEnabled: false,
          monthlyBudget: 50000,
          dailySpendingLimit: 2500,
          pushNotificationsEnabled: true
        }}
        onApplyRecommendedBudget={(newBudget, newLimit) => {
          showToast(`Applied recommended budget cap: ${getCurrencySymbol()} ${newBudget}`);
        }}
      />

      {/* Tax Report Modal */}
      <TaxReportModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        transactions={transactions}
        settings={{
          baseCurrency: currency,
          ledgerMode,
          businessIndustry,
          darkMode: false,
          biometricAuthEnabled: false,
          monthlyBudget: 50000,
          dailySpendingLimit: 2500,
          pushNotificationsEnabled: true
        }}
        onPurgeData={() => {
          setTransactions([]);
          localStorage.removeItem('spoken_ledger_txs');
          showToast('Data cleared');
        }}
      />

      {/* Family Access Modal */}
      <FamilyAccessModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        members={familyMembers}
        onUpdateMembers={(updated) => {
          setFamilyMembers(updated);
          showToast('Family permissions saved');
        }}
      />

      {/* Onboarding Mode & Industry Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentMode={ledgerMode}
        currentIndustry={businessIndustry}
        onComplete={(newMode, newInd) => {
          setLedgerMode(newMode);
          setBusinessIndustry(newInd);
          const indConfig = BUSINESS_INDUSTRIES[newInd] || BUSINESS_INDUSTRIES.general;
          if (newMode === 'business' && indConfig) {
            const indCats = indConfig.suggestedCategories.map((name, idx) => ({
              name,
              color: CUSTOM_PALETTE[idx % CUSTOM_PALETTE.length],
              builtin: true
            }));
            setCategories(indCats);
          } else {
            setCategories(DEFAULT_CATEGORIES);
          }
          setIsOnboardingOpen(false);
          showToast(`Switched to ${newMode === 'business' ? indConfig?.name || 'Business' : 'Household'} mode`);
        }}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Auth / Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onSuccessAuth={(newUser) => {
          setUser(newUser);
          localStorage.setItem('spoken_ledger_user', JSON.stringify(newUser));
          showToast(`Signed in as ${newUser.name}`);
        }}
        onSignOut={() => {
          setUser(null);
          localStorage.removeItem('spoken_ledger_user');
          showToast('Signed out');
        }}
      />

    </div>
  );
};

export default App;
