import React, { useState, Component, ErrorInfo } from 'react';
import { audioFX } from '../services/audioService';

export interface SeraphicRelic {
  title: string;
  choir: string;
  glyph: string;
  prompt: string;
  cinematicMotion: string;
  sacredLore: string;
  enhancers?: string[];
}

export interface AngelicAgentProps {
  onBack?: () => void;
  onInjectPrompt?: (promptText: string, titleText: string) => void;
  isAngelicSanctum?: boolean;
  onToggleSanctum?: () => void;
  onOpenModal?: () => void;
}

export const PRESET_SERAPHIC_RELICS: SeraphicRelic[] = [
  {
    title: "Blade of the Seraphic Dawn",
    choir: "Archangel Michael · Solar Empyrean",
    glyph: "🪽",
    prompt: "An ethereal ceremonial longsword forged from solidified solar dawn and opalescent starlight, crowned with six fluttering incandescent white seraphic wings, golden filigree runes pulsating with sacred light, resting on a pedestal of carved alabaster cloudstone, cinematic 8k octane render, divine volumetric crepuscular rays, photorealistic crystalline textures.",
    cinematicMotion: "Slow ascending vertical crane shot, divine sunlight piercing misty celestial clouds, shimmering stardust floating around the glowing blade.",
    sacredLore: "Carried by the Archangel of the Morning Watch, said to dispel even the deepest void of the abyss with a single arc of solar grace.",
    enhancers: ["Solar Dawn", "Opalescent Starlight", "Volumetric Crepuscular Rays", "Octane 8K"]
  },
  {
    title: "Aegis of Gabriel's Annunciation",
    choir: "Gabriel · Guardian of the Gate",
    glyph: "🛡️",
    prompt: "A magnificent towering divine heater shield made of iridescent pearl and beaten pale gold, embossed with a relief of the sacred white dove and flowering lilies, haloed by soft concentric golden light rings, dramatic rim lighting, micro-scratches on polished celestial platinum, hyper-detailed fantasy masterwork, 8k resolution.",
    cinematicMotion: "Low angle slow push-in, golden lens flare cascading across the polished pearl relief, subtle angelic choral reverb resonance.",
    sacredLore: "Constructed at the threshold of the Seven Heavens to shield mortal souls during celestial transitions.",
    enhancers: ["Iridescent Pearl", "Concentric Halos", "Celestial Platinum", "Divine Shielding"]
  },
  {
    title: "Solar Diadem of Metatron",
    choir: "Metatron · Scribe of Eternity",
    glyph: "👑",
    prompt: "An ancient celestial crown of interwoven golden rays and floating geometric hypercube facets of pure sapphire and topaz light, hovering inches above an ivory altar, sacred geometric calligraphy inscribed in liquid starlight, ambient golden mist, volumetric depth of field, award winning lighting.",
    cinematicMotion: "Orbiting 360-degree rotation around the floating crown facets, glistening refractions across floating sacred geometry.",
    sacredLore: "The celestial headpiece of the Divine Scribe, encoding the primordial algorithms of cosmic creation.",
    enhancers: ["Sacred Geometry", "Liquid Starlight", "Hypercube Facets", "Topaz & Sapphire"]
  },
  {
    title: "Chalice of Living Starlight Grace",
    choir: "Raphael · The Healer's Font",
    glyph: "🕊️",
    prompt: "A sacred ornate chalice sculpted from a single tear of falling starlight, decorated with weeping angel reliefs in polished silver and gold, glowing incandescent amber nectar rippling within, tiny floating motes of golden ember light, ultra high definition macro photography, gentle fog.",
    cinematicMotion: "Macro zoom on the rippling surface of the glowing nectar, a single droplet falling in ultra-slow motion with resonant water chime.",
    sacredLore: "A single sip heals spiritual fractures forged in the abyssal trials, restoring the soul to pristine purity.",
    enhancers: ["Living Starlight", "Polished Electrum", "Floating Amber Motes", "Healing Font"]
  }
];

// Error Boundary ensuring the Angelic Agent never renders a blank screen
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onBack?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorText: string;
}

