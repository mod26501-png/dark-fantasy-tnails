// Persistent IndexedDB & LocalStorage Hybrid Storage
// Solves browser 5MB localStorage limits for high-resolution AI generated images

export interface StoredRelic {
  id?: string;
  title: string;
  description: string;
  image: string;
  savedAt?: number;
}

const DB_NAME = 'demon_codex_local_db';
const DB_VERSION = 1;
const RELICS_STORE = 'relics';
const SESSIONS_STORE = 'sessions';

let dbPromise: Promise<IDBDatabase> | null = null;

function getIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(RELICS_STORE)) {
          db.createObjectStore(RELICS_STORE, { keyPath: 'title' });
        }
        if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
          db.createObjectStore(SESSIONS_STORE, { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

/**
 * Save relic to IndexedDB (unlimited local quota) and sync safe cache to localStorage
 */
export async function saveRelicIDB(relic: { title: string; description: string; image: string }): Promise<void> {
  if (!relic.title) return;
  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RELICS_STORE, 'readwrite');
      const store = tx.objectStore(RELICS_STORE);
      const item: StoredRelic = {
        title: relic.title,
        description: relic.description || '',
        image: relic.image,
        savedAt: Date.now(),
      };
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveRelicIDB fallback to localStorage:', err);
  }

  // Also sync to localStorage with safe quota management
  try {
    const storedStr = localStorage.getItem('relicCodex');
    const list: any[] = storedStr ? JSON.parse(storedStr) : [];
    const existsIndex = list.findIndex((r) => r.title === relic.title);
    if (existsIndex >= 0) {
      list[existsIndex] = relic;
    } else {
      list.unshift(relic);
    }
    // Keep top 20 in localStorage
    const trimmed = list.slice(0, 20);
    try {
      localStorage.setItem('relicCodex', JSON.stringify(trimmed));
    } catch {
      // If quota exceeded in localStorage, save without heavy base64 so title/desc persist
      const lightList = trimmed.map((item) => ({
        ...item,
        image: item.image.length > 50000 ? '' : item.image,
      }));
      localStorage.setItem('relicCodex', JSON.stringify(lightList));
    }
  } catch (e) {
    console.warn('LocalStorage sync warning:', e);
  }
}

/**
 * Fetch all saved relics from IndexedDB (or fallback to localStorage)
 */
export async function getAllRelicsIDB(): Promise<StoredRelic[]> {
  try {
    const db = await getIDB();
    const items = await new Promise<StoredRelic[]>((resolve, reject) => {
      const tx = db.transaction(RELICS_STORE, 'readonly');
      const store = tx.objectStore(RELICS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    if (items.length > 0) {
      // Sort newest first
      return items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    }
  } catch (err) {
    console.warn('IndexedDB getAllRelicsIDB fallback to localStorage:', err);
  }

  try {
    const stored = localStorage.getItem('relicCodex');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a relic from IndexedDB and localStorage
 */
export async function deleteRelicIDB(title: string): Promise<void> {
  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RELICS_STORE, 'readwrite');
      const store = tx.objectStore(RELICS_STORE);
      const req = store.delete(title);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }

  try {
    const stored = localStorage.getItem('relicCodex');
    if (stored) {
      const list = JSON.parse(stored);
      const updated = list.filter((r: any) => r.title !== title);
      localStorage.setItem('relicCodex', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('LocalStorage delete sync warning:', e);
  }
}

/**
 * Save session history in IndexedDB
 */
export async function saveSessionIDB(session: any): Promise<void> {
  try {
    const db = await getIDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.put({
        ...session,
        savedAt: Date.now(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveSession error:', err);
  }
}

/**
 * Get all sessions from IndexedDB
 */
export async function getAllSessionsIDB(): Promise<any[]> {
  try {
    const db = await getIDB();
    const items = await new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(SESSIONS_STORE, 'readonly');
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    if (items.length > 0) {
      return items.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    }
  } catch (err) {
    console.warn('IndexedDB getAllSessions fallback:', err);
  }

  try {
    const stored = localStorage.getItem('demon_codex_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
