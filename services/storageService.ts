import type { GeneratedData } from '../types';
import { saveManifestationToFirestore, saveRelicToFirestore, removeRelicFromFirestore } from './firebaseService';
import { saveRelicIDB, deleteRelicIDB, saveSessionIDB, getAllRelicsIDB } from './idbStorage';

/**
 * Safely saves the new generation session to IndexedDB, local storage history and Cloud Firestore.
 */
export const saveToHistory = (data: GeneratedData, userIdea?: string): void => {
    // 1. IndexedDB persistent storage (no size quota limits)
    saveSessionIDB({ data, userIdea }).catch((err) => {
        console.warn("IndexedDB session save warning:", err);
    });

    // 2. Cloud Firestore Async Sync
    saveManifestationToFirestore(data, userIdea).catch((err) => {
        console.warn("Firestore manifestation sync:", err);
    });

    // 3. LocalStorage best-effort sync
    try {
        const historyStr = localStorage.getItem('demon_codex_history');
        const history: GeneratedData[] = historyStr ? JSON.parse(historyStr) : [];
        
        // Keep a maximum of 10 history records in local storage
        let newHistory = [data, ...history].slice(0, 10);
        
        let success = false;
        let attempts = 0;
        
        while (!success && attempts < 15) {
            try {
                localStorage.setItem('demon_codex_history', JSON.stringify(newHistory));
                success = true;
            } catch (err) {
                attempts++;
                if (newHistory.length > 1) {
                    newHistory.pop();
                } else if (newHistory.length === 1) {
                    const single = newHistory[0];
                    let stripped = false;
                    for (let i = single.cards.length - 1; i >= 0; i--) {
                        if (single.cards[i].imageUrl && !single.cards[i].imageUrl.startsWith('data:image/svg')) {
                            single.cards[i].imageUrl = '';
                            stripped = true;
                            break;
                        }
                    }
                    if (!stripped && single.bannerImageUrl && !single.bannerImageUrl.startsWith('data:image/svg')) {
                        single.bannerImageUrl = '';
                        stripped = true;
                    }
                    if (!stripped) break;
                } else {
                    break;
                }
            }
        }
    } catch (globalErr) {
        console.error('Critical failure saving history:', globalErr);
    }
};

/**
 * Safely saves a single relic to the persistent IndexedDB, Codex and Cloud Firestore.
 */
export const saveToCodex = (relic: { image: string; title: string; description: string }): boolean => {
    // 1. Local IndexedDB storage (instant, high-capacity, permanent)
    saveRelicIDB(relic).catch((err) => {
        console.warn("IndexedDB relic save warning:", err);
    });

    // 2. Cloud Firestore Sync
    saveRelicToFirestore(relic).catch((err) => {
        console.warn("Firestore relic save error:", err);
    });

    // 3. Synchronous LocalStorage backup
    try {
        const storedStr = localStorage.getItem('relicCodex');
        const stored = storedStr ? JSON.parse(storedStr) : [];
        
        const exists = stored.some((r: any) => r.title === relic.title);
        if (exists) return true;
        
        const updated = [relic, ...stored];
        
        try {
            localStorage.setItem('relicCodex', JSON.stringify(updated));
        } catch {
            // Compress or strip heavy base64 for localStorage cache so quota is never exceeded
            const safeList = updated.slice(0, 15).map((item) => ({
                ...item,
                image: item.image && item.image.length > 60000 ? '' : item.image,
            }));
            localStorage.setItem('relicCodex', JSON.stringify(safeList));
        }
        
        return true;
    } catch (globalErr) {
        console.error('Failure caching to localStorage:', globalErr);
        return true; // Still true because IndexedDB & Firestore received it
    }
};

/**
 * Safely removes a relic from the Codex, IndexedDB, and Cloud Firestore.
 */
export const removeFromCodex = (title: string): void => {
    // 1. Remove from IndexedDB
    deleteRelicIDB(title).catch((err) => {
        console.warn("IndexedDB delete error:", err);
    });

    // 2. Remove from Firestore
    removeRelicFromFirestore(title).catch((err) => {
        console.warn("Firestore relic removal error:", err);
    });

    // 3. Remove from localStorage
    try {
        const storedStr = localStorage.getItem('relicCodex');
        if (!storedStr) return;
        const stored = JSON.parse(storedStr);
        const updated = stored.filter((r: any) => r.title !== title);
        localStorage.setItem('relicCodex', JSON.stringify(updated));
    } catch (err) {
        console.error('Failed to remove from Codex:', err);
    }
};

/**
 * Safely overwrites the entire Codex list (e.g. during a purge action).
 */
export const setCodexList = (relics: any[]): void => {
    try {
        localStorage.setItem('relicCodex', JSON.stringify(relics));
    } catch (err) {
        console.error('Failed to save Codex list:', err);
    }
};
