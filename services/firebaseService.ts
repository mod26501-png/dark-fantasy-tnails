import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from "firebase/app-check";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  getDocFromServer,
  updateDoc,
  increment
} from "firebase/firestore";
import firebaseConfigFile from "../firebase-applet-config.json";
import type { GeneratedData, DarkSeals, DarkSealType } from "../types";
import { getTodayRitualDateKey } from "./dailyRitualService";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || (firebaseConfigFile as any)?.apiKey || 'AIzaSyBXnMwhVJAYy21TOQ26Es2485sr8H3qMsA',
  // Explicitly point to the default Firebase project handler for OAuth popups and redirects.
  // Never point authDomain to the custom domain (thedemoncodex.com) or Cloud Run / .ai.studio URL,
  // because Cloud Run does not host the /__/auth/handler iframe required for Firebase OAuth.
  authDomain: "gen-lang-client-0064975005.firebaseapp.com",
  projectId: "gen-lang-client-0064975005",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || (firebaseConfigFile as any)?.storageBucket || 'gen-lang-client-0064975005.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || (firebaseConfigFile as any)?.messagingSenderId || '227241308944',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || (firebaseConfigFile as any)?.appId || '1:227241308944:web:3f8d9abb51be5426692b95',
  firestoreDatabaseId: import.meta.env.VITE_FIRESTORE_DATABASE_ID || import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (firebaseConfigFile as any)?.firestoreDatabaseId || 'ai-studio-demoncodexdarkfa-a22713ae-9899-4eb9-b831-880b3a832015'
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase App Check with ReCaptchaV3Provider and debug mode support
let appCheck: AppCheck | null = null;
const rawSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const isUuid = (val: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(val);

if (typeof window !== "undefined") {
  const trimmedKey = typeof rawSiteKey === 'string' ? rawSiteKey.trim() : '';
  
  // If a UUID was supplied, it is a Firebase App Check debug token, not a reCAPTCHA site key
  if (trimmedKey && isUuid(trimmedKey)) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = trimmedKey;
    if (import.meta.env.DEV || import.meta.env.MODE === "development") {
      console.info("Firebase App Check: Registered debug token from environment.");
    }
  } else if (trimmedKey && (import.meta.env.DEV || import.meta.env.MODE === "development")) {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Only initialize ReCaptchaV3Provider if a valid, non-UUID reCAPTCHA v3 key is supplied (typically ~40 chars starting with 6L/6P without hyphens)
  const isValidRecaptchaKey = Boolean(
    trimmedKey &&
    trimmedKey.length >= 25 &&
    !isUuid(trimmedKey) &&
    !trimmedKey.includes('-') &&
    !trimmedKey.startsWith('AIza')
  );

  if (isValidRecaptchaKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(trimmedKey),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn("Firebase App Check initialization skipped/failed:", err);
    }
  }
}

export { appCheck };
export const auth = getAuth(app);

// Use specified custom Firestore Database ID if present
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate initial connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: client is currently offline or connecting.");
    }
  }
}
if (typeof window !== "undefined") {
  testConnection().catch(() => {});
}

let currentUser: User | null = null;
let cachedUserId: string | null = null;
let authInitializedPromise: Promise<User | null> | null = null;

// Check for redirect result on boot if page was redirected during Google Sign-In
if (typeof window !== "undefined") {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        currentUser = result.user;
        cachedUserId = result.user.uid;
        console.log("Firebase Google Auth redirect successful for:", result.user.email);
      }
    })
    .catch((err) => {
      console.warn("Firebase redirect auth result handled:", err?.message || err);
    });
}

/**
 * Sign in with Google using Firebase Authentication Popup with Redirect fallback
 */
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    cachedUserId = result.user.uid;
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google Sign-In error:", error?.code, error?.message, error);

    // Annotate error with iframe context for downstream UI handling
    if (isInIframe) {
      error.isInIframe = true;
    }

    // If popup was blocked or denied inside an ordinary window, try signInWithRedirect as graceful fallback
    if (!isInIframe && (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request')) {
      try {
        console.info("Popup blocked/cancelled in top-level window, attempting redirect auth fallback...");
        await signInWithRedirect(auth, provider);
        return new Promise(() => {}); // Wait for browser redirect
      } catch (redirectErr) {
        console.error("Redirect fallback error:", redirectErr);
        throw error;
      }
    }

    throw error;
  }
};

/**
 * Sign out current authenticated user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    currentUser = null;
    cachedUserId = null;
  } catch (error: any) {
    console.error("Firebase Sign-Out error:", error);
    throw error;
  }
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const onUserAuthStateChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
      cachedUserId = user.uid;
    }
    callback(user);
  });
};

/**
 * Attempt Firebase authentication without crashing if anonymous sign-in is disabled in project settings
 */
