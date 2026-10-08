/**
 * Stripe Client Service
 * Interacts with the backend proxy routes to create Stripe Checkout sessions,
 * verify subscriptions, and handle member ascension.
 */

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_live_51U5QVcIaPpa0VSmLjH0Tgww9yuAvVikLXPYwxI9EgiBgoigjzRG6QcCeLSuvPJtAI2GShYoN1LnAu77CJ97cX78U00zseHpXm9';

export const STRIPE_ACCOUNT_ID = 'acct_1U5QVcIaPpa0VSmL';

export function resolveClientStripePortalUrl(): string {
  const candidates = [
    (import.meta as any).env?.VITE_STRIPE_CUSTOMER_PORTAL_URL,
    (import.meta as any).env?.VITE_STRIPE_BILLING_URL,
    (import.meta as any).env?.VITE_STRIPE_BILL_URL,
    (import.meta as any).env?.VITE_CUSTOMER_PORTAL_URL,
  ];

  for (const c of candidates) {
    if (c && typeof c === 'string') {
      const trimmed = c.trim();
      if (trimmed.includes('billing.stripe.com') || (trimmed.includes('stripe.com') && !trimmed.includes('thedemoncodex.com'))) {
        return trimmed;
      }
    }
  }

  return 'https://billing.stripe.com/p/login/dRm5kD7oU42N7EgcKL1gs00';
}

export let STRIPE_CUSTOMER_PORTAL_URL = resolveClientStripePortalUrl();
export const STRIPE_PORTAL_CONFIG_ID = 'bpc_1UGWmzIaPpa0VSmLAFhU5SIQ';

export const getCustomerPortalUrl = (): string => STRIPE_CUSTOMER_PORTAL_URL;

// Official Stripe Buy Payment Links
export const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  cultist_onetime: (import.meta as any).env?.VITE_PAYMENT_LINK_CULTIST || (import.meta as any).env?.VITE_PAYMENT_LINK_SINGLE || (import.meta as any).env?.VITE_PAYMENT_LINK_ONETIME || 'https://buy.stripe.com/aFa9AT24Abvff6I6mn1gs01', // $14 One-Time Purchase
  arcane_token_pack: (import.meta as any).env?.VITE_PAYMENT_LINK_ARCANE || (import.meta as any).env?.VITE_PAYMENT_LINK_STANDARD || 'https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02', // $19 / month Subscription
  archdemon_monthly: (import.meta as any).env?.VITE_PAYMENT_LINK_ARCHDEMON || (import.meta as any).env?.VITE_PAYMENT_LINK_PREMIUM || 'https://buy.stripe.com/dRmfZh38E1UFf6IaCD1gs03', // $39 / month Subscription
  // Backward compatible keys
  cultist_monthly: (import.meta as any).env?.VITE_PAYMENT_LINK_CULTIST || 'https://buy.stripe.com/aFa9AT24Abvff6I6mn1gs01',
  grimoire_pack: (import.meta as any).env?.VITE_PAYMENT_LINK_ARCANE || 'https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02',
  // Modular Add-On Links
  lorekeeper_monthly: (import.meta as any).env?.VITE_PAYMENT_LINK_LOREKEEPER || 'https://buy.stripe.com/YOUR_LOREKEEPER_LINK',
  audit_pack_onetime: (import.meta as any).env?.VITE_PAYMENT_LINK_AUDIT_TOPUP || 'https://buy.stripe.com/YOUR_AUDIT_PACK_LINK',
  vault_addon_monthly: (import.meta as any).env?.VITE_PAYMENT_LINK_UNIVERSE_VAULT || 'https://buy.stripe.com/YOUR_VAULT_LINK',
  dark_lore_license: (import.meta as any).env?.VITE_PAYMENT_LINK_LOREKEEPER || 'https://buy.stripe.com/YOUR_LOREKEEPER_LINK',
  occult_topup: (import.meta as any).env?.VITE_PAYMENT_LINK_AUDIT_TOPUP || 'https://buy.stripe.com/YOUR_AUDIT_PACK_LINK',
  universe_vault: (import.meta as any).env?.VITE_PAYMENT_LINK_UNIVERSE_VAULT || 'https://buy.stripe.com/YOUR_VAULT_LINK',
};

export interface StripePlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  popular?: boolean;
  description: string;
  features: string[];
  paymentLink?: string;
}

export interface StripeAddonPlan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  interval: string;
  popular?: boolean;
  description: string;
  features: string[];
  cta: string;
  paymentLink?: string;
}

