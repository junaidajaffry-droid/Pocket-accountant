import React, { useState } from 'react';
import {
  X,
  Download,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Calendar,
  Tag,
  DollarSign,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/currency';

interface ReceiptPhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  baseCurrency: string;
}

export const ReceiptPhotoViewerModal: React.FC<ReceiptPhotoViewerModalProps> = ({
  isOpen,
  onClose,
  transaction,
  baseCurrency
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);

  if (!isOpen || !transaction || !transaction.photoUrl) return null;

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(2.5, z + 0.25));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.75, z - 0.25));
  };

  const handleDownload = () => {
    if (!transaction.photoUrl) return;
    const a = document.createElement('a');
    a.href = transaction.photoUrl;
    a.download = `receipt-${transaction.date}-${transaction.id.slice(0, 6)}.jpg`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-zinc-100 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-100">
                {transaction.receiptDetails?.merchant || transaction.note || 'Expense Receipt'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span>{transaction.date}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{formatCurrency(transaction.amount, transaction.currency || baseCurrency)}</span>
                {transaction.isTaxDeductible && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800/60 font-sans">
                    Tax Record
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-1 overflow-hidden flex items-center justify-center p-3 bg-zinc-950 rounded-2xl my-4 border border-zinc-850 relative min-h-[300px]">
          <img
            src={transaction.photoUrl}
            alt="Receipt Document"
            className="max-h-[60vh] max-w-full object-contain rounded-lg transition-transform duration-300 shadow-md select-none"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`
            }}
          />
        </div>

        {/* Itemized breakdown if available */}
        {transaction.receiptDetails?.items && transaction.receiptDetails.items.length > 0 && (
          <div className="pt-2 border-t border-zinc-800">
            <div className="text-[11px] uppercase font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extracted Line Items</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1 text-xs font-mono">
              {transaction.receiptDetails.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-zinc-300">
                  <span className="truncate max-w-xs">{it.name}</span>
                  <span className="text-zinc-400">{formatCurrency(it.price, transaction.currency || baseCurrency)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
