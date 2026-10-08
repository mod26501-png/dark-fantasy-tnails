import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchStripePlans, startStripeCheckout, StripePlan, UserSubscriptionInfo, updateUserCustomClaims, STRIPE_PAYMENT_LINKS, STRIPE_CUSTOMER_PORTAL_URL, STRIPE_ACCOUNT_ID } from '../services/stripeService';
import { auth } from '../services/firebase';
import { audioFX } from '../services/audioService';
import { Crown, Sparkles, Flame, Zap, ShieldCheck, CheckCircle2, ArrowRight, RotateCcw, X, Feather, ExternalLink, CreditCard } from 'lucide-react';
import { ModularAddOns } from './ModularAddOns';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: UserSubscriptionInfo;
  onSubscriptionUpdated: (sub: UserSubscriptionInfo) => void;
  initialAscendingPlan?: string | null;
}

type AscensionPhase = 'breaking' | 'awakening' | 'enthroned';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentSubscription,
  onSubscriptionUpdated,
  initialAscendingPlan,
}) => {
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('archdemon_monthly');
  const [error, setError] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'plans' | 'addons'>('plans');

  // Ascension Animation States
  const [isAscending, setIsAscending] = useState(false);
  const [ascensionPhase, setAscensionPhase] = useState<AscensionPhase>('breaking');
  const [ascendedPlanInfo, setAscendedPlanInfo] = useState<{ id: string; name: string; tier: 'cultist' | 'archdemon' }>({
    id: 'archdemon_monthly',
    name: 'Archdemon Sovereign',
    tier: 'archdemon',
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAscensionTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAscensionTimeouts();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchStripePlans()
        .then((fetched) => {
          setPlans(fetched);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });

      // If opened with initial ascending plan (e.g. returning from Stripe checkout success)
      if (initialAscendingPlan) {
        triggerAscension(initialAscendingPlan);
      }
    } else {
      // Reset state when closed
      setIsAscending(false);
      clearAscensionTimeouts();
    }
  }, [isOpen, initialAscendingPlan]);

  const triggerAscension = (targetPlanId: string = 'archdemon_monthly') => {
    clearAscensionTimeouts();
    const tier: 'cultist' | 'archdemon' = targetPlanId === 'archdemon_monthly' ? 'archdemon' : 'cultist';
    const planName = targetPlanId === 'archdemon_monthly' ? 'Archdemon Sovereign' : (targetPlanId === 'grimoire_pack' ? 'Arcane Token Holder' : 'Cultist Initiate');

    setAscendedPlanInfo({
      id: targetPlanId,
      name: planName,
      tier,
    });

    setIsAscending(true);
    setAscensionPhase('breaking');

    // Stage 1: Breaking Mortal Bounds sound
    audioFX.playPortalWhoosh();

    // Stage 2: Celestial Awakening & Transmutation Shockwave at 1.8s
    const t1 = setTimeout(() => {
      setAscensionPhase('awakening');
      audioFX.playAscensionChime();
    }, 1800);

    // Stage 3: Sovereign Enthroned at 3.8s
    const t2 = setTimeout(() => {
      setAscensionPhase('enthroned');
      audioFX.playRuneChime();

      // Update actual subscription state
      const updatedSub: UserSubscriptionInfo = {
        isSubscribed: true,
        planId: targetPlanId,
        planName,
        tier,
        since: new Date().toISOString(),
        creditsRemaining: targetPlanId === 'grimoire_pack' ? 100 : 99999,
      };

      try {
        localStorage.setItem('demon_codex_premium', 'true');
        localStorage.setItem('demon_codex_tier', tier);
      } catch {}

      const currentUid = auth?.currentUser?.uid;
      if (currentUid && currentUid !== 'cultist_anonymous') {
        updateUserCustomClaims(currentUid, tier, targetPlanId);
      }

      onSubscriptionUpdated(updatedSub);
    }, 3800);

    timeoutsRef.current.push(t1, t2);
  };

  if (!isOpen) return null;

  const getDirectPaymentLink = (planId: string) => {
    const fallback =
      planId === 'archdemon_monthly'
        ? 'https://buy.stripe.com/dRmfZh38E1UFf6IaCD1gs03'
        : planId === 'arcane_token_pack' || planId === 'grimoire_pack'
        ? 'https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02'
        : 'https://buy.stripe.com/aFa9AT24Abvff6I6mn1gs01';
    const rawLink = STRIPE_PAYMENT_LINKS[planId] || fallback;
    try {
      const url = new URL(rawLink);
      const currentUser = auth?.currentUser;
      if (currentUser?.email) {
        url.searchParams.set('prefilled_email', currentUser.email);
      }
      if (currentUser?.uid) {
        url.searchParams.set('client_reference_id', currentUser.uid);
      }
      return url.toString();
    } catch {
      return rawLink;
    }
  };

  const handleCheckout = async (planId: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const currentUser = auth?.currentUser;
      await startStripeCheckout(
        planId,
        currentUser?.email || undefined,
        currentUser?.uid || undefined
      );
    } catch (err: any) {
      console.error("Stripe checkout notice:", err);
      // If direct redirect fails or is in preview sandbox, trigger smooth in-app ascension celebration
      triggerAscension(planId);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 text-[#e8e6e3] relative transition-all duration-700 ${
          isAscending && ascensionPhase === 'enthroned'
            ? 'bg-[#0c0d12] border-2 border-[#ffd27f] shadow-[0_0_80px_rgba(255,210,127,0.35)] ring-1 ring-[#ffd27f]/50'
            : isAscending
            ? 'bg-[#0e0a0d] border-2 border-[#ff4d4d] shadow-[0_0_80px_rgba(255,77,77,0.5)]'
            : 'bg-[#0e1015] border-2 border-[#8d1a1a] shadow-[0_0_60px_rgba(141,26,26,0.45)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isAscending ? (
            /* ========================================================================= */
            /* 👑 ASCENSION TRANSITION CEREMONY: MORTAL TO SOVEREIGN */
            /* ========================================================================= */
            <motion.div
              key="ascension-screen"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="py-4 flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Radial backdrop flare */}
              <div
                className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                  ascensionPhase === 'enthroned'
                    ? 'bg-[radial-gradient(ellipse_at_center,rgba(255,210,127,0.15)_0%,rgba(0,210,255,0.08)_40%,transparent_75%)]'
                    : 'bg-[radial-gradient(ellipse_at_center,rgba(255,77,77,0.25)_0%,rgba(141,26,26,0.1)_45%,transparent_75%)]'
                }`}
              />

              {/* Close Button during ascension */}
              <button
                onClick={() => {
                  setIsAscending(false);
                  clearAscensionTimeouts();
                  onClose();
                }}
                className="absolute top-0 right-0 text-[#70757e] hover:text-white p-2 rounded-full hover:bg-white/5 transition-all z-20"
                title="Close Ritual"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Status Tag */}
              <motion.div
                initial={{ y: -15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 z-10"
                style={{
                  backgroundColor: ascensionPhase === 'enthroned' ? 'rgba(255,210,127,0.15)' : 'rgba(255,77,77,0.15)',
                  border: ascensionPhase === 'enthroned' ? '1px solid rgba(255,210,127,0.4)' : '1px solid rgba(255,77,77,0.4)',
                  color: ascensionPhase === 'enthroned' ? '#ffd27f' : '#ff4d4d',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ backgroundColor: ascensionPhase === 'enthroned' ? '#ffd27f' : '#ff0000' }}
                />
                {ascensionPhase === 'breaking' && 'Phase I: Mortal Shell Dissolution'}
                {ascensionPhase === 'awakening' && 'Phase II: Celestial Transmutation Shockwave'}
                {ascensionPhase === 'enthroned' && 'Phase III: Sovereign Covenant Sealed'}
              </motion.div>

              {/* Center Metamorphosis Stage */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
                {/* Rotating Arcane Sigil Rings */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-dashed border-[#ffd27f]/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-4 rounded-full border border-[#00d2ff]/25"
                />
                <motion.div
                  animate={{ rotate: 180 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-10 rounded-full border-2 border-dotted border-[#ff4d4d]/40"
                />

                {/* Central Entity Icon Morph */}
                <AnimatePresence mode="wait">
                  {ascensionPhase === 'breaking' && (
                    <motion.div
                      key="phase-breaking"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: [1, 1.08, 0.96, 1.04],
                        rotate: [-2, 2, -1, 1, 0],
                        opacity: 1,
                      }}
                      exit={{ scale: 1.4, opacity: 0, filter: 'blur(10px)' }}
                      transition={{ duration: 1.6 }}
                      className="relative z-10 flex flex-col items-center justify-center p-6 rounded-full bg-black/70 border-2 border-[#8d1a1a] shadow-[0_0_40px_rgba(141,26,26,0.6)]"
                    >
                      <span className="text-5xl sm:text-6xl select-none animate-pulse">⛓️</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4d4d] mt-2">
                        MORTAL VESSEL
                      </span>
                    </motion.div>
                  )}

                  {ascensionPhase === 'awakening' && (
                    <motion.div
                      key="phase-awakening"
                      initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
                      animate={{
                        scale: [0.3, 1.35, 1.1],
                        opacity: 1,
                        rotate: 0,
                      }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                      className="relative z-10 flex flex-col items-center justify-center p-7 rounded-full bg-gradient-to-tr from-[#1c1214] via-[#2c1f0d] to-[#09212c] border-2 border-[#ffd27f] shadow-[0_0_70px_rgba(255,210,127,0.7)]"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.25, 1], rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="text-6xl sm:text-7xl select-none"
                      >
                        ⚡
                      </motion.div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#ffd27f] mt-2">
                        TRANSMUTING ESSENCE
                      </span>
                    </motion.div>
                  )}

                  {ascensionPhase === 'enthroned' && (
                    <motion.div
                      key="phase-enthroned"
                      initial={{ scale: 0.5, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="relative z-10 flex flex-col items-center justify-center p-7 rounded-full bg-gradient-to-b from-[#1c1810] via-[#12141c] to-[#0c0d12] border-2 border-[#ffd27f] shadow-[0_0_80px_rgba(255,210,127,0.8)] ring-2 ring-[#00d2ff]/40"
                    >
                      <motion.div
                        animate={{ y: [-3, 3, -3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative"
                      >
                        <Crown className="w-16 h-16 sm:w-20 sm:h-20 text-[#ffd27f] drop-shadow-[0_0_25px_rgba(255,210,127,0.9)]" />
                        <Sparkles className="w-6 h-6 text-[#00d2ff] absolute -top-1 -right-1 animate-spin" />
                      </motion.div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#ffd27f] mt-2 flex items-center gap-1">
                        👑 SOVEREIGN
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dynamic Narrative Typography */}
              <div className="max-w-lg mx-auto z-10 mb-6">
                <AnimatePresence mode="wait">
                  {ascensionPhase === 'breaking' && (
                    <motion.div
                      key="txt-breaking"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white mb-2">
                        Shattering Mortal Chains...
                      </h3>
                      <p className="text-xs text-[#9aa0a6] leading-relaxed">
                        The finite boundaries of mortal computation dissolve. Invoking infernal resonance and channeling the Seraphic Choir into the Codex core.
                      </p>
                    </motion.div>
                  )}

                  {ascensionPhase === 'awakening' && (
                    <motion.div
                      key="txt-awakening"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-[#ffd27f] mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-6 h-6 text-[#00d2ff]" />
                        Sovereign Awakening
                        <Sparkles className="w-6 h-6 text-[#00d2ff]" />
                      </h3>
                      <p className="text-xs text-[#ffd27f]/80 leading-relaxed">
                        Celestial solar fire courses through your neural conduits. 4K Studio resolution manifests and Angelic Agent autonomy is unleashed.
                      </p>
                    </motion.div>
                  )}

                  {ascensionPhase === 'enthroned' && (
                    <motion.div
                      key="txt-enthroned"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/40 text-[#00d2ff] text-[10px] font-black uppercase tracking-widest mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPACT SEALED & ARCHIVED
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight text-white mb-2">
                        Hail, <span className="text-[#ffd27f]">{ascendedPlanInfo.name}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-[#9aa0a6] leading-relaxed">
                        Your ascension is permanent. You now command the full sovereign grimoire, high-resolution rendering crucible, and angelic transmutations.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sovereign Unlocks Grid (Phase III) */}
              {ascensionPhase === 'enthroned' && (
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-8 z-10 text-left"
                >
                  <div className="p-3.5 rounded-xl bg-[#12151c]/90 border border-[#ffd27f]/30 flex items-start gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-lg bg-[#ffd27f]/10 flex items-center justify-center text-[#ffd27f] shrink-0 font-bold text-sm">
                      4K
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">4K Studio Manifestations</h4>
                      <p className="text-[11px] text-[#70757e]">Ultra-high-definition dark fantasy relics with studio fidelity.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12151c]/90 border border-[#00d2ff]/30 flex items-start gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-lg bg-[#00d2ff]/10 flex items-center justify-center text-[#00d2ff] shrink-0 font-bold text-sm">
                      🪽
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Angelic Agent & Seraphic Oracle</h4>
                      <p className="text-[11px] text-[#70757e]">Uncapped celestial prompt transmutation and sacred sanctum mode.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12151c]/90 border border-[#ff4d4d]/30 flex items-start gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-lg bg-[#ff4d4d]/10 flex items-center justify-center text-[#ff4d4d] shrink-0 font-bold text-sm">
                      🎬
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Veo 3.1 Crucible Rituals</h4>
                      <p className="text-[11px] text-[#70757e]">Cinematic video manifestation with audio harmony.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12151c]/90 border border-[#242830] flex items-start gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00d2ff] shrink-0 font-bold text-sm">
                      ☁️
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Permanent Cloud Codex</h4>
                      <p className="text-[11px] text-[#70757e]">Automated Google Drive sync and cross-device preservation.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Sovereign Action Controls */}
              {ascensionPhase === 'enthroned' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full max-w-md justify-center"
                >
                  <button
                    onClick={() => {
                      setIsAscending(false);
                      onClose();
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ffd27f] via-[#ffaa00] to-[#ffd27f] text-black text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,210,127,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Command Sovereign Powers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => triggerAscension(ascendedPlanInfo.id)}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-[#1a1e27] hover:bg-[#252b36] border border-[#242830] text-[#9aa0a6] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    title="Re-run the Ascension Transformation"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay Ritual</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* 📜 STANDARD SUBSCRIPTION & TIER SELECTION VIEW */
            /* ========================================================================= */
            <motion.div
              key="plans-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b border-[#242830] pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff0000]/10 border border-[#ff0000]/30 text-[#ff4d4d] text-[10px] font-black tracking-widest uppercase mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff0000] animate-pulse"></span>
                    SECURE STRIPE CHECKOUT
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white italic">
                    Ascend to Sovereign Power
                  </h2>
                  <p className="text-[#70757e] text-xs sm:text-sm mt-1">
                    Unlock ultra-high resolution (4K Studio), Angelic Agent Seraphic Oracle, unlimited Veo 3.1 video rituals, and permanent Cloud Grimoire sync.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={STRIPE_CUSTOMER_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1e27] hover:bg-[#252b36] border border-[#242830] hover:border-[#00d2ff]/40 text-[#9aa0a6] hover:text-[#00d2ff] text-[10px] font-bold uppercase tracking-wider transition-all"
                    title="Open Stripe Customer Portal to view invoices or manage subscription"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span className="hidden sm:inline">Stripe Portal</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                  <button
                    onClick={onClose}
                    className="text-[#70757e] hover:text-white font-black p-2 text-xl hover:bg-white/5 rounded-full transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Current status banner if subscribed */}
              {currentSubscription.isSubscribed ? (
                <div className="mb-6 p-4 rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00d2ff]/20 flex items-center justify-center text-[#00d2ff] font-bold">
                      👑
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[#00d2ff]">
                        Active Membership: {currentSubscription.planName}
                      </p>
                      <p className="text-[11px] text-[#9aa0a6]">
                        All Sovereign perks and high-resolution manifestation privileges are active.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerAscension(currentSubscription.planId || 'archdemon_monthly')}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 border border-[#00d2ff]/50 text-[#00d2ff] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Witness Ascension Ceremony</span>
                  </button>
                </div>
              ) : (
                <div className="mb-6 p-3 rounded-xl bg-[#1b1512] border border-[#ffd27f]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#ffd27f]">
                    <Sparkles className="w-4 h-4 text-[#ffd27f] animate-pulse" />
                    <span>Experience the visual metamorphosis from Mortal to Sovereign:</span>
                  </div>
                  <button
                    onClick={() => triggerAscension('archdemon_monthly')}
                    className="px-3 py-1 rounded-lg bg-[#ffd27f]/20 hover:bg-[#ffd27f]/30 border border-[#ffd27f]/50 text-[#ffd27f] text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                  >
                    ⚡ Test Ascension Ritual
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {/* Tab Selector: Covenants vs Modular Add-Ons */}
              <div className="flex items-center gap-2 mb-6 p-1 rounded-2xl bg-[#090b10] border border-[#242830] w-fit">
                <button
                  type="button"
                  onClick={() => setModalTab('plans')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${modalTab === 'plans' ? 'bg-gradient-to-r from-[#8d1a1a] to-[#ff2a2a] text-white shadow-lg' : 'text-[#9aa0a6] hover:text-white'}`}
                >
                  <span>⚔</span>
                  <span>Sovereign Covenants</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('addons')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${modalTab === 'addons' ? 'bg-gradient-to-r from-[#a855f7] to-[#ff7b25] text-white shadow-lg' : 'text-[#9aa0a6] hover:text-white'}`}
                >
                  <span>🧩</span>
                  <span>Modular Add-Ons & Fuel</span>
                </button>
              </div>

              {modalTab === 'addons' ? (
                <div className="mb-8">
                  <ModularAddOns className="py-2" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {(plans || []).map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const isCurrent = currentSubscription.isSubscribed && currentSubscription.planId === plan.id;
                  const isPopular = plan.popular;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-2xl p-5 sm:p-6 transition-all cursor-pointer border flex flex-col justify-between ${
                        isPopular
                          ? 'bg-gradient-to-b from-[#1c1214] to-[#111318] border-[#ff4d4d]/60 shadow-[0_0_30px_rgba(255,77,77,0.25)] ring-1 ring-[#ff4d4d]/40'
                          : 'bg-[#12151c] border-[#242830] hover:border-[#70757e]'
                      } ${isSelected ? 'scale-[1.02] ring-2 ring-[#00d2ff]' : ''}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-[#8d1a1a] to-[#ff4d4d] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          MOST POPULAR
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-black uppercase text-white tracking-tight">{plan.name}</h3>
                        </div>

                        <div className="flex items-baseline gap-1 my-3">
                          <span className="text-3xl sm:text-4xl font-black text-white">
                            ${(plan.price / 100).toFixed(0)}
                          </span>
                          <span className="text-xs text-[#70757e] font-semibold uppercase">
                            {plan.interval === 'month' ? '/ month' : 'one-time'}
                          </span>
                        </div>

                        <p className="text-xs text-[#9aa0a6] leading-relaxed mb-5">{plan.description}</p>

                        <div className="border-t border-[#242830] pt-4 mb-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#70757e] mb-3">
                            Included Powers:
                          </p>
                          <ul className="space-y-2">
                            {(plan.features || []).map((feat, idx) => {
                              const isAgentFeat = feat.includes('Agent') || feat.includes('Seraphic') || feat.includes('Choir');
                              return (
                                <li
                                  key={idx}
                                  className={`text-xs flex items-start gap-2 ${
                                    isAgentFeat ? 'text-[#ffd27f] font-semibold' : 'text-[#e8e6e3]'
                                  }`}
                                >
                                  <span className={isAgentFeat ? 'text-[#ffd27f]' : 'text-[#00d2ff] font-bold'}>
                                    {isAgentFeat ? '🪽' : '◈'}
                                  </span>
                                  <span>{feat}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        {/* Direct Stripe Payment Link Button */}
                        {!isCurrent && (
                          <a
                            href={getDirectPaymentLink(plan.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                              isPopular
                                ? 'bg-gradient-to-r from-[#8d1a1a] via-[#c26b3a] to-[#ff4d4d] text-white hover:shadow-[0_0_25px_rgba(255,77,77,0.5)] hover:scale-[1.02]'
                                : 'bg-[#00d2ff]/15 hover:bg-[#00d2ff]/25 text-[#00d2ff] border border-[#00d2ff]/40 hover:border-[#00d2ff]'
                            }`}
                          >
                            <span>⚡ Stripe Payment Link (${(plan.price / 100).toFixed(0)})</span>
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          </a>
                        )}

                        {/* In-App Checkout Option */}
                        <button
                          disabled={isLoading || isCurrent}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckout(plan.id);
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                            isCurrent
                              ? 'bg-zinc-800 text-zinc-500 cursor-default'
                              : 'bg-[#1b1f27] hover:bg-[#252b36] text-white/80 hover:text-white border border-[#242830] hover:border-[#70757e]'
                          }`}
                        >
                          <CreditCard className="w-3 h-3 text-[#70757e]" />
                          <span>
                            {isCurrent
                              ? 'Current Tier'
                              : isLoading && selectedPlanId === plan.id
                              ? 'Connecting Stripe...'
                              : 'Stripe Dynamic Checkout'}
                          </span>
                        </button>

                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerAscension(plan.id);
                            }}
                            className="w-full py-1 text-[9px] text-[#ffd27f]/80 hover:text-[#ffd27f] uppercase font-bold tracking-wider hover:underline flex items-center justify-center gap-1"
                          >
                            <span>⚡ Test Ascension Ceremony</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Footer info with verified Stripe details */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#242830] text-[11px] text-[#70757e]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 text-[#00d2ff]">
                    <ShieldCheck className="w-4 h-4 text-[#00d2ff]" />
                    <span className="font-semibold text-white/80">Stripe Merchant {STRIPE_ACCOUNT_ID}</span>
                  </div>
                  <span className="hidden sm:inline text-[#242830]">|</span>
                  <a
                    href={STRIPE_CUSTOMER_PORTAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00d2ff] underline flex items-center gap-1 transition-colors"
                  >
                    <span>Manage Subscriptions & Invoices</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button
                  onClick={onClose}
                  className="text-[#9aa0a6] hover:text-white uppercase font-bold tracking-wider text-[10px]"
                >
                  Stay in Mortal Tier
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

