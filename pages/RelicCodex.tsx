import React, { useState, useEffect } from "react";
import { FileJson } from "lucide-react";
import { setCodexList, removeFromCodex } from "../services/storageService";
import { uploadFileToDrive, urlToBlob, getOrCreateCodexFolder, requestGoogleDriveToken } from "../services/driveService";
import { subscribeToUserCodex } from "../services/firebaseService";
import { getAllRelicsIDB, saveRelicIDB } from "../services/idbStorage";
import { playBladeClang } from "../src/utils/soundEffects";
import { HoloFoilCard } from '../components/HoloFoilCard';

interface RelicItem {
  id?: string;
  image: string;
  title: string;
  description: string;
}

interface RelicCodexProps {
  onBack?: () => void;
}

export default function RelicCodex({ onBack }: RelicCodexProps) {
  const [relics, setRelics] = useState<RelicItem[]>([]);
  const [isExportingToDrive, setIsExportingToDrive] = useState(false);
  const [driveExportStatus, setDriveExportStatus] = useState<string | null>(null);
  const [driveFolderLink, setDriveFolderLink] = useState<string | null>(null);
  const [isLiveSync, setIsLiveSync] = useState(false);

  useEffect(() => {
    // 1. Load initial storage: check IndexedDB first, then localStorage
    getAllRelicsIDB().then((idbRelics) => {
      if (idbRelics && idbRelics.length > 0) {
        setRelics(idbRelics);
      } else {
        try {
          const stored = JSON.parse(localStorage.getItem("relicCodex") || "[]");
          if (stored.length > 0) setRelics(stored);
        } catch {
          // ignore
        }
      }
    });

    // 2. Subscribe to real-time Cloud Firestore updates
    const unsubscribe = subscribeToUserCodex((cloudRelics) => {
      if (cloudRelics && cloudRelics.length > 0) {
        setRelics(cloudRelics);
        setIsLiveSync(true);
        // Save to IndexedDB for offline persistence
        cloudRelics.forEach((r) => {
          saveRelicIDB(r).catch(() => {});
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handlePurgeRelic = (indexToRemove: number) => {
    const target = relics[indexToRemove];
    if (target) {
      removeFromCodex(target.title);
    }
    const updated = relics.filter((_, idx) => idx !== indexToRemove);
    setCodexList(updated);
    setRelics(updated);
  };

  const handleExportAllToDrive = async () => {
    if (relics.length === 0 || isExportingToDrive) return;
    setIsExportingToDrive(true);
    setDriveExportStatus("Connecting to Google Drive...");
    try {
      const token = await requestGoogleDriveToken();
      setDriveExportStatus("Preparing Google Drive folder...");
      const mainFolderId = await getOrCreateCodexFolder(token);

      // Create "Saved Codex Relics" folder
      const dateStr = new Date().toISOString().split("T")[0];
      const folderRes = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Demon Codex - Saved Relics [${dateStr}]`,
          mimeType: "application/vnd.google-apps.folder",
          parents: [mainFolderId],
        }),
      });

      if (!folderRes.ok) throw new Error("Failed to create archive folder in Google Drive");
      const folderJson = await folderRes.json();
      const folderId = folderJson.id;

      let count = 0;
      for (let i = 0; i < relics.length; i++) {
        const item = relics[i];
        if (item.image && !item.image.includes("svg+xml")) {
          try {
            setDriveExportStatus(`Archiving relic ${i + 1}/${relics.length}: ${item.title}...`);
            const blob = await urlToBlob(item.image, "image/png");
            const safeName = (item.title || `relic_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, "_");
            await uploadFileToDrive(`${String(i + 1).padStart(2, "0")}_${safeName}.png`, blob, folderId);
            count++;
          } catch (err) {
            console.warn(`Failed to upload ${item.title}:`, err);
          }
        }
      }

      // Upload JSON manifest
      setDriveExportStatus("Archiving Codex Manifest JSON...");
      const manifestBlob = new Blob([JSON.stringify(relics, null, 2)], { type: "application/json" });
      await uploadFileToDrive("Codex_Relics_Manifest.json", manifestBlob, folderId);
      count++;

      setDriveExportStatus(`✓ Successfully backed up ${count} items to Google Drive!`);
      if (folderJson.webViewLink) {
        setDriveFolderLink(folderJson.webViewLink);
      }
    } catch (err: any) {
      console.error("Codex Drive export error:", err);
      setDriveExportStatus(`Drive export interrupted: ${err?.message || String(err)}`);
    } finally {
      setIsExportingToDrive(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 text-white animate-fade-in pb-12 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 pt-4 sm:pt-6 gap-6">
        <div className="flex flex-col gap-2">
          <div className="codex-title-wrapper !items-start !justify-start !m-0 !mt-6 sm:!mt-8 !mb-3 !w-auto">
            <h1 className="codex-title text-4xl sm:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-3" data-text="THE RELIC CODEX">
              THE RELIC CODEX
              <span className="rune">✦</span>
              <span className="rune">✙</span>
              <span className="rune">✦</span>
              <span className="rune">✙</span>
              <span className="blood-drop" style={{ '--drop-left': '12%', '--drop-duration': '3.2s' } as React.CSSProperties}></span>
              <span className="blood-drop" style={{ '--drop-left': '28%', '--drop-duration': '4.5s' } as React.CSSProperties}></span>
              <span className="blood-drop" style={{ '--drop-left': '48%', '--drop-duration': '2.8s' } as React.CSSProperties}></span>
              <span className="blood-drop" style={{ '--drop-left': '64%', '--drop-duration': '5.1s' } as React.CSSProperties}></span>
              <span className="blood-drop" style={{ '--drop-left': '80%', '--drop-duration': '3.7s' } as React.CSSProperties}></span>
              <span className="blood-drop" style={{ '--drop-left': '94%', '--drop-duration': '4.2s' } as React.CSSProperties}></span>
            </h1>
          </div>
          <p className="lightning-text text-sm uppercase italic opacity-80 tracking-widest mt-1">
            An individual repository of your personal manifested constructs.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {relics.length > 0 && (
            <button
              onClick={handleExportAllToDrive}
              disabled={isExportingToDrive}
              className="bg-[#14171f] hover:bg-[#1f2533] text-[#00d2ff] hover:text-white px-5 py-3 rounded-xl text-xs font-black transition-all border border-[#00d2ff]/30 shadow-lg flex items-center gap-2 hover-blood disabled:opacity-50"
            >
              <span className="text-sm">▲</span>
              <span>{isExportingToDrive ? 'SAVING TO DRIVE...' : 'EXPORT CODEX TO DRIVE'}</span>
            </button>
          )}

          {onBack && (
            <button 
              onClick={onBack}
              className="bg-[#111318] border border-[#242830] px-6 py-3 rounded-xl text-xs font-black text-[#e8e6e3] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all hover-blood"
            >
              RETURN TO FORGE
            </button>
          )}
        </div>
      </div>

      {driveExportStatus && (
        <div className="mb-8 p-4 rounded-xl bg-[#0f141e] border border-[#00d2ff]/40 shadow-xl flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#00d2ff] text-base">▲</span>
            <span className="text-[#d8f4ff] font-medium">{driveExportStatus}</span>
          </div>
          <div className="flex items-center gap-3">
            {driveFolderLink && (
              <a 
                href={driveFolderLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#00d2ff]/20 border border-[#00d2ff]/60 text-[#00d2ff] hover:bg-[#00d2ff] hover:text-black rounded-lg text-xs font-bold transition-all"
              >
                Open Drive Folder ↗
              </a>
            )}
            <button 
              onClick={() => { setDriveExportStatus(null); setDriveFolderLink(null); }}
              className="text-[#70757e] hover:text-white text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {(relics || []).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(relics || []).map((relic, index) => (
            <HoloFoilCard key={index} tier={index % 3 === 0 ? 'abyssal-gold' : index % 2 === 0 ? 'blood-foil' : 'void-cosmic'} rarity={92} showBadge={true} className="h-full">
            <div
              key={index}
              className="bg-black/40 border border-red-900/40 rounded-xl p-4 shadow-lg hover:shadow-red-700/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                  <img
                    src={relic.image || undefined}
                    alt={relic.title}
                    className="w-full h-full object-cover shadow-lg group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#8d1a1a] px-2 py-0.5 rounded text-[9px] font-black text-white uppercase shadow-lg border border-white/10">Saved</span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-[#e8e6e3] tracking-tight">{relic.title}</h2>
                <p className="text-sm opacity-80 text-[#9aa0a6] leading-relaxed mb-4">{relic.description}</p>
              </div>
              
              <div className="border-t border-[#242830]/40 pt-4 mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={async () => {
                      try {
                        const blob = await urlToBlob(relic.image, "image/png");
                        const safeName = (relic.title || `relic_${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, "_");
                        const res = await uploadFileToDrive(`${safeName}.png`, blob);
                        alert(`✓ Uploaded "${relic.title}" to Google Drive!`);
                      } catch (e: any) {
                        alert(`Upload failed: ${e?.message || String(e)}`);
                      }
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#00d2ff] bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 rounded-lg transition-all flex items-center gap-1"
                  >
                    ▲ DRIVE
                  </button>

                  <button
                    id={`codex-export-json-${index}`}
                    onClick={() => {
                      try {
                        playBladeClang();
                        const exportPayload = {
                          title: relic.title,
                          lore: relic.description,
                          description: relic.description,
                          imageUrl: relic.image,
                          exportedAt: new Date().toISOString(),
                          source: "Demon Codex: Grimoire Archive"
                        };
                        const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        const safeName = (relic.title || `relic_${index + 1}`)
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/gi, "_")
                          .replace(/_+/g, "_") || "relic";
                        link.href = url;
                        link.download = `${safeName}_codex_lore.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error("Export failed", err);
                      }
                    }}
                    title="Export lore and relic details as downloadable JSON"
                    className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#e8e6e3] hover:text-[#00d2ff] bg-[#14171f] hover:bg-[#1b202c] border border-[#242830] hover:border-[#00d2ff]/40 rounded-lg transition-all flex items-center gap-1 hover-blood"
                  >
                    <FileJson className="w-3.5 h-3.5 text-[#00d2ff]" />
                    <span>JSON</span>
                  </button>
                </div>

                <button 
                  onClick={() => handlePurgeRelic(index)}
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#ff4d4d]/70 hover:text-[#ff4d4d] bg-red-950/20 border border-red-950/40 hover:border-red-900 rounded-lg transition-all"
                >
                  ☠ PURGE
                </button>
              </div>
              </div>
            </HoloFoilCard>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-[#242830] rounded-2xl bg-[#111318]/20">
          <div className="w-16 h-16 rounded-full border border-[#242830] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#70757e] font-black text-xl">✦</span>
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">The Codex is Empty</h3>
          <p className="text-sm text-[#70757e] max-w-md mx-auto mb-6">
            You have not stored any custom creations in your personal grimoire yet. Use the Forge to manifest a series, and click "Save to Codex" on your favorite relics.
          </p>
          {onBack && (
            <button 
              onClick={onBack}
              className="px-6 py-2 bg-[#8d1a1a] hover:bg-[#ff0000] text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_#8d1a1a]"
            >
              Begin Forging
            </button>
          )}
        </div>
      )}
    </div>
  );
}
