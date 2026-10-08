
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, FileJson, Check } from 'lucide-react';
import { analyzeLore, generateRelicVideo, generateSoundscape, generateImageWithDiagnostics, FAILED_IMAGE_PLACEHOLDER } from '../services/geminiService';
import { saveToCodex, removeFromCodex } from '../services/storageService';
import { backupSeriesToDrive, uploadFileToDrive, urlToBlob } from '../services/driveService';
import { ImageDiagnosticOverlay } from './ImageDiagnosticOverlay';
import { playBladeClang, playRuneHum } from '../src/utils/soundEffects';
import type { GeneratedData, PromptCard as PromptCardType } from '../types';

const playPCM = async (base64Audio: string) => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const binary = atob(base64Audio.split(',')[1] || base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const dataInt16 = new Int16Array(bytes.buffer);
        const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
    } catch (err) {
        console.error("Audio playback failure:", err);
    }
};

const Card: React.FC<{ 
  card: PromptCardType; 
  archetype: string; 
  onImageClick: (src: string) => void;
  onCardUpdate?: (updatedCard: PromptCardType) => void;
}> = ({ card, archetype, onImageClick, onCardUpdate }) => {
  const [currentCard, setCurrentCard] = useState<PromptCardType>(card);
  const [imgLoadError, setImgLoadError] = useState(false);
  const [isRetryingImage, setIsRetryingImage] = useState(false);

  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lore, setLore] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
  const [showVideoConfig, setShowVideoConfig] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentCard(card);
    setImgLoadError(false);
  }, [card]);

  const hasFailedImage = 
    imgLoadError || 
    !currentCard.imageUrl || 
    currentCard.imageUrl === FAILED_IMAGE_PLACEHOLDER || 
    currentCard.diagnostic?.hasError === true;

  const handleRetryCardImage = async (customPrompt?: string) => {
    setIsRetryingImage(true);
    try {
      const promptToUse = customPrompt || currentCard.prompt;
      const res = await generateImageWithDiagnostics(
        `${currentCard.title}, ${promptToUse.replace(/\n/g, ', ')}, atmospheric dark fantasy, gothic aesthetic, vivid colors, sharp focus`,
        '16:9',
        '1K'
      );
      
      const updated: PromptCardType = {
        ...currentCard,
        prompt: customPrompt || currentCard.prompt,
        imageUrl: res.imageUrl,
        diagnostic: res.diagnostic
      };
      
      setCurrentCard(updated);
      setImgLoadError(res.diagnostic?.hasError || res.imageUrl === FAILED_IMAGE_PLACEHOLDER);
      onCardUpdate?.(updated);
    } catch (err: any) {
      console.error("Retry card manifestation failed:", err);
      const fallbackDiag = {
        hasError: true,
        rawError: err?.message || String(err),
        statusCode: err?.status || "RETRY_EXCEPTION",
        modelName: "gemini-3.1-flash-image",
        promptAttempted: customPrompt || currentCard.prompt,
        timestamp: new Date().toLocaleTimeString()
      };
      const updated: PromptCardType = {
        ...currentCard,
        imageUrl: FAILED_IMAGE_PLACEHOLDER,
        diagnostic: fallbackDiag
      };
      setCurrentCard(updated);
      setImgLoadError(true);
      onCardUpdate?.(updated);
    } finally {
      setIsRetryingImage(false);
    }
  };

  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState(false);
  const [driveLink, setDriveLink] = useState<string | null>(null);

  const handleUploadSingleToDrive = async () => {
    if (isUploadingToDrive || hasFailedImage) return;
    setIsUploadingToDrive(true);
    try {
      const blob = await urlToBlob(currentCard.imageUrl, 'image/png');
      const safeName = (currentCard.title || 'relic').replace(/[^a-zA-Z0-9_-]/g, '_');
      const result = await uploadFileToDrive(`${safeName}.png`, blob);
      setDriveUploadSuccess(true);
      if (result.webViewLink) setDriveLink(result.webViewLink);
      setTimeout(() => setDriveUploadSuccess(false), 5000);
    } catch (err: any) {
      console.error("Single card drive upload failed:", err);
      alert(`Google Drive Upload Failed: ${err?.message || String(err)}`);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("relicCodex") || "[]");
      return stored.some((r: any) => r.title === card.title);
    } catch {
      return false;
    }
  });

  const handleSaveToCodex = () => {
    if (isSaved) {
      removeFromCodex(currentCard.title);
      setIsSaved(false);
    } else {
      const success = saveToCodex({
        image: currentCard.imageUrl,
        title: currentCard.title,
        description: currentCard.caption
      });
      if (success) {
        setIsSaved(true);
      } else {
        alert("Your device's local storage is completely full. To make room for more relics, please try deleting some older ones.");
      }
    }
  };

  const handleCopy = async () => {
    try {
        playBladeClang();
        await navigator.clipboard.writeText(currentCard.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    } catch (err) {
        console.error("Failed to copy", err);
    }
  };

  const [isExported, setIsExported] = useState(false);

  const handleExportJson = () => {
    try {
      playBladeClang();
      const exportPayload = {
        title: currentCard.title,
        glyph: currentCard.glyph || "⚔",
        archetype: archetype,
        caption: currentCard.caption,
        lore: lore || currentCard.caption,
        revealedLore: lore || null,
        prompt: currentCard.prompt,
        tags: currentCard.tags || [],
        imageUrl: currentCard.imageUrl,
        exportedAt: new Date().toISOString(),
        source: "Demon Codex: Dark Fantasy Relic Forge"
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = (currentCard.title || 'relic')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '') || 'relic';
      link.href = url;
      link.download = `${safeTitle}_lore_prompt.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExported(true);
      setTimeout(() => setIsExported(false), 2000);
    } catch (err) {
      console.error("Failed to export relic JSON:", err);
    }
  };

  const handleLore = async () => {
    if (isAnalyzing || lore) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeLore(currentCard.title, currentCard.caption);
      setLore(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnimate = async () => {
    if (isAnimating || videoUrl || hasFailedImage) return;
    setIsAnimating(true);
    setShowVideoConfig(false);
    setVideoError(null);
    try {
      const url = await generateRelicVideo(currentCard.imageUrl, currentCard.title, videoDuration, videoRatio);
      setVideoUrl(url);
    } catch (err: any) {
      console.error("Video ritual failed", err);
      const msg = err?.message || String(err);
      if (msg === 'API_KEY_RESET_REQUIRED' || msg.includes('API_KEY')) {
        setVideoError("API Key required. Please configure your key in Settings > Secrets.");
      } else {
        setVideoError(msg || "Video manifestation failed.");
      }
    } finally {
      setIsAnimating(false);
    }
  };

  const handleSound = async () => {
    if (isGeneratingAudio) return;
    setIsGeneratingAudio(true);
    try {
      const base64 = await generateSoundscape(`A dark fantasy relic named ${currentCard.title}. ${currentCard.caption}`);
      await playPCM(base64);
    } catch (err) {
      console.error("Sound ritual failed", err);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => playRuneHum()}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card bg-[#111318] border border-[#242830] rounded-xl overflow-hidden flex flex-col group/card transition-all hover:border-[#00d2ff]/40 shadow-xl hover:shadow-[0_0_30px_rgba(0,210,255,0.1)]"
    >
      <div className={`thumb bg-[#0f1116] border-b border-[#242830] relative overflow-hidden ${videoRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
        {videoUrl ? (
          <video 
            src={videoUrl || undefined} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover border-2 border-[#8d1a1a]/50"
          />
        ) : hasFailedImage ? (
          <ImageDiagnosticOverlay 
            diagnostic={currentCard.diagnostic}
            assetTitle={currentCard.title}
            originalPrompt={currentCard.prompt}
            onRetry={handleRetryCardImage}
            isRetrying={isRetryingImage}
          />
        ) : (
          <img 
            src={currentCard.imageUrl || undefined} 
            alt={currentCard.title} 
            onError={() => setImgLoadError(true)}
            className={`w-full h-full object-cover block cursor-pointer transition-transform duration-700 group-hover/card:scale-105 ${isAnimating ? 'opacity-40 grayscale blur-sm' : ''}`} 
            onClick={() => !isAnimating && onImageClick(currentCard.imageUrl)} 
          />
        )}
        
        {isAnimating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <div className="w-10 h-10 border-4 border-[#ff0000] border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Veo 3.1 Ritual: {videoDuration}s</span>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 z-10">
           <span className="bg-[#00d2ff] px-2 py-0.5 rounded text-[9px] font-black text-black uppercase shadow-lg border border-white/20">Vivid Flash</span>
           {videoUrl && <span className="bg-[#8d1a1a] px-2 py-0.5 rounded text-[9px] font-black text-white uppercase shadow-lg border border-white/20 animate-pulse">Animated</span>}
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-[#e8e6e3] tracking-tight">{currentCard.title}</h3>
            <div className="relative">
                <button 
                    onClick={() => videoUrl ? null : setShowVideoConfig(!showVideoConfig)}
                    disabled={isAnimating || videoUrl !== null || hasFailedImage}
                    className={`text-[10px] font-bold tracking-tighter uppercase px-2 py-1 rounded border transition-all ${videoUrl ? 'bg-[#8d1a1a] border-[#8d1a1a] text-white' : 'bg-[#1b1f27] border-[#8d1a1a]/40 text-[#ff4d4d] hover:bg-[#8d1a1a]/20 hover:shadow-[0_0_10px_#8d1a1a] disabled:opacity-40'}`}
                >
                    {isAnimating ? 'Manifesting...' : videoUrl ? 'High Priest Ritual' : '✧ Animate'}
                </button>
                
                <AnimatePresence>
                    {showVideoConfig && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 z-[70] bg-[#1a1c23] border border-[#8d1a1a] p-3 rounded-lg shadow-2xl w-48 no-print"
                        >
                            <p className="text-[8px] font-black text-[#8d1a1a] uppercase mb-2 tracking-widest">Ritual Settings</p>
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-1 bg-black/40 p-1 rounded border border-[#242830]">
                                    {[5, 10].map(d => (
                                        <button 
                                            key={d} 
                                            onClick={() => setVideoDuration(d as 5|10)}
                                            className={`flex-1 text-[9px] font-bold py-1 rounded transition-colors ${videoDuration === d ? 'bg-[#8d1a1a] text-white' : 'text-[#70757e]'}`}
                                        >
                                            {d}s
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-1 bg-black/40 p-1 rounded border border-[#242830]">
                                    {['16:9', '9:16'].map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => setVideoRatio(r as '16:9'|'9:16')}
                                            className={`flex-1 text-[9px] font-bold py-1 rounded transition-colors ${videoRatio === r ? 'bg-[#8d1a1a] text-white' : 'text-[#70757e]'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleAnimate}
                                    className="w-full py-2 bg-[#8d1a1a] text-white text-[10px] font-black rounded hover:bg-[#ff0000] transition-all uppercase"
                                >
                                    Begin Manifestation
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
        
        {videoError && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 bg-[#1f0d0d] border border-[#8d1a1a]/60 rounded-lg flex items-start justify-between gap-2 text-xs text-[#ff9999]"
            >
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#ff4d4d] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{videoError}</span>
                </div>
                <button 
                    onClick={() => setVideoError(null)}
                    className="text-[#ff4d4d] hover:text-white text-xs font-bold px-1"
                >
                    ✕
                </button>
            </motion.div>
        )}

        {lore && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-black/40 border-l-2 border-[#00d2ff] rounded text-xs italic text-[#b3f2ff] leading-relaxed overflow-hidden"
            >
                {lore}
            </motion.div>
        )}

        <div className="meta flex gap-2 flex-wrap">
          <span className="chip bg-[#1b1f27] border border-[#242830] rounded-full px-3 py-1 text-[10px] font-bold text-[#70757e] uppercase">{archetype}</span>
          {(currentCard.tags || []).map(tag => <span key={tag} className="chip bg-[#1b1f27]/50 border border-[#242830] rounded-full px-3 py-1 text-[10px] font-bold text-[#00d2ff] uppercase">#{tag}</span>)}
        </div>
        
        <div className="actions flex gap-2 flex-wrap mt-2 no-print">
          <button onClick={handleLore} className="btn flex-1 bg-transparent border border-[#242830] text-[#e8e6e3] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#242830] transition-colors">
            {isAnalyzing ? 'Decoding...' : lore ? 'Lore Bound' : 'Reveal Lore'}
          </button>
          <button onClick={handleSound} className="btn bg-transparent border border-[#242830] text-[#70757e] p-2 rounded-lg hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all">
            {isGeneratingAudio ? '...' : '🔊'}
          </button>
          <button onClick={handleCopy} className="btn flex-[1.5] bg-gradient-to-r from-[#008cff] to-[#00d2ff] text-black px-4 py-2 rounded-lg text-xs font-black hover:opacity-90 transition-opacity">
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>

        <div className="flex gap-2 mt-2 no-print">
          <button 
            id={`codex-btn-${(currentCard.title || 'relic').replace(/\s+/g, '-').toLowerCase()}`}
            onClick={handleSaveToCodex} 
            disabled={hasFailedImage}
            className={`flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border disabled:opacity-40 ${
              isSaved 
                ? 'bg-[#8d1a1a]/20 border-[#8d1a1a] text-[#ff4d4d] hover:bg-[#8d1a1a]/40 shadow-[0_0_15px_rgba(141,26,26,0.3)]' 
                : 'bg-transparent border-[#242830] text-[#e8e6e3] hover:text-[#ff4d4d] hover:border-[#ff4d4d]/50 hover-blood'
            }`}
          >
            <span>{isSaved ? '✙ IN CODEX' : '✙ CODEX'}</span>
          </button>

          <button
            id={`drive-btn-${(currentCard.title || 'relic').replace(/\s+/g, '-').toLowerCase()}`}
            onClick={handleUploadSingleToDrive}
            disabled={hasFailedImage || isUploadingToDrive}
            title="Upload this relic image to Google Drive"
            className="flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-[#242830] bg-[#14171f] hover:bg-[#1b202c] hover:border-[#00d2ff]/50 text-[#e8e6e3] hover:text-[#00d2ff] disabled:opacity-40 shadow-sm"
          >
            {isUploadingToDrive ? (
              <span className="animate-pulse text-[10px]">SYNCING...</span>
            ) : driveUploadSuccess ? (
              <span className="text-[#00d2ff] text-[10px]">✓ IN DRIVE</span>
            ) : (
              <span>▲ DRIVE</span>
            )}
          </button>

          <button
            id={`export-json-btn-${(currentCard.title || 'relic').replace(/\s+/g, '-').toLowerCase()}`}
            onClick={handleExportJson}
            title="Export relic lore and prompt details as downloadable JSON file"
            className="flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-[#242830] bg-[#14171f] hover:bg-[#1b202c] hover:border-[#00d2ff]/50 text-[#e8e6e3] hover:text-[#00d2ff] shadow-sm hover-blood"
          >
            {isExported ? (
              <span className="text-[#00d2ff] text-[10px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#00d2ff]" />
                SAVED
              </span>
            ) : (
              <>
                <FileJson className="w-3.5 h-3.5 text-[#00d2ff]" />
                <span>JSON</span>
              </>
            )}
          </button>
        </div>

        {driveLink && (
          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#00d2ff] hover:underline text-center block mt-1"
          >
            View in Google Drive ↗
          </a>
        )}
      </div>
    </motion.article>
  );
};

const Lightbox: React.FC<{ src: string, onClose: () => void }> = ({ src, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center z-[100] p-4" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-6xl w-full"
      >
          <img src={src || undefined} alt="Relic focus" className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,210,255,0.2)] border border-white/10" />
          <button className="absolute -top-12 right-0 text-white font-black text-sm tracking-widest hover:text-[#00d2ff] transition-colors">CLOSE [X]</button>
      </motion.div>
    </motion.div>
  );
};

export const PromptCardSet: React.FC<{ data: GeneratedData, onStartOver: () => void, onOpenGallery: () => void }> = ({ data, onStartOver, onOpenGallery }) => {
    const [tagFilter, setTagFilter] = useState('');
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [cardsList, setCardsList] = useState<PromptCardType[]>(data.cards);

    const [bannerUrl, setBannerUrl] = useState(data.bannerImageUrl);
    const [bannerDiagnostic, setBannerDiagnostic] = useState(data.bannerDiagnostic);
    const [bannerLoadError, setBannerLoadError] = useState(false);
    const [isRetryingBanner, setIsRetryingBanner] = useState(false);

    useEffect(() => {
        setCardsList(data.cards);
        setBannerUrl(data.bannerImageUrl);
        setBannerDiagnostic(data.bannerDiagnostic);
        setBannerLoadError(false);
    }, [data]);

    const hasBannerError = 
      bannerLoadError || 
      !bannerUrl || 
      bannerUrl === FAILED_IMAGE_PLACEHOLDER || 
      bannerDiagnostic?.hasError === true;

    const [isBackingUpDrive, setIsBackingUpDrive] = useState(false);
    const [driveBackupStatus, setDriveBackupStatus] = useState<string | null>(null);
    const [driveFolderLink, setDriveFolderLink] = useState<string | null>(null);

    const handleBackupSeriesToDrive = async () => {
        if (isBackingUpDrive) return;
        setIsBackingUpDrive(true);
        setDriveBackupStatus("Connecting to Google Drive...");
        try {
            const result = await backupSeriesToDrive(
                data.mainTitle,
                {
                    ...data,
                    bannerImageUrl: bannerUrl,
                    cards: cardsList
                },
                (msg) => setDriveBackupStatus(msg)
            );
            setDriveBackupStatus(`✓ Series saved to Google Drive (${result.uploadedCount} files)!`);
            if (result.webViewFolderLink) {
                setDriveFolderLink(result.webViewFolderLink);
            }
        } catch (err: any) {
            console.error("Series Drive backup failed:", err);
            setDriveBackupStatus(`Backup interrupted: ${err?.message || String(err)}`);
        } finally {
            setIsBackingUpDrive(false);
        }
    };

    const [copiedAllMd, setCopiedAllMd] = useState(false);
    const handleCopyAllMarkdown = async () => {
        playBladeClang();
        const md = [
            `# ${data.mainTitle}`,
            `**Archetype:** ${data.archetype} | **Tone:** ${data.tone}`,
            '',
            ...cardsList.map((c, i) => [
                `### ${i + 1}. ${c.title}`,
                `> ${c.caption}`,
                '',
                `**Prompt:** \`${c.prompt}\``,
                c.tags && c.tags.length ? `**Tags:** ${c.tags.join(', ')}` : '',
                ''
            ].join('\n'))
        ].join('\n');
        try {
            await navigator.clipboard.writeText(md);
            setCopiedAllMd(true);
            setTimeout(() => setCopiedAllMd(false), 2000);
        } catch (err) {
            console.error('Failed to copy all as markdown', err);
        }
    };

    const [exportedAllJson, setExportedAllJson] = useState(false);
    const handleExportAllJson = () => {
        try {
            playBladeClang();
            const seriesExport = {
                mainTitle: data.mainTitle,
                archetype: data.archetype,
                tone: data.tone,
                use: data.use,
                bannerImageUrl: bannerUrl,
                negativePrompts: data.negativePrompts || [],
                remixSuggestions: data.remixSuggestions || [],
                relics: cardsList.map((c, idx) => ({
                    index: idx + 1,
                    title: c.title,
                    glyph: c.glyph,
                    caption: c.caption,
                    lore: c.caption,
                    prompt: c.prompt,
                    tags: c.tags || [],
                    imageUrl: c.imageUrl
                })),
                exportedAt: new Date().toISOString(),
                source: "Demon Codex: Dark Fantasy Relic Forge"
            };

            const blob = new Blob([JSON.stringify(seriesExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const safeTitle = (data.mainTitle || 'relic_series')
                .toLowerCase()
                .replace(/[^a-z0-9_-]/gi, '_')
                .replace(/_+/g, '_')
                .replace(/^_+|_+$/g, '') || 'relic_series';
            link.href = url;
            link.download = `${safeTitle}_series_export.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setExportedAllJson(true);
            setTimeout(() => setExportedAllJson(false), 2000);
        } catch (err) {
            console.error('Failed to export series JSON', err);
        }
    };

    const handleRetryBanner = async (customPrompt?: string) => {
      setIsRetryingBanner(true);
      try {
        const promptToUse = customPrompt || `Wide cinematic dark fantasy landscape, ${data.tone}, gothic architecture, volumetric lighting, high contrast, 8k resolution.`;
        const res = await generateImageWithDiagnostics(promptToUse, '16:9', '1K');
        setBannerUrl(res.imageUrl);
        setBannerDiagnostic(res.diagnostic);
        setBannerLoadError(res.diagnostic?.hasError || res.imageUrl === FAILED_IMAGE_PLACEHOLDER);
      } catch (err: any) {
        console.error("Banner retry failed:", err);
        setBannerDiagnostic({
          hasError: true,
          rawError: err?.message || String(err),
          statusCode: err?.status || "BANNER_RETRY_ERR",
          modelName: "gemini-3.1-flash-image",
          promptAttempted: customPrompt || `Wide cinematic dark fantasy landscape, ${data.tone}`,
          timestamp: new Date().toLocaleTimeString()
        });
        setBannerLoadError(true);
      } finally {
        setIsRetryingBanner(false);
      }
    };

    const handleCardUpdated = (index: number, updatedCard: PromptCardType) => {
        setCardsList(prev => {
            const next = [...prev];
            next[index] = updatedCard;
            return next;
        });
    };

    const allTags = useMemo(() => {
        const tags = (cardsList || []).flatMap(c => c.tags || []);
        return [...new Set(tags)].sort();
    }, [cardsList]);

    const filteredCards = useMemo(() => {
        return (cardsList || []).filter(card => !tagFilter || (card.tags && card.tags.includes(tagFilter)));
    }, [cardsList, tagFilter]);

    return (
        <div className="w-full pb-12">
            <header className="relative h-[45vh] md:h-[55vh] min-h-[400px] overflow-hidden rounded-[2.5rem] mb-12 shadow-[0_20px_60px_rgba(0,0,0,0.8)] group/banner border border-white/5 bg-[#0e1017]">
                {hasBannerError ? (
                  <div className="absolute inset-0 z-10">
                    <ImageDiagnosticOverlay 
                      diagnostic={bannerDiagnostic}
                      assetTitle={`${data.mainTitle} (Banner)`}
                      originalPrompt={`Wide cinematic dark fantasy landscape, ${data.tone}, gothic architecture, volumetric lighting, high contrast, 8k resolution.`}
                      onRetry={handleRetryBanner}
                      isRetrying={isRetryingBanner}
                    />
                  </div>
                ) : (
                  <img 
                    src={bannerUrl || undefined} 
                    alt="Series Banner" 
                    onError={() => setBannerLoadError(true)}
                    className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover/banner:scale-110" 
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/30 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 inset-x-0 p-8 md:p-16 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/20 border border-[#00d2ff]/40 text-[#00d2ff] text-[10px] font-black tracking-[0.2em] uppercase mb-4 shadow-[0_0_20px_rgba(0,210,255,0.3)]"
                    >
                        Relic Series Manifested
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="demon-title text-4xl md:text-[9rem] font-normal tracking-tighter leading-none mb-4 drop-shadow-[0_10px_10px_rgba(0,0,0,1)]" 
                        data-text={data.mainTitle}
                    >
                        {data.mainTitle}
                    </motion.h1>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 text-sm md:text-2xl font-bold"
                    >
                        <span className="lightning-text uppercase italic">{data.archetype}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]/50"></span>
                        <span className="text-white/80 font-medium">{data.tone}</span>
                    </motion.div>
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="sticky top-6 z-[60] flex items-center gap-4 mb-10 p-3 rounded-2xl bg-[#111318]/90 backdrop-blur-2xl border border-[#242830] shadow-2xl no-print"
            >
                <button onClick={onStartOver} className="bg-[#8d1a1a] hover:bg-[#ff4d4d] text-white px-6 py-3 rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-[#ff4d4d]/20 hover-blood">↺ RESET FORGE</button>
                <div className="h-6 w-[1px] bg-[#242830]"></div>
                
                <button 
                    onClick={onOpenGallery}
                    className="bg-[#1b1f27] hover:bg-[#242830] text-[#00d2ff] px-6 py-3 rounded-xl text-xs font-black transition-all border border-[#00d2ff]/20 hover-blood flex items-center gap-2"
                >
                    <span className="text-lg">◈</span> ARCHIVE GALLERY
                </button>
                <div className="flex-grow"></div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyAllMarkdown}
                        className="bg-[#1b1f27] hover:bg-[#242830] text-[#e8e6e3] hover:text-[#00d2ff] px-4 py-3 rounded-xl text-xs font-black transition-all border border-[#242830] hover:border-[#00d2ff]/40 shadow-lg flex items-center gap-1.5 hover-blood"
                        title="Copy entire relic series prompts & lore as Markdown"
                    >
                        <span>📋</span>
                        <span>{copiedAllMd ? 'COPIED MD ✓' : 'COPY ALL AS MD'}</span>
                    </button>
                    <button
                        id="export-series-json-btn"
                        onClick={handleExportAllJson}
                        className="bg-[#1b1f27] hover:bg-[#242830] text-[#e8e6e3] hover:text-[#00d2ff] px-4 py-3 rounded-xl text-xs font-black transition-all border border-[#242830] hover:border-[#00d2ff]/40 shadow-lg flex items-center gap-1.5 hover-blood"
                        title="Export entire relic series lore and prompt details as downloadable JSON file"
                    >
                        <FileJson className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>{exportedAllJson ? 'JSON SAVED ✓' : 'EXPORT JSON'}</span>
                    </button>
                    <button 
                        onClick={handleBackupSeriesToDrive}
                        disabled={isBackingUpDrive}
                        className="bg-[#14171f] hover:bg-[#1f2533] text-[#00d2ff] hover:text-white px-5 py-3 rounded-xl text-xs font-black transition-all border border-[#00d2ff]/30 shadow-lg flex items-center gap-2 hover-blood disabled:opacity-50"
                    >
                        <span className="text-sm">▲</span>
                        <span>{isBackingUpDrive ? 'SAVING TO DRIVE...' : 'SAVE TO GOOGLE DRIVE'}</span>
                    </button>
                    <button onClick={() => window.print()} className="px-5 py-3 rounded-xl border border-[#242830] text-xs font-bold hover:bg-[#00d2ff] hover:text-black hover:border-transparent transition-all">EXPORT PDF</button>
                </div>
            </motion.div>

            {/* Interactive Dark Fantasy Tag Filters */}
            {allTags.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center gap-2 mb-8 no-print p-3 rounded-xl bg-[#0e1015]/80 border border-[#242830]"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mr-1 flex items-center gap-1">
                        <span>🏷️</span> TAGS:
                    </span>
                    <button
                        onClick={() => { playRuneHum(); setTagFilter(''); }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                            !tagFilter 
                            ? 'bg-[#00d2ff] text-black border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.4)]' 
                            : 'bg-[#111318] text-[#70757e] border-[#242830] hover:text-white hover:border-[#444]'
                        }`}
                    >
                        ALL ({cardsList.length})
                    </button>
                    {allTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => { playRuneHum(); setTagFilter(tagFilter === tag ? '' : tag); }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                tagFilter === tag 
                                ? 'bg-[#ff0000] text-white border-[#ff0000] shadow-[0_0_15px_rgba(255,0,0,0.4)]' 
                                : 'bg-[#111318] text-[#a0a5b0] border-[#242830] hover:text-[#ff4d4d] hover:border-[#8d1a1a]'
                            }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </motion.div>
            )}

            {driveBackupStatus && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 rounded-xl bg-[#0f141e] border border-[#00d2ff]/40 shadow-xl flex items-center justify-between gap-4 text-xs"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-[#00d2ff] text-base">▲</span>
                        <span className="text-[#d8f4ff] font-medium">{driveBackupStatus}</span>
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
                            onClick={() => { setDriveBackupStatus(null); setDriveFolderLink(null); }}
                            className="text-[#70757e] hover:text-white text-xs px-2 py-1"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}

            <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {filteredCards.map((card, i) => (
                    <Card 
                        key={`${card.title}-${i}`} 
                        card={card} 
                        archetype={data.archetype} 
                        onImageClick={setLightboxImage} 
                        onCardUpdate={(updated) => handleCardUpdated(i, updated)}
                    />
                ))}
            </motion.div>

            <AnimatePresence>
                {lightboxImage && <Lightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />}
            </AnimatePresence>
        </div>
    );
};

