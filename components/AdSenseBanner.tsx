import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdSenseBannerProps {
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({ className = '' }) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only push once per mount to prevent duplicate adsbygoogle errors
    if (pushedRef.current) return;
    
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      // Gracefully ignore ad blocker or duplicate execution notices
      console.debug('AdSense notice:', err);
    }
  }, []);

  return (
    <div className={`w-full max-w-5xl mx-auto my-8 overflow-hidden rounded-2xl bg-[#0b0c10]/90 border border-[#242830] p-4 text-center shadow-[0_4px_25px_rgba(0,0,0,0.5)] relative select-none no-print ${className}`}>
      <div className="flex items-center justify-between border-b border-[#1b1f27] pb-2 mb-3">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#70757e] flex items-center gap-1.5">
          <span className="text-[#8d1a1a]">✦</span>
          <span>SPONSORED RELIQUARY &bull; AD TRANSMISSION</span>
        </span>
        <span className="text-[8px] font-mono text-[#444] uppercase tracking-wider">
          SECURE DISPATCH
        </span>
      </div>

      <div className="min-h-[100px] flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key="-d5+m-n-fu+wi"
          data-ad-client="ca-pub-9649841469711282"
          data-ad-slot="8154297463"
        />
      </div>
    </div>
  );
};

export default AdSenseBanner;
