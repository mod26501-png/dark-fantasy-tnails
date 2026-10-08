import React, { useState, useEffect } from 'react';
import { startStripeCheckout, STRIPE_PAYMENT_LINKS, StripeAddonPlan, DEFAULT_ADDON_PLANS } from '../services/stripeService';
import { auth, onUserAuthStateChanged } from '../services/firebaseService';
import type { User } from 'firebase/auth';

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
  const [authUser, setAuthUser] = useState<User | null>(() => auth?.currentUser || null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onUserAuthStateChanged((user) => {
      setAuthUser(user);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Helper to append ?prefilled_email=${user.email} to Stripe payment links
  const formatStripeLink = (baseLink: string): string => {
    if (!baseLink) return '';
    const email = authUser?.email || auth?.currentUser?.email;
    if (!email) return baseLink;
    const separator = baseLink.includes('?') ? '&' : '?';
    return `${baseLink}${separator}prefilled_email=${encodeURIComponent(email)}`;
  };

  // Resolve official Stripe payment links from environment or defaults
  const lorekeeperRaw =
    (import.meta as any).env?.VITE_PAYMENT_LINK_LOREKEEPER ||
    STRIPE_PAYMENT_LINKS.lorekeeper_monthly ||
    'https://buy.stripe.com/YOUR_LOREKEEPER_LINK';

  const auditPackRaw =
    (import.meta as any).env?.VITE_PAYMENT_LINK_AUDIT_TOPUP ||
    STRIPE_PAYMENT_LINKS.audit_pack_onetime ||
    'https://buy.stripe.com/YOUR_AUDIT_PACK_LINK';

  const universeVaultRaw =
    (import.meta as any).env?.VITE_PAYMENT_LINK_UNIVERSE_VAULT ||
    STRIPE_PAYMENT_LINKS.vault_addon_monthly ||
    'https://buy.stripe.com/YOUR_VAULT_LINK';

  const lorekeeperLink = formatStripeLink(lorekeeperRaw);
  const auditPackLink = formatStripeLink(auditPackRaw);
  const universeVaultLink = formatStripeLink(universeVaultRaw);

  // Fallback to dynamic server-side checkout if placeholder link is clicked
  const handleFallbackCheckout = async (addonId: string, planName: string, e: React.MouseEvent) => {
    const rawLink =
      addonId === 'lorekeeper_monthly' ? lorekeeperRaw :
      addonId === 'audit_pack_onetime' ? auditPackRaw :
      universeVaultRaw;

    if (rawLink && !rawLink.includes('YOUR_')) {
      // Valid Stripe payment link present — let default <a> navigation proceed to new tab
      return;
    }

    // Otherwise, intercept and run dynamic server-side checkout
    e.preventDefault();
    setNoticeMsg(null);
    setLoadingId(addonId);

    try {
      await startStripeCheckout(
        addonId,
        authUser?.email || undefined,
        authUser?.uid || undefined
      );
      if (onAddonPurchased) {
        onAddonPurchased(addonId);
      }
    } catch (err: any) {
      console.warn(`Dynamic checkout fallback notice for ${addonId}:`, err);
      setNoticeMsg(
        `To link direct checkout, set VITE_PAYMENT_LINK_${addonId.toUpperCase()} with your https://buy.stripe.com/... URL.`
      );
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

        {authUser?.email && (
          <div className="mt-2 text-[10px] text-emerald-400 font-mono">
            ✦ Signed in as: {authUser.email} (Email auto-fills in Stripe Checkout)
          </div>
        )}

        {noticeMsg && (
          <div className="mt-4 p-3 max-w-md mx-auto rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs text-center font-mono">
            {noticeMsg}
          </div>
        )}
      </div>

      {/* 3 Add-on Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* ADD-ON 1: The Lorekeeper License ($15/mo) */}
        <div className="rounded-2xl bg-gradient-to-b from-[#140e1e] via-[#0d0914] to-[#08050c] border border-[#a855f7]/40 hover:border-[#c084fc] p-6 sm:p-7 flex flex-col justify-between shadow-[0_8px_30px_rgba(168,85,247,0.15)] transition-all duration-300 relative group hover:-translate-y-1">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c084fc] bg-[#a855f7]/15 border border-[#a855f7]/30 px-2.5 py-1 rounded-md">
                The Lorekeeper License
              </span>
              <span className="text-[11px] text-[#a855f7] font-mono font-bold">Monthly Canon</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#c084fc] font-serif tracking-wide transition-colors mb-2">
              The Lorekeeper License
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
              <li className="flex items-start gap-2">
                <span className="text-[#c084fc] text-xs">✦</span>
                <span>Multi-chapter consistency &amp; character bible lock</span>
              </li>
            </ul>
          </div>

          {/* Action CTA Link */}
          <div className="mt-6 pt-5 border-t border-[#a855f7]/20">
            <a
              href={lorekeeperLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleFallbackCheckout('lorekeeper_monthly', 'The Lorekeeper License', e)}
              className="addon-btn w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7c3aed] hover:from-[#c084fc] hover:to-[#9333ea] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{loadingId === 'lorekeeper_monthly' ? 'Summoning Stripe...' : 'GET LOREKEEPER ($15/MO) ↗'}</span>
            </a>
            <p className="text-[10px] text-[#70757e] text-center mt-2 font-mono">
              Recurring Monthly Covenant &bull; Direct Stripe
            </p>
          </div>
        </div>

        {/* ADD-ON 2: 50 Deep Audit Fuel Pack ($10 one-time) */}
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
              <li className="flex items-start gap-2">
                <span className="text-[#ff9b50] text-xs">✦</span>
                <span>Instant sprint activation &bull; Stackable balances</span>
              </li>
            </ul>
          </div>

          {/* Action CTA Link */}
          <div className="mt-6 pt-5 border-t border-[#ff7b25]/20">
            <a
              href={auditPackLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleFallbackCheckout('audit_pack_onetime', '50 Deep Audit Fuel Pack', e)}
              className="addon-btn w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff7b25] to-[#c2410c] hover:from-[#ff9b50] hover:to-[#ea580c] text-white text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,123,37,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{loadingId === 'audit_pack_onetime' ? 'Summoning Stripe...' : 'ADD 50 AUDITS ($10) ↗'}</span>
            </a>
            <p className="text-[10px] text-[#70757e] text-center mt-2 font-mono">
              One-Time Purchase &bull; Instant Fuel Pack
            </p>
          </div>
        </div>

        {/* ADD-ON 3: Multi-Universe Vault (+3) ($5/mo) */}
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
              <li className="flex items-start gap-2">
                <span className="text-[#00d2ff] text-xs">✦</span>
                <span>Isolated cosmology &amp; pantheon memory banks</span>
              </li>
            </ul>
          </div>

          {/* Action CTA Link */}
          <div className="mt-6 pt-5 border-t border-[#00d2ff]/20">
            <a
              href={universeVaultLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleFallbackCheckout('vault_addon_monthly', 'Multi-Universe Vault (+3)', e)}
              className="addon-btn w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0369a1] text-black text-xs font-black uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{loadingId === 'vault_addon_monthly' ? 'Summoning Stripe...' : 'ADD UNIVERSE VAULT ($5/MO) ↗'}</span>
            </a>
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
          <span>Verified Stripe Direct Links &bull; Official descriptions &amp; prefilled customer email</span>
        </div>
        <div className="font-mono text-[10px] text-[#8d929b]">
          The Demon Codex Modular Engine &bull; Canon Precision Guaranteed
        </div>
      </div>
    </section>
  );
};

export default ModularAddOns;
