import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Check,
  Receipt,
  RotateCw,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface CameraReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  baseCurrency: string;
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export const CameraReceiptModal: React.FC<CameraReceiptModalProps> = ({
  isOpen,
  onClose,
  categories,
  baseCurrency,
  onSaveTransaction
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Scanned / editable fields
  const [merchant, setMerchant] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Shopping');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [taxAmount, setTaxAmount] = useState<string>('0');
  const [note, setNote] = useState<string>('');
  const [items, setItems] = useState<{ name: string; price: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPhotoDataUrl(null);
      setErrorMsg(null);
      setIsScanning(false);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setMerchant('');
    setAmount('');
    setCategory(categories[0]?.name || 'Shopping');
    setDate(new Date().toISOString().slice(0, 10));
    setTaxAmount('0');
    setNote('');
    setItems([]);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setErrorMsg('Camera access unavailable or permission denied. You can upload a receipt photo file instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Compress JPEG to keep payload lightweight
    const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
    setPhotoDataUrl(dataUrl);
    stopCamera();

    // Auto-trigger OCR Scan
    runReceiptOCR(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          setPhotoDataUrl(compressed);
          runReceiptOCR(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const runReceiptOCR = async (base64Img: string) => {
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          mimeType: 'image/jpeg',
          baseCurrency
        })
      });

      if (!response.ok) {
        throw new Error('AI Scan status ' + response.status);
      }

      const parsed = await response.json();
      if (parsed.merchant) setMerchant(parsed.merchant);
      if (parsed.amount) setAmount(String(parsed.amount));
      if (parsed.date) setDate(parsed.date);
      if (parsed.taxAmount) setTaxAmount(String(parsed.taxAmount));
      if (parsed.note) setNote(parsed.note);
      if (parsed.items && Array.isArray(parsed.items)) setItems(parsed.items);

      // Match category
      const matched = categories.find(
        (c) => c.name.toLowerCase() === (parsed.category || '').toLowerCase()
      );
      if (matched) {
        setCategory(matched.name);
      }
    } catch (err: any) {
      console.warn('Receipt OCR fallback:', err);
      setMerchant('Receipt Document');
      setNote('Receipt expense (Offline mode)');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount.');
      return;
    }

    onSaveTransaction({
      amount: parsedAmount,
      currency: baseCurrency,
      baseAmount: parsedAmount,
      type: 'expense',
      category: category,
      note: note || merchant || 'Receipt expense',
      date: date,
      photoUrl: photoDataUrl || undefined,
      receiptDetails: {
        merchant,
        date,
        taxAmount: parseFloat(taxAmount) || 0,
        items
      },
      isTaxDeductible: true,
      taxCategory: 'Receipt Documented Expense',
      synced: false
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-zinc-800 text-zinc-100 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-zinc-100">
                Snap or Upload Expense Receipt
              </h3>
              <p className="text-xs text-zinc-400">
                Images are saved alongside expense records and audited with Gemini Vision OCR.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder or Preview Area */}
        <div className="mb-4">
          {!photoDataUrl && !cameraActive && (
            <div className="p-8 rounded-2xl border-2 border-dashed border-zinc-700 text-center bg-zinc-850/60 bg-zinc-800/40">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-100 mb-1">
                Capture Expense Photo with Device Camera
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-5">
                Automatically saves the photo alongside the transaction and extracts line-items.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={startCamera}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 text-xs font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Device Camera</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 border border-zinc-700 transition"
                >
                  <Upload className="w-4 h-4 text-zinc-400" />
                  <span>Upload Image File</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {cameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-zinc-800">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
              <div className="absolute inset-0 border-2 border-dashed border-emerald-500/60 m-6 rounded-2xl pointer-events-none" />
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-3">
                <button
                  onClick={captureSnapshot}
                  className="w-14 h-14 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-lg active:scale-95 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500" />
                </button>
                <button
                  onClick={stopCamera}
                  className="absolute right-4 top-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {photoDataUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950">
              <img src={photoDataUrl} alt="Captured receipt" className="w-full max-h-56 object-contain mx-auto" />
              <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                <button
                  onClick={() => {
                    setPhotoDataUrl(null);
                    resetForm();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-black/70 text-white hover:bg-black text-xs flex items-center gap-1.5 backdrop-blur-sm border border-white/10"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Scanning indicator */}
        {isScanning && (
          <div className="p-3 mb-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            <span>AI scanning receipt image, extracting merchant, amount, & line items...</span>
          </div>
        )}

        {/* Extracted Form Inputs */}
        {photoDataUrl && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Total Amount ({baseCurrency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Merchant / Store
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Costco, Home Depot, Cafe"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                Note / Description
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Brief summary of items"
                className="w-full px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {items.length > 0 && (
              <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-800 text-xs">
                <div className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Detected Line Items ({items.length}):</span>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-zinc-400">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-xs">{it.name}</span>
                      <span className="text-zinc-200">{formatCurrency(it.price, baseCurrency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="text-xs text-red-300 bg-red-950/40 border border-red-900 p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Check className="w-4 h-4" />
                <span>Save Expense with Receipt</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
