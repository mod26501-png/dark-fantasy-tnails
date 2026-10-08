import React from 'react';
import { playRuneHum, playBladeClang } from '../utils/soundEffects';

export interface ArcaneModifier {
    id: string;
    label: string;
    icon: string;
    snippet: string;
    glowColor: string;
}

export const ARCANE_MODIFIERS: ArcaneModifier[] = [
    {
        id: 'blood-steel',
        label: 'Blood-Forged Steel',
        icon: '⚔️',
        snippet: 'damascus steel forged in abyssal blood, crimson metallic reflections, razor battle-worn edges, demonic runes engraved',
        glowColor: '#ff0000'
    },
    {
        id: 'eldritch-void',
        label: 'Eldritch Void',
        icon: '🌌',
        snippet: 'swirling cosmic void, dark matter tendrils, bioluminescent eldritch eyes in shadows, non-euclidean abyssal architecture',
        glowColor: '#a855f7'
    },
    {
        id: 'abyssal-fog',
        label: 'Abyssal Fog',
        icon: '🌫️',
        snippet: 'dense volumetric graveyard fog, atmospheric rim lighting, spectral silhouette in mist, gloomy chiaroscuro shadows',
        glowColor: '#00d2ff'
    },
    {
        id: 'octane-unreal',
        label: '8K Octane Unreal',
        icon: '✨',
        snippet: 'hyper-detailed 8K octane render, raytraced subsurface scattering, cinematic dramatic lighting, sharp photorealistic microtextures',
        glowColor: '#ffaa00'
    },
    {
        id: 'cyber-grimdark',
        label: 'Cyber-Grimdark',
        icon: '⚡',
        snippet: 'industrial cyber-gothic biomechanical armor, decaying neon conduits, scorched copper wiring, dystopian dark fantasy aesthetic',
        glowColor: '#ef4444'
    },
    {
        id: 'necrotic-gold',
        label: 'Necrotic Gold',
        icon: '👑',
        snippet: 'tarnished sovereign gold filigree, corrupted gilded patina, ancient cursed royal regalia, ornate cathedral relief sculptures',
        glowColor: '#c26b3a'
    }
];

interface ArcaneModifiersProps {
    onSelectModifier: (snippet: string) => void;
    activeSnippets?: string[];
}

export const ArcaneModifiers: React.FC<ArcaneModifiersProps> = ({
    onSelectModifier,
    activeSnippets = []
}) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] flex items-center gap-1.5">
                    <span>⚡ Arcane Modifiers</span>
                    <span className="text-[8px] bg-[#1c2029] text-[#00d2ff] px-1.5 py-0.5 rounded font-mono">1-CLICK INJECT</span>
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {ARCANE_MODIFIERS.map((mod) => {
                    const isSelected = activeSnippets.some(s => s.includes(mod.label) || s.includes(mod.snippet));
                    return (
                        <button
                            key={mod.id}
                            type="button"
                            onMouseEnter={() => playRuneHum()}
                            onClick={() => {
                                playBladeClang();
                                onSelectModifier(mod.snippet);
                            }}
                            className={`p-2 rounded-xl text-left transition-all border group flex flex-col gap-1 relative overflow-hidden ${
                                isSelected
                                    ? 'bg-[#1a1318] border-[#ff0000] shadow-[0_0_15px_rgba(255,0,0,0.3)] scale-[1.02]'
                                    : 'bg-[#0e1015] border-[#242830] hover:border-[#8d1a1a] hover:bg-[#15171f]'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="text-base group-hover:scale-110 transition-transform">{mod.icon}</span>
                                <span className="text-[8px] font-mono text-[#70757e] group-hover:text-white uppercase">ADD +</span>
                            </div>
                            <span className="text-[11px] font-bold text-white leading-tight group-hover:text-[#ff4d4d] transition-colors">
                                {mod.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ArcaneModifiers;
