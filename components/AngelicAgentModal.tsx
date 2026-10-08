import React, { useState, useEffect } from 'react';
import { audioFX } from '../services/audioService';

interface AngelicAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectPrompt?: (promptText: string, titleText: string) => void;
  onExpandView?: () => void;
  isAngelicSanctum?: boolean;
  onToggleSanctum?: () => void;
}

interface SeraphicRelic {
  title: string;
  choir: string;
  glyph: string;
  prompt: string;
  cinematicMotion: string;
  sacredLore: string;
}

const PRESET_RELICS: SeraphicRelic[] = [
  {
    title: "Blade of the Seraphic Dawn",
    choir: "Archangel Michael · Solar Empyrean",
    glyph: "🪽",
    prompt: "An ethereal ceremonial longsword forged from solidified solar dawn and opalescent starlight, crowned with six fluttering incandescent white seraphic wings, golden filigree runes pulsating with sacred light, resting on a pedestal of carved alabaster cloudstone, cinematic 8k octane render, divine volumetric crepuscular rays, photorealistic crystalline textures.",
    cinematicMotion: "Slow ascending vertical crane shot, divine sunlight piercing misty celestial clouds, shimmering stardust floating around the glowing blade.",
    sacredLore: "Carried by the Archangel of the Morning Watch, said to dispel even the deepest void of the abyss with a single arc of solar grace."
  },
  {
    title: "Aegis of Gabriel's Annunciation",
    choir: "Gabriel · Guardian of the Gate",
    glyph: "🛡️",
    prompt: "A magnificent towering divine heater shield made of iridescent pearl and beaten pale gold, embossed with a relief of the sacred white dove and flowering lilies, haloed by soft concentric golden light rings, dramatic rim lighting, micro-scratches on polished celestial platinum, hyper-detailed fantasy masterwork, 8k resolution.",
    cinematicMotion: "Low angle slow push-in, golden lens flare cascading across the polished pearl relief, subtle angelic choral reverb resonance.",
    sacredLore: "Constructed at the threshold of the Seven Heavens to shield mortal souls during celestial transitions."
  },
  {
    title: "Solar Diadem of Metatron",
    choir: "Metatron · Scribe of Eternity",
    glyph: "👑",
    prompt: "An ancient celestial crown of interwoven golden rays and floating geometric hypercube facets of pure sapphire and topaz light, hovering inches above an ivory altar, sacred geometric calligraphy inscribed in liquid starlight, ambient golden mist, volumetric depth of field, award winning lighting.",
    cinematicMotion: "Orbiting 360-degree rotation around the floating crown facets, glistening refractions across floating sacred geometry.",
    sacredLore: "The celestial headpiece of the Divine Scribe, encoding the primordial algorithms of cosmic creation."
  },
  {
    title: "Chalice of Living Starlight Grace",
    choir: "Raphael · The Healer's Font",
    glyph: "🕊️",
    prompt: "A sacred ornate chalice sculpted from a single tear of falling starlight, decorated with weeping angel reliefs in polished silver and gold, glowing incandescent amber nectar rippling within, tiny floating motes of golden ember light, ultra high definition macro photography, gentle fog.",
    cinematicMotion: "Macro zoom on the rippling surface of the glowing nectar, a single droplet falling in ultra-slow motion with resonant water chime.",
    sacredLore: "A single sip heals spiritual fractures forged in the abyssal trials, restoring the soul to pristine purity."
  }
];