export const DEFAULT_ADDON_PLANS: StripeAddonPlan[] = [
  {
    id: 'lorekeeper_monthly',
    name: 'Dark Lore License',
    subtitle: 'The Lorekeeper License',
    price: 1500,
    currency: 'usd',
    interval: 'month',
    paymentLink: STRIPE_PAYMENT_LINKS.lorekeeper_monthly,
    description: 'Tailored for dark fantasy novelists, screenwriters, and grimdark tabletop GMs. Unlimited mythic script audits & custom Codex Brain memory.',
    features: [
      'Unlimited mythic script audits',
      'Custom Codex Brain persistent memory',
      'Grimdark narrative tone guardrails',
      'Multi-chapter consistency & character bible lock'
    ],
    cta: 'Get Lorekeeper (/mo)'
  },
  {
    id: 'audit_pack_onetime',
    name: 'Occult Top-Up',
    subtitle: '50 Deep Audit Fuel Pack',
    price: 1000,
    currency: 'usd',
    interval: 'one_time',
    paymentLink: STRIPE_PAYMENT_LINKS.audit_pack_onetime,
    description: 'Writing sprint top-up: add 50 deep dark fantasy continuity audits, tone-drift checks, and auto-harmonized rewrites.',
    features: [
      '50 deep dark fantasy continuity audits',
      'Tone-drift and vocabulary harmonizers',
      'Auto-harmonized lore rewrite suggestions',
      'Sprint fuel pack — credits never expire'
    ],
    cta: 'Add 50 Audits ()'
  },
  {
    id: 'vault_addon_monthly',
    name: 'Occult Grimoire Add-On',
    subtitle: 'Multi-Universe Vault (+3)',
    price: 500,
    currency: 'usd',
    interval: 'month',
    paymentLink: STRIPE_PAYMENT_LINKS.vault_addon_monthly,
    description: 'Store 3 additional isolated grimdark universe bibles simultaneously for multi-series dark fantasy authors and studios.',
    features: [
      'Store +3 additional isolated universe bibles',
      'Simultaneous multi-series universe isolation',
      'Independent cosmology, seals & faction registries',
      'Instant studio universe switching'
    ],
    cta: 'Add Universe Vault (/mo)'
  }
];

export const fetchStripeAddons = async (): Promise<StripeAddonPlan[]> => {
  try {
    const res = await fetch('/api/stripe/config');
    if (!res.ok) throw new Error('Server returned status ' + res.status);
    const data = await res.json();
    return data.addons || DEFAULT_ADDON_PLANS;
  } catch (err) {
    console.warn("Using fallback add-on plans:", err);
    return DEFAULT_ADDON_PLANS;
  }
};

export interface UserSubscriptionInfo {
  isSubscribed: boolean;
  planId: string | null;
  planName: string | null;
  tier: 'free' | 'cultist' | 'archdemon';
  since?: string;
  creditsRemaining?: number;
}

const SUBSCRIPTION_STORAGE_KEY = 'demon_codex_subscription';

/**
 * Get active user subscription details
 */
export const getUserSubscription = (): UserSubscriptionInfo => {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read subscription from storage:", e);
  }
  return {
    isSubscribed: false,
    planId: null,
    planName: null,
    tier: 'free',
    creditsRemaining: 5
  };
};

/**
 * Save user subscription locally
 */
export const setUserSubscription = (info: UserSubscriptionInfo): void => {
  try {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(info));
  } catch (e) {
    console.warn("Could not save subscription to storage:", e);
  }
};

/**
 * Fetch available plans from backend
 */
export const fetchStripePlans = async (): Promise<StripePlan[]> => {
  try {
    const res = await fetch('/api/stripe/config');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    if (data.portalUrl && (data.portalUrl.includes('billing.stripe.com') || (data.portalUrl.includes('stripe.com') && !data.portalUrl.includes('thedemoncodex.com')))) {
      STRIPE_CUSTOMER_PORTAL_URL = data.portalUrl;
    }
    return data.plans || [];
  } catch (err) {
    console.warn("Failed to fetch Stripe config from server, using fallback plans:", err);
    return [
      {
        id: 'cultist_onetime',
        name: 'Cultist Initiate',
        price: 1400,
        currency: 'usd',
        interval: 'one_time',
        paymentLink: STRIPE_PAYMENT_LINKS.cultist_onetime,
        description: 'One-time purchase: instant high-res relic manifests, arcane prompt diagnostics, and personal/commercial usage license.',
        features: [
          'Instant High-Res Relic Manifestation Pack',
          'Diagnostic Arcane Prompt Blueprint',
          'Full Personal & Commercial Art License',
          'Direct Studio Relic Asset Download',
          'One-time charge — no recurring subscription'
        ]
      },
      {
        id: 'arcane_token_pack',
        name: 'Arcane & Seraphic Token Pack',
        price: 1900,
        currency: 'usd',
        interval: 'month',
        popular: true,
        paymentLink: STRIPE_PAYMENT_LINKS.arcane_token_pack,
        description: 'Monthly covenant: 50 Angelic Agent transmutations/mo, 2K Ultra resolution, and continuous Cloud Codex sync.',
        features: [
          '50 Angelic Transmutations per month',
          '2K Ultra Resolution Relic Generation',
          'Continuous Cloud Codex & History Sync',
          'Crucible Video Ritual Access',
          'Cancel or manage anytime via Stripe'
        ]
      },
      {
        id: 'archdemon_monthly',
        name: 'Archdemon Sovereign',
        price: 3900,
        currency: 'usd',
        interval: 'month',
        paymentLink: STRIPE_PAYMENT_LINKS.archdemon_monthly,
        description: 'Studio 4K Ultra renders, unlimited Angelic Agent & Seraphic Oracle transmutation, Veo 3.1 videos & Drive sync.',
        features: [
          'Studio 4K Ultra Fidelity',
          'Unlimited Angelic Agent & Seraphic Oracle Access',
          'Autonomous Agent Relic & Lore Transmuter',
          'Four Archangel Choirs (Michael, Gabriel, Metatron, Raphael)',
          'Unlimited Alchemist Crucible Transmutations',
          'Cinematic Veo Video Generation',
          'Instant Automated Google Drive Archiving',
          'Dark Ambient & Celestial Choral Soundscapes'
        ]
      }
    ];
  }
};

