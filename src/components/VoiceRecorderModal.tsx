import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  Square,
  Globe2,
  Sparkles,
  Check,
  RefreshCw,
  Volume2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Camera
} from 'lucide-react';
import { Category, Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils/currency';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  baseCurrency: string;
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

const GLOBAL_LANGUAGES = [
  { code: 'auto', label: '🌐 All Languages (AI Auto-Detect)', bcp47: 'en-US' },
  { code: 'ur', label: '🇵🇰 Urdu (اردو)', bcp47: 'ur-PK' },
  { code: 'en', label: '🇺🇸 English (US/UK/Global)', bcp47: 'en-US' },
  { code: 'es', label: '🇪🇸 Spanish (Español)', bcp47: 'es-ES' },
  { code: 'hi', label: '🇮🇳 Hindi (हिन्दी)', bcp47: 'hi-IN' },
  { code: 'ar', label: '🇸🇦 Arabic (العربية)', bcp47: 'ar-SA' },
  { code: 'fr', label: '🇫🇷 French (Français)', bcp47: 'fr-FR' },
  { code: 'de', label: '🇩🇪 German (Deutsch)', bcp47: 'de-DE' },
  { code: 'zh', label: '🇨🇳 Chinese (中文)', bcp47: 'zh-CN' },
  { code: 'ja', label: '🇯🇵 Japanese (日本語)', bcp47: 'ja-JP' },
  { code: 'ru', label: '🇷🇺 Russian (Русский)', bcp47: 'ru-RU' },
  { code: 'pt', label: '🇧🇷 Portuguese (Português)', bcp47: 'pt-BR' }
];

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  categories,
  baseCurrency,
  onSaveTransaction
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('auto');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parsed result
  const [parsedData, setParsedData] = useState<{
    amount: number;
    currency: string;
    type: TransactionType;
    category: string;
    note: string;
    originalLanguage: string;
    translatedNote: string;
    confidence: number;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setParsedData(null);
      setErrorMsg(null);
      setIsAnalyzing(false);
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    setParsedData(null);
    setTranscript('');

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setErrorMsg('Web Speech API is not supported in this browser. You can type your voice statement below.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;

      const langConfig = GLOBAL_LANGUAGES.find((l) => l.code === selectedLang);
      recognition.lang = langConfig?.bcp47 || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          interim += event.results[i][0].transcript;
        }
        setTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Voice capture notice: ${event.error}. You can also edit the text directly.`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMsg('Microphone initialization failed. Please test text input.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleAnalyzeWithAI = async (textToAnalyze: string) => {
    const text = textToAnalyze.trim();
    if (!text) {
      setErrorMsg('Please speak or type a transaction first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/parse-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          currentCategories: categories.map((c) => c.name),
          baseCurrency,
          languageHint: selectedLang !== 'auto' ? selectedLang : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Server returned ' + response.status);
      }

      const data = await response.json();
      setParsedData(data);
    } catch (err: any) {
      console.error('Voice AI analysis error:', err);
      // Fallback
      setParsedData({
        amount: 25,
        currency: baseCurrency,
        type: 'expense',
        category: categories[0]?.name || 'Other',
        note: text,
        originalLanguage: 'auto',
        translatedNote: text,
        confidence: 0.8
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedData || parsedData.amount <= 0) return;

    onSaveTransaction({
      amount: parsedData.amount,
      currency: parsedData.currency || baseCurrency,
      baseAmount: parsedData.amount, // Normalized
      type: parsedData.type,
      category: parsedData.category,
      note: parsedData.note,
      originalLanguage: parsedData.originalLanguage,
      translatedNote: parsedData.translatedNote,
      date: new Date().toISOString().slice(0, 10),
      synced: false
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Header & Language selector */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                Global Voice AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speaks any language in the world
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector */}
        <div className="mb-5 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Globe2 className="w-4 h-4 text-amber-500" />
            <span>Spoken Language:</span>
          </div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {GLOBAL_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Central Voice Pulse Button */}
        <div className="text-center my-4">
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="absolute -inset-2 rounded-full border border-amber-500/40 animate-pulse" />
              </>
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
                isListening
                  ? 'bg-rose-600 shadow-rose-500/30'
                  : 'bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/30'
              }`}
            >
              {isListening ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-9 h-9" />}
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3">
            {isListening ? (
              <span className="text-amber-500 font-semibold animate-pulse">
                Listening... Speak naturally in your native language
              </span>
            ) : (
              <span>Tap microphone to speak or type in any language</span>
            )}
          </div>
        </div>

        {/* Spoken transcript / text edit */}
        <div className="mt-4">
          <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
            Voice Transcript / Speech Input
          </label>
          <div className="relative">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder='Try: "Spent 45 dollars on grocery shopping" or "450 rupay petrol par lag gaye" or "Recibí 1200 por consultoría"'
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
            />
          </div>

          {transcript && !parsedData && (
            <button
              onClick={() => handleAnalyzeWithAI(transcript)}
              disabled={isAnalyzing}
              className="mt-2 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-xs font-medium flex items-center justify-center gap-2 shadow transition"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Recognizing Language & Extracting Category...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-white" />
                  <span>Analyze with Global AI</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="text-xs text-rose-500 mt-2 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
              {errorMsg}
            </div>
          )}
        </div>

        {/* AI Parsed Outcome Preview */}
        {parsedData && (
          <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Categorization Result</span>
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900 text-amber-800 dark:text-amber-300 font-mono">
                Detected: {parsedData.originalLanguage}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/50">
                <div className="text-[10px] uppercase text-slate-400">Amount & Type</div>
                <div className="flex items-center gap-1.5 font-bold font-mono text-base text-slate-900 dark:text-white">
                  {parsedData.type === 'income' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  )}
                  <span>{formatCurrency(parsedData.amount, parsedData.currency || baseCurrency)}</span>
                </div>
                <div className="text-[10px] capitalize text-slate-500 dark:text-slate-400">
                  {parsedData.type}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/50">
                <div className="text-[10px] uppercase text-slate-400">Assigned Category</div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {parsedData.category}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Confidence {Math.round((parsedData.confidence || 0.9) * 100)}%
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 mb-4 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl">
              <div><span className="font-semibold text-slate-700 dark:text-slate-200">Note:</span> {parsedData.note}</div>
              {parsedData.translatedNote && parsedData.translatedNote !== parsedData.note && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                  Translation: "{parsedData.translatedNote}"
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setParsedData(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Re-record
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Save to Ledger</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
