import React, { useEffect, useRef } from 'react';

export interface CodexAddonsProps {
  user?: { email?: string | null } | null;
  className?: string;
}

export default function CodexAddons({ user, className = '' }: CodexAddonsProps) {
  const adPushedRef = useRef(false);

  // Trigger AdSense for this specific ad placement safely (prevents React StrictMode double push)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !adPushedRef.current) {
        adPushedRef.current = true;
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense render error:', e);
    }
  }, []);

  const LINKS = {
    vault: 'https://buy.stripe.com/14A8wP10w7eZ2jWbGH1gs04',       // $5/mo
    auditPack: 'https://buy.stripe.com/28E28r24Abvfe2E2671gs05',   // $10 one-time
    lorekeeper: 'https://buy.stripe.com/8x214n6kQczj0bO7qr1gs06',  // $15/mo
  };

  const getCheckoutUrl = (baseUrl: string) => {
    if (!user?.email) return baseUrl;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}prefilled_email=${encodeURIComponent(user.email)}`;
  };

  return (
    <div className={`codex-addons-container max-w-7xl mx-auto py-8 ${className}`}>
      <div className="text-center mb-8">
        <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#ff9b50] bg-[#ff7b25]/15 border border-[#ff7b25]/30 px-3 py-1 rounded-full">
          MODULAR SOVEREIGN ADD-ONS
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight mt-2">
          Amplify Your Dark Fantasy Covenant
        </h3>
        <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1 max-w-xl mx-auto">
          Standalone power modules with direct Stripe checkout and instant account sync.
        </p>
      </div>

      <div className="addon-grid grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* THE LOREKEEPER LICENSE */}
        <div className="addon-card rounded-2xl bg-gradient-to-b from-[#18111e] via-[#0f0b14] to-[#0a070e] border border-[#a855f7]/40 hover:border-[#c084fc] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c084fc] bg-[#a855f7]/15 border border-[#a855f7]/30 px-2.5 py-1 rounded-md">
                Lorekeeper License
              </span>
              <span className="text-[11px] text-[#c084fc] font-mono font-bold">Monthly</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#c084fc] font-serif tracking-wide transition-colors mb-2">
              The Lorekeeper
            </h4>
            <p className="text-xs text-[#d1c7de] mb-5 leading-relaxed min-h-[48px]">
              Unlock sovereign master rights to manifest, store, and export unlimited canonical lore &amp; high-res scriptures.
            </p>
            <div className="flex items-baseline gap-2 pb-5 border-b border-[#242830]">
              <span className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">$15</span>
              <span className="text-xs text-[#c084fc] uppercase tracking-widest font-bold">/ month</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-xs text-[#cfd3d8]">
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Full commercial lore &amp; mythos IP ownership</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Priority high-throughput Gemini 3 Pro neural access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Unlimited Scribe PDF illuminated scrolls</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-[#a855f7]/20">
            <a
              href={getCheckoutUrl(LINKS.lorekeeper)}
              target="_blank"
              rel="noopener noreferrer"
              className="addon-btn w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] hover:from-[#c084fc] hover:to-[#9333ea] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              GET LOREKEEPER ($15/MO) ↗
            </a>
          </div>
        </div>

        {/* 50 DEEP AUDIT FUEL PACK */}
        <div className="addon-card rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a06] to-[#0a0503] border border-[#ff7b25]/40 hover:border-[#ff9b50] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(255,123,37,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9b50] bg-[#ff7b25]/15 border border-[#ff7b25]/30 px-2.5 py-1 rounded-md">
                50 Deep Audit Pack
              </span>
              <span className="text-[11px] text-[#ff9b50] font-mono font-bold">Sprint Fuel</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#ff9b50] font-serif tracking-wide transition-colors mb-2">
              Occult Top-Up
            </h4>
            <p className="text-xs text-[#ded1c7] mb-5 leading-relaxed min-h-[48px]">
              Writing sprint top-up: add 50 deep dark fantasy continuity audits, tone-drift checks, and auto-harmonized rewrites.
            </p>
            <div className="flex items-baseline gap-2 pb-5 border-b border-[#242830]">
              <span className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">$10</span>
              <span className="text-xs text-[#ff9b50] uppercase tracking-widest font-bold">/ one-time</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-xs text-[#cfd3d8]">
              <li className="flex items-start gap-2">
                <span className="text-[#ff9b50] text-xs">✦</span>
                <span>50 Deep continuity audits for books &amp; campaigns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff9b50] text-xs">✦</span>
                <span>Real-time tone-drift &amp; archaic lexicon checks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff9b50] text-xs">✦</span>
                <span>Credits never expire &bull; Instant activation</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-[#ff7b25]/20">
            <a
              href={getCheckoutUrl(LINKS.auditPack)}
              target="_blank"
              rel="noopener noreferrer"
              className="addon-btn w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff7b25] to-[#c2410c] hover:from-[#ff9b50] hover:to-[#ea580c] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,123,37,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              ADD 50 AUDITS ($10) ↗
            </a>
          </div>
        </div>

        {/* MULTI-UNIVERSE VAULT (+3) */}
        <div className="addon-card rounded-2xl bg-gradient-to-b from-[#0c161c] via-[#070e12] to-[#04080a] border border-[#00d2ff]/40 hover:border-[#38bdf8] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,210,255,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#38bdf8] bg-[#00d2ff]/15 border border-[#00d2ff]/30 px-2.5 py-1 rounded-md">
                Universe Vault (+3)
              </span>
              <span className="text-[11px] text-[#38bdf8] font-mono font-bold">Monthly</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#38bdf8] font-serif tracking-wide transition-colors mb-2">
              Multi-Universe Vault
            </h4>
            <p className="text-xs text-[#c7d9de] mb-5 leading-relaxed min-h-[48px]">
              Isolate 3 distinct creative universes, sub-series, or grimoires with zero canon contamination.
            </p>
            <div className="flex items-baseline gap-2 pb-5 border-b border-[#242830]">
              <span className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">$5</span>
              <span className="text-xs text-[#38bdf8] uppercase tracking-widest font-bold">/ month</span>
            </div>
            <ul className="mt-5 space-y-2.5 text-xs text-[#cfd3d8]">
              <li className="flex items-start gap-2">
                <span className="text-[#38bdf8] text-xs">✦</span>
                <span>+3 Isolated universe canon vault slots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#38bdf8] text-xs">✦</span>
                <span>Independent bible rules &amp; custom banlists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#38bdf8] text-xs">✦</span>
                <span>Dedicated Firestore &amp; Drive sync partitions</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-[#00d2ff]/20">
            <a
              href={getCheckoutUrl(LINKS.vault)}
              target="_blank"
              rel="noopener noreferrer"
              className="addon-btn w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0369a1] text-black text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              ADD UNIVERSE VAULT ($5/MO) ↗
            </a>
          </div>
        </div>
      </div>

      {/* AdSense In-Feed Unit */}
      <div className="my-8 w-full flex justify-center overflow-hidden">
        <ins
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
}

export { CodexAddons };