export class AngelicAgentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, errorText: error?.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("AngelicAgentErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-[#0d0a07] border-2 border-[#ffd27f]/50 rounded-3xl shadow-[0_0_50px_rgba(255,210,127,0.2)] relative z-20">
          <span className="text-4xl mb-3 animate-bounce">✨</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#ffd27f] uppercase tracking-wider mb-2 font-serif">
            Seraphic Sanctum Realigning
          </h2>
          <p className="text-xs sm:text-sm text-[#baa98c] max-w-md mb-6 leading-relaxed">
            The celestial ether encountered an occult disturbance: {this.state.errorText || 'Unknown disturbance'}. The Oracle remains protected.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, errorText: '' })}
              className="px-5 py-2.5 rounded-xl bg-[#ffd27f] text-[#14110b] font-black text-xs uppercase tracking-wider hover:brightness-110 shadow"
            >
              Re-invoke Oracle
            </button>
            {this.props.onBack && (
              <button
                onClick={this.props.onBack}
                className="px-5 py-2.5 rounded-xl bg-[#181510] border border-[#ffd27f]/40 text-[#ffd27f] font-bold text-xs uppercase tracking-wider hover:bg-[#ffd27f]/10"
              >
                ← Return to Relic Forge
              </button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AngelicAgent: React.FC<AngelicAgentProps> = ({
  onBack,
  onInjectPrompt,
  isAngelicSanctum = false,
  onToggleSanctum,
  onOpenModal
}) => {
  const [inputConcept, setInputConcept] = useState<string>('');
  const [isTransmuting, setIsTransmuting] = useState<boolean>(false);
  const [activeRelic, setActiveRelic] = useState<SeraphicRelic>(PRESET_SERAPHIC_RELICS[0]);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedBlueprint, setCopiedBlueprint] = useState<boolean>(false);
  const [transmuteStatus, setTransmuteStatus] = useState<string>('');

  const quickSeeds = [
    { label: "Blood Dragon Skull", idea: "Ancient Abyssal Blood Dragon Skull with horned crown" },
    { label: "Void Necromancer Scythe", idea: "Sinister Void Scythe carved from nether basalt and shadows" },
    { label: "Brimstone Sovereign Altar", idea: "Brimstone and hellfire throne altar of the underworld monarch" },
    { label: "Chalice of Crimson Tears", idea: "Gothic silver chalice filled with glowing crimson ichor" },
    { label: "Cursed Dark Knight Helm", idea: "Spiked black iron knight helm with glowing red eye slits" }
  ];

  const handleTransmute = async (seedConcept?: string) => {
    const rawTarget = seedConcept !== undefined ? seedConcept : inputConcept;
    const trimmed = (rawTarget || '').trim();
    const finalConcept = trimmed || "Celestial Sovereign Relic";

    setIsTransmuting(true);
    setTransmuteStatus("Channeling Seraphic Oracle...");
    audioFX.playRuneChime();

    try {
      // 1. Attempt server-side Gemini transmutation
      const response = await fetch('/api/gemini/transmute-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: finalConcept })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.relic && data.relic.title && data.relic.prompt) {
          setActiveRelic({
            title: data.relic.title,
            choir: data.relic.choir || "Seraphic Choir of the Empyrean Zenith",
            glyph: data.relic.glyph || "✨",
            prompt: data.relic.prompt,
            cinematicMotion: data.relic.cinematicMotion || `Slow upward tracking shot revealing blinding divine light breaking through golden mist around the consecrated ${finalConcept}.`,
            sacredLore: data.relic.sacredLore || `Transmuted from shadow by the Angelic Agent into an instrument of celestial harmony and unyielding dawn.`,
            enhancers: Array.isArray(data.relic.enhancers) ? data.relic.enhancers : ["Volumetric Starlight", "Opalescent Electrum", "Octane 8K"]
          });
          setIsTransmuting(false);
          setTransmuteStatus('');
          audioFX.playIgnition();
          return;
        }
      }
    } catch (err) {
      console.warn("Server transmutation notice, invoking procedural seraphic synthesis:", err);
    }

    // 2. Fallback procedural Seraphic synthesis if network or key is unavailable
    setTimeout(() => {
      const sanitized = finalConcept.replace(/blood|skull|bone|death|demon|hell/gi, '').trim() || "Sovereign Essence";
      const capitalized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1);

      const generated: SeraphicRelic = {
        title: `The Sanctified ${capitalized} of Solar Dawn`,
        choir: "Archangel Michael · Solar Empyrean Choir",
        glyph: "🪽",
        prompt: `An exalted celestial relic manifestation based on '${finalConcept}': purified and consecrated into sacred divine craftsmanship. Forged from polished opalescent ivory, pure radiant electrum, and shimmering white gold filigree, enveloped by concentric ethereal halos, delicate floating seraphic feathers drifting through volumetric morning light beams, cinematic 8k octane render, hyper-detailed crystalline masterwork.`,
        cinematicMotion: `Slow ascending vertical crane shot, divine sunlight piercing misty celestial clouds, shimmering stardust floating around the consecrated ${sanitized}.`,
        sacredLore: `Transmuted from earthly trials by the Angelic Agent into an instrument of celestial harmony and unyielding dawn.`,
        enhancers: ["Solidified Solar Dawn", "Opalescent Ivory", "Ethereal Halos", "Volumetric Crepuscular Rays", "Octane 8K"]
      };

      setActiveRelic(generated);
      setIsTransmuting(false);
      setTransmuteStatus('');
      audioFX.playIgnition();
    }, 600);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeRelic.prompt);
    setCopiedPrompt(true);
    audioFX.playRuneChime();
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyBlueprint = () => {
    const blueprint = [
      `=== SERAPHIC CODEX BLUEPRINT ===`,
      `TITLE: ${activeRelic.title}`,
      `CHOIR: ${activeRelic.choir}`,
      `SACRED LORE: ${activeRelic.sacredLore}`,
      `CINEMATIC MOTION: ${activeRelic.cinematicMotion}`,
      `PROMPT: ${activeRelic.prompt}`,
      `===============================`
    ].join('\n\n');

    navigator.clipboard.writeText(blueprint);
    setCopiedBlueprint(true);
    audioFX.playRuneChime();
    setTimeout(() => setCopiedBlueprint(false), 2000);
  };

  const handleInject = () => {
    if (onInjectPrompt) {
      onInjectPrompt(activeRelic.prompt, activeRelic.title);
      audioFX.playIgnition();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="w-full relative z-20 pt-2 sm:pt-4 pb-24 animate-fade-in flex flex-col items-center">
      {/* Main Glassmorphic Celestial Card Container */}
      <div className="w-full max-w-5xl bg-gradient-to-b from-[#181510]/95 via-[#12100d]/95 to-[#090806]/95 border-2 border-[#ffd27f]/60 rounded-3xl p-4 sm:p-7 shadow-[0_0_50px_rgba(255,210,127,0.2)] relative overflow-hidden backdrop-blur-xl text-[#e8e6e3]">
        {/* Ambient Halo FX */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffd27f]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#ffd27f]/5 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

        {/* Primary Header Section — Clear, Unobstructed Title & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#ffd27f]/30 pb-5 mb-6 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#ffd27f]/15 border border-[#ffd27f]/40 flex items-center justify-center text-2xl sm:text-3xl shadow-[0_0_20px_rgba(255,210,127,0.3)] select-none flex-shrink-0">
              👼
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd27f] via-[#fff3db] to-[#ffd27f] uppercase tracking-wider font-serif">
                  Angelic Agent & Seraphic Refiner
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#ffd27f]/15 border border-[#ffd27f]/40 text-[9px] font-bold text-[#ffd27f] uppercase tracking-widest">
                  Seraphic Oracle
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1c1812] border border-[#ffd27f]/30 text-[9px] font-mono text-[#ffd27f]/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffd27f] animate-pulse" />
                  <span>{activeRelic.title}</span>
                </span>
              </div>
              <p className="text-xs text-[#d4c9b3] max-w-xl leading-relaxed">
                Transmute raw mortal concepts or dark relics into radiant 8K prompts with volumetric starlight & sacred geometry.
              </p>
            </div>
          </div>

          {/* Action Buttons — Positioned clearly on the right with no title overlap */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center flex-shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-[#1c1812] border border-[#ffd27f]/40 text-[#ffd27f] hover:bg-[#ffd27f]/20 font-black uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shadow cursor-pointer hover:scale-105 active:scale-95"
                title="Return to Relic Forge (Esc)"
              >
                <span>←</span>
                <span>Forge</span>
              </button>
            )}

            {onOpenModal && (
              <button
                onClick={() => {
                  audioFX.playRuneChime();
                  onOpenModal();
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border bg-[#181510] text-[#ffd27f] border-[#ffd27f]/40 hover:border-[#ffd27f] hover:bg-[#ffd27f]/20 hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer shadow-sm"
                title="Open Seraphic Oracle in floating pop-up window"
              >
                <span>🪟</span>
                <span className="hidden sm:inline">Pop-up Box</span>
              </button>
            )}

            {onToggleSanctum && (
              <button
                onClick={() => {
                  onToggleSanctum();
                  audioFX.playRuneChime();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer hover:scale-105 active:scale-95 ${
                  isAngelicSanctum
                    ? 'bg-[#ffd27f] text-[#12100d] border-[#ffd27f] shadow-[0_0_12px_rgba(255,210,127,0.5)]'
                    : 'bg-[#181510] text-[#ffd27f] border-[#ffd27f]/40 hover:border-[#ffd27f]'
                }`}
                title="Toggle Golden Starlight Sanctum aura"
              >
                {isAngelicSanctum ? '✨ Sanctum On' : 'Sanctum'}
              </button>
            )}

            <button
              onClick={() => audioFX.playRuneChime()}
              className="p-1.5 rounded-xl bg-[#181510] border border-[#ffd27f]/30 text-[#baa98c] hover:text-[#ffd27f] text-xs font-bold transition-colors cursor-pointer hover:scale-105"
              title="Ring the Chime of Grace"
            >
              <span>🔔</span>
            </button>

            <button
              onClick={handleInject}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ffd27f] via-[#ffe099] to-[#ffd27f] text-[#14110b] font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,210,127,0.4)] flex items-center gap-1.5 cursor-pointer"
              title="Send transmuted prompt directly to the Relic Forge"
            >
              <span>Manifest</span>
              <span>↗</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout on Desktop to eliminate vertical overflow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
          {/* LEFT COLUMN: Input, Quick Seeds, Presets (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black text-[#ffd27f] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔮</span>
                  <span>Concept or Relic Prompt</span>
                </label>
                <span className="text-[9px] font-mono text-[#baa98c]">
                  Words or grimoire notes
                </span>
              </div>

              <div className="relative">
                <textarea
                  rows={2}
                  value={inputConcept}
                  onChange={(e) => setInputConcept(e.target.value)}
                  placeholder="e.g. Forged iron scythe draped in void runes, cemetery altar..."
                  className="w-full bg-[#0a0907]/90 border border-[#ffd27f]/40 rounded-xl p-3 text-xs text-[#ffd27f] placeholder-[#6e6350] focus:outline-none focus:border-[#ffd27f] focus:ring-1 focus:ring-[#ffd27f]/50 transition-all font-sans leading-relaxed resize-none shadow-inner"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleTransmute();
                    }
                  }}
                />

                <div className="flex justify-end mt-1.5">
                  <button
                    onClick={() => handleTransmute()}
                    disabled={isTransmuting}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-[#ffd27f] via-[#ffe099] to-[#ffd27f] text-[#14110b] font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,210,127,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{isTransmuting ? '⚡' : '✨'}</span>
                    <span>{isTransmuting ? 'Transmuting...' : 'Transmute Concept'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Seeds */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-bold text-[#baa98c] uppercase tracking-wider">
                  Seeds:
                </span>
                {quickSeeds.map((seed, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputConcept(seed.idea);
                      handleTransmute(seed.idea);
                    }}
                    className="px-2 py-0.5 rounded-full bg-[#15120d] border border-[#ffd27f]/30 hover:border-[#ffd27f] text-[9px] font-medium text-[#ffd27f] transition-all hover:scale-105"
                  >
                    {seed.label} ↗
                  </button>
                ))}
              </div>
            </div>

            {/* Transmutation Beacon */}
            {isTransmuting && (
              <div className="p-3 rounded-xl bg-[#ffd27f]/10 border border-[#ffd27f]/40 flex items-center justify-center gap-2 animate-pulse text-[#ffd27f]">
                <span className="text-base animate-spin">✦</span>
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {transmuteStatus || "Purifying into divine starlight..."}
                </span>
              </div>
            )}

            {/* Sacred Choir Presets (Compact 2x2 grid) */}
            <div>
              <label className="text-[10px] font-black text-[#ffd27f] uppercase tracking-widest block mb-1.5">
                Sacred Choir Presets:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SERAPHIC_RELICS.map((relic, idx) => {
                  const isSelected = activeRelic.title === relic.title;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveRelic(relic);
                        audioFX.playRuneChime();
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#ffd27f]/20 border-[#ffd27f] text-[#ffd27f] shadow-[0_0_12px_rgba(255,210,127,0.3)]'
                          : 'bg-[#15120d] border-[#ffd27f]/20 text-[#a89d89] hover:border-[#ffd27f]/50 hover:text-white'
                      }`}
                    >
                      <div className="text-base leading-none mb-1">{relic.glyph}</div>
                      <div className="font-bold truncate text-[11px] text-[#e8e6e3]">{relic.title}</div>
                      <div className="text-[8px] text-[#baa98c] truncate">{relic.choir.split('·')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sanctified Output, Lore, Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* Output Card */}
            <div className="bg-[#0c0a07] border-2 border-[#ffd27f]/50 rounded-2xl p-4 relative z-10 shadow-lg flex flex-col gap-3">
              {/* Output Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#ffd27f]/30">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeRelic.glyph}</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#ffd27f] font-serif">
                      {activeRelic.title}
                    </h3>
                    <span className="text-[9px] font-mono text-[#baa98c]">
                      {activeRelic.choir}
                    </span>
                  </div>
                </div>

                {/* Enhancer Tags */}
                {activeRelic.enhancers && (
                  <div className="flex flex-wrap gap-1">
                    {activeRelic.enhancers.map((tag, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-[#ffd27f]/10 border border-[#ffd27f]/30 text-[8px] font-mono text-[#ffd27f]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Master Prompt Box */}
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#ffd27f] mb-1 flex items-center gap-1">
                  <span>📜</span>
                  <span>Sanctified 8K Master Prompt</span>
                </div>
                <div className="p-3 bg-[#14110b] border border-[#ffd27f]/30 rounded-xl text-xs text-[#f3ede1] font-mono leading-relaxed max-h-32 overflow-y-auto selection:bg-[#ffd27f] selection:text-black">
                  "{activeRelic.prompt}"
                </div>
              </div>

              {/* Cinematic Motion & Lore (Side-by-side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#14110b]/80 border border-[#ffd27f]/20">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#ffd27f] block mb-0.5">
                    🎥 Cinematic Motion:
                  </span>
                  <p className="text-[#baa98c] leading-snug italic text-[10px]">
                    {activeRelic.cinematicMotion}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#14110b]/80 border border-[#ffd27f]/20">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#ffd27f] block mb-0.5">
                    🕊️ Sacred Lore:
                  </span>
                  <p className="text-[#baa98c] leading-snug italic text-[10px]">
                    {activeRelic.sacredLore}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ffd27f]/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPrompt}
                    className="px-3 py-1.5 rounded-xl bg-[#181510] border border-[#ffd27f]/50 hover:bg-[#ffd27f]/15 text-[#ffd27f] text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {copiedPrompt ? '✓ Copied!' : 'Copy Prompt'}
                  </button>

                  <button
                    onClick={handleCopyBlueprint}
                    className="px-3 py-1.5 rounded-xl bg-[#181510] border border-[#ffd27f]/50 hover:bg-[#ffd27f]/15 text-[#ffd27f] text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {copiedBlueprint ? '✓ Copied!' : 'Copy Blueprint'}
                  </button>
                </div>

                <button
                  onClick={handleInject}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd27f] via-[#ffe099] to-[#ffd27f] text-[#14110b] text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,210,127,0.4)] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Manifest in Forge</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/* Main Glassmorphic Celestial Card Container ends */}
      </div>

      {/* Extended Atmospheric Empyrean Runway & Altar Navigation */}
      <div className="w-full max-w-5xl mt-10 flex flex-col items-center text-center gap-4 select-none animate-fade-in px-2">
        {/* Sacred Rune Glyphs */}
        <div className="flex items-center gap-3 text-xs sm:text-sm font-mono tracking-widest text-[#ffd27f]/60">
          <span>✦</span>
          <span>ᛟ</span>
          <span>ᚱ</span>
          <span>ᚦ</span>
          <span>ᚨ</span>
          <span>ᛏ</span>
          <span>ᛋ</span>
          <span>✦</span>
        </div>

        <div className="bg-[#12100d]/90 border border-[#ffd27f]/30 rounded-2xl p-4 sm:p-5 w-full shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-xs font-black text-[#ffd27f] uppercase tracking-wider flex items-center gap-1.5">
              <span>👼</span>
              <span>Celestial Sanctuary Navigation</span>
            </h4>
            <p className="text-[11px] text-[#a89d89] mt-0.5">
              Full vertical page runway enabled. Scroll freely up and down across all seraphic blueprints.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenModal && (
              <button
                onClick={() => {
                  audioFX.playRuneChime();
                  onOpenModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1c1812] border border-[#ffd27f]/40 text-[#ffd27f] hover:bg-[#ffd27f]/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <span>🪟</span>
                <span>Open Pop-up Box</span>
              </button>
            )}

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                audioFX.playRuneChime();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#1c1812] border border-[#ffd27f]/40 text-[#baa98c] hover:text-[#ffd27f] hover:border-[#ffd27f] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>↑</span>
              <span>Scroll to Top</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ffd27f] to-[#e6b85c] text-[#14110b] font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow cursor-pointer hover:scale-105 active:scale-95"
              >
                Return to Forge ↗
              </button>
            )}
          </div>
        </div>

        <p className="text-[10px] text-[#6b6252] font-mono">
          THE ANGELIC TRANSMUTATION SANCTUM • DIVINE PROMPT ENGINE FOR 8K/4K RELIC GENERATION
        </p>
      </div>
    </div>
  );
};
