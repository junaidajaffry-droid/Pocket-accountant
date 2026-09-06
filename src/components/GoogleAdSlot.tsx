import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Info, X } from 'lucide-react';

interface GoogleAdSlotProps {
  clientId?: string;
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export const GoogleAdSlot: React.FC<GoogleAdSlotProps> = ({
  clientId = 'ca-pub-1977106388827549',
  slotId = '1977106388',
  format = 'auto',
  responsive = true,
  className = ''
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch {
      // AdSense push might fail if already filled or blocked by client
    }
  }, [slotId]);

  if (dismissed) return null;

  return (
    <div
      id={`google-ad-${slotId}`}
      className={`relative overflow-hidden rounded-2xl border p-4 my-6 transition-colors shadow-sm ${className}`}
      style={{
        backgroundColor: 'var(--paper-raised)',
        borderColor: 'var(--line)',
        color: 'var(--ink)'
      }}
    >
      {/* Header with Ad Identifier & Dismiss */}
      <div className="flex items-center justify-between text-[11px] mb-3" style={{ color: 'var(--ink-soft)' }}>
        <div className="flex items-center gap-2 font-medium">
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--line)',
              color: 'var(--gold)'
            }}
          >
            Ad
          </span>
          <span className="font-mono text-[11px]">
            Google AdSense • {clientId}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.google.com/adsense/start/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition flex items-center gap-1"
            style={{ color: 'var(--ink-soft)' }}
          >
            <Info className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">Ad Choices</span>
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-0.5 rounded transition hover:opacity-100 opacity-60"
            title="Dismiss ad"
            aria-label="Dismiss ad"
            style={{ color: 'var(--ink-soft)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Google AdSense container */}
      <div className="w-full min-h-[90px] flex items-center justify-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full text-center"
          style={{ display: 'block', minHeight: '90px' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>

      {/* Fallback sponsor banner when AdSense is awaiting domain activation or ad fill */}
      <div
        className="mt-3 pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs flex-shrink-0"
            style={{
              backgroundColor: 'var(--ink)',
              color: 'var(--paper-raised)'
            }}
          >
            Ad
          </div>
          <div>
            <div className="font-medium flex items-center gap-1.5" style={{ color: 'var(--ink)' }}>
              <span>Google Verified Advertiser Slot</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
              Contextual accounting, financial tools, and business ads powered by Google AdSense.
            </p>
          </div>
        </div>

        <a
          href="https://ads.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition"
          style={{
            backgroundColor: 'var(--paper)',
            border: '1px solid var(--line)',
            color: 'var(--ink)'
          }}
        >
          Advertise Here
        </a>
      </div>
    </div>
  );
};
