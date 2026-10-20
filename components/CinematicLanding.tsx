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
  Crown,
  Copy,
  Check,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { audioFX } from '../services/audioService';

interface CinematicLandingProps {
  onEnterForge: () => void;
  onNavigate: (view: 'forge' | 'gallery' | 'about' | 'crucible' | 'codex' | 'youtube' | 'studio' | 'ascend' | 'angelic') => void;
  hasActiveSession?: boolean;
  onRestoreSession?: () => void;
}

export interface RelicSpecimen {
  id: string;
  title: string;
  archetype: string;
  rarity: string;
  power: number;
  glyph: string;
  quote: string;
  image: string;
  tag: string;
  aspect: string;
  prompt: string;
  color: string;
}

const FEATURED_RELICS: RelicSpecimen[] = [
  {
    id: 'epic-reveal',
    title: 'Epic Reveal: The Slime Fiend',
    archetype: 'YouTube Master Thumbnail',
    rarity: 'Transcendent 8K',
    power: 100,
    glyph: '⚡',
    quote: 'High-octane YouTube thumbnail alchemy — 3D blood-chrome typography, electric abyssal lightning, and bio-luminescent emerald dread bursting through the seal.',
    image: '/relics/epic_reveal_thumbnail.jpg',
    tag: 'YouTube Thumbnail Pro',
    aspect: '16:9 Thumbnail',
    prompt: 'Hyper-detailed epic dark fantasy YouTube thumbnail, hideous bio-luminescent green demon creature with sharp jagged teeth dripping acidic slime bursting through an ancient ornate blood-red runic crest seal, embossed 3D metallic chrome text reading "EPIC REVEAL by The Demon Codex", vivid electric crimson and sapphire lightning tendrils, cinematic hyper-contrast 8K, unreal engine 5 render.',
    color: '#00ff66'
  },
  {
    id: 'archon-warlord',
    title: 'The Obsidian Archon',
    archetype: 'Vampiric Sovereign',
    rarity: 'Mythic Occult',
    power: 98,
    glyph: '🩸',
    quote: 'Clad in runic damascus plate and shredded midnight silk. His pale gaze pierced centuries of subterranean silence inside the cathedral crypt.',
    image: '/relics/archon_warlord.jpg',
    tag: 'Character Relic',
    aspect: '16:9 Cinematic',
    prompt: 'Pale bald vampire warlord in heavy ornate Damascus steel plate armor etched with glowing crimson elder runes, tattered black cape, standing in a vast ruined gothic cathedral with dust motes and a single dramatic shaft of cold moonlight from the vaulted ceiling, volumetric shadows, masterwork dark fantasy portrait, 8k resolution, cinematic lighting.',
    color: '#ff2a2a'
  },
  {
    id: 'crucible-cauldron',
    title: 'The Crucible of Molten Runes',
    archetype: 'Alchemical Hearth',
    rarity: 'Elder Relic',
    power: 96,
    glyph: '🔥',
    quote: 'Elder Futhark runes carved into black iron, containing liquid fire and incandescent sparks from the heart of the Nether Forge.',
    image: '/relics/crucible_cauldron.jpg',
    tag: 'Alchemical Relic',
    aspect: '16:9 Cinematic',
    prompt: 'Massive heavy iron sacrificial cauldron engraved with glowing incandescent Elder Futhark runes along the rim, boiling molten lava and dancing volcanic flames with embers bursting into the dark misty air, ruined gothic stone arches under a pale crescent moon, dark fantasy alchemy atmosphere, raytraced cinematic 8k.',
    color: '#ff6600'
  },
  {
    id: 'abyssal-titan',
    title: 'Malakor the Ruin Sovereign',
    archetype: 'Celestial Demon King',
    rarity: 'Apocalyptic Prime',
    power: 99,
    glyph: '⚡',
    quote: 'Summoning crimson celestial lightning and molten meteors above gothic ramparts. Rendered in towering 9:16 vertical ratio for YouTube Shorts.',
    image: '/relics/abyssal_titan.jpg',
    tag: 'Vertical Short (9:16)',
    aspect: '9:16 Shorts',
    prompt: 'Towering winged demonic gargoyle king perched atop high gothic castle spires, golden ornamental armor with glowing red core, summoning red celestial lightning bolts and orbiting molten fire orbs from a cracked cavernous sky above, 9:16 vertical mobile aspect ratio, cinematic dark fantasy epic scale, 8K ultra detail.',
    color: '#ff0055'
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
  const [inspectModalRelic, setInspectModalRelic] = useState<RelicSpecimen | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => audioFX.getState().masterDroneActive);

  const toggleSound = () => {
    audioFX.toggleMasterDrone();
    setIsAudioActive(audioFX.getState().masterDroneActive);
  };

  const handleCopyPrompt = (relic: RelicSpecimen, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(relic.prompt);
    setCopiedPromptId(relic.id);
    audioFX.playRuneChime();
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in relative z-20 pb-28">
      
      {/* Top Atmospheric Action Bar */}
      <div className="w-full max-w-6xl px-4 pt-4 pb-2 flex justify-between items-center text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-ping"></span>
          <span className="text-[#ff7b7b] uppercase tracking-widest text-[10px] font-bold">
            Canon Codex Sanctum • v3.8 Active
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              audioFX.playRuneChime();
              onNavigate('about');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#111318] hover:bg-[#1f2430] border border-[#242830] hover:border-[#ff4d4d] text-[#ff7b7b] hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
            title="Read About The Demon Codex & The Arch-Scribe"
          >
            <span>✧</span>
            <span>About The Scribe</span>
          </button>
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
            {isAudioActive ? <Volume2 className="w-3.5 h-3.5 text-[#ff4d4d] animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAudioActive ? 'Ambient Sound ON' : 'Ambient Sound OFF'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          HERO SECTION: THE DEMON CODEX MAJESTY
          ======================================================== */}
      <section className="w-full max-w-5xl px-4 pt-8 pb-12 text-center flex flex-col items-center relative">
        
        {/* Sacred Tier Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8d1a1a]/30 via-[#111318] to-[#c26b3a]/30 border border-[#8d1a1a]/60 text-[#ff9999] text-[10px] font-mono tracking-[0.25em] uppercase mb-6 shadow-[0_0_25px_rgba(141,26,26,0.4)] backdrop-blur-md">
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
        <p className="lightning-text text-lg sm:text-2xl max-w-2xl mx-auto leading-relaxed uppercase italic font-black tracking-wide mt-2 mb-8">
          Transmute Occult Ideations into 8K Cinematic Relics, Lore Scriptures & Veo 3.1 Motion.
        </p>

        {/* Primary Call-to-Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-xl mb-12">
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

        {/* ========================================================
            HERO MASTERPIECE SHOWCASE (Your Manifested Relic)
            ======================================================== */}
        <div className="w-full max-w-4xl p-1 rounded-3xl bg-gradient-to-b from-[#8d1a1a]/40 via-[#242830]/40 to-transparent shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
          <div className="relative rounded-[22px] overflow-hidden bg-[#0d0f14] border border-[#ff0000]/30 group">
            <div className="relative aspect-[21/9] sm:aspect-[16/8] w-full overflow-hidden">
              <img 
                src="/relics/epic_reveal_thumbnail.jpg" 
                alt="Epic Reveal by The Demon Codex" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-black/30"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
            </div>

            {/* Overlay Bar on the Hero Image */}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/80 to-transparent">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#ff0000] text-white tracking-widest uppercase">
                    MASTER SHOWCASE
                  </span>
                  <span className="text-[10px] font-mono text-[#00d2ff] uppercase">
                    16:9 • 8K Master Thumbnail
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight italic drop-shadow">
                  "Epic Reveal: The Slime Fiend"
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectModalRelic(FEATURED_RELICS[0])}
                  className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 border border-white/20 text-white text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition-all hover:scale-105"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#00d2ff]" />
                  <span>Inspect Specimen</span>
                </button>
                <button
                  onClick={() => {
                    audioFX.playBladeClang();
                    onEnterForge();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-[#ff0000] hover:bg-[#ff2222] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,0,0.6)] transition-all hover:scale-105"
                >
                  <span>Forge Similar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Feature Telemetry Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl mt-12 pt-6 border-t border-[#242830]/80 text-left font-mono">
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
            <span className="text-[9px] uppercase tracking-wider text-[#70757e] block">Archival Vault</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              IndexedDB & Cloud
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================
          FEATURED RELIC SPECIMENS (YOUR MANIFESTED GALLERY)
          ======================================================== */}
      <section className="w-full max-w-6xl px-4 py-12 border-t border-[#242830]/60">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff4d4d] block mb-1 flex items-center gap-1.5">
              <span>◈</span> PRIME RELIQUARY SPECIMENS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">
              Manifested Masterworks
            </h2>
          </div>
          <p className="text-xs text-[#70757e] max-w-sm sm:text-right font-sans leading-relaxed">
            Authentic dark fantasy relics forged directly in The Demon Codex. Click any relic to inspect full 8K details, prompt incantations, and dimensional directives.
          </p>
        </div>

        {/* 4-Column Master Relic Grid with Real Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_RELICS.map((relic, idx) => (
            <div
              key={relic.id}
              onClick={() => {
                audioFX.playRuneChime();
                setSelectedRelicIdx(idx);
                setInspectModalRelic(relic);
              }}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group bg-[#111318] overflow-hidden hover:-translate-y-1 ${
                selectedRelicIdx === idx 
                  ? 'border-[#ff0000] shadow-[0_0_30px_rgba(255,0,0,0.35)]' 
                  : 'border-[#242830] hover:border-[#ff4d4d]/60 hover:shadow-[0_0_20px_rgba(0,0,0,0.8)]'
              }`}
            >
              {/* Image Container with Aspect Badge */}
              <div className="relative w-full aspect-[16/10] overflow-hidden bg-black">
                <img 
                  src={relic.image} 
                  alt={relic.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/20"></div>
                
                {/* Top Badges */}
                <div className="absolute top-2.5 inset-x-2.5 flex justify-between items-center">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-white font-bold">
                    {relic.aspect}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#8d1a1a]/70 backdrop-blur-md border border-[#ff0000]/60 text-[#ffb3b3] uppercase font-bold tracking-wider">
                    {relic.rarity}
                  </span>
                </div>

                {/* Inspect Action on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                  <span className="px-3 py-1.5 rounded-full bg-[#ff0000] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,0,0.8)]">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{relic.glyph}</span>
                    <span className="text-[10px] font-mono text-[#00d2ff] uppercase tracking-wider">
                      {relic.archetype}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors mb-2 line-clamp-1">
                    {relic.title}
                  </h3>

                  <p className="text-xs text-[#9aa0a6] leading-relaxed italic border-l-2 border-[#8d1a1a]/60 pl-2.5 mb-4 line-clamp-3">
                    "{relic.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#242830] flex justify-between items-center text-[10px] font-mono">
                  <span className="text-[#70757e]">{relic.tag}</span>
                  <span className="text-[#ffd27f] font-bold">PWR {relic.power}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          INSPECT SPECIMEN MODAL
          ======================================================== */}
      {inspectModalRelic && (
        <div 
          onClick={() => setInspectModalRelic(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-[#0e1017] border-2 border-[#ff0000]/50 shadow-[0_0_60px_rgba(255,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Image Header */}
            <div className="relative w-full max-h-[50vh] overflow-hidden bg-black flex items-center justify-center">
              <img 
                src={inspectModalRelic.image} 
                alt={inspectModalRelic.title}
                className="w-full h-full object-contain max-h-[50vh]" 
              />
              <button 
                onClick={() => setInspectModalRelic(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black border border-white/20 text-white flex items-center justify-center text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex flex-col gap-4 font-sans">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{inspectModalRelic.glyph}</span>
                    <span className="text-xs font-mono text-[#00d2ff] uppercase font-bold tracking-wider">
                      {inspectModalRelic.archetype} &bull; {inspectModalRelic.aspect}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                    {inspectModalRelic.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-[#8d1a1a]/30 border border-[#8d1a1a] text-[#ff9999] text-xs font-mono font-bold">
                    {inspectModalRelic.rarity}
                  </span>
                  <span className="px-3 py-1 rounded-md bg-[#ffd27f]/10 border border-[#ffd27f]/30 text-[#ffd27f] text-xs font-mono font-bold">
                    PWR {inspectModalRelic.power}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#d1d5db] italic border-l-2 border-[#ff0000] pl-3 leading-relaxed">
                "{inspectModalRelic.quote}"
              </p>

              {/* Incantation Prompt Box */}
              <div className="p-4 rounded-xl bg-[#06080b] border border-[#242830]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-[#70757e] uppercase tracking-wider">
                    Sacred Inscription Prompt
                  </span>
                  <button
                    onClick={(e) => handleCopyPrompt(inspectModalRelic, e)}
                    className="text-xs font-mono text-[#00d2ff] hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    {copiedPromptId === inspectModalRelic.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#10b981]" />
                        <span className="text-[#10b981]">Copied to Grimoire!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-[#cfd3d8] leading-relaxed select-all">
                  {inspectModalRelic.prompt}
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-wrap gap-3 pt-2 justify-end">
                <button
                  onClick={() => {
                    setInspectModalRelic(null);
                    audioFX.playBladeClang();
                    onEnterForge();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#ff2222] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all"
                >
                  <Sword className="w-4 h-4" />
                  <span>Forge in The Crucible</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          CANON LORE SCRIPTURES (PERMANENT READABLE SCRIPTURES)
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
            These scriptures are permanently chronicled here for all seekers to read, study, and contemplate without disappearing.
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
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-[#c26b3a] uppercase font-bold tracking-widest">
                    {chap.num}
                  </span>
                  {activeChapter === chap.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c26b3a]"></span>
                  )}
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

          <div 
            onClick={() => {
              audioFX.playRuneChime();
              onNavigate('about');
            }}
            className="p-5 rounded-2xl bg-[#111318] border border-[#242830] hover:border-[#ff4d4d] cursor-pointer hover:shadow-[0_0_25px_rgba(255,77,77,0.25)] hover:-translate-y-1 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#ff4d4d]/15 flex items-center justify-center text-xl mb-3 text-[#ff4d4d]">
              ✧
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors">
              The Arch-Scribe (About)
            </h4>
            <p className="text-xs text-[#70757e] mt-1.5 leading-relaxed">
              Discover the lore, system specs, Outlier AI background, and creator of The Demon Codex.
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