export const ensureAuthenticated = async (): Promise<User | null> => {
  if (currentUser) return currentUser;

  if (!authInitializedPromise) {
    authInitializedPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUser = user;
          cachedUserId = user.uid;
          unsubscribe();
          resolve(user);
        } else {
          try {
            const userCred = await signInAnonymously(auth);
            currentUser = userCred.user;
            cachedUserId = userCred.user.uid;
            unsubscribe();
            resolve(userCred.user);
          } catch (err: any) {
            // When anonymous sign-in is disabled, resolve gracefully without throwing unhandled error
            unsubscribe();
            resolve(null);
          }
        }
      });
    });
  }

  return authInitializedPromise;
};

/**
 * Returns a stable, persistent user ID (Firebase Auth UID when active, or persistent local UUID)
 */
export const getEffectiveUserId = async (): Promise<string> => {
  if (auth.currentUser?.uid) {
    currentUser = auth.currentUser;
    cachedUserId = auth.currentUser.uid;
    return auth.currentUser.uid;
  }
  if (currentUser?.uid) return currentUser.uid;

  try {
    const authUser = await ensureAuthenticated();
    if (authUser?.uid) {
      currentUser = authUser;
      cachedUserId = authUser.uid;
      return authUser.uid;
    }
  } catch {
    // Proceed to persistent device ID
  }

  if (cachedUserId) return cachedUserId;

  let localUid = localStorage.getItem('demon_codex_device_uid');
  if (!localUid) {
    localUid = 'cultist_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substring(0, 16) : Math.random().toString(36).substring(2, 12));
    localStorage.setItem('demon_codex_device_uid', localUid);
  }
  cachedUserId = localUid;
  return localUid;
};

// Start initial auth check silently
ensureAuthenticated().catch(() => {});

export interface FirestoreRelicItem {
  id?: string;
  image: string;
  title: string;
  description: string;
  savedAt?: any;
}

/**
 * Compresses/resizes a base64 or large image to ensure it stays well below Firestore's 1MB document limit.
 * Converts large base64 PNGs (~1-2MB) into lightweight high-quality JPEGs (~40-90KB).
 */
export const compressImageForFirestore = async (
  imageUrl: string,
  maxWidth = 800,
  quality = 0.82
): Promise<string> => {
  if (!imageUrl) return "";

  // If it's already a tiny string or SVG, return as is
  if (imageUrl.startsWith("data:image/svg") || imageUrl.length < 50000) {
    return imageUrl;
  }

  // If it's an external web URL (http/https), return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If in non-browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return imageUrl.length > 700000 ? imageUrl.slice(0, 700000) : imageUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(imageUrl.length > 700000 ? imageUrl.slice(0, 700000) : imageUrl);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch (canvasErr) {
          console.warn("Canvas compression failed, falling back:", canvasErr);
          resolve(imageUrl.length > 700000 ? imageUrl.slice(0, 700000) : imageUrl);
        }
      };

      img.onerror = () => {
        resolve(imageUrl);
      };

      img.src = imageUrl;
    } catch {
      resolve(imageUrl);
    }
  });
};

/**
 * Save a generated grimoire manifestation to Cloud Firestore (in user sessions, and optionally in public gallery)
 */
export const saveManifestationToFirestore = async (
  data: GeneratedData, 
  userIdea?: string,
  publishToPublic = true,
  ritualTheme?: string
): Promise<string> => {
  try {
    const userId = await getEffectiveUserId();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Compress banner image and all card images to guarantee total document payload fits safely under 1MB
    const compressedBanner = data.bannerImageUrl
      ? await compressImageForFirestore(data.bannerImageUrl, 900, 0.78)
      : "";

    const compressedCards = await Promise.all(
      (data.cards || []).map(async (c) => ({
        title: c.title || "",
        glyph: c.glyph || "✙",
        prompt: c.prompt || "",
        caption: c.caption || c.description || "",
        description: c.description || c.caption || "",
        tags: Array.isArray(c.tags) ? c.tags : [],
        imageUrl: c.imageUrl ? await compressImageForFirestore(c.imageUrl, 700, 0.75) : "",
        stats: (c as any).stats || { power: 80, darkness: 85, rarity: 90 },
      }))
    );

    const sessionDoc = {
      userId,
      mainTitle: data.mainTitle || "The Demon Codex",
      archetype: data.archetype || "Unknown Relic",
      tone: data.tone || "Atmospheric Dark Fantasy",
      userIdea: userIdea || "",
      bannerImageUrl: compressedBanner,
      cards: compressedCards,
      darkSeals: data.darkSeals || { blood: 0, void: 0, spark: 0, soul: 0 },
      ritualTheme: ritualTheme || data.ritualTheme || "",
      ritualDate: data.ritualDate || (ritualTheme ? getTodayRitualDateKey() : ""),
      createdAt: serverTimestamp(),
    };

    // 1. Save in user's private sessions
    const userSessionRef = doc(db, "users", userId, "sessions", sessionId);
    await setDoc(userSessionRef, sessionDoc);

    // 2. Save in public community abyssal gallery if permitted
    if (publishToPublic) {
      const publicGalleryRef = doc(db, "public_gallery", sessionId);
      await setDoc(publicGalleryRef, sessionDoc);
    }

    return sessionId;
  } catch (err) {
    console.error("Failed to save manifestation to Firestore:", err);
    throw err;
  }
};

