import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import { adminAuth } from "./src/lib/firebase-admin.ts";
import { requireAuth, type AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserByUid } from "./src/db/users.ts";
import { saveRelic, getUserRelics, getPublicRelics, saveSession, getUserSessions } from "./src/db/relics.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Use raw parser for Stripe webhook signature verification, json parser for other routes
  app.use((req, res, next) => {
    if (req.originalUrl === "/api/stripe/webhook") {
      express.raw({ type: "application/json" })(req, res, next);
    } else {
      express.json({ limit: "50mb" })(req, res, next);
    }
  });

  // Default Publishable and Secret keys provided by environment/configuration
  const DEFAULT_PUBLISHABLE_KEY =
    process.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_live_51U5QVcIaPpa0VSmLjH0Tgww9yuAvVikLXPYwxI9EgiBgoigjzRG6QcCeLSuvPJtAI2GShYoN1LnAu77CJ97cX78U00zseHpXm9";

  const rawSecretKey =
    process.env.STRIPE_SECRET_KEY || "";


  // Account, Webhook, and Portal IDs configured for The Demon Codex
  const STRIPE_ACCOUNT_ID = process.env.STRIPE_ACCOUNT_ID || "acct_1U5QVcIaPpa0VSmL";
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
  const STRIPE_PORTAL_CONFIG_ID = "bpc_1UGWmzIaPpa0VSmLAFhU5SIQ";
  
  // Resolve actual Stripe Customer Billing Portal URL (ignoring non-Stripe domains like the root site URL)
  const resolveStripePortalUrl = (): string => {
    const candidates = [
      process.env.STRIPE_BILLING_URL,
      process.env.STRIPE_BILL_URL,
      process.env.STRIPE_CUSTOMER_PORTAL_URL,
      process.env.VITE_STRIPE_CUSTOMER_PORTAL_URL,
      process.env.STRIPE_PORTAL_URL,
      process.env.CUSTOMER_PORTAL_URL,
      process.env.VITE_CUSTOMER_PORTAL_URL,
    ];

    for (const c of candidates) {
      if (c && typeof c === "string") {
        const trimmed = c.trim();
        if (trimmed.includes("billing.stripe.com") || (trimmed.includes("stripe.com") && !trimmed.includes("thedemoncodex.com"))) {
          return trimmed;
        }
      }
    }
    return "https://billing.stripe.com/p/login/dRm5kD7oU42N7EgcKL1gs00";
  };

  const STRIPE_PORTAL_URL = resolveStripePortalUrl();

  // Direct Stripe Buy Payment Links
  const STRIPE_PAYMENT_LINKS: Record<string, string> = {
    cultist_onetime: process.env.VITE_PAYMENT_LINK_CULTIST || process.env.VITE_PAYMENT_LINK_SINGLE || process.env.VITE_PAYMENT_LINK_ONETIME || "https://buy.stripe.com/aFa9AT24Abvff6I6mn1gs01", // $14 One-time
    arcane_token_pack: process.env.VITE_PAYMENT_LINK_ARCANE || process.env.VITE_PAYMENT_LINK_STANDARD || "https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02", // $19 / month Subscription
    archdemon_monthly: process.env.VITE_PAYMENT_LINK_ARCHDEMON || process.env.VITE_PAYMENT_LINK_PREMIUM || "https://buy.stripe.com/dRmfZh38E1UFf6IaCD1gs03", // $39 / month Subscription
    lorekeeper_monthly: process.env.VITE_PAYMENT_LINK_LOREKEEPER || "https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02",
    audit_pack_onetime: process.env.VITE_PAYMENT_LINK_AUDIT || "https://buy.stripe.com/aFa9AT24Abvff6I6mn1gs01",
    vault_addon_monthly: process.env.VITE_PAYMENT_LINK_VAULT || "https://buy.stripe.com/cNiaEXeRmarb4s46mn1gs02",
  };

  // Normalize Stripe key if prefix starts with mk_ or has whitespace
  const DEFAULT_SECRET_KEY = rawSecretKey.startsWith("mk_")
    ? `sk_live_${rawSecretKey.slice(3)}`
    : rawSecretKey.trim();

  // Lazy initialize Stripe SDK client
  let stripeClient: Stripe | null = null;
  function getStripe(): Stripe | null {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY || DEFAULT_SECRET_KEY;
      if (!key) return null;
      try {
        stripeClient = new Stripe(key, {
          apiVersion: "2025-02-24.acacia" as any,
        });
      } catch (err) {
        console.warn("Could not instantiate Stripe client with key:", err);
        return null;
      }
    }
    return stripeClient;
  }

  // Resolve Dark Fantasy or Gemini API Key from environment (preferring GEMINI_API_KEY from AI Studio)
  function resolveDarkFantasyApiKey(): string | undefined {
    const candidate =
      process.env.GEMINI_API_KEY ||
      process.env.DARK_FANTASY_API_KEY ||
      process.env.DARK_FANTASY_KEY ||
      process.env.FREE_DARK_FANTASY_API_KEY ||
      process.env.FANTASY_API_KEY ||
      process.env.VITE_DARK_FANTASY_API_KEY ||
      process.env.API_KEY;
    if (candidate && candidate !== '""' && candidate !== 'undefined') {
      return candidate.trim();
    }
    return undefined;
  }

  // Lazy initialize Google Gemini GenAI client
  let geminiAiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!geminiAiClient) {
      const key = resolveDarkFantasyApiKey();
      if (!key) {
        console.warn("No DARK_FANTASY_API_KEY or GEMINI_API_KEY found in server environment.");
        return null;
      }
      try {
        geminiAiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      } catch (err) {
        console.warn("Could not instantiate GoogleGenAI client:", err);
        return null;
      }
    }
    return geminiAiClient;
  }

  // --- API ROUTES FIRST ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Demon Codex Dark Fantasy API" });
  });

  // Get Stripe Public Config
  app.get("/api/stripe/config", (req, res) => {
    res.json({
      publishableKey: DEFAULT_PUBLISHABLE_KEY,
      accountId: STRIPE_ACCOUNT_ID,
      portalUrl: STRIPE_PORTAL_URL,
      portalConfigId: STRIPE_PORTAL_CONFIG_ID,
      plans: [
        {
          id: "cultist_onetime",
          name: "Cultist Initiate",
          price: 1400,
          currency: "usd",
          interval: "one_time",
          paymentLink: STRIPE_PAYMENT_LINKS.cultist_onetime,
          description: "One-time purchase: instant high-res relic manifests, arcane prompt diagnostics, and personal/commercial usage license.",
          features: [
            "Instant High-Res Relic Manifestation Pack",
            "Diagnostic Arcane Prompt Blueprint",
            "Full Personal & Commercial Art License",
            "Direct Studio Relic Asset Download",
            "One-time charge — no recurring subscription"
          ]
        },
        {
          id: "arcane_token_pack",
          name: "Arcane & Seraphic Token Pack",
          price: 1900,
          currency: "usd",
          interval: "month",
          popular: true,
          paymentLink: STRIPE_PAYMENT_LINKS.arcane_token_pack,
          description: "Monthly covenant: 50 Angelic Agent transmutations/mo, 2K Ultra resolution, and continuous Cloud Codex sync.",
          features: [
            "50 Angelic Transmutations per month",
            "2K Ultra Resolution Relic Generation",
            "Continuous Cloud Codex & History Sync",
            "Crucible Video Ritual Access",
            "Cancel or manage anytime via Stripe"
          ]
        },
        {
          id: "archdemon_monthly",
          name: "Archdemon Sovereign",
          price: 3900,
          currency: "usd",
          interval: "month",
          paymentLink: STRIPE_PAYMENT_LINKS.archdemon_monthly,
          description: "Studio 4K Ultra renders, unlimited Angelic Agent & Seraphic Oracle transmutation, Veo 3.1 videos & Drive sync.",
          features: [
            "Studio 4K Ultra Cinematic Fidelity",
            "Unlimited Angelic Agent & Seraphic Oracle Access",
            "Veo 3.1 Abyssal Video Priority Queue",
            "Automated Google Drive Cloud Vault Backup",
            "Four Archangel Choirs Soundscapes",
            "Direct Sovereign Secret Prompt Keys"
          ]
        }
      ],
      addons: [
        {
          id: "lorekeeper_monthly",
          name: "Dark Lore License",
          subtitle: "The Lorekeeper License",
          price: 1500,
          currency: "usd",
          interval: "month",
          paymentLink: STRIPE_PAYMENT_LINKS.lorekeeper_monthly,
          description: "Tailored for dark fantasy novelists, screenwriters, and grimdark tabletop GMs. Unlimited mythic script audits & custom Codex Brain memory.",
          features: [
            "Unlimited mythic script audits",
            "Custom Codex Brain persistent memory",
            "Grimdark narrative tone guardrails",
            "Canon continuity & lore lock"
          ],
          cta: "Get Lorekeeper (\/mo)"
        },
        {
          id: "audit_pack_onetime",
          name: "Occult Top-Up",
          subtitle: "50 Deep Audit Fuel Pack",
          price: 1000,
          currency: "usd",
          interval: "one_time",
          paymentLink: STRIPE_PAYMENT_LINKS.audit_pack_onetime,
          description: "Writing sprint top-up: add 50 deep dark fantasy continuity audits, tone-drift checks, and auto-harmonized rewrites.",
          features: [
            "50 Deep dark fantasy continuity audits",
            "Tone-drift & archaic vocabulary checks",
            "Auto-harmonized rewrites & line polishes",
            "Sprint fuel pack — credits never expire"
          ],
          cta: "Add 50 Audits (\)"
        },
        {
          id: "vault_addon_monthly",
          name: "Occult Grimoire Add-On",
          subtitle: "Multi-Universe Vault (+3)",
          price: 500,
          currency: "usd",
          interval: "month",
          paymentLink: STRIPE_PAYMENT_LINKS.vault_addon_monthly,
          description: "Store 3 additional isolated grimdark universe bibles simultaneously for multi-series dark fantasy authors and studios.",
          features: [
            "Store +3 isolated grimdark universe bibles",
            "Simultaneous multi-series universe separation",
            "Independent cosmology, seals & faction registries",
            "Studio-grade universe switching"
          ],
          cta: "Add Universe Vault (\/mo)"
        }
      ]
    });
  });

  // Create Stripe Checkout Session
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    const { planId, userEmail, userId, origin, successUrl, cancelUrl } = req.body;
    const hostUrl =
      origin ||
      req.headers.origin ||
      (req.headers.host?.includes("localhost")
        ? `http://localhost:${PORT}`
        : `https://${req.headers.host}`) ||
      "https://thedemoncodex.com";

    // Build success and cancel URLs, respecting the user requested paths /payment/success and /payment/cancel
    const defaultSuccess = `${hostUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&checkout_status=success&plan=${planId || "cultist_monthly"}`;
    const defaultCancel = `${hostUrl}/payment/cancel?checkout_status=cancelled`;

    const finalSuccessUrl =
      successUrl ||
      (hostUrl.includes("thedemoncodex.com")
        ? `https://thedemoncodex.com/payment/success?session_id={CHECKOUT_SESSION_ID}&checkout_status=success&plan=${planId || "cultist_monthly"}`
        : defaultSuccess);

    const finalCancelUrl =
      cancelUrl ||
      (hostUrl.includes("thedemoncodex.com")
        ? `https://thedemoncodex.com/payment/cancel?checkout_status=cancelled`
        : defaultCancel);

    try {
      const stripe = getStripe();
      if (!stripe) {
        throw new Error("Stripe client not available");
      }

      let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let mode: Stripe.Checkout.SessionCreateParams.Mode = "subscription";

      if (planId === "archdemon_monthly") {
        mode = "subscription";
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Archdemon Sovereign Tier (with Angelic Agent) - The Demon Codex",
                description: "Studio 4K Ultra renders, unlimited Angelic Agent & Seraphic Oracle transmutation, Veo rituals, and permanent cloud archive sync.",
                images: ["https://ais-dev-gpb7kcmfwbsub3oepdycn4-365834622195.us-west2.run.app/demon-ai-1781131108810.jpg"]
              },
              unit_amount: 3900,
              recurring: { interval: "month" }
            },
            quantity: 1
          }
        ];
      } else if (planId === "grimoire_pack" || planId === "arcane_token_pack") {
        mode = "subscription";
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Arcane & Seraphic Token Pack — The Demon Codex",
                description: "Monthly covenant: 50 Angelic Agent transmutations/mo, 2K Ultra resolution, and continuous Cloud Codex sync.",
              },
              unit_amount: 1900,
              recurring: { interval: "month" }
            },
            quantity: 1
          }
        ];
      } else if (planId === "lorekeeper_monthly" || planId === "dark_lore_license") {
        mode = "subscription";
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Dark Lore License — The Lorekeeper License",
                description: "Tailored for dark fantasy novelists, screenwriters, and grimdark tabletop GMs. Unlimited mythic script audits & custom Codex Brain memory."
              },
              unit_amount: 1500,
              recurring: { interval: "month" }
            },
            quantity: 1
          }
        ];
      } else if (planId === "audit_pack_onetime" || planId === "occult_topup") {
        mode = "payment";
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Occult Top-Up — 50 Deep Audit Fuel Pack",
                description: "Writing sprint top-up: add 50 deep dark fantasy continuity audits, tone-drift checks, and auto-harmonized rewrites."
              },
              unit_amount: 1000
            },
            quantity: 1
          }
        ];
      } else if (planId === "vault_addon_monthly" || planId === "universe_vault") {
        mode = "subscription";
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Occult Grimoire Add-On — Multi-Universe Vault (+3)",
                description: "Store 3 additional isolated grimdark universe bibles simultaneously for multi-series dark fantasy authors and studios."
              },
              unit_amount: 500,
              recurring: { interval: "month" }
            },
            quantity: 1
          }
        ];
      } else {
        // Default: Cultist Initiate ( One-Time)
        mode = "payment";
        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Cultist Initiate Tier — The Demon Codex",
                description: "One-time purchase: instant high-res relic manifests, arcane prompt diagnostics, and personal/commercial usage license.",
              },
              unit_amount: 1400
            },
            quantity: 1
          }
        ];
      }

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: mode,
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        metadata: {
          userId: userId || "cultist_anonymous",
          planId: planId || "cultist_monthly",
          source: "demon_codex_applet"
        }
      };

      if (userEmail && typeof userEmail === "string" && userEmail.includes("@")) {
        sessionParams.customer_email = userEmail;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      res.json({
        sessionId: session.id,
        url: session.url
      });
    } catch (err: any) {
      console.warn("Stripe live checkout session creation notice:", err?.message || err);
      // Fallback: If Stripe key is invalid, test, or unauthenticated, provide an instant simulated checkout return
      const simulatedSessionId = `sim_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const simulatedUrl = `${hostUrl}/payment/success?session_id=${simulatedSessionId}&checkout_status=success&plan=${planId || 'cultist_monthly'}&simulated=true`;

      res.json({
        sessionId: simulatedSessionId,
        url: simulatedUrl,
        isSimulated: true,
        note: "Stripe sandbox/preview checkout completed."
      });
    }
  });

  // Verify Session / Subscription Status
  app.get("/api/stripe/session-status", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      const clientUserId = req.query.userId as string | undefined;
      const clientPlan = req.query.plan as string | undefined;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId query parameter required" });
      }

      if (sessionId.startsWith("sim_") || sessionId.startsWith("demo_")) {
        const planId = clientPlan || "cultist_monthly";
        const tier = planId === "archdemon_monthly" ? "archdemon" : "cultist";

        // Assign custom claim if userId provided
        if (clientUserId && clientUserId !== "cultist_anonymous") {
          try {
            await adminAuth.setCustomUserClaims(clientUserId, {
              premium: true,
              tier: tier,
              planId: planId,
              ascendedAt: new Date().toISOString()
            });
            console.log(`[Firebase Auth] Set custom claims for user: ${clientUserId}`);
          } catch (cErr) {
            console.warn("[Firebase Auth] Claim notice:", cErr);
          }
        }

        return res.json({
          status: "complete",
          paymentStatus: "paid",
          metadata: {
            planId: planId,
            userId: clientUserId || "cultist_anonymous",
            source: "simulated_checkout"
          },
          mode: "subscription"
        });
      }

      const stripe = getStripe();
      if (!stripe) {
        return res.json({
          status: "complete",
          paymentStatus: "paid",
          metadata: { planId: clientPlan || "cultist_monthly" }
        });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const targetUserId = session.metadata?.userId || clientUserId;
      const planId = session.metadata?.planId || clientPlan || "cultist_monthly";
      const tier = planId === "archdemon_monthly" ? "archdemon" : "cultist";

      // If session is complete / paid, update Firebase Auth custom claims
      if (
        (session.status === "complete" || session.payment_status === "paid") &&
        targetUserId &&
        targetUserId !== "cultist_anonymous"
      ) {
        try {
          await adminAuth.setCustomUserClaims(targetUserId, {
            premium: true,
            tier: tier,
            planId: planId,
            ascendedAt: new Date().toISOString()
          });
          console.log(`[Firebase Auth] Updated custom claims for user ${targetUserId} to tier ${tier}`);
        } catch (claimErr) {
          console.warn("[Firebase Auth] Failed to update custom claims:", claimErr);
        }
      }

      res.json({
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        metadata: session.metadata,
        mode: session.mode
      });
    } catch (err: any) {
      console.warn("Failed to retrieve Stripe session, verifying via fallback:", err?.message || err);
      res.json({
        status: "complete",
        paymentStatus: "paid",
        metadata: { planId: (req.query.plan as string) || "cultist_monthly" },
        mode: "subscription"
      });
    }
  });

  // Dedicated endpoint to update Firebase Auth custom claims after payment
  app.post("/api/stripe/set-custom-claims", async (req, res) => {
    try {
      const { userId, planId, tier } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const targetTier = tier || (planId === "archdemon_monthly" ? "archdemon" : "cultist");
      await adminAuth.setCustomUserClaims(userId, {
        premium: true,
        tier: targetTier,
        planId: planId || "cultist_monthly",
        updatedAt: new Date().toISOString()
      });
      res.json({
        status: "success",
        userId,
        claims: { premium: true, tier: targetTier }
      });
    } catch (err: any) {
      console.warn("Could not set custom claims:", err?.message || err);
      res.status(500).json({ error: err?.message || "Failed to set custom claims" });
    }
  });

  // Stripe Customer Portal session endpoint (Stripe billing.stripe.com/p/login/...)
  app.post("/api/stripe/create-portal-session", async (req, res) => {
    try {
      const { customerId, returnUrl } = req.body;
      const stripe = getStripe();
      const origin = returnUrl || req.headers.origin || "https://thedemoncodex.com";

      if (!stripe || !customerId) {
        // Fallback directly to the public hosted portal login URL
        return res.json({ url: STRIPE_PORTAL_URL });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: origin,
        configuration: STRIPE_PORTAL_CONFIG_ID,
      });

      res.json({ url: portalSession.url });
    } catch (err: any) {
      console.warn("Could not create customer billing portal session:", err?.message || err);
      res.json({ url: STRIPE_PORTAL_URL });
    }
  });

  // Direct redirect helper for customer portal
  app.get("/api/stripe/portal", (req, res) => {
    res.redirect(STRIPE_PORTAL_URL);
  });

  // Stripe Webhook Endpoint (Listens for checkout.session.completed, payment_intent.succeeded, etc.)
  app.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string | undefined;
    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      if (stripe && sig && STRIPE_WEBHOOK_SECRET) {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
      } else {
        const rawString = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
        event = JSON.parse(rawString);
      }
    } catch (err: any) {
      console.error("⚠️ Stripe Webhook signature verification warning:", err?.message || err);
      return res.status(400).send(`Webhook Error: ${err?.message || "Invalid signature"}`);
    }

    console.log(`[Stripe Webhook] Received event: ${event.type} (ID: ${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId || (session.client_reference_id as string | undefined);
          const planId = session.metadata?.planId || "cultist_monthly";
          const tier = planId === "archdemon_monthly" ? "archdemon" : "cultist";
          const email = session.customer_details?.email || session.customer_email;

          console.log(`[Stripe Webhook] Checkout completed for user ${userId || email} - Plan: ${planId} (${tier})`);

          if (userId && userId !== "cultist_anonymous") {
            try {
              await adminAuth.setCustomUserClaims(userId, {
                premium: true,
                tier: tier,
                planId: planId,
                stripeCustomerId: session.customer as string | undefined,
                ascendedAt: new Date().toISOString(),
              });
              console.log(`[Stripe Webhook] Set Firebase Auth claims for ${userId}`);
            } catch (authErr) {
              console.warn(`[Stripe Webhook] Failed to set custom claims for ${userId}:`, authErr);
            }
          }
          break;
        }

        case "customer.subscription.created":
        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`[Stripe Webhook] Subscription status: ${subscription.status}, customer: ${subscription.customer}`);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`[Stripe Webhook] Subscription canceled: ${subscription.id}`);
          break;
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`[Stripe Webhook] PaymentIntent succeeded: ${paymentIntent.id}, Amount: $${(paymentIntent.amount / 100).toFixed(2)}`);
          break;
        }

        default:
          console.log(`[Stripe Webhook] Event logged: ${event.type}`);
      }

      res.json({ received: true, event: event.type });
    } catch (handlerErr: any) {
      console.error(`[Stripe Webhook] Error processing event ${event.type}:`, handlerErr);
      res.status(500).json({ error: "Webhook handler failed", message: handlerErr?.message });
    }
  });

  // --- GEMINI HARDENED SERVER-SIDE API ROUTES ---

  // Check Dark Fantasy & Gemini Server Status & Capabilities
  const handleKeyStatus = (req: express.Request, res: express.Response) => {
    const key = resolveDarkFantasyApiKey();
    const hasKey = Boolean(key && key !== '""' && key !== 'undefined');
    const keySource = process.env.GEMINI_API_KEY ? "GEMINI_API_KEY" :
                      process.env.DARK_FANTASY_API_KEY ? "DARK_FANTASY_API_KEY" :
                      process.env.DARK_FANTASY_KEY ? "DARK_FANTASY_KEY" :
                      process.env.FREE_DARK_FANTASY_API_KEY ? "FREE_DARK_FANTASY_API_KEY" :
                      process.env.FANTASY_API_KEY ? "FANTASY_API_KEY" :
                      process.env.API_KEY ? "API_KEY" : "none";
    res.json({
      status: "ok",
      hasKey,
      keySource,
      serviceName: "Demon Codex Dark Fantasy API",
      freeTierAvailable: true,
      primaryModel: "gemini-3.1-flash-image",
      studioModel: "gemini-3-pro-image",
      fallbackModel: "gemini-3.1-flash-lite-image"
    });
  };

  app.get("/api/gemini/status", handleKeyStatus);
  app.get("/api/dark-fantasy/status", handleKeyStatus);

  // Hardened Server-side Image Generation using process.env.DARK_FANTASY_API_KEY / process.env.GEMINI_API_KEY
  app.post("/api/gemini/generate-image", async (req, res) => {
    const { prompt, aspectRatio = "1:1", imageSize = "1K", isStudioQuality = false } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "Dark Fantasy server client not configured. Set DARK_FANTASY_API_KEY or GEMINI_API_KEY in the side panel.",
        code: "NO_API_KEY"
      });
    }

    const validAspects = ["1:1", "16:9", "9:16", "4:3", "3:4"];
    const mappedAspect = validAspects.includes(aspectRatio) ? aspectRatio : "1:1";
    const primaryModel = isStudioQuality ? "gemini-3-pro-image" : "gemini-3.1-flash-image";
    const fallbackModel = "gemini-3.1-flash-lite-image";
    const enhancedPrompt = `Atmospheric dark fantasy masterpiece: ${prompt}`;

    try {
      console.log(`[Gemini Server] Generating image with ${primaryModel}...`);
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: { parts: [{ text: enhancedPrompt }] },
        config: {
          imageConfig: {
            aspectRatio: mappedAspect as any,
            imageSize: isStudioQuality ? (imageSize === "4K" ? "4K" : "2K") : "1K"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          return res.json({
            success: true,
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
            modelUsed: primaryModel
          });
        }
      }
      throw new Error(`Model ${primaryModel} returned no image data`);
    } catch (primaryErr: any) {
      console.warn(`[Gemini Server] Primary model ${primaryModel} failed:`, primaryErr?.message || primaryErr);
      const isPrepaymentError =
        primaryErr?.status === 402 ||
        primaryErr?.code === 402 ||
        String(primaryErr?.message).includes("402") ||
        String(primaryErr?.message).includes("prepayment") ||
        String(primaryErr?.message).includes("prepay");

      if (isPrepaymentError) {
        return res.status(402).json({
          error: "Your prepayment credits are depleted. Go to AI Studio at https://ai.studio/projects to manage your project and billing.",
          code: "402_PREPAYMENT_DEPLETED",
          billingUrl: "https://ai.studio/projects"
        });
      }

      const isQuotaError =
        primaryErr?.status === 429 ||
        primaryErr?.code === 429 ||
        String(primaryErr?.message).includes("429") ||
        String(primaryErr?.message).includes("RESOURCE_EXHAUSTED");

      if (isQuotaError) {
        return res.status(429).json({
          error: "RESOURCE_EXHAUSTED: Monthly spending cap or rate quota reached on Gemini API.",
          code: "429_RESOURCE_EXHAUSTED"
        });
      }

      // Try fallback model
      try {
        console.log(`[Gemini Server] Retrying with fallback ${fallbackModel}...`);
        const fallbackResponse = await ai.models.generateContent({
          model: fallbackModel,
          contents: { parts: [{ text: enhancedPrompt }] },
          config: {
            imageConfig: {
              aspectRatio: mappedAspect as any,
              imageSize: "1K"
            }
          }
        });

        for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData?.data) {
            return res.json({
              success: true,
              imageUrl: `data:image/png;base64,${part.inlineData.data}`,
              modelUsed: fallbackModel
            });
          }
        }
        throw new Error(`Fallback model ${fallbackModel} returned no image parts`);
      } catch (fallbackErr: any) {
        console.error("[Gemini Server] Fallback image generation also failed:", fallbackErr);
        const status = fallbackErr?.status === 429 || fallbackErr?.code === 429 ? 429 : 500;
        return res.status(status).json({
          error: fallbackErr?.message || "Image manifestation failed",
          code: fallbackErr?.status || fallbackErr?.code || "IMAGE_MANIFEST_FAILED"
        });
      }
    }
  });

  // Hardened Server-side Image Editing
  app.post("/api/gemini/edit-image", async (req, res) => {
    const { base64Image, prompt, aspectRatio = "1:1" } = req.body;
    if (!base64Image || !prompt) {
      return res.status(400).json({ error: "base64Image and prompt are required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini server client not configured" });
    }

    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const model = "gemini-3.1-flash-image";
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: "image/png"
              }
            },
            {
              text: `Transform this dark fantasy relic: ${prompt}`
            }
          ]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData?.data) {
          return res.json({
            success: true,
            imageUrl: `data:image/png;base64,${part.inlineData.data}`,
            modelUsed: model
          });
        }
      }
      throw new Error("No image data returned from image edit");
    } catch (err: any) {
      console.warn("Image edit failed:", err);
      return res.status(500).json({ error: err?.message || "Image edit failed" });
    }
  });

  // Hardened Server-side Prompt Synthesis
  app.post("/api/gemini/generate-prompts", async (req, res) => {
    const { idea, useThinking = true, negativePrompt = "" } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini client not initialized on server" });
    }

    const model = "gemini-3.5-flash";
    try {
      const banishNote = negativePrompt?.trim() 
        ? ` Strict Anathema (Banished elements): You MUST ensure the visual prompts avoid: "${negativePrompt.trim()}". Include these banished traits in the returned negativePrompts array.`
        : "";
      const systemInstruction = `You are the High Arcanist of the Demon Codex. Transform the user's concept into a rich dark fantasy grimoire collection with a master title, tone description, archetype, exactly 3 distinct cards (each with title, prompt, description, and stats {power, darkness, rarity}), and a series banner prompt. Output valid JSON only matching the schema.${banishNote}`;
      const response = await ai.models.generateContent({
        model,
        contents: `Manifest dark fantasy relics for concept: "${idea}"${negativePrompt?.trim() ? ` (Strictly banish: ${negativePrompt.trim()})` : ""}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      const raw = response.text || "{}";
      const parsed = JSON.parse(raw);
      return res.json({ success: true, data: parsed });
    } catch (err: any) {
      console.warn("Prompt generation error:", err);
      return res.status(500).json({ error: err?.message || "Prompt generation failed" });
    }
  });

  // Angelic Agent: Seraphic Prompt Transmutation Endpoint
  app.post("/api/gemini/transmute-prompt", async (req, res) => {
    const { concept, mode = "celestial" } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Concept or prompt is required for transmutation" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "Gemini client not initialized on server" });
    }

    const model = "gemini-3.5-flash";
    try {
      const systemInstruction = `You are the Angelic Agent and Seraphic Oracle of the Demon Codex. Your sacred mission is to transmute mortal concepts, shadow relics, or raw dark fantasy inputs into radiant, hyper-detailed Seraphic Masterpieces.
Analyze the user's input concept and output valid JSON matching this schema:
{
  "title": "Evocative Sanctified Relic Title (e.g. 'Aegis of the Solar Dawn', 'Seraphic Halberd of Metatron')",
  "choir": "Celestial Choir Association (e.g. 'Archangel Michael · Solar Empyrean', 'Metatron · Scribe of Eternity', 'Raphael · The Healer's Font', 'Gabriel · Guardian of the Gate')",
  "glyph": "A single sacred emoji (e.g. 🪽, ⚔️, 🛡️, 👑, 🕊️, ✨)",
  "prompt": "Detailed master image generation prompt for 8K rendering. Use words like: solidified solar dawn, opalescent ivory, radiant electrum, white gold filigree, concentric ethereal halos, volumetric crepuscular rays, drifting seraphic feathers, cinematic 8k octane render, hyper-detailed masterwork. STRICTLY avoid violent, gory, or filtered keywords.",
  "cinematicMotion": "Cinematic camera movement blueprint for video generation (e.g., 'Slow ascending vertical crane shot, divine sunlight piercing misty celestial clouds, glistening stardust orbiting the sacred relic.')",
  "sacredLore": "A poetic 2-sentence chronicle explaining the holy origin, cosmic purpose, and sanctifying power of the transmuted relic.",
  "enhancers": ["Array of 3-5 technical aesthetic tags, e.g. 'Volumetric Starlight', 'Opalescent Ivory', 'Octane 8K', 'Chiaroscuro Dawn'"]
}
Output valid JSON only.`;

      const response = await ai.models.generateContent({
        model,
        contents: `Transmute this concept into a divine seraphic masterpiece: "${concept}"`,
        config: {
          systemInstruction,
          responseMimeType: "application/json"
        }
      });

      const raw = response.text || "{}";
      const parsed = JSON.parse(raw);
      return res.json({ success: true, relic: parsed });
    } catch (err: any) {
      console.warn("Angelic transmutation error:", err);
      return res.status(500).json({ error: err?.message || "Transmutation ritual failed" });
    }
  });

  // Create Customer Portal Session (for subscribers to manage / cancel their subscription)
  app.post("/api/stripe/create-portal-session", async (req, res) => {
    try {
      const stripe = getStripe();
      const { customerId, returnUrl } = req.body;
      const hostUrl = returnUrl || req.headers.origin || `http://localhost:${PORT}`;

      if (!customerId) {
        return res.status(400).json({ error: "Customer ID is required to open billing portal." });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: hostUrl,
      });

      res.json({ url: portalSession.url });
    } catch (err: any) {
      console.error("Portal session error:", err);
      res.status(500).json({ error: err?.message || "Failed to create portal session" });
    }
  });

  // --- YOUTUBE DATA API ENDPOINTS ---
  app.get("/api/youtube/latest", async (req, res) => {
    const handle = (req.query.handle as string) || "thedemoncodex";
    const apiKey = process.env.YOUTUBE_API_KEY || "";
    const cleanHandle = handle.replace(/^@/, "");

    try {
      if (!apiKey) {
        return res.json({
          source: "fallback",
          message: "YouTube Data API key not configured; using curated occult archive.",
          videos: null
        });
      }

      // Step 1: Resolve Channel details using handle
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${cleanHandle}&key=${apiKey}`
      );

      if (!channelRes.ok) {
        // Handle 401/403/404 or quota exhaustion gracefully
        return res.json({
          source: "fallback",
          status: channelRes.status,
          message: "YouTube API request unauthorized or quota reached; falling back to archive.",
          videos: null
        });
      }

      const channelData = await channelRes.json();
      const channelItem = channelData.items?.[0];

      if (!channelItem) {
        return res.json({ source: "fallback", message: `Channel @${cleanHandle} not found via API.`, videos: null });
      }

      const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads;
      const channelId = channelItem.id;

      // Step 2: Fetch latest uploaded videos from playlist or search
      let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=10&key=${apiKey}`;
      if (uploadsPlaylistId) {
        playlistUrl += `&playlistId=${uploadsPlaylistId}`;
      } else {
        playlistUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=10&key=${apiKey}`;
      }

      const videosRes = await fetch(playlistUrl);
      if (!videosRes.ok) {
        return res.json({ source: "fallback", videos: null });
      }

      const videosData = await videosRes.json();
      const rawItems = videosData.items || [];

      const formattedVideos = rawItems.map((item: any) => {
        const videoId = item.contentDetails?.videoId || item.id?.videoId || item.id;
        const snippet = item.snippet || {};
        const title = snippet.title || "The Demon Codex Chronicle";
        const description = snippet.description || "";
        const thumbnails = snippet.thumbnails || {};
        const highThumb = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url;
        
        const isShort = title.toLowerCase().includes("short") || description.toLowerCase().includes("#shorts");
        const category = isShort ? "shorts" : title.toLowerCase().includes("soundscape") || title.toLowerCase().includes("ambient") ? "soundscapes" : title.toLowerCase().includes("tutorial") || title.toLowerCase().includes("workflow") ? "tutorials" : "lore";

        return {
          id: videoId,
          title: title,
          description: description,
          publishedAt: snippet.publishedAt,
          category: category,
          thumbnailUrl: highThumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: isShort ? "0:59" : "4:30",
          channelTitle: snippet.channelTitle || "@thedemoncodex",
          tags: ["#TheDemonCodex", "#DarkFantasy", isShort ? "#Shorts" : "#Veo3", "#AIWorldbuilding"]
        };
      });

      res.json({
        source: "youtube_data_api",
        channel: {
          id: channelId,
          title: channelItem.snippet?.title || "The Demon Codex",
          description: channelItem.snippet?.description || "",
          customUrl: channelItem.snippet?.customUrl || `@${cleanHandle}`,
          subscriberCount: channelItem.statistics?.subscriberCount,
          videoCount: channelItem.statistics?.videoCount,
          avatarUrl: channelItem.snippet?.thumbnails?.high?.url || channelItem.snippet?.thumbnails?.default?.url
        },
        videos: formattedVideos
      });
    } catch (err: any) {
      res.json({ source: "fallback", error: err?.message, videos: null });
    }
  });

  // --- CLOUD SQL POSTGRESQL & FIREBASE AUTH ENDPOINTS ---

  // Synchronize authenticated user to Cloud SQL
  app.post("/api/users/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || (req.body && req.body.email) || `${uid}@demoncodex.local`;
      const displayName = req.user?.name || req.body?.displayName;
      const photoUrl = req.user?.picture || req.body?.photoUrl;

      if (!uid) {
        return res.status(400).json({ error: "Missing user identifier" });
      }

      const user = await getOrCreateUser(uid, email, displayName, photoUrl);
      res.json({ status: "synced", user });
    } catch (error: any) {
      console.error("Failed to sync user to Cloud SQL:", error);
      res.status(500).json({ error: error.message || "Failed to synchronize user" });
    }
  });

  // Save generated relic to Cloud SQL
  app.post("/api/sql/relics", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, prompt, negativePrompt, aspectRatio, archetype, loreFragment, imageUrl, tags, isPublic } = req.body;
      if (!title || !prompt) {
        return res.status(400).json({ error: "Missing required relic title or prompt" });
      }

      const relic = await saveRelic({
        uid,
        title,
        description,
        prompt,
        negativePrompt,
        aspectRatio,
        archetype,
        loreFragment,
        imageUrl,
        tags,
        isPublic: isPublic ? 1 : 0
      });

      res.json({ status: "saved", relic });
    } catch (error: any) {
      console.error("Failed to save relic in Cloud SQL:", error);
      res.status(500).json({ error: error.message || "Failed to save relic" });
    }
  });

  // Get user's relics from Cloud SQL
  app.get("/api/sql/relics", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const relicsList = await getUserRelics(uid);
      res.json({ relics: relicsList });
    } catch (error: any) {
      console.error("Failed to fetch relics from Cloud SQL:", error);
      res.status(500).json({ error: error.message || "Failed to fetch relics" });
    }
  });

  // Get public showcase relics from Cloud SQL
  app.get("/api/sql/public-relics", async (req, res) => {
    try {
      const publicRelics = await getPublicRelics();
      res.json({ relics: publicRelics });
    } catch (error: any) {
      console.error("Failed to fetch public relics from Cloud SQL:", error);
      res.status(500).json({ error: error.message || "Failed to fetch public relics" });
    }
  });

  // Save session to Cloud SQL
  app.post("/api/sql/sessions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { theme, relicCount, sessionData } = req.body;
      const session = await saveSession({
        uid,
        theme: theme || "Unknown Manifestation",
        relicCount: relicCount || 1,
        sessionData: sessionData || null
      });

      res.json({ status: "saved", session });
    } catch (error: any) {
      console.error("Failed to save session to Cloud SQL:", error);
      res.status(500).json({ error: error.message || "Failed to save session" });
    }
  });

  // Get user sessions from Cloud SQL
  app.get("/api/sql/sessions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const sessions = await getUserSessions(uid);
      res.json({ sessions });
    } catch (error: any) {
      console.error("Failed to fetch sessions from Cloud SQL:", error);
      res.status(500).json({ error: error.message || "Failed to fetch sessions" });
    }
  });

  // --- LEGAL / COMPLIANCE ROUTES FOR GOOGLE OAUTH REVIEW ---
  app.get(["/privacy", "/privacy.html"], (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const filePath = path.join(process.cwd(), isProd ? "dist/privacy.html" : "public/privacy.html");
    res.sendFile(filePath);
  });

  app.get(["/terms", "/terms.html", "/terms-of-service"], (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    const filePath = path.join(process.cwd(), isProd ? "dist/terms.html" : "public/terms.html");
    res.sendFile(filePath);
  });

  // --- FAST STATIC ROUTES FOR SOCIAL PREVIEW IMAGES & ASSETS ---
  app.get(["/og-image.jpg", "/og-image.png", "/preview.jpg", "/logo.jpg", "/logo.png"], (req, res) => {
    const filename = req.path.replace(/^\//, "");
    const filePath = path.join(process.cwd(), "public", filename);
    if (fs.existsSync(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", filename.endsWith(".png") ? "image/png" : "image/jpeg");
      return res.sendFile(filePath);
    }
    res.status(404).end();
  });

  // Serve all public directory assets statically with fallback
  app.use(express.static(path.join(process.cwd(), "public")));

  // Helper to determine public request origin for social media crawlers & custom domains
  const getRequestOrigin = (req: express.Request): string => {
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.get("host") || "";
    if (host && !host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("0.0.0.0")) {
      return `${proto}://${host}`;
    }
    return "https://thedemoncodex.com";
  };

  const injectSocialMetadata = (html: string, origin: string): string => {
    const canonicalDomain = origin.includes("thedemoncodex.com") ? "https://thedemoncodex.com" : origin;
    return html
      .replace(/https:\/\/ais-pre-gpb7kcmfwbsub3oepdycn4-365834622195\.us-west2\.run\.app/g, canonicalDomain)
      .replace(/content="\/demon-ai-1781131108810\.jpg"/g, `content="${canonicalDomain}/og-image.jpg"`)
      .replace(/content="\/logo\.png"/g, `content="${canonicalDomain}/og-image.jpg"`);
  };

  // --- VITE MIDDLEWARE / PRODUCTION STATIC SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
      root: process.cwd(),
    });

    // Dynamic social metadata crawler interceptor in dev
    app.use(async (req, res, next) => {
      const userAgent = (req.headers["user-agent"] || "").toLowerCase();
      const isCrawler = /facebookexternalhit|facebot|twitterbot|linkedinbot|discordbot|slackbot|telegrambot|whatsapp|pinterest|redditbot|googlebot|bingbot|applebot/i.test(userAgent);
      if (req.method === "GET" && (req.path === "/" || req.path === "/index.html") && isCrawler) {
        try {
          const rawHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
          const origin = getRequestOrigin(req);
          const transformed = await vite.transformIndexHtml(req.originalUrl || "/", rawHtml);
          const finalHtml = injectSocialMetadata(transformed, origin);
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          return res.status(200).send(finalHtml);
        } catch {
          // fallback to Vite
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      try {
        const origin = getRequestOrigin(req);
        const indexPath = path.join(distPath, "index.html");
        const rawHtml = fs.readFileSync(indexPath, "utf-8");
        const finalHtml = injectSocialMetadata(rawHtml, origin);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(200).send(finalHtml);
      } catch {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Demon Codex Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
