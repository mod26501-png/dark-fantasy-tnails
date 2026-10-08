/**
 * Stripe Front-end Wrapper (src/stripe.ts)
 * Provides client-side helpers to initialize Stripe checkout,
 * redirect to Stripe payment portal, and manage subscription persistence.
 */

import {
  startStripeCheckout,
  verifyCheckoutSession,
  getUserSubscription,
  setUserSubscription,
  fetchStripePlans,
  updateUserCustomClaims,
  type StripePlan,
  type UserSubscriptionInfo
} from '../services/stripeService';

export {
  fetchStripePlans,
  getUserSubscription,
  setUserSubscription,
  updateUserCustomClaims,
  type StripePlan,
  type UserSubscriptionInfo
};

/**
 * Creates a Stripe Checkout session and redirects the user to the Stripe Checkout page.
 * @param planId The identifier of the chosen tier (e.g. 'cultist_monthly', 'archdemon_monthly', 'grimoire_pack')
 * @param userEmail Optional email of the signed-in user
 * @param userId Optional Firebase Auth UID of the user
 * @param successUrl Optional custom success URL (defaults to /payment/success)
 * @param cancelUrl Optional custom cancel URL (defaults to /payment/cancel)
 */
export async function createCheckoutSession(
  planId: string = 'cultist_monthly',
  userEmail?: string,
  userId?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<{ url: string }> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
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
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Stripe session creation failed with status ${res.status}`);
    }

    const data = await res.json();
    if (data.url) {
      return { url: data.url };
    }
    throw new Error('No checkout URL returned from Stripe session.');
  } catch (error: any) {
    console.warn('createCheckoutSession error, falling back to client service:', error);
    const checkoutUrl = await startStripeCheckout(planId, userEmail, userId, successUrl, cancelUrl);
    return { url: checkoutUrl };
  }
}

/**
 * Initiates the checkout redirect directly.
 */
export async function redirectToCheckout(
  planId: string = 'cultist_monthly',
  userEmail?: string,
  userId?: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<void> {
  const { url } = await createCheckoutSession(planId, userEmail, userId, successUrl, cancelUrl);
  if (url && typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Verify checkout completion after redirect back to app
 */
export async function handleCheckoutReturn(
  sessionId: string,
  planParam?: string,
  userId?: string
): Promise<UserSubscriptionInfo | null> {
  return await verifyCheckoutSession(sessionId, planParam, userId);
}

/**
 * Check if the active user holds premium privileges
 */
export function isPremiumUser(): boolean {
  const sub = getUserSubscription();
  return sub.isSubscribed && (sub.tier === 'cultist' || sub.tier === 'archdemon');
}
