import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Eye, 
  Share2, 
  Bookmark, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { audioFX } from '../services/audioService';
import { DarkSealsBar } from './DarkSealsBar';
import { HoloFoilCard } from './HoloFoilCard';
import { playBladeClang } from '../src/utils/soundEffects';

export interface RelicItem {
  id?: string;
  image: string;
  title: string;
  description: string;
  savedAt?: any;
}

interface GrimoireViewerProps {
  relics: RelicItem[];
  onBack?: () => void;
  onSelectRelic?: (relic: RelicItem) => void;
}

export const GrimoireViewer: React.FC<GrimoireViewerProps> = ({
  relics = [],
  onBack,
  onSelectRelic
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVoidTorch, setIsVoidTorch] = useState(false);
  const [brokenSeals, setBrokenSeals] = useState<Record<string, boolean>>({});
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(false);

  const totalPages = relics.length;
  const currentRelic = relics[currentPage] || null;

  // Turn page forward
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      audioFX.playStoneRuneThud();
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
      }, 280);
    }
  }, [currentPage, totalPages, isFlipping]);

  // Turn page backward
  const handlePrevPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      audioFX.playStoneRuneThud();
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
      }, 280);
    }
  }, [currentPage, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'v' || e.key === 'V') {
        setIsVoidTorch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage]);

  // Toggle breaking wax seal
  const handleBreakSeal = (relicTitle: string) => {
    if (!brokenSeals[relicTitle]) {
      audioFX.playBladeUnsheathe();
      playBladeClang();
      setBrokenSeals((prev) => ({ ...prev, [relicTitle]: true }));
    }
  };

  // Convert number to Roman Numeral
  const toRoman = (num: number): string => {
    const romanMap: [number, string][] = [
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let n = num + 1;
    let res = '';
    for (const [val, sym] of romanMap) {
      while (n >= val) {
        res += sym;
        n -= val;
      }
    }
    return res || 'I';
  };

  // Generate deterministic ancient incantation text based on title
  const secretIncantation = useMemo(() => {
    if (!currentRelic) return '';
    const hash = currentRelic.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const incantations = [
      "Per sanguinem antiquum et tenebras infinitas, sigillum aperitur. Quod clausum erat nunc patet.",
      "In abysso voraginis, anima ligata surgit. Ex umbra in lucem caliginis transformatur.",
      "Maledictio ferrea cordis fracti. Vox mortis silentium perrumpit et regnum tenebrarum evocat.",
      "Cruor et ignis, ferrum et cinis. Daemonium antiquum in hoc speculo aeterno renascitur.",
      "Oculi caeci vident veritatem obscuram. Verbum quod nunquam dictum est resonat in aeternum."
    ];
    return incantations[hash % incantations.length];
  }, [currentRelic]);

  if (relics.length === 0) {
    return (
      <div className="py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/30 mx-auto flex items-center justify-center text-red-400 text-2xl mb-4 shadow-[0_0_20px_rgba(255,77,77,0.3)]">
          📜
        </div>
        <h2 className="text-2xl font-black text-white font-serif uppercase tracking-wider mb-2">
          The Grimoire is Pristine
        </h2>
        <p className="text-sm text-[#8d929b] max-w-md mx-auto mb-6">
          No relics have been inscribed into your permanent codex yet. Forge construct relics in the Forge to bind their souls to these parchment folios.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-[#8d1a1a] hover:bg-[#ff4d4d] text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg"
          >
            Return to the Forge
          </button>
        )}
      </div>
    );
  }

  const isSealBroken = currentRelic ? Boolean(brokenSeals[currentRelic.title]) : false;

  return (
    <div className={`w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 transition-all ${isFullscreen ? 'fixed inset-0 z-[150] bg-[#07080b]/95 p-4 sm:p-10 overflow-y-auto' : ''}`}>
      {/* Top Grimoire Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#242830]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#1a0f12] to-[#0d0709] border border-[#ff4d4d]/40 shadow-[0_0_15px_rgba(255,77,77,0.25)]">
            <BookOpen className="w-5 h-5 text-[#ff4d4d]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase font-serif tracking-wider flex items-center gap-2">
              <span>Grimoire of the Damned</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#8d1a1a]/30 border border-[#8d1a1a]/60 text-[#ff8080] font-mono">
                Folio {currentPage + 1} of {totalPages}
              </span>
            </h2>
            <p className="text-[11px] text-[#70757e] tracking-widest uppercase">
              Physical Folio Inspection &bull; UV Necrotic Ink &bull; Wax Seal Rituals
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Void Torch UV Toggle */}
          <button
            type="button"
            onClick={() => {
              audioFX.playRuneChime();
              setIsVoidTorch(!isVoidTorch);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border shadow-lg ${
              isVoidTorch
                ? 'bg-gradient-to-r from-[#9333ea] to-[#c084fc] text-black border-[#c084fc] shadow-[0_0_20px_rgba(168,85,247,0.7)] animate-pulse'
                : 'bg-[#121019] text-[#c084fc] border-[#a855f7]/40 hover:bg-[#a855f7]/20'
            }`}
            title="Toggle Void Torch: Reveals hidden demonic UV invisible ink"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Void Torch</span>
            <span className="text-[10px]">{isVoidTorch ? 'ON' : 'OFF'}</span>
          </button>

          {/* Table of Contents button */}
          <button
            type="button"
            onClick={() => setShowToc(!showToc)}
            className="px-3 py-2 rounded-xl bg-[#14171f] hover:bg-[#1f2533] text-[#00d2ff] hover:text-white border border-[#00d2ff]/30 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Table of Contents"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Index</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[#14171f] hover:bg-[#1f2533] text-[#9aa0a6] hover:text-white border border-[#242830] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Inspection"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Table of Contents Drawer */}
      {showToc && (
        <div className="mb-6 p-4 rounded-2xl bg-[#0b0c10] border border-[#ff4d4d]/30 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-3 border-b border-[#242830] pb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4d] flex items-center gap-1.5">
              <span>✦</span> Index of Bound Relics
            </span>
            <button onClick={() => setShowToc(false)} className="text-[#70757e] hover:text-white text-xs font-bold">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
            {relics.map((r, idx) => (
              <button
                key={idx}
                onClick={() => {
                  audioFX.playStoneRuneThud();
                  setCurrentPage(idx);
                  setShowToc(false);
                }}
                className={`p-2 rounded-xl text-left text-xs transition-all flex items-center gap-2 border ${
                  idx === currentPage
                    ? 'bg-[#8d1a1a]/30 border-[#ff4d4d] text-white font-bold'
                    : 'bg-[#12141c] border-[#242830] text-[#9aa0a6] hover:text-white hover:border-[#444]'
                }`}
              >
                <span className="text-[9px] font-mono text-[#ff4d4d]">Folio {toRoman(idx)}</span>
                <span className="truncate flex-1 text-[11px]">{r.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D TOME STRUCTURE */}
      <div 
        className={`relative w-full rounded-3xl p-3 sm:p-6 md:p-8 bg-[#0a0507] border-4 border-[#3a1219] shadow-[0_20px_70px_rgba(0,0,0,0.95)] transition-all duration-300 ${
          isVoidTorch ? 'shadow-[0_0_60px_rgba(147,51,234,0.35)] border-[#581c87]' : ''
        }`}
        style={{
          boxShadow: isVoidTorch 
            ? '0 0 60px rgba(168, 85, 247, 0.3), inset 0 0 40px rgba(0,0,0,0.9)' 
            : '0 25px 70px rgba(0,0,0,0.95), inset 0 0 50px rgba(15, 5, 8, 0.95)'
        }}
      >
        {/* Grimoire Spine & Ornamental Corners */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#ff4d4d]/50 pointer-events-none"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#ff4d4d]/50 pointer-events-none"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#ff4d4d]/50 pointer-events-none"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#ff4d4d]/50 pointer-events-none"></div>

        {/* The Two-Page Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[580px] sm:min-h-[640px] items-stretch">
          
          {/* LEFT FOLIO: Occult Script, Stats, and UV Ink */}
          <div 
            className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative border overflow-hidden ${
              isVoidTorch 
                ? 'bg-[#0f0b1a] border-[#9333ea]/50 text-[#e9d5ff]' 
                : 'bg-[#151214] border-[#2e151b] text-[#d6d3d1]'
            }`}
            style={{
              backgroundImage: isVoidTorch 
                ? 'radial-gradient(circle at 50% 50%, rgba(88, 28, 135, 0.15) 0%, rgba(10, 5, 18, 0.95) 100%)' 
                : 'radial-gradient(circle at 50% 20%, rgba(45, 16, 22, 0.3) 0%, rgba(18, 14, 16, 0.98) 100%)'
            }}
          >
            {/* Ancient Header Sigil */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#3d1820]/60">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff4d4d] flex items-center gap-1.5">
                  <span>✙</span>
                  <span>LIBER RELIQUIAE &bull; CAPUT {toRoman(currentPage)}</span>
                </span>
                <span className="text-[10px] font-serif text-[#70757e] tracking-widest uppercase">
                  Demon Codex Sanctum
                </span>
              </div>

              {/* Title in Gothic Display */}
              <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-wide text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] mb-3">
                {currentRelic?.title || "Untitled Relic"}
              </h1>

              {/* Main Lore Scripture */}
              <div className="p-4 rounded-xl bg-black/40 border border-[#2e151b] mb-4">
                <p className="text-xs sm:text-sm font-serif leading-relaxed text-[#c7c2be] italic">
                  &ldquo;{currentRelic?.description || "An ancient artifact inscribed into the abyssal registry of the Demon Codex."}&rdquo;
                </p>
              </div>

              {/* UV INVISIBLE INK INSCRIPTION (Glows when Void Torch is ON) */}
              <div 
                className={`p-4 rounded-xl transition-all duration-500 border ${
                  isVoidTorch 
                    ? 'bg-[#2e1065]/30 border-[#c084fc] shadow-[0_0_30px_rgba(168,85,247,0.4)] opacity-100 scale-100' 
                    : 'opacity-10 border-transparent bg-transparent scale-98 pointer-events-none select-none blur-[2px]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#c084fc]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Necrotic UV Inscription &bull; Hidden Canon</span>
                </div>
                <p className="text-xs font-mono text-[#e9d5ff] leading-relaxed tracking-wider drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]">
                  {secretIncantation}
                </p>
                <div className="mt-2 text-[9px] text-[#a855f7] uppercase font-bold tracking-widest flex items-center gap-1">
                  <span>✦ Resonant Frequencies: 432Hz &bull; Sanctum Law Verified</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls on Left Page */}
            <div className="pt-4 border-t border-[#3d1820]/60 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#70757e]">Occult Seals Reaction:</span>
                <span className="text-[9px] text-[#ff8080] font-mono">Immutable Soul Binding</span>
              </div>
              <DarkSealsBar 
                relicId={currentRelic?.id || (currentRelic?.title || 'relic').replace(/\s+/g, '-').toLowerCase()} 
                compact={false} 
              />
            </div>
          </div>

          {/* RIGHT FOLIO: Framed Relic Artwork & Interactive Wax Seal */}
          <div 
            className="rounded-2xl p-6 sm:p-8 flex flex-col justify-between items-center bg-[#100d0f] border border-[#2e151b] relative overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(30, 10, 15, 0.4) 0%, rgba(8, 6, 8, 0.98) 100%)'
            }}
          >
            {/* Top Folio Header Right */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#2e151b]">
              <span className="text-[10px] font-mono text-[#70757e] tracking-widest uppercase">
                Visual Manifestation Frame
              </span>
              <span className="text-[10px] font-black text-[#ff4d4d] uppercase tracking-wider">
                Sanctum Tier 4K
              </span>
            </div>

            {/* Central 3D HoloFoil Framed Display */}
            <div className="w-full flex-1 flex flex-col items-center justify-center my-2">
              <div className="w-full max-w-sm sm:max-w-md relative group">
                <HoloFoilCard 
                  tier={currentPage % 3 === 0 ? 'abyssal-gold' : currentPage % 2 === 0 ? 'blood-foil' : 'void-cosmic'} 
                  rarity={94} 
                  showBadge={true}
                  className="w-full"
                >
                  <div className="aspect-square sm:aspect-video rounded-xl overflow-hidden relative shadow-[0_15px_40px_rgba(0,0,0,0.85)] border-2 border-[#5a1b24] group-hover:border-[#ff4d4d] transition-all">
                    <img 
                      src={currentRelic?.image} 
                      alt={currentRelic?.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Watermark in frame */}
                    <div className="absolute bottom-2 right-3 text-[9px] font-mono text-white/60 tracking-wider">
                      THE DEMON CODEX
                    </div>
                  </div>
                </HoloFoilCard>
              </div>
            </div>

            {/* INTERACTIVE WAX SEAL AT BOTTOM OF RIGHT PAGE */}
            <div className="w-full pt-4 border-t border-[#2e151b] flex items-center justify-between gap-3">
              {/* Wax Seal Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => currentRelic && handleBreakSeal(currentRelic.title)}
                  className={`relative group p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                    isSealBroken
                      ? 'bg-red-950/40 border border-red-500/30 text-red-400'
                      : 'bg-gradient-to-br from-[#8d1a1a] to-[#450a0a] border-2 border-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.5)] hover:scale-110 active:scale-95'
                  }`}
                  title={isSealBroken ? "Seal Broken: Inscription unsealed" : "Click to break the Imperial Wax Seal"}
                >
                  <span className="text-lg select-none">
                    {isSealBroken ? '🩸' : '✙'}
                  </span>
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white block">
                    {isSealBroken ? 'Sanctum Seal Broken' : 'Wax Seal Intact'}
                  </span>
                  <span className="text-[9px] text-[#70757e] block">
                    {isSealBroken ? 'Unsealed into your chronicle' : 'Click seal to release the binding'}
                  </span>
                </div>
              </div>

              {/* View in Forge Link */}
              {onSelectRelic && currentRelic && (
                <button
                  type="button"
                  onClick={() => onSelectRelic(currentRelic)}
                  className="px-3 py-1.5 rounded-lg bg-[#1a1f2c] hover:bg-[#00d2ff] hover:text-black text-[#00d2ff] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border border-[#00d2ff]/30"
                >
                  <span>Open Forge</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM PAGE TURN NAVIGATION RIBBON */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-[#3a1219]">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 0 || isFlipping}
            className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#141014] hover:bg-[#8d1a1a] text-[#d6d3d1] hover:text-white border border-[#3a1219] hover:border-[#ff4d4d] text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Folio</span>
          </button>

          <div className="text-center font-serif">
            <span className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase">
              Folio {toRoman(currentPage)}
            </span>
            <span className="text-[10px] text-[#70757e] block font-mono">
              Use &larr; / &rarr; arrow keys to turn pages
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || isFlipping}
            className="px-4 sm:px-6 py-2.5 rounded-xl bg-[#141014] hover:bg-[#8d1a1a] text-[#d6d3d1] hover:text-white border border-[#3a1219] hover:border-[#ff4d4d] text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
          >
            <span>Next Folio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
