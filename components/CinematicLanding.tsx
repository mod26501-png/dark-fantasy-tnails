import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  BookOpen, 
  Sword, 
  Play, 
  ArrowRight, 
  Eye, 
  Volume2, 
  VolumeX,
  Scroll,
  Crown
} from 'lucide-react';
import { audioFX } from '../services/audioService';

interface CinematicLandingProps {
  onEnterForge: () => void;
  onNavigate: (view: 'forge' | 'gallery' | 'about' | 'crucible' | 'codex' | 'youtube' | 'studio' | 'ascend' | 'angelic') => void;
  hasActiveSession?: boolean;
  onRestoreSession?: () => void;
}

const FEATURED_RELICS = [
  {
    title: 'The Eclipse Cleaver',
    archetype: 'Blood-Forged Armament',
    rarity: 'Mythic Occult',
    power: 96,
    glyph: '⚔️',
    quote: 'Tempered in the dying embers of a blood sun, its obsidian edge cleaves the boundary between flesh and nether.',
    image: '/demon-ai-1781131108810.jpg',
    tag: 'Abyssal Weaponry'
  },
  {
    title: 'Crown of the Obsidian Sovereign',
    archetype: 'Monarch Relic',
    rarity: 'Ascendant Gold',
    power: 99,
    glyph: '👑',
    quote: 'Forged from petrified starlight and volcanic glass. Those who don the circlet hear the whispers of thousand fallen dynasties.',
    image: '/demon-ai-1782459263710.png',
    tag: 'Celestial Sovereign'
  },
  {
    title: 'Grimoire of the Void Stalker',
    archetype: 'Forbidden Canon',
    rarity: 'Ancestral Relic',
    power: 92,
    glyph: '📜',
    quote: 'Bound in sinew and midnight parchment. Every turn of its blood-sealed pages alters the tapestry of surrounding space.',
    image: '/demon-ai-1781132284837.png',
    tag: 'Occult Scriptures'
  }
];

