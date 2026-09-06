import React, { useEffect, useRef } from 'react';

export interface AdBannerProps {
  /** The AdSense Ad Slot ID (defaults to 'YOUR_AD_SLOT_ID' placeholder) */
  adSlot?: string;
  /** The AdSense Client ID (defaults to 'ca-pub-1977106388827549') */
  adClient?: string;
  /** Ad unit layout format: 'auto', 'fluid', 'rectangle', etc. */
  adFormat?: string;
  /** Full width responsive configuration */
  fullWidthResponsive?: boolean | string;
  /** Optional custom CSS classes */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot = 'YOUR_AD_SLOT_ID',
  adClient = 'ca-pub-1977106388827549',
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
  style
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushedRef = useRef<boolean>(false);

  useEffect(() => {
    // Avoid duplicate push calls for the same ad unit
    if (isPushedRef.current) return;

    const insElement = adRef.current;
    if (!insElement) return;

    // Check if AdSense has already processed or filled this ins tag
    const isAlreadyFilled =
      insElement.getAttribute('data-adsbygoogle-status') === 'done' ||
      insElement.children.length > 0;

    if (isAlreadyFilled) {
      isPushedRef.current = true;
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isPushedRef.current = true;
      }
    } catch (error) {
      // Safely catch any AdSense initialization duplicate or ad-blocker errors
      console.debug('AdSense push caught/skipped:', error);
    }
  }, [adSlot]);

  return (
    <div
      className={`ad-banner-container overflow-hidden rounded-2xl border p-4 my-6 transition-colors shadow-xs ${className}`}
      style={{
        backgroundColor: 'var(--paper-raised, #FAF8F5)',
        borderColor: 'var(--line, #D6D2C4)',
        color: 'var(--ink, #1B2A4A)',
        ...style
      }}
    >
      {/* Label: Google AdSense • ca-pub-1977106388827549 */}
      <div className="flex items-center justify-between text-[11px] mb-2.5 opacity-70">
        <div className="flex items-center gap-2 font-medium">
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--paper, #E9E7DF)',
              border: '1px solid var(--line, #D6D2C4)',
              color: 'var(--gold, #B8902E)'
            }}
          >
            Ad
          </span>
          <span className="font-mono text-[11px]">
            Google AdSense • {adClient}
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-tight opacity-60">
          Slot: {adSlot}
        </span>
      </div>

      {/* Real Google AdSense ad unit */}
      <div className="w-full min-h-[90px] flex items-center justify-center overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={String(fullWidthResponsive)}
        />
      </div>
    </div>
  );
};

export default AdBanner;