/**
 * Explicitly publish a relic series to the public community gallery in Cloud Firestore
 */
export const publishSessionToPublicGallery = async (data: GeneratedData, ritualTheme?: string): Promise<string> => {
  try {
    const userId = await getEffectiveUserId();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const compressedBanner = data.bannerImageUrl
      ? await compressImageForFirestore(data.bannerImageUrl, 900, 0.78)
      : "";

    const compressedCards = await Promise.all(
      (data.cards || []).map(async (c) => ({
        title: c.title || "",
        glyph: c.glyph || "✙",
        prompt: c.prompt || "",
        caption: c.caption || c.description || "",
        description: c.description || c.caption || "",
        tags: Array.isArray(c.tags) ? c.tags : [],
        imageUrl: c.imageUrl ? await compressImageForFirestore(c.imageUrl, 700, 0.75) : "",
        stats: (c as any).stats || { power: 80, darkness: 85, rarity: 90 },
      }))
    );

    const sessionDoc = {
      userId,
      mainTitle: data.mainTitle || "The Demon Codex",
      archetype: data.archetype || "Relic Series",
      tone: data.tone || "Atmospheric Dark Fantasy",
      userIdea: (data as any).userIdea || "",
      bannerImageUrl: compressedBanner,
      cards: compressedCards,
      createdAt: serverTimestamp(),
    };

    const publicGalleryRef = doc(db, "public_gallery", sessionId);
    await setDoc(publicGalleryRef, sessionDoc);
    return sessionId;
  } catch (err) {
    console.error("Failed to publish session to public gallery:", err);
    throw err;
  }
};

/**
 * Fetch generation history from Cloud Firestore
 */
export const fetchUserHistoryFromFirestore = async (): Promise<GeneratedData[]> => {
  try {
    const userId = await getEffectiveUserId();
    const sessionsRef = collection(db, "users", userId, "sessions");
    const q = query(sessionsRef, orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      const rawSeals = d.darkSeals || {};
      const darkSeals: DarkSeals = {
        blood: typeof rawSeals.blood === 'number' ? rawSeals.blood : 0,
        void: typeof rawSeals.void === 'number' ? rawSeals.void : 0,
        spark: typeof rawSeals.spark === 'number' ? rawSeals.spark : 0,
        soul: typeof rawSeals.soul === 'number' ? rawSeals.soul : 0,
      };

      return {
        id: docSnap.id,
        mainTitle: d.mainTitle || "The Demon Codex",
        archetype: d.archetype || "Relic Series",
        tone: d.tone || "Dark Fantasy",
        use: d.use || "",
        bannerImageUrl: d.bannerImageUrl || "",
        cards: (d.cards || []).map((c: any) => ({
          glyph: c.glyph || "✙",
          title: c.title || "",
          prompt: c.prompt || "",
          caption: c.caption || c.description || "",
          tags: Array.isArray(c.tags) ? c.tags : [],
          imageUrl: c.imageUrl || "",
          diagnostic: c.diagnostic,
        })),
        negativePrompts: d.negativePrompts || [],
        remixSuggestions: d.remixSuggestions || [],
        darkSeals,
        ritualTheme: d.ritualTheme || "",
        ritualDate: d.ritualDate || "",
      } as GeneratedData;
    });
  } catch (err) {
    console.warn("Could not fetch Firestore history, falling back to local:", err);
    return [];
  }
};

/**
 * Fetch public community abyssal gallery manifests
 */
