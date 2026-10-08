import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | null = null;

/**
 * Lazy initialization of Firebase Admin SDK for server-side operations.
 * Reads credentials securely from FIREBASE_SERVICE_ACCOUNT (JSON string)
 * or GOOGLE_APPLICATION_CREDENTIALS (file path).
 */
export function getFirebaseAdminApp(): App | null {
  if (adminApp) return adminApp;

  const apps = getApps();
  if (apps.length > 0 && apps[0]) {
    adminApp = apps[0];
    return adminApp;
  }

  try {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (rawServiceAccount) {
      const parsed = typeof rawServiceAccount === "string" 
        ? JSON.parse(rawServiceAccount) 
        : rawServiceAccount;

      adminApp = initializeApp({
        credential: cert(parsed),
        projectId: parsed.project_id || process.env.VITE_FIREBASE_PROJECT_ID,
      });
      return adminApp;
    }

    // Fallback: Default application credentials if running in GCP environment
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
      adminApp = initializeApp();
      return adminApp;
    }

    return null;
  } catch (err) {
    console.warn("Notice: Firebase Admin SDK initialization skipped (no valid credentials provided):", err);
    return null;
  }
}

/**
 * Get server-side Firestore instance with admin privileges.
 */
export function getAdminFirestore(): Firestore | null {
  const appInstance = getFirebaseAdminApp();
  if (!appInstance) return null;
  return getFirestore(appInstance);
}

/**
 * Get server-side Firebase Auth instance with admin privileges.
 */
export function getAdminAuth(): Auth | null {
  const appInstance = getFirebaseAdminApp();
  if (!appInstance) return null;
  return getAuth(appInstance);
}
