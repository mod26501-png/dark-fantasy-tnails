import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scroll, Download, CheckCircle, X, Sparkles } from 'lucide-react';
import type { GeneratedData } from '../types';
import { generateAncientScrollPdf } from '../services/ancientScrollPdfService';
import { audioFX } from '../services/audioService';

export interface AncientScrollModalProps {
  data: GeneratedData;
  isOpen: boolean;
  onClose: () => void;
}

export const AncientScrollModal: React.FC<AncientScrollModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgressMsg('Transcribing ancient scroll on aged parchment...');
    audioFX.playRuneChime();

    try {
      await generateAncientScrollPdf(data, {
        onProgress: (status) => setProgressMsg(status),
      });
      setIsDownloaded(true);
      audioFX.playDarkSealOffering('blood');
      setTimeout(() => setIsDownloaded(false), 4500);
    } catch (err: any) {
      console.error('Failed to generate Ancient Scroll PDF:', err);
      setProgressMsg(`Failed: ${err?.message || 'Error generating PDF'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl w-full max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border-2 border-[#8d5b2d]/80 shadow-[0_0_80px_rgba(141,91,45,0.4)] bg-[#1a120c]"
        >
          {/* Top Modal Action Bar */}
          <div className="bg-[#24170f] border-b border-[#5a3821] px-6 py-4 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[#8d1a1a]/40 border border-[#8d1a1a] text-[#ff6666]">
                <Scroll className="w-5 h-5 text-[#f5c278]" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#f5ebd0] tracking-wide flex items-center gap-2">
                  <span>Ancient Scroll Grimoire</span>
                  <span className="text-[10px] bg-[#8d1a1a] text-white px-2 py-0.5 rounded font-black tracking-widest uppercase">
                    Gothic PDF
                  </span>
                </h2>
                <p className="text-[11px] text-[#bda07c]">
                  Illuminated gothic manuscript with authentic parchment textures &amp; centered layout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8d1a1a] via-[#b52626] to-[#d63b2f] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 flex items-center gap-2 border border-[#ff5555]/50 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transcribing...</span>
                  </>
                ) : isDownloaded ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Scroll Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-[#ffe6a8]" />
                    <span>Download Ancient Scroll (.PDF)</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="text-[#bda07c] hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Toast Banner */}
          {progressMsg && (
            <div className="bg-[#381f12] border-b border-[#633b1e] px-6 py-2 text-xs text-[#f7d8a6] flex items-center justify-between font-mono shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f5c278] animate-ping" />
                {progressMsg}
              </span>
            </div>
          )}

          {/* Scroll Content Preview Stage */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#120c08] scrollbar-thin scrollbar-thumb-[#5a3821]">
            <div
              className="max-w-2xl mx-auto rounded-2xl p-6 sm:p-12 relative shadow-2xl border-4 border-[#6b4528]"
              style={{
                backgroundColor: '#f5eedb',
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(220,195,150,0.5) 75%, rgba(160,115,65,0.85) 100%)',
                color: '#381f12',
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 text-lg text-[#5a3821] font-serif select-none">✠</div>
              <div className="absolute top-3 right-3 text-lg text-[#5a3821] font-serif select-none">✠</div>
              <div className="absolute bottom-3 left-3 text-lg text-[#5a3821] font-serif select-none">✠</div>
              <div className="absolute bottom-3 right-3 text-lg text-[#5a3821] font-serif select-none">✠</div>

              {/* Header & Title Section */}
              <div className="text-center pb-6 border-b-2 border-[#5a3821]/60">
                <div className="text-[10px] uppercase tracking-[0.28em] font-serif font-bold text-[#8d1a1a] mb-2">
                  * * * THE DEMON CODEX: ANCIENT SCRIPTURE * * *
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#2d140a] uppercase mb-1">
                  {data.mainTitle}
                </h1>
                <p className="text-xs sm:text-sm font-serif italic text-[#8d1a1a] font-semibold">
                  {data.archetype} &bull; {data.tone}
                </p>
                <p className="text-[10px] font-serif text-[#6b4c33] mt-2">
                  Transcribed from the Neural Crucible &bull; Folio MMXXVI
                </p>
              </div>

              {/* Banner Image */}
              {data.bannerImageUrl && (
                <div className="my-6 border-2 border-[#5a3821] p-1.5 bg-[#ebd9b8] rounded shadow-md">
                  <img
                    src={data.bannerImageUrl}
                    alt={data.mainTitle}
                    className="w-full h-44 sm:h-56 object-cover rounded filter sepia-[0.18]"
                  />
                </div>
              )}

              {/* Illuminated Prologue Box */}
              <div className="my-6 p-4 rounded-xl border border-[#8d5b2d]/50 bg-[#f0e3c5]/80 font-serif leading-relaxed text-xs sm:text-sm text-[#3b2314]">
                <div className="text-center text-xs font-bold text-[#8d1a1a] uppercase tracking-widest mb-2 pb-1 border-b border-[#8d5b2d]/30">
                  I. Prologue of the Dark Arcanum
                </div>
                <p className="text-justify">
                  <span className="float-left text-3xl font-black font-serif leading-none mr-2 text-[#8d1a1a]">K</span>
                  now, seeker of forbidden arts, that these scriptures chronicle the manifestation of{' '}
                  <strong>{data.mainTitle}</strong>. Within this sacred scroll lie preserved relics, arcane rites, and
                  cosmic lore forged through the fires of the Demon Codex. Let none alter this canon without the blood seal
                  of the High Priest.
                </p>
              </div>

              {/* Relic Cards Inscription Preview */}
              <div className="space-y-6 my-8">
                {(data.cards || []).map((card, idx) => (
                  <div
                    key={card.title || idx}
                    className="p-5 rounded-xl border-2 border-[#7a4c28] bg-[#eedfc2]/90 shadow-sm"
                  >
                    <div className="text-center pb-2 mb-3 border-b border-[#8d5b2d]/40">
                      <div className="text-[9px] uppercase tracking-widest font-mono text-[#7a4c28]">
                        RELIC SCRIPTURE {idx + 1} OF {data.cards.length}
                      </div>
                      <h3 className="text-base sm:text-lg font-serif font-black text-[#2d140a] uppercase mt-0.5">
                        {card.title}
                      </h3>
                      <div className="text-[10px] font-bold text-[#8d1a1a] uppercase tracking-wider mt-0.5">
                        [ SACRED RELIC ARTIFACT &bull; CONTINUITY CANON ]
                      </div>
                    </div>

                    {card.imageUrl && (
                      <div className="mb-3 border border-[#8d5b2d] p-1 bg-[#ebd9b8] rounded">
                        <img
                          src={card.imageUrl}
                          alt={card.title}
                          className="w-full h-36 object-cover rounded filter sepia-[0.15]"
                        />
                      </div>
                    )}

                    {card.caption && (
                      <p className="text-xs font-serif italic text-[#4a2e1b] text-center mb-3">
                        &ldquo;{card.caption}&rdquo;
                      </p>
                    )}

                    <div className="p-2.5 rounded bg-[#e3cfab] border border-[#a17849] font-mono text-[10px] text-[#2d180c] break-words">
                      <div className="text-[8px] font-bold uppercase text-[#733d1b] tracking-widest mb-1">
                        Incantation Formula:
                      </div>
                      {card.prompt}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Colophon Preview */}
              <div className="text-center pt-6 border-t-2 border-[#5a3821]/60">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-[#c42828] via-[#8d1a1a] to-[#420606] border-2 border-[#fce2a6] flex items-center justify-center text-white shadow-lg mb-2">
                  <span className="text-xl">✠</span>
                </div>
                <div className="text-[10px] font-serif font-bold text-[#8d1a1a]">
                  Confirmed &amp; Bound by The High Priest of the Codex
                </div>
                <div className="text-[9px] text-[#704d30] mt-1 font-mono">
                  THE DEMON CODEX &bull; PERMANENT CANON ARCHIVE
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
