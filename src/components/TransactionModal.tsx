import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  TrendingDown,
  TrendingUp,
  Calendar,
  Tag,
  FileText,
  FileCheck,
  User,
  Check,
  Camera,
  Image,
  Trash2,
  Upload
} from 'lucide-react';
import { Category, FamilyMember, Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  familyMembers: FamilyMember[];
  baseCurrency: string;
  transactionToEdit?: Transaction | null;
  onSave: (tx: Omit<Transaction, 'id' | 'timestamp'> & { id?: string }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  familyMembers,
  baseCurrency,
  transactionToEdit,
  onSave
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [isTaxDeductible, setIsTaxDeductible] = useState<boolean>(false);
  const [taxCategory, setTaxCategory] = useState<string>('Standard Deduction');
  const [addedByMember, setAddedByMember] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(String(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setNote(transactionToEdit.note);
      setDate(transactionToEdit.date);
      setIsTaxDeductible(Boolean(transactionToEdit.isTaxDeductible));
      setTaxCategory(transactionToEdit.taxCategory || 'Standard Deduction');
      setAddedByMember(transactionToEdit.addedByMemberName || familyMembers[0]?.name || 'Primary Owner');
      setPhotoUrl(transactionToEdit.photoUrl || null);
    } else {
      setType('expense');
      setAmount('');
      const defaultCat = categories.find((c) => c.type === 'expense' || c.type === 'both')?.name || categories[0]?.name || 'Other';
      setCategory(defaultCat);
      setNote('');
      setDate(new Date().toISOString().slice(0, 10));
      setIsTaxDeductible(false);
      setTaxCategory('Standard Deduction');
      setAddedByMember(familyMembers[0]?.name || 'Primary Owner');
      setPhotoUrl(null);
    }
  }, [transactionToEdit, isOpen, categories, familyMembers]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === 'both' || c.type === type || !c.type
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
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
          setPhotoUrl(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onSave({
      id: transactionToEdit?.id,
      amount: parsedAmount,
      currency: baseCurrency,
      baseAmount: parsedAmount,
      type,
      category: category || filteredCategories[0]?.name || 'Other',
      note: note.trim() || category,
      date,
      photoUrl: photoUrl || undefined,
      isTaxDeductible,
      taxCategory: isTaxDeductible ? taxCategory : undefined,
      addedByMemberName: addedByMember,
      synced: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-zinc-800 text-zinc-100 relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <h3 className="font-bold text-base sm:text-lg text-zinc-100">
            {transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense / Income Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-zinc-800 border border-zinc-700/60">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                type === 'expense'
                  ? 'bg-zinc-900 text-red-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                type === 'income'
                  ? 'bg-zinc-900 text-emerald-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount & Currency */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Amount ({baseCurrency})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-lg font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
            >
              {filteredCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Description / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this transaction for?"
              className="w-full px-3.5 py-2.5 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Date & Member */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Logged By
              </label>
              <select
                value={addedByMember}
                onChange={(e) => setAddedByMember(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-100 text-xs truncate focus:outline-none focus:border-emerald-500"
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Receipt Photo Attachment & Storage */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>Receipt Photo Document</span>
              {photoUrl && <span className="text-emerald-400 font-mono text-[10px]">Photo Attached</span>}
            </label>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {photoUrl ? (
              <div className="relative rounded-2xl border border-zinc-700 bg-zinc-800/80 p-2.5 flex items-center gap-3">
                <img
                  src={photoUrl}
                  alt="Receipt preview"
                  className="w-14 h-14 object-cover rounded-xl border border-zinc-700 shadow-sm"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-semibold text-zinc-200 truncate">Receipt Photo Attached</div>
                  <div className="text-[11px] text-zinc-400">Stored alongside this entry</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="p-2 rounded-xl bg-zinc-700/60 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 transition"
                  title="Remove Receipt Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-zinc-700 hover:border-emerald-500/60 bg-zinc-800/40 hover:bg-zinc-800/70 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Snap or Upload Receipt Photo</span>
              </button>
            )}
          </div>

          {/* Tax Deductible Toggle */}
          <div className="p-3 rounded-2xl bg-zinc-800/50 border border-zinc-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isTaxDeductible}
                onChange={(e) => setIsTaxDeductible(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
              />
              <span className="text-xs font-semibold text-zinc-200">
                Mark as Tax-Deductible
              </span>
            </label>
            {isTaxDeductible && (
              <div className="mt-2.5">
                <input
                  type="text"
                  value={taxCategory}
                  onChange={(e) => setTaxCategory(e.target.value)}
                  placeholder="Tax Schedule / Category (e.g. Schedule C Line 18)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 text-xs font-bold shadow-sm transition"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
