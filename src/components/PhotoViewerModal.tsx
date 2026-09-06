import React from 'react';
import { X, Download } from 'lucide-react';

interface PhotoViewerModalProps {
  photoUrl: string | null;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photoUrl,
  onClose
}) => {
  if (!photoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <a
            href={photoUrl}
            download="receipt-photo.jpg"
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            title="Download receipt"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 flex items-center justify-center min-h-[300px]">
          <img
            src={photoUrl}
            alt="Receipt preview"
            className="max-h-[70vh] w-auto object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};