export const fetchPublicGalleryFromFirestore = async (): Promise<GeneratedData[]> => {
  try {
    const galleryRef = collection(db, "public_gallery");
    const q = query(galleryRef, orderBy("createdAt", "desc"), limit(30));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        mainTitle: d.mainTitle || "The Demon Codex",
        archetype: d.archetype || "Relic Series",
        tone: d.tone || "Dark Fantasy",
        use: d.use || "",
        bannerImageUrl: d.bannerImageUrl || "",
        cards: (d.cards || []).map((c: any) => ({
          glyph: c.glyph || "✙",
          title: c.title || "",
          prompt: c.prompt || "",
          caption: c.caption || c.description || "",
          tags: Array.isArray(c.tags) ? c.tags : [],
          imageUrl: c.imageUrl || "",
          diagnostic: c.diagnostic,
        })),
        negativePrompts: d.negativePrompts || [],
        remixSuggestions: d.remixSuggestions || [],
      } as GeneratedData;
    });
  } catch (err) {
    console.warn("Could not fetch public gallery from Firestore:", err);
    return [];
  }
};

/**
 * Save an individual relic to the user's permanent Cloud Firestore Codex
 */
export const saveRelicToFirestore = async (relic: { image: string; title: string; description: string }): Promise<void> => {
  try {
    const userId = await getEffectiveUserId();
    const rawId = (relic.title || "").replace(/[^a-zA-Z0-9_-]/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
    const relicId = rawId ? rawId.substring(0, 64) : `relic_${Date.now()}`;
    const relicRef = doc(db, "users", userId, "relics", relicId);

    // Compress image if necessary to prevent Firestore document 1MB limit error
    const compressedImage = await compressImageForFirestore(relic.image, 800, 0.82);

    await setDoc(relicRef, {
      userId,
      title: relic.title || "Untitled Relic",
      description: relic.description || "",
      image: compressedImage,
      savedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to save relic to Firestore:", err);
    throw err;
  }
};

/**
 * Remove an individual relic from Cloud Firestore Codex
 */
export const removeRelicFromFirestore = async (title: string): Promise<void> => {
  try {
    const userId = await getEffectiveUserId();
    const rawId = (title || "").replace(/[^a-zA-Z0-9_-]/g, "_").replace(/^_+|_+$/g, "").toLowerCase();
    const relicId = rawId ? rawId.substring(0, 64) : "relic";
    const relicRef = doc(db, "users", userId, "relics", relicId);
    await deleteDoc(relicRef);
  } catch (err) {
    console.error("Failed to remove relic from Firestore:", err);
  }
};

/**
 * Subscribe to real-time updates of the user's saved Codex in Firestore
 */
export const subscribeToUserCodex = (callback: (relics: FirestoreRelicItem[]) => void) => {
  let unsubscribeSnapshot: (() => void) | null = null;

  getEffectiveUserId().then((userId) => {
    const relicsRef = collection(db, "users", userId, "relics");
    const q = query(relicsRef, orderBy("savedAt", "desc"));

    unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: d.title,
            description: d.description,
            image: d.image,
            savedAt: d.savedAt,
          } as FirestoreRelicItem;
        });
        callback(items);
      },
      (err) => {
        console.warn("Firestore codex real-time subscription error:", err);
      }
    );
  }).catch((err) => {
    console.warn("Could not resolve user ID for real-time codex subscription:", err);
  });

  return () => {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
  };
};

/**
 * Bestow an Occult Dark Seal (Blood Offering, Void Gaze, Arcane Spark, Soul Bound) on a public gallery relic.
 * Atomically increments tally in Firestore with resilient offline localStorage fallback.
 */
export const bestowDarkSeal = async (
  relicId: string, 
  sealType: DarkSealType
): Promise<{ success: boolean }> => {
  if (!relicId) return { success: false };

  const storageKey = `demon_codex_seal_${relicId}_${sealType}`;
  localStorage.setItem(storageKey, 'true');

  try {
    const relicRef = doc(db, "public_gallery", relicId);
    await updateDoc(relicRef, {
      [`darkSeals.${sealType}`]: increment(1)
    });
    return { success: true };
  } catch (err) {
    try {
      const relicRef = doc(db, "public_gallery", relicId);
      await setDoc(relicRef, {
        darkSeals: {
          [sealType]: increment(1)
        }
      }, { merge: true });
      return { success: true };
    } catch (fallbackErr) {
      console.warn("Could not persist Dark Seal to Firestore, saved locally:", fallbackErr);
      return { success: true };
    }
  }
};

/**
 * Checks whether the current user on this device has already bestowed a given Dark Seal on a relic.
 */
export const hasUserBestowedSeal = (relicId: string, sealType: DarkSealType): boolean => {
  if (!relicId) return false;
  try {
    return localStorage.getItem(`demon_codex_seal_${relicId}_${sealType}`) === 'true';
  } catch {
    return false;
  }
};
