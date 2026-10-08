/// <reference types="vite/client" />

interface Window {
  aistudio?: {
    hasSelectedApiKey?: () => boolean;
    openSelectKey?: () => Promise<void>;
  };
  FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY?: string;
}

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIRESTORE_DATABASE_ID?: string;
  readonly VITE_FIREBASE_FIRESTORE_DATABASE_ID?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_PAYMENT_LINK_LOREKEEPER?: string;
  readonly VITE_PAYMENT_LINK_AUDIT_TOPUP?: string;
  readonly VITE_PAYMENT_LINK_UNIVERSE_VAULT?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly DEV: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
