import React, { useState } from 'react';
import { startStripeCheckout, STRIPE_PAYMENT_LINKS, StripeAddonPlan, DEFAULT_ADDON_PLANS } from '../services/stripeService';
import { auth } from '../services/firebase';

export interface ModularAddOnsProps {
  className?: string;
  addons?: StripeAddonPlan[];
  onAddonPurchased?: (addonId: string) => void;
}

export const ModularAddOns: React.FC<ModularAddOnsProps> = ({
  className = '',
  addons = DEFAULT_ADDON_PLANS,
  onAddonPurchased,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async (addon: StripeAddonPlan) => {
    setErrorMsg(null);
    setLoadingId(addon.id);

    // If an official direct payment link is configured for this add-on, we can also prioritize or fallback to it
    const directLink =
      addon.paymentLink ||
      STRIPE_PAYMENT_LINKS[addon.id] ||
      (import.meta as any).env?.[`VITE_PAYMENT_LINK_${addon.id.toUpperCase()}`];

    try {
      const currentUser = auth?.currentUser;
      // Trigger dynamic Stripe checkout session (creates session with exact name, description & price)
      await startStripeCheckout(
        addon.id,
        currentUser?.email || undefined,
        currentUser?.uid || undefined
      );
      if (onAddonPurchased) {
        onAddonPurchased(addon.id);
      }
    } catch (err: any) {
      console.warn(`Dynamic Stripe checkout unavailable for ${addon.id}, attempting direct link:`, err);
      if (directLink) {
        window.open(directLink, '_blank', 'noopener,noreferrer');
      } else {
        setErrorMsg(
          `Unable to open checkout for ${addon.name}. Set VITE_PAYMENT_LINK_${addon.id.toUpperCase()} in your environment or ensure the Stripe backend is active.`
        );
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className={`w-full max-w-6xl mx-auto px-4 py-8 ${className}`} id="modular-addons">
      {/* Occult Section Header */}
      <div className="text-center mb-10 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#171221] border border-[#a855f7]/40 text-[#c084fc] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-3 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <span>🧩</span>
          <span>MODULAR ADD-ON BLOCKS</span>
          <span>🧩</span>
        </div>
        
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wider text-white uppercase font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          Dark Lorekeeper &amp; Grimdark Creator Fuel
        </h3>
        
        <p className="text-xs sm:text-sm text-[#8d929b] mt-3 max-w-2xl mx-auto font-sans leading-relaxed">
          Strictly engineered for dark fantasy authors, occult tabletop worldbuilders, and grim narrative creators who require unrelenting canon precision.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 max-w-md mx-auto rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs text-center font-mono">
            {errorMsg}
          </div>
        )}
      </div>

      {/* 3 Add-on Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* ADD-ON 1: Dark Lore License ($15/mo) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#140e1e] via-[#0d0914] to-[#08050c] border border-[#a855f7]/40 hover:border-[#c084fc] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c084fc] bg-[#a855f7]/15 border border-[#a855f7]/30 px-2.5 py-1 rounded-md">
                The Lorekeeper License
              </span>
              <span className="text-[11px] text-[#a855f7] font-mono font-bold">Monthly Canon</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#c084fc] font-serif tracking-wide transition-colors mb-2">
              Dark Lore License
            </h4>
            
            <p className="text-xs text-[#b8b0c4] mb-5 leading-relaxed min-h-[48px]">
              Tailored for dark fantasy novelists, screenwriters, and grimdark tabletop GMs. Unlimited mythic script audits &amp; custom Codex Brain memory.
            </p>

            {/* Price Block */}
            <div className="flex items-baseline gap-2 pb-5 border-b border-[#242830]">
              <span className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">$15</span>
              <span className="text-xs text-[#a855f7] uppercase tracking-widest font-bold">
                / mo
              </span>
            </div>

            {/* Feature Highlights */}
            <ul className="mt-5 space-y-2.5 text-xs text-[#cfd3d8]">
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Unlimited mythic script audits &amp; canon verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Custom Codex Brain persistent narrative memory</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Unrelenting grimdark lore &amp; lexicon continuity lock</span>
              </li>
            </ul>
          </div>

          {/* Action CTA */}
          <div className="mt-6 pt-5 border-t border-[#a855f7]/20">
            <button
              onClick={() => handleCheckout(addons[0] || DEFAULT_ADDON_PLANS[0])}
              disabled={loadingId === 'lorekeeper_monthly'}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7928ca] hover:from-[#b975ff] hover:to-[#9333ea] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loadingId === 'lorekeeper_monthly' ? 'Summoning Stripe...' : 'Get Lorekeeper ($15/mo)'}</span>
              <span className="text-sm">↗</span>
            </button>
            <p className="text-[10px] text-[#70757e] text-center mt-2 font-mono">
              Recurring Monthly Covenant &bull; Direct Stripe
            </p>
          </div>
        </div>

        {/* ADD-ON 2: Occult Top-Up ($10 one-time) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#1c120c] via-[#120a06] to-[#0a0503] border border-[#ff7b25]/40 hover:border-[#ff9b50] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(255,123,37,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9b50] bg-[#ff7b25]/15 border border-[#ff7b25]/30 px-2.5 py-1 rounded-md">
                50 Deep Audit Fuel Pack
              </span>
              <span className="text-[11px] text-[#ff9b50] font-mono font-bold">Sprint Fuel</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#ff9b50] font-serif tracking-wide transition-colors mb-2">
              Occult Top-Up
            </h4>
            
            <p className="text-xs text-[#ded1c7] mb-5 leading-relaxed min-h-[48px]">
              Writing sprint top-up: add 50 deep dark fantasy continuity audits, tone-drift checks, and auto-harmonized rewrites.
            </p>

            {/* Price Block */}
            <div className="flex items-baseline gap-2 pb-5 border-b border-[#242830]">
              <span className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">$10</span>
              <span className="text-xs text-[#ff9b50] uppercase tracking-widest font-bold">
                / one-time
              </span>
            </div>

            {/* Feature Highlights */}
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
                <span>Auto-harmonized mythic rewrites (Credits never expire)</span>
              </li>
            </ul>
          </div>

          {/* Action CTA */}
          <div className="mt-6 pt-5 border-t border-[#ff7b25]/20">
            <button
              onClick={() => handleCheckout(addons[1] || DEFAULT_ADDON_PLANS[1])}
              disabled={loadingId === 'audit_pack_onetime'}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff7b25] to-[#c2410c] hover:from-[#ff9b50] hover:to-[#ea580c] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,123,37,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loadingId === 'audit_pack_onetime' ? 'Summoning Stripe...' : 'Add 50 Audits ($10)'}</span>
              <span className="text-sm">↗</span>
            </button>
            <p className="text-[10px] text-[#70757e] text-center mt-2 font-mono">
              One-Time Purchase &bull; Instant Fuel Pack
            </p>
          </div>
        </div>

        {/* ADD-ON 3: Occult Grimoire Add-On ($5/mo) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#091518] via-[#060e10] to-[#040708] border border-[#00d2ff]/40 hover:border-[#4ade80] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,210,255,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00d2ff] bg-[#00d2ff]/15 border border-[#00d2ff]/30 px-2.5 py-1 rounded-md">
                Multi-Universe Vault (+3)
              </span>
              <span className="text-[11px] text-[#00d2ff] font-mono font-bold">Vault Storage</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00d2ff] font-serif tracking-wide transition-colors mb-2">
              Occult Grimoire Add-On
            </h4>
            
            <p className="text-xs text-[#a5c0c7] mb-5 leading-relaxed min-h-[48px]">
              Store 3 additional isolated grimdark universe bibles simultaneously for multi-series dark fantasy authors and studios.
            </p>

            {/* Price Block */}
            <div className="flex items-baseline gap-2 pb-5 border-b border-[#242830]">
              <span className="text-3xl sm:text-4xl font-black text-white font-serif tracking-tight">$5</span>
              <span className="text-xs text-[#00d2ff] uppercase tracking-widest font-bold">
                / mo
              </span>
            </div>

            {/* Feature Highlights */}
            <ul className="mt-5 space-y-2.5 text-xs text-[#cfd3d8]">
              <li className="flex items-start gap-2">
                <span className="text-[#00d2ff] text-xs">✦</span>
                <span>Store +3 isolated grimdark universe bibles simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00d2ff] text-xs">✦</span>
                <span>Independent faction, relic, and pantheon registries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00d2ff] text-xs">✦</span>
                <span>Instant multi-series switching for studios &amp; authors</span>
              </li>
            </ul>
          </div>

          {/* Action CTA */}
          <div className="mt-6 pt-5 border-t border-[#00d2ff]/20">
            <button
              onClick={() => handleCheckout(addons[2] || DEFAULT_ADDON_PLANS[2])}
              disabled={loadingId === 'vault_addon_monthly'}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0369a1] text-black text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <span>{loadingId === 'vault_addon_monthly' ? 'Summoning Stripe...' : 'Add Universe Vault ($5/mo)'}</span>
              <span className="text-sm">↗</span>
            </button>
            <p className="text-[10px] text-[#70757e] text-center mt-2 font-mono">
              Monthly Add-On &bull; Direct Stripe
            </p>
          </div>
        </div>

      </div>

      {/* Stripe Security & Sync Guarantee */}
      <div className="mt-8 pt-4 border-t border-[#1e232d] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6b7280]">
        <div className="flex items-center gap-2">
          <span className="text-[#10b981]">🛡️</span>
          <span>Verified Stripe Dynamic Checkout &bull; Official descriptions &amp; price-locks auto-generated</span>
        </div>
        <div className="font-mono text-[10px] text-[#8d929b]">
          The Demon Codex Modular Engine &bull; Canon Precision Guaranteed
        </div>
      </div>
    </section>
  );
};

export default ModularAddOns;