export const AngelicAgentModal: React.FC<AngelicAgentModalProps> = ({
  isOpen,
  onClose,
  onInjectPrompt,
  onExpandView,
  isAngelicSanctum = false,
  onToggleSanctum
}) => {
  const [inputConcept, setInputConcept] = useState('');
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [activeRelic, setActiveRelic] = useState<SeraphicRelic>(PRESET_RELICS[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleTransmute = () => {
    setIsTransmuting(true);
    audioFX.playRuneChime();

    setTimeout(() => {
      const trimmed = inputConcept.trim();
      const baseName = trimmed ? trimmed : "Celestial Sovereign";

      const newRelic: SeraphicRelic = {
        title: `The Sanctified ${baseName.charAt(0).toUpperCase() + baseName.slice(1)} of Grace`,
        choir: "Seraphic Choir of the Empyrean Zenith",
        glyph: "✨",
        prompt: `An exalted celestial relic manifestation based on '${baseName}': transformed into sacred divine craftsmanship. Forged from polished opalescent ivory, pure radiant electrum and white gold, enveloped by concentric ethereal halos, delicate floating seraphic feathers drifting through volumetric morning light beams, cinematic 8k, hyper-detailed, octane render masterwork.`,
        cinematicMotion: `Slow upward tracking shot revealing blinding divine light breaking through golden mist around the consecrated ${baseName}.`,
        sacredLore: `Transmuted from shadowy origins by the Angelic Agent into an instrument of celestial harmony and unyielding dawn.`
      };

      setActiveRelic(newRelic);
      setIsTransmuting(false);
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeRelic.prompt);
    setCopied(true);
    audioFX.playRuneChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInject = () => {
    if (onInjectPrompt) {
      onInjectPrompt(activeRelic.prompt, activeRelic.title);
      audioFX.playIgnition();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-b from-[#181510] via-[#12100d] to-[#0a0907] border-2 border-[#ffd27f]/70 rounded-3xl max-w-2xl w-full max-h-[86vh] flex flex-col shadow-[0_0_60px_rgba(255,210,127,0.35)] relative text-[#e8e6e3] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle angelic ambient halo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd27f]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffd27f]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Modal Header — Permanently attached at the top of the box */}
        <div className="flex items-center justify-between border-b border-[#ffd27f]/30 px-4 py-3 sm:px-6 sm:py-3.5 bg-[#181510] flex-shrink-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="angelic-agent text-base sm:text-lg font-black tracking-wider flex items-center gap-1.5 select-none text-[#ffd27f] drop-shadow-[0_0_12px_rgba(255,210,127,0.5)] truncate">
              <span>👼</span>
              <span>Angelic Agent</span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#ffd27f]/15 border border-[#ffd27f]/40 text-[9px] font-bold text-[#ffd27f] uppercase tracking-widest flex-shrink-0">
              Seraphic Oracle
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onExpandView && (
              <button
                onClick={onExpandView}
                className="px-2.5 py-1 rounded-full bg-[#ffd27f]/10 border border-[#ffd27f]/40 text-[#ffd27f] hover:bg-[#ffd27f]/25 text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                title="Expand to Full Page Sanctum View"
              >
                <span>📜</span>
                <span className="hidden sm:inline">Full Page</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffd27f]/15 border border-[#ffd27f]/50 hover:bg-[#ffd27f]/30 text-[#ffd27f] hover:text-white flex items-center justify-center transition-all font-black text-xs sm:text-sm shadow-[0_0_12px_rgba(255,210,127,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
              title="Close Seraphic Sanctum (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content Body — Scrolls smoothly up and down INSIDE the box */}
        <div className="p-4 sm:p-6 space-y-4 flex-grow overflow-y-auto custom-scrollbar">
          <p className="text-xs text-[#d4c9b3] leading-relaxed relative z-10">
            Channel the celestial counterpart of the Demon Codex. Transmute shadow, brimstone, and abyssal concepts into radiant, sacred master prompts for 8K rendering and cinematic generation.
          </p>

          {/* Sanctum Mode Quick Toggle */}
          <div className="p-3.5 bg-[#ffd27f]/10 border border-[#ffd27f]/30 rounded-xl flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">✨</span>
              <div>
                <div className="text-xs font-black text-[#ffd27f] uppercase tracking-wider">
                  Celestial Sanctum Embers
                </div>
                <div className="text-[11px] text-[#baa98c]">
                  Bathes the entire Codex in floating golden starlight & sacred angelic runes
                </div>
              </div>
            </div>
            {onToggleSanctum && (
              <button
                onClick={() => {
                  onToggleSanctum();
                  audioFX.playRuneChime();
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer hover:scale-105 active:scale-95 ${
                  isAngelicSanctum
                    ? 'bg-[#ffd27f] text-[#12100d] border-[#ffd27f] shadow-[0_0_15px_rgba(255,210,127,0.5)]'
                    : 'bg-[#181510] text-[#ffd27f] border-[#ffd27f]/40 hover:border-[#ffd27f]'
                }`}
              >
                {isAngelicSanctum ? 'SANCTUM ON' : 'ACTIVATE'}
              </button>
            )}
          </div>

          {/* Preset Relic Pills */}
          <div className="relative z-10">
            <label className="text-[10px] font-black text-[#ffd27f] uppercase tracking-widest block mb-2">
              Sacred Choir Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_RELICS.map((relic, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveRelic(relic);
                    audioFX.playRuneChime();
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    activeRelic.title === relic.title
                      ? 'bg-[#ffd27f]/20 border-[#ffd27f] text-[#ffd27f] shadow-[0_0_12px_rgba(255,210,127,0.3)]'
                      : 'bg-[#181510] border-[#ffd27f]/20 text-[#a89d89] hover:border-[#ffd27f]/50 hover:text-white'
                  }`}
                >
                  <div className="text-base mb-1">{relic.glyph}</div>
                  <div className="font-bold truncate text-[11px]">{relic.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Transmutation Input */}
          <div className="relative z-10">
            <label className="text-[10px] font-black text-[#ffd27f] uppercase tracking-widest block mb-1.5">
              Transmute Any Demon / Abyssal Concept:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputConcept}
                onChange={(e) => setInputConcept(e.target.value)}
                placeholder="e.g., Blood Dragon Skull, Void Scythe, Abyssal Throne..."
                className="flex-grow bg-[#0f0d0a] border border-[#ffd27f]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#ffd27f] placeholder:text-[#6e6350] focus:outline-none focus:border-[#ffd27f] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleTransmute()}
              />
              <button
                onClick={handleTransmute}
                disabled={isTransmuting}
                className="px-4 py-2 bg-gradient-to-r from-[#ffd27f] to-[#e6b85c] text-[#14110b] font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,210,127,0.3)] whitespace-nowrap cursor-pointer"
              >
                {isTransmuting ? 'Transmuting...' : '✨ Purify'}
              </button>
            </div>
          </div>

          {/* Active Seraphic Relic Card Display */}
          <div className="p-4 sm:p-5 bg-[#0d0c09] border border-[#ffd27f]/40 rounded-2xl relative z-10 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-black text-[#ffd27f] flex items-center gap-1.5">
                <span className="text-lg">{activeRelic.glyph}</span>
                <span>{activeRelic.title}</span>
              </div>
              <span className="text-[10px] text-[#a89d89] font-mono italic">
                {activeRelic.choir}
              </span>
            </div>
            <p className="text-xs text-[#d6cdbd] leading-relaxed mb-3 font-mono selection:bg-[#ffd27f] selection:text-black">
              "{activeRelic.prompt}"
            </p>
            <div className="text-[11px] text-[#ffd27f]/80 italic border-t border-[#ffd27f]/20 pt-2.5 flex items-center gap-1.5">
              <span>📜</span>
              <span>{activeRelic.sacredLore}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer — Permanently attached to the bottom of the box */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-t border-[#ffd27f]/30 bg-[#12100d] flex-shrink-0 z-10 rounded-b-3xl">
          <button
            onClick={() => audioFX.playRuneChime()}
            className="text-[11px] text-[#baa98c] hover:text-[#ffd27f] flex items-center gap-1 font-bold transition-colors cursor-pointer"
          >
            <span>🔔</span>
            <span>Chime of Grace</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 sm:py-2 bg-[#181510] border border-[#ffd27f]/50 hover:bg-[#ffd27f]/10 text-[#ffd27f] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              {copied ? '✓ Prompt Copied!' : 'Copy Prompt'}
            </button>
            {onInjectPrompt && (
              <button
                onClick={handleInject}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#ffd27f] via-[#ffe099] to-[#ffd27f] text-[#14110b] text-xs font-black uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,210,127,0.4)] cursor-pointer"
              >
                Manifest in Forge ↗
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
