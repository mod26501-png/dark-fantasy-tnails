/**
 * Google Drive Workspace Service
 * Handles OAuth 2.0 token acquisition via Google Identity Services (GSI)
 * and exports Relics, Grimoires, Videos, and Audio to Google Drive.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

const DRIVE_FOLDER_NAME = "The Demon Codex - Relic Archive";
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

import firebaseConfigFile from "../firebase-applet-config.json";
import { auth } from "./firebaseService";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
}

export const VITE_GOOGLE_CLIENT_ID =
  (firebaseConfigFile as any)?.oAuthClientId ||
  '227241308944-06hik6m1c3h995r49d1hure8adm0h0c9.apps.googleusercontent.com';
export const GOOGLE_CLIENT_ID = VITE_GOOGLE_CLIENT_ID;

/**
 * Acquire or refresh Google OAuth token using Firebase Auth or Google Identity Services (GSI)
 */
export const requestGoogleDriveToken = async (): Promise<string> => {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  // 1. First attempt: Firebase Authentication GoogleAuthProvider Popup (most reliable in web apps)
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      tokenExpiresAt = Date.now() + 3500 * 1000; // ~1 hour validity
      return cachedAccessToken;
    }
  } catch (firebaseErr: any) {
    console.warn("Firebase Auth Drive token acquisition failed or was cancelled, attempting GSI fallback:", firebaseErr);
    // If the user actively closed the popup or cancelled, rethrow
    if (firebaseErr?.code === "auth/popup-closed-by-user" || firebaseErr?.code === "auth/cancelled-popup-request") {
      throw new Error("Sign-in popup was closed before completing Drive authentication.");
    }
  }

  // 2. Second attempt: Google Identity Services (GSI) Token Client
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    (firebaseConfigFile as any)?.oAuthClientId ||
    VITE_GOOGLE_CLIENT_ID;

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      return reject(new Error("Google Identity Services is not loaded. Please try again in a few moments."));
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error || "Google Drive authentication was not completed."));
            return;
          }
          cachedAccessToken = response.access_token;
          tokenExpiresAt = Date.now() + 3500 * 1000;
          resolve(response.access_token);
        },
      });

      client.requestAccessToken();
    } catch (err: any) {
      reject(new Error(`Google Drive sign-in initialization failed: ${err?.message || String(err)}`));
    }
  });
};

/**
 * Get or create the dedicated app folder in the user's Google Drive
 */
export const getOrCreateCodexFolder = async (accessToken: string): Promise<string> => {
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${DRIVE_FOLDER_NAME}' and trashed=false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errData = await searchRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to search Google Drive folders (${searchRes.status})`);
  }

  const searchJson = await searchRes.json();
  if (searchJson.files && searchJson.files.length > 0) {
    return searchJson.files[0].id;
  }

  // Create folder
  const folderMetadata = {
    name: DRIVE_FOLDER_NAME,
    mimeType: "application/vnd.google-apps.folder",
  };

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(folderMetadata),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to create Google Drive folder (${createRes.status})`);
  }

  const createJson = await createRes.json();
  return createJson.id;
};

/**
 * Converts data URLs or remote URLs into a standard binary Blob
 */
export const urlToBlob = async (url: string, defaultMime = "image/png"): Promise<Blob> => {
  if (url.startsWith("data:")) {
    const parts = url.split(",");
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : defaultMime;
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  const res = await fetch(url);
  return await res.blob();
};

/**
 * Upload a binary asset (image, video, json) into Google Drive using multipart upload
 */
export const uploadFileToDrive = async (
  filename: string,
  blob: Blob,
  folderId?: string
): Promise<DriveUploadResult> => {
  const token = await requestGoogleDriveToken();
  const targetFolderId = folderId || (await getOrCreateCodexFolder(token));

  const metadata = {
    name: filename,
    parents: [targetFolderId],
  };

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
  const mediaHeaderPart = `${delimiter}Content-Type: ${blob.type || "application/octet-stream"}\r\n\r\n`;

  // Build multipart payload
  const metadataBlob = new Blob([metadataPart]);
  const mediaHeaderBlob = new Blob([mediaHeaderPart]);
  const closeBlob = new Blob([closeDelimiter]);

  const multipartBody = new Blob([metadataBlob, mediaHeaderBlob, blob, closeBlob], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Drive upload failed (${uploadRes.status})`);
  }

  return await uploadRes.json();
};

/**
 * Back up an entire Grimoire Series (all relic images + JSON codex) to Google Drive
 */
export const backupSeriesToDrive = async (
  seriesTitle: string,
  seriesData: any,
  onProgress?: (msg: string) => void
): Promise<{ folderId: string; uploadedCount: number; webViewFolderLink?: string }> => {
  const token = await requestGoogleDriveToken();
  onProgress?.("Locating/Creating Demon Codex archive in Google Drive...");
  const mainFolderId = await getOrCreateCodexFolder(token);

  // Create subfolder for this specific generation series
  const dateStr = new Date().toISOString().split("T")[0];
  const seriesFolderName = `${seriesTitle || "Relic Series"} [${dateStr}]`;

  const folderRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: seriesFolderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [mainFolderId],
    }),
  });

  if (!folderRes.ok) {
    throw new Error("Failed to create series subfolder in Google Drive");
  }

  const seriesFolder = await folderRes.json();
  const seriesFolderId = seriesFolder.id;
  let count = 0;

  // 1. Upload Banner Image
  if (seriesData.bannerImageUrl && !seriesData.bannerImageUrl.includes("svg+xml")) {
    try {
      onProgress?.("Archiving Series Banner to Google Drive...");
      const bannerBlob = await urlToBlob(seriesData.bannerImageUrl, "image/png");
      await uploadFileToDrive("00_Series_Banner.png", bannerBlob, seriesFolderId);
      count++;
    } catch (e) {
      console.warn("Could not archive banner:", e);
    }
  }

  // 2. Upload Relic Cards
  const cards = seriesData.cards || [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (card.imageUrl && !card.imageUrl.includes("svg+xml")) {
      try {
        const safeTitle = (card.title || `Relic_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, "_");
        onProgress?.(`Archiving Relic ${i + 1}/${cards.length}: ${card.title}...`);
        const cardBlob = await urlToBlob(card.imageUrl, "image/png");
        await uploadFileToDrive(`${String(i + 1).padStart(2, "0")}_${safeTitle}.png`, cardBlob, seriesFolderId);
        count++;
      } catch (e) {
        console.warn(`Could not archive card ${i}:`, e);
      }
    }
  }

  // 3. Upload Full Grimoire JSON & Lore Manifest
  onProgress?.("Writing Grimoire Manifest Codex JSON...");
  const manifestBlob = new Blob([JSON.stringify(seriesData, null, 2)], { type: "application/json" });
  await uploadFileToDrive("Codex_Grimoire_Manifest.json", manifestBlob, seriesFolderId);
  count++;

  return {
    folderId: seriesFolderId,
    uploadedCount: count,
    webViewFolderLink: seriesFolder.webViewLink || `https://drive.google.com/drive/folders/${seriesFolderId}`,
  };
};