const LORE_CHAPTERS = [
  {
    id: 'origin',
    num: 'CHAPTER I',
    title: 'The Great Convergence & The Demon Codex',
    body: 'Before time solidified into mortal calendars, the boundaries separating terrestrial reality and the primeval abyss shattered. Out of this silent cataclysm arose The Demon Codex — a living reliquary designed to catalogue, forge, and bind entities whose visual resonance could otherwise collapse human comprehension. Each relic forged within this sanctuary holds an intrinsic resonance signature.'
  },
  {
    id: 'forge-rites',
    num: 'CHAPTER II',
    title: 'The Doctrine of Vector Manifestation',
    body: 'The Relic Forge is not a mere generative engine; it is a ritual crucible where words transmute into cinematic artifacts. By combining deep atmospheric descriptors, lighting ratios, and sacred banishing seals (anathemas), seekers invoke high-fidelity visual manifestations rendered at up to 8K fidelity without violating ancient safety barriers.'
  },
  {
    id: 'crucible',
    num: 'CHAPTER III',
    title: 'The Veo 3.1 Kinematic Alchemy',
    body: 'Static relics are only half of the ancient covenant. Through the Crucible, still images undergo temporal ignition — breathing motion, smoke, volumetric lighting, and synthesized binaural soundscapes into existence. A relic is not fully awakened until its cinematic heartbeat resonates through the dark.'
  }
];

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  onEnterForge,
  onNavigate,
  hasActiveSession = false,
  onRestoreSession
}) => {
  const [activeChapter, setActiveChapter] = useState<string>('origin');
  const [selectedRelicIdx, setSelectedRelicIdx] = useState<number>(0);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => audioFX.getState().masterDroneActive);

  const toggleSound = () => {
    audioFX.toggleMasterDrone();
    setIsAudioActive(audioFX.getState().masterDroneActive);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in relative z-20 pb-20">
      
      {/* Top Atmospheric Action Bar */}
      <div className="w-full max-w-6xl px-4 pt-4 pb-2 flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-ping"></span>
          <span className="text-[#ff7b7b] uppercase tracking-widest text-[10px] font-bold">
            Canon Codex Sanctum • v3.8 Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          {hasActiveSession && onRestoreSession && (
            <button
              onClick={() => {
                audioFX.playRuneChime();
                onRestoreSession();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/40 text-[#00d2ff] text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,210,255,0.2)]"
            >
              <span>◈</span>
              <span>Resume Active Session</span>
            </button>
          )}

          <button
            onClick={toggleSound}
            className="px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-[#1b1f27] border border-[#242830] text-[#70757e] hover:text-white transition-all flex items-center gap-1 text-[10px]"
            title={isAudioActive ? 'Silence Abyssal Drone' : 'Ignite Abyssal Drone'}
          >
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-[#ff4d4d]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioActive ? 'Ambient Sound ON' : 'Ambient Sound OFF'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          HERO SECTION: THE DEMON CODEX MAJESTY
          ======================================================== */}
      <section className="w-full max-w-5xl px-4 pt-10 pb-16 text-center flex flex-col items-center relative">
        
        {/* Sacred Tier Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8d1a1a]/30 via-[#111318] to-[#c26b3a]/30 border border-[#8d1a1a]/60 text-[#ff9999] text-[10px] font-mono tracking-[0.25em] uppercase mb-8 shadow-[0_0_25px_rgba(141,26,26,0.4)] backdrop-blur-md">
          <Flame className="w-3 h-3 text-[#ff4d4d] animate-pulse" />
          <span>Grimoire of Dark Art & Relic Vectors</span>
          <span className="w-1 h-1 rounded-full bg-[#ff4d4d]"></span>
          <span className="text-[#ffd27f]">Adept Edition</span>
        </div>

        {/* Chrome Split-Horizon Title */}
        <div className="codex-title-wrapper mb-2">
          <h1 
            className="codex-title text-6xl sm:text-8xl md:text-[9.5rem] font-normal leading-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)] select-none" 
            data-text="THE DEMON CODEX"
          >
            THE DEMON CODEX
            <div className="rune">ᚱ</div>
            <div className="rune">ᛟ</div>
            <div className="rune">ᚾ</div>
            <div className="rune">ᛉ</div>
          </h1>
        </div>

        {/* Cinematic Subtitle */}
        <p className="lightning-text text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed uppercase italic font-black tracking-wide mt-2 mb-10">
          Transmute Occult Ideations into 8K Cinematic Relics, Lore Scriptures & Veo 3.1 Motion.
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-xl">
          <button
            onClick={() => {
              audioFX.playBladeClang();
              onEnterForge();
            }}
            className="flex-1 min-w-[240px] py-4 px-8 rounded-2xl bg-gradient-to-r from-[#8d1a1a] via-[#ff0000] to-[#8d1a1a] hover:from-[#ff1a1a] hover:via-[#ff3333] hover:to-[#ff1a1a] text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_0_35px_rgba(255,0,0,0.6)] hover:shadow-[0_0_55px_rgba(255,0,0,0.9)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-white/20 group"
          >
            <Sword className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span>ENTER THE FORGE</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              audioFX.playRuneChime();
              const loreSection = document.getElementById('codex-lore-section');
              loreSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="py-4 px-6 rounded-2xl bg-[#141720]/90 hover:bg-[#1d2230] border border-[#2d3345] hover:border-[#ffd27f]/60 text-[#ffd27f] font-black text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,210,127,0.3)]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Canon Lore</span>
          </button>
        </div>

        {/* Key Feature Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl mt-14 pt-8 border-t border-[#242830]/80 text-left font-mono">
          <div className="p-3 rounded-xl bg-[#111318]/80 border border-[#242830]">
            <span className="text-[9px] uppercase tracking-wider text-[#70757e] block">Visual Model</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff]"></span>
              gemini-3.1-flash-image
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#111318]/80 border border-[#242830]">
            <span className="text-[9px] uppercase tracking-wider text-[#70757e] block">Kinematic Engine</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0000]"></span>
              Veo 3.1 Directives
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#111318]/80 border border-[#242830]">
            <span className="text-[9px] uppercase tracking-wider text-[#70757e] block">Lore Intelligence</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffd27f]"></span>
              gemini-3.8-flash Occult
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#111318]/80 border border-[#242830]">
            <span className="text-[9px] uppercase tracking-wider text-[#70757e] block">Archival Storage</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              Firestore & IDB Vault
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          FEATURED RELIC SHOWCASE (INTERACTIVE SHOWCASE)
          ======================================================== */}
      <section className="w-full max-w-5xl px-4 py-12 border-t border-[#242830]/60">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff4d4d] block mb-1 flex items-center gap-1.5">
              <span>◈</span> PRIME RELIQUARY SPECIMENS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">
              Manifested Masterworks
            </h2>
          </div>
          <p className="text-xs text-[#70757e] max-w-xs sm:text-right font-sans leading-relaxed">
            Explore relics preserved within the eternal Codex vault. Each specimen features distinct archetypes, lore, and visual directives.
          </p>
        </div>

        {/* Relic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_RELICS.map((relic, idx) => (
            <div
              key={relic.title}
              onClick={() => {
                audioFX.playRuneChime();
                setSelectedRelicIdx(idx);
              }}
              className={`rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between cursor-pointer group bg-[#111318] ${
                selectedRelicIdx === idx 
                  ? 'border-[#ff0000] shadow-[0_0_30px_rgba(255,0,0,0.35)] scale-[1.02]' 
                  : 'border-[#242830] hover:border-[#ff4d4d]/50 hover:bg-[#141720]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-3xl">{relic.glyph}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#8d1a1a]/30 border border-[#8d1a1a] text-[#ff9999] uppercase font-bold tracking-wider">
                    {relic.rarity}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors mb-1">
                  {relic.title}
                </h3>
                <span className="text-[10px] font-mono text-[#00d2ff] uppercase tracking-wider block mb-3">
                  {relic.archetype}
                </span>

                <p className="text-xs text-[#cfd3d8] leading-relaxed italic border-l-2 border-[#8d1a1a]/60 pl-3 mb-4">
                  "{relic.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#242830] flex justify-between items-center text-[10px] font-mono">
                <span className="text-[#70757e]">{relic.tag}</span>
                <span className="text-[#ffd27f] font-bold">PWR {relic.power}/100</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          CANON LORE SCRIPTURES (READABLE CHAPTERS SECTION)
          ======================================================== */}
      <section id="codex-lore-section" className="w-full max-w-5xl px-4 py-16 border-t border-[#242830]/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ffd27f] block mb-2 flex items-center justify-center gap-1.5">
            <Scroll className="w-3.5 h-3.5 text-[#ffd27f]" />
            <span>SCRIPTURES OF THE ABYSS</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight italic">
            Lore & World-Building Canon
          </h2>
          <p className="text-xs text-[#9aa0a6] mt-2 leading-relaxed">
            These scriptures are permanently chronicled here for all seekers to read, study, and contemplate without interruption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Chapter Selector Tabs */}
          <div className="md:col-span-4 flex flex-col gap-2">
            {LORE_CHAPTERS.map((chap) => (
              <button
                key={chap.id}
                onClick={() => {
                  audioFX.playStoneRuneThud();
                  setActiveChapter(chap.id);
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  activeChapter === chap.id
                    ? 'bg-gradient-to-r from-[#1c140e] to-[#111318] border-[#c26b3a] shadow-[0_0_20px_rgba(194,107,58,0.25)]'
                    : 'bg-[#111318] border-[#242830] hover:border-[#70757e] hover:bg-[#141720]'
                }`}
              >
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#c26b3a] font-bold">
                  {chap.num}
                </span>
                <span className="text-xs font-black text-white uppercase tracking-tight">
                  {chap.title}
                </span>
              </button>
            ))}
          </div>

          {/* Active Chapter Reading Scroll */}
          <div className="md:col-span-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#12141c] via-[#0d0f15] to-[#07080b] border-2 border-[#8d1a1a]/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none text-8xl font-serif">
              📜
            </div>

            {(() => {
              const active = LORE_CHAPTERS.find(c => c.id === activeChapter) || LORE_CHAPTERS[0];
              return (
                <article className="relative z-10 flex flex-col gap-4">
                  <div className="border-b border-[#242830] pb-3">
                    <span className="text-[10px] font-mono text-[#ff4d4d] uppercase tracking-[0.2em] font-bold">
                      {active.num} &bull; SCRIPTURE CANON
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                      {active.title}
                    </h3>
                  </div>

                  <p className="text-sm text-[#d1d5db] leading-relaxed font-sans font-normal first-letter:text-3xl first-letter:font-black first-letter:text-[#ff4d4d] first-letter:mr-1">
                    {active.body}
                  </p>

                  <div className="pt-4 mt-2 border-t border-[#242830] flex flex-wrap justify-between items-center gap-3 text-[11px] font-mono text-[#70757e]">
                    <span>Authorized by The Demon Codex Sovereign</span>
                    <button
                      onClick={() => {
                        audioFX.playBladeClang();
                        onEnterForge();
                      }}
                      className="text-[#00d2ff] hover:underline font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Invoke in Forge</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ========================================================
          SANCTUM NEXUS: DIRECT PORTAL CARDS
          ======================================================== */}
      <section className="w-full max-w-5xl px-4 py-12 border-t border-[#242830]/60">
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00d2ff] block mb-1">
            SANCTUM PATHWAYS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">
            Choose Your Destination
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => {
              audioFX.playBladeClang();
              onEnterForge();
            }}
            className="p-5 rounded-2xl bg-gradient-to-br from-[#1c0f0f] to-[#111318] border border-[#ff0000]/40 hover:border-[#ff0000] cursor-pointer hover:shadow-[0_0_25px_rgba(255,0,0,0.35)] hover:-translate-y-1 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff0000]/15 flex items-center justify-center text-xl mb-3 text-[#ff4d4d]">
              ⚔️
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors">
              The Relic Forge
            </h4>
            <p className="text-xs text-[#70757e] mt-1.5 leading-relaxed">
              Input your idea and forge 5 unique relic cards with rich prompts and 8K visual banners.
            </p>
          </div>

          <div 
            onClick={() => {
              audioFX.playRuneChime();
              onNavigate('crucible');
            }}
            className="p-5 rounded-2xl bg-[#111318] border border-[#242830] hover:border-[#c26b3a] cursor-pointer hover:shadow-[0_0_25px_rgba(194,107,58,0.25)] hover:-translate-y-1 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#c26b3a]/15 flex items-center justify-center text-xl mb-3 text-[#c26b3a]">
              🔥
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#c26b3a] transition-colors">
              Veo 3.1 Crucible
            </h4>
            <p className="text-xs text-[#70757e] mt-1.5 leading-relaxed">
              Ignite image-to-image transmutation and synthesize 60fps kinematic video rituals.
            </p>
          </div>

          <div 
            onClick={() => {
              audioFX.playRuneChime();
              onNavigate('youtube');
            }}
            className="p-5 rounded-2xl bg-[#111318] border border-[#242830] hover:border-[#ff0000] cursor-pointer hover:shadow-[0_0_25px_rgba(255,0,0,0.25)] hover:-translate-y-1 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff0000]/15 flex items-center justify-center text-xl mb-3 text-[#ff0000]">
              📺
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors">
              YouTube Chronicles
            </h4>
            <p className="text-xs text-[#70757e] mt-1.5 leading-relaxed">
              Watch official Demon Codex long-form videos, shorts, and cinematic soundtrack albums.
            </p>
          </div>

          <div 
            onClick={() => {
              audioFX.playRuneChime();
              onNavigate('studio');
            }}
            className="p-5 rounded-2xl bg-[#111318] border border-[#242830] hover:border-[#ffd27f] cursor-pointer hover:shadow-[0_0_25px_rgba(255,210,127,0.25)] hover:-translate-y-1 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ffd27f]/15 flex items-center justify-center text-xl mb-3 text-[#ffd27f]">
              🔮
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#ffd27f] transition-colors">
              Denomic Studio & Store
            </h4>
            <p className="text-xs text-[#70757e] mt-1.5 leading-relaxed">
              Acquire 4K wallpapers, sound loops, master prompt packs, and custom commission slots.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Bottom Entry Pill */}
      <div className="fixed bottom-6 z-40 animate-bounce">
        <button
          onClick={() => {
            audioFX.playBladeClang();
            onEnterForge();
          }}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-[#8d1a1a] via-[#ff0000] to-[#8d1a1a] text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,0,0,0.7)] hover:shadow-[0_0_50px_rgba(255,0,0,1)] flex items-center gap-2 border border-white/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Flame className="w-4 h-4 text-white" />
          <span>ENTER THE FORGE NOW</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