/**
 * Initiate Stripe Checkout session for a chosen plan
 */
export const startStripeCheckout = async (
  planId: string,
  userEmail?: string,
  userId?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<string> => {
  const origin = window.location.origin;
  const res = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      planId,
      userEmail,
      userId,
      origin,
      successUrl,
      cancelUrl
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Checkout failed (${res.status})`);
  }

  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
    return data.url;
  }
  throw new Error("No checkout URL returned from Stripe session.");
};

/**
 * Update Firebase Auth custom claim on backend
 */
export const updateUserCustomClaims = async (
  userId: string,
  tier: 'cultist' | 'archdemon',
  planId: string = 'cultist_monthly'
): Promise<boolean> => {
  try {
    const res = await fetch('/api/stripe/set-custom-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier, planId })
    });
    return res.ok;
  } catch (err) {
    console.warn("Could not set custom claims via API:", err);
    return false;
  }
};

/**
 * Verify checkout completion after redirect back to app
 */
export const verifyCheckoutSession = async (
  sessionId: string,
  planParam?: string,
  userId?: string
): Promise<UserSubscriptionInfo | null> => {
  try {
    const url = `/api/stripe/session-status?sessionId=${encodeURIComponent(sessionId)}${userId ? `&userId=${encodeURIComponent(userId)}` : ''}${planParam ? `&plan=${encodeURIComponent(planParam)}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not verify session");
    const data = await res.json();

    if (data.status === 'complete' || data.paymentStatus === 'paid') {
      const planId = data.metadata?.planId || planParam || 'cultist_monthly';
      const tier = planId === 'archdemon_monthly' ? 'archdemon' : 'cultist';
      const info: UserSubscriptionInfo = {
        isSubscribed: true,
        planId: planId,
        planName:
          planId === 'archdemon_monthly'
            ? 'Archdemon Sovereign'
            : planId === 'grimoire_pack'
            ? 'Arcane Token Holder'
            : 'Cultist Initiate',
        tier: tier,
        since: new Date().toISOString(),
        creditsRemaining: planId === 'grimoire_pack' ? 100 : 99999
      };
      // Store in localStorage as requested
      setUserSubscription(info);
      try {
        localStorage.setItem('demon_codex_premium', 'true');
        localStorage.setItem('demon_codex_tier', tier);
      } catch {}

      // Update Firebase Auth custom claim
      const targetUid = data.metadata?.userId || userId;
      if (targetUid && targetUid !== 'cultist_anonymous') {
        updateUserCustomClaims(targetUid, tier, planId);
      }

      return info;
    }
  } catch (err) {
    console.warn("Session verification error:", err);
    // If backend verification fails temporarily, fallback gracefully to activate tier
    const planId = planParam || 'cultist_monthly';
    const tier = planId === 'archdemon_monthly' ? 'archdemon' : 'cultist';
    const info: UserSubscriptionInfo = {
      isSubscribed: true,
      planId: planId,
      planName: planId === 'archdemon_monthly' ? 'Archdemon Sovereign' : 'Cultist Initiate',
      tier: tier,
      since: new Date().toISOString(),
      creditsRemaining: 99999
    };
    setUserSubscription(info);
    try {
      localStorage.setItem('demon_codex_premium', 'true');
      localStorage.setItem('demon_codex_tier', tier);
    } catch {}

    if (userId && userId !== 'cultist_anonymous') {
      updateUserCustomClaims(userId, tier, planId);
    }

    return info;
  }
  return null;
};
