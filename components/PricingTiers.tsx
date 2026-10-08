import React from 'react';
import { ModularAddOns } from './ModularAddOns';

export interface PricingTiersProps {
  className?: string;
  title?: string;
  subtitle?: string;
  showAddOns?: boolean;
}

export const PricingTiers: React.FC<PricingTiersProps> = ({
  className = '',
  title = 'Ascend Through the Ranks',
  subtitle = 'Bind your covenant with the Demon Codex. Select your path of power and unlock sacred dark fantasy artifacts.',
  showAddOns = true,
}) => {
  // Read payment URLs from Vite environment variables (with official Stripe direct links as fallbacks)
  const cultistLink =
    import.meta.env.VITE_PAYMENT_LINK_CULTIST ||
    import.meta.env.VITE_PAYMENT_LINK_SINGLE ||
    import.meta.env.VITE_PAYMENT_LINK_ONETIME ||
    'https://buy.stripe.com/aFa9AT24Abvff6I6mn1gs01'; // $14 One-Time Purchase

  const arcaneLink =
    import.meta.env.VITE_PAYMENT_LINK_ARCANE ||
    import.meta.env.VITE_PAYMENT_LINK_STANDARD ||
    'https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02'; // $19 / month Subscription

  const archdemonLink =
    import.meta.env.VITE_PAYMENT_LINK_ARCHDEMON ||
    import.meta.env.VITE_PAYMENT_LINK_PREMIUM ||
    'https://buy.stripe.com/dRmfZh38E1UFf6IaCD1gs03'; // $39 / month Subscription

  const handleCheckout = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className={`w-full max-w-6xl mx-auto px-4 py-12 ${className}`}>
      {/* Dark Medieval Header */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1e1026] border border-[#a855f7]/40 text-[#c084fc] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-4 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <span>⚔</span>
          <span>ASCEND / COVENANT PLANS</span>
          <span>⚔</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-wider text-white uppercase font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#8d929b] mt-3 max-w-2xl mx-auto font-sans leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        
        {/* CARD 1: Cultist Initiate ($14 One-Time Purchase) */}
        <div className="rounded-2xl bg-[#0e1015]/95 border border-[#242830] hover:border-[#c26b3a]/70 p-7 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c26b3a] bg-[#c26b3a]/15 border border-[#c26b3a]/30 px-2.5 py-1 rounded-md">
                One-Time Purchase
              </span>
              <span className="text-[11px] text-[#70757e] font-mono">Instant Unlock</span>
            </div>

            <h3 className="text-2xl font-black text-white group-hover:text-[#c26b3a] font-serif tracking-wide transition-colors mb-2">
              Cultist Initiate
            </h3>
            <p className="text-xs text-[#8d929b] mb-6 leading-relaxed">
              Targeted starter pact: instant dark fantasy manifests, prompt diagnostics, and direct relic downloads without recurring fees.
            </p>

            {/* Price Block */}
            <div className="flex items-baseline gap-2 pb-6 border-b border-[#242830]">
              <span className="text-4xl sm:text-5xl font-black text-white font-serif tracking-tight">$14</span>
              <span className="text-xs text-[#70757e] uppercase tracking-widest font-bold">
                / one-time
              </span>
            </div>

            {/* Features List */}
            <ul className="mt-6 space-y-3.5 text-xs text-[#cfd3d8]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#c26b3a] text-sm">✦</span>
                <span>Instant High-Res Relic Manifestation Pack</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#c26b3a] text-sm">✦</span>
                <span>Diagnostic Arcane Prompt Blueprint</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#c26b3a] text-sm">✦</span>
                <span>Direct Studio Relic Asset Download</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#c26b3a] text-sm">✦</span>
                <span>Full Personal & Commercial Art License</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#c26b3a] text-sm">✦</span>
                <span>Single charge &bull; No monthly obligation</span>
              </li>
            </ul>
          </div>

          {/* Checkout CTA */}
          <div className="mt-8 pt-6 border-t border-[#242830]">
            <button
              onClick={() => handleCheckout(cultistLink)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#16181f] hover:bg-[#c26b3a] border border-[#c26b3a]/50 hover:border-[#c26b3a] text-[#c26b3a] hover:text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(194,107,58,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Summon Cultist Initiate ($14)</span>
              <span className="text-sm">↗</span>
            </button>
            <p className="text-[10px] text-[#70757e] text-center mt-2.5 font-mono">
              Direct Stripe Checkout &bull; One-Time Purchase
            </p>
          </div>
        </div>

        {/* CARD 2: Arcane & Seraphic Token Pack ($19/mo Subscription) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#181124] via-[#100d18] to-[#0d0a14] border-2 border-[#a855f7] p-7 sm:p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(168,85,247,0.25)] relative transform lg:-translate-y-2 hover:-translate-y-3 transition-all duration-300">
          {/* Top highlight ribbon */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] text-black text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse">
              ★ Most Chosen Subscription ★
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 mt-1">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c084fc] bg-[#a855f7]/20 border border-[#a855f7]/40 px-2.5 py-1 rounded-md">
                Monthly Subscription
              </span>
              <span className="text-[11px] text-[#c084fc] font-mono font-bold">Continuous Fuel</span>
            </div>

            <h3 className="text-2xl font-black text-white font-serif tracking-wide mb-2 flex items-center gap-2">
              <span>Arcane &amp; Seraphic Pack</span>
              <span className="text-base text-[#a855f7]">🔮</span>
            </h3>
            <p className="text-xs text-[#cfc7dd] mb-6 leading-relaxed">
              Continuous monthly covenant: regular token refilling, 2K Ultra resolution, 50 Angelic Transmutations, and Cloud Codex sync.
            </p>

            {/* Price Box */}
            <div className="flex items-baseline gap-2 pb-6 border-b border-[#a855f7]/30">
              <span className="text-4xl sm:text-5xl font-black text-white font-serif tracking-tight">$19</span>
              <span className="text-xs text-[#c084fc] uppercase tracking-widest font-bold">
                / month
              </span>
            </div>

            {/* Benefits */}
            <ul className="mt-6 space-y-3.5 text-xs text-white">
              <li className="flex items-start gap-2.5">
                <span className="text-[#a855f7] text-sm">⚡</span>
                <span><strong>50 Angelic Transmutations</strong> per month</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#a855f7] text-sm">⚡</span>
                <span>Expanded 2K Ultra Resolution Generation</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#a855f7] text-sm">⚡</span>
                <span>Continuous Cloud Codex &amp; History Sync</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#a855f7] text-sm">⚡</span>
                <span>Crucible Video Ritual Access</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#a855f7] text-sm">⚡</span>
                <span>Cancel or pause covenant anytime via Stripe</span>
              </li>
            </ul>
          </div>

          {/* Action CTA */}
          <div className="mt-8 pt-6 border-t border-[#a855f7]/30">
            <button
              onClick={() => handleCheckout(arcaneLink)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#a855f7] hover:from-[#b975ff] hover:to-[#9333ea] text-black text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Subscribe to Token Pack ($19/mo)</span>
              <span className="text-sm">↗</span>
            </button>
            <p className="text-[10px] text-[#c084fc]/80 text-center mt-2.5 font-mono">
              Monthly Subscription &bull; Manage via Stripe
            </p>
          </div>
        </div>

        {/* CARD 3: Archdemon Sovereign ($39/mo Subscription) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#1b0d10] via-[#12080a] to-[#0a0507] border border-[#ff2a2a]/40 hover:border-[#ff2a2a] p-7 sm:p-8 flex flex-col justify-between shadow-[0_10px_35px_rgba(255,42,42,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff4d4d] bg-[#ff2a2a]/15 border border-[#ff2a2a]/40 px-2.5 py-1 rounded-md">
                Archdemon Reign
              </span>
              <span className="text-[11px] text-[#ff7b7b] font-mono font-bold">Supreme Power</span>
            </div>

            <h3 className="text-2xl font-black text-white group-hover:text-[#ff2a2a] font-serif tracking-wide transition-colors mb-2 flex items-center gap-2">
              <span>Archdemon Sovereign</span>
              <span className="text-base text-[#ff2a2a]">👑</span>
            </h3>
            <p className="text-xs text-[#cfc7c8] mb-6 leading-relaxed">
              The supreme grimoire covenant. Unrestricted power and priority render speed engineered for heavy creators and sovereign masters.
            </p>

            {/* Price Box */}
            <div className="flex items-baseline gap-2 pb-6 border-b border-[#ff2a2a]/30">
              <span className="text-4xl sm:text-5xl font-black text-white font-serif tracking-tight">$39</span>
              <span className="text-xs text-[#ff7b7b] uppercase tracking-widest font-bold">
                / month
              </span>
            </div>

            {/* Benefits */}
            <ul className="mt-6 space-y-3.5 text-xs text-[#e8e6e3]">
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff2a2a] text-sm">🔥</span>
                <span><strong>Unlimited Angelic &amp; Seraphic Transmutations</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff2a2a] text-sm">🔥</span>
                <span>Studio 4K Ultra Cinematic Relic Renderings</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff2a2a] text-sm">🔥</span>
                <span>Veo 3.1 Abyssal Video Engine Priority Queue</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff2a2a] text-sm">🔥</span>
                <span>Automated Google Drive Cloud Vault Backup</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff2a2a] text-sm">🔥</span>
                <span>Four Archangel Choirs Soundscapes</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#ff2a2a] text-sm">🔥</span>
                <span>Direct Access to Sovereign Secret Prompt Keys</span>
              </li>
            </ul>
          </div>

          {/* Action CTA */}
          <div className="mt-8 pt-6 border-t border-[#ff2a2a]/30">
            <button
              onClick={() => handleCheckout(archdemonLink)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#ff2a2a] via-[#c2185b] to-[#8d1a1a] hover:from-[#ff4d4d] hover:to-[#a01c1c] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,42,42,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Seize Archdemon Sovereign ($39/mo)</span>
              <span className="text-sm">↗</span>
            </button>
            <p className="text-[10px] text-[#ff7b7b]/80 text-center mt-2.5 font-mono">
              Monthly Subscription &bull; Instant Full Access
            </p>
          </div>
        </div>

      </div>

      {/* Modular Add-On Blocks Section */}
      {showAddOns && (
        <div className="mt-16 pt-12 border-t border-[#242830]/80 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-[#0a0c10] border border-[#a855f7]/30 text-[#c084fc] text-[10px] font-mono uppercase tracking-widest shadow-md">
            ✦ MODULAR EXTENSIONS ✦
          </div>
          <ModularAddOns />
        </div>
      )}
    </section>
  );
};

export default PricingTiers;
