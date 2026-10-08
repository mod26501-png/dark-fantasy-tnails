import React, { useState } from 'react';
import { audioFX } from '../services/audioService';

export interface PurgeRune {
    id: string;
    label: string;
    banishSnippet: string;
    description: string;
}

export const PURGE_RUNES: PurgeRune[] = [
    {
        id: 'lowres',
        label: 'Purge: Low-Res & Artifacts',
        banishSnippet: 'low-res, jpeg artifacts, blurry, pixelated, distorted, compression noise',
        description: 'Banish digital compression artifacts and blur'
    },
    {
        id: 'anatomy',
        label: 'Banish: Extra Limbs & Deformed Anatomy',
        banishSnippet: 'extra limbs, mutated hands, deformed fingers, anatomical defects, fused limbs, missing fingers',
        description: 'Exorcise anatomical mutations and multi-limbed defects'
    },
    {
        id: 'plastic',
        label: 'Exorcise: Over-smoothed 3D Plastic & CGI Sheen',
        banishSnippet: '3d render, plastic skin, cgi sheen, cartoon, doll-like, unreal engine gloss, smooth artificial texture',
        description: 'Eliminate sterile digital 3D plastic looks'
    },
    {
        id: 'washedout',
        label: 'Purge: Washed Out Colors & Gray Mist',
        banishSnippet: 'washed out, desaturated, muddy gray, dull lighting, flat lighting, low contrast, bland background',
        description: 'Banish flat, murky gray washes in favor of rich contrast'
    },
    {
        id: 'watermarks',
        label: 'Banish: Watermarks & Text Overlays',
        banishSnippet: 'watermarks, signatures, text overlays, labels, logo, usernames, UI borders, font stamps',
        description: 'Expel unwanted text stamps, signatures, and stock watermarks'
    },
    {
        id: 'facial',
        label: 'Purge: Asymmetrical Eyes & Blurry Faces',
        banishSnippet: 'asymmetrical eyes, cross-eyed, blurry face, bad anatomy, deformed iris, distorted visage, melted features',
        description: 'Ensure grim anatomical precision in facial relic features'
    }
];

export interface PositiveAmplifier {
    category: 'lighting' | 'texture' | 'camera';
    tag: string;
    snippet: string;
}

export const POSITIVE_AMPLIFIERS: PositiveAmplifier[] = [
    // Lighting
    { category: 'lighting', tag: 'Chiaroscuro', snippet: 'volumetric chiaroscuro deep shadows' },
    { category: 'lighting', tag: 'Crepuscular Rays', snippet: 'crepuscular sunbeams piercing black clouds' },
    { category: 'lighting', tag: 'Bioluminescent Spores', snippet: 'bioluminescent glowing azure spores' },
    { category: 'lighting', tag: 'Rim-Lit Eclipse', snippet: 'intense rim-lit blood eclipse backlight' },
    { category: 'lighting', tag: 'Ember Glow', snippet: 'smoldering ember warmth on dark edges' },

    // Texture
    { category: 'texture', tag: 'Eldritch Basalt', snippet: 'weathered eldritch basalt stone texture' },
    { category: 'texture', tag: 'Cracked Alabaster', snippet: 'ancient cracked alabaster marble' },
    { category: 'texture', tag: 'Damascus Filigree', snippet: 'intricate forged damascus steel filigree' },
    { category: 'texture', tag: 'Obsidian Glass', snippet: 'sharp reflective black obsidian glass facets' },
    { category: 'texture', tag: 'Ancient Patina', snippet: 'verdigris bronze patina and oxidized gold' },

    // Camera / Optics
    { category: 'camera', tag: '85mm Anamorphic', snippet: '85mm anamorphic prime lens, subtle streak bokeh' },
    { category: 'camera', tag: 'Octane Macro', snippet: 'extreme macro octane depth of field' },
    { category: 'camera', tag: 'Panoramic Crane', snippet: 'high-angle panoramic ascending crane view' },
    { category: 'camera', tag: 'Dutch Angle', snippet: 'dramatic Dutch angle tension composition' },
    { category: 'camera', tag: 'Extreme Detail', snippet: 'tactile 8k microscopic surface clarity' }
];

interface DualCrucibleProps {
    prompt: string;
    onPromptChange: (newPrompt: string) => void;
    negativePrompt: string;
    onNegativePromptChange: (newNegative: string) => void;
    disabled?: boolean;
}

export const DualCrucible: React.FC<DualCrucibleProps> = ({
    prompt,
    onPromptChange,
    negativePrompt,
    onNegativePromptChange,
    disabled = false
}) => {
    const [isAnathemaOpen, setIsAnathemaOpen] = useState(true);
    const [activeCategory, setActiveCategory] = useState<'lighting' | 'texture' | 'camera'>('lighting');

    // Toggle Positive Amplifier
    const handleToggleAmplifier = (snippet: string) => {
        audioFX.playStoneRuneThud();
        const current = prompt.trim();

        if (current.includes(snippet)) {
            // Remove snippet cleanly
            const regex = new RegExp(`(,?\\s*${snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
            let updated = current.replace(regex, '').trim();
            if (updated.startsWith(',')) updated = updated.substring(1).trim();
            if (updated.endsWith(',')) updated = updated.slice(0, -1).trim();
            onPromptChange(updated);
        } else {
            // Append snippet
            if (!current) {
                onPromptChange(snippet);
            } else {
                onPromptChange(`${current}, ${snippet}`);
            }
        }
    };

    // Check if positive amplifier is active in prompt
    const isAmplifierActive = (snippet: string) => {
        return prompt.toLowerCase().includes(snippet.toLowerCase());
    };

    // Toggle Purge Rune in Negative Prompt
    const handleTogglePurgeRune = (rune: PurgeRune) => {
        const current = negativePrompt.trim();
        const snippet = rune.banishSnippet;

        if (current.toLowerCase().includes(snippet.toLowerCase())) {
            // Remove
            audioFX.playPurgeBanish();
            const regex = new RegExp(`(,?\\s*${snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            let updated = current.replace(regex, '').trim();
            if (updated.startsWith(',')) updated = updated.substring(1).trim();
            if (updated.endsWith(',')) updated = updated.slice(0, -1).trim();
            onNegativePromptChange(updated);
        } else {
            // Add
            audioFX.playPurgeBanish();
            if (!current) {
                onNegativePromptChange(snippet);
            } else {
                onNegativePromptChange(`${current}, ${snippet}`);
            }
        }
    };

    const isPurgeRuneActive = (rune: PurgeRune) => {
        return negativePrompt.toLowerCase().includes(rune.banishSnippet.toLowerCase());
    };

    const activePurgeCount = PURGE_RUNES.filter(isPurgeRuneActive).length;

    return (
        <div className="w-full flex flex-col gap-4 mt-2">
            {/* ━━━ DUAL CRUCIBLE CONTAINER ━━━ */}
            <div className="w-full rounded-2xl bg-[#090b10] border border-[#242830] overflow-hidden shadow-2xl">
                
                {/* 1. TOP PANE: THE SACRED SUMMONING (Positive Aesthetic Amplifiers) */}
                <div className="p-4 sm:p-5 bg-gradient-to-b from-[#11141c] to-[#0d0f15] border-b border-[#242830]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] shadow-[0_0_10px_#00d2ff]" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#00d2ff]">
                                THE SACRED SUMMONING
                            </span>
                            <span className="text-[10px] font-mono text-[#70757e] hidden sm:inline">
                                &bull; Positive Aesthetic Amplifiers
                            </span>
                        </div>

                        {/* Category Sub-tabs */}
                        <div className="flex items-center gap-1 bg-[#090b10] p-1 rounded-lg border border-[#242830] self-start sm:self-auto">
                            {(['lighting', 'texture', 'camera'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        audioFX.playStoneRuneThud();
                                        setActiveCategory(cat);
                                    }}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                                        activeCategory === cat
                                            ? 'bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40 shadow-sm'
                                            : 'text-[#70757e] hover:text-white'
                                    }`}
                                >
                                    {cat === 'lighting' ? '⚡ Lighting' : cat === 'texture' ? '🗿 Texture' : '🎥 Optics'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Positive Chips for Selected Category */}
                    <div className="flex flex-wrap gap-2">
                        {POSITIVE_AMPLIFIERS.filter(a => a.category === activeCategory).map((amp) => {
                            const active = isAmplifierActive(amp.snippet);
                            return (
                                <button
                                    key={amp.tag}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleToggleAmplifier(amp.snippet)}
                                    title={amp.snippet}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 select-none ${
                                        active
                                            ? 'bg-[#00d2ff]/25 border border-[#00d2ff] text-white shadow-[0_0_12px_rgba(0,210,255,0.4)] scale-105'
                                            : 'bg-[#181c26]/70 border border-[#242830] text-[#8d929b] hover:text-white hover:border-[#00d2ff]/50 hover:bg-[#181c26]'
                                    }`}
                                >
                                    <span>{active ? '✦' : '✧'}</span>
                                    <span>{amp.tag}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. BOTTOM PANE: THE ANATHEMA (BANISHED SEAL) */}
                <div className="bg-[#0b0808]/90 border-t border-[#8d1a1a]/40">
                    {/* Drawer Accordion Header */}
                    <button
                        type="button"
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setIsAnathemaOpen(!isAnathemaOpen);
                        }}
                        className="w-full px-4 sm:px-5 py-3 flex items-center justify-between hover:bg-[#8d1a1a]/10 transition-colors select-none group"
                    >
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ff0000] shadow-[0_0_10px_#ff0000] animate-pulse" />
                            <div className="text-left">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#ff4d4d] group-hover:text-white transition-colors flex items-center gap-2">
                                    THE ANATHEMA (BANISHED SEAL)
                                    {activePurgeCount > 0 && (
                                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff0000]/20 border border-[#ff0000]/50 text-[#ff7b7b] font-mono">
                                            {activePurgeCount} SEAL{activePurgeCount > 1 ? 'S' : ''} ACTIVE
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8d929b] font-mono">
                            <span className="hidden sm:inline text-[10px]">
                                {isAnathemaOpen ? 'Collapse Negative Crucible' : 'Expand Banished Crucible'}
                            </span>
                            <span className={`transform transition-transform duration-300 text-sm ${isAnathemaOpen ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                    </button>

                    {/* Drawer Content */}
                    {isAnathemaOpen && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 space-y-4 animate-fade-in border-t border-[#8d1a1a]/20">
                            {/* Negative Prompt Input Area */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#cf7070] flex items-center gap-1.5">
                                        <span>⚔️ Banished Negative Prompt</span>
                                    </label>
                                    {negativePrompt.trim() && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                audioFX.playPurgeBanish();
                                                onNegativePromptChange('');
                                            }}
                                            className="text-[9px] font-mono text-[#70757e] hover:text-[#ff4d4d] transition-colors uppercase tracking-wider"
                                        >
                                            Purge All Seals
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    value={negativePrompt}
                                    onChange={(e) => onNegativePromptChange(e.target.value)}
                                    placeholder="Declare what shall be banished from existence (e.g. low-res, extra limbs, plastic gloss, artifacts)..."
                                    disabled={disabled}
                                    rows={2}
                                    className="w-full p-3.5 rounded-xl border border-[#8d1a1a]/50 focus:border-[#ff4d4d] focus:ring-2 focus:ring-[#ff0000]/20 transition-all bg-[#140b0b]/90 text-sm text-[#ffdede] placeholder:text-[#6e4848] focus:outline-none shadow-inner"
                                />
                            </div>

                            {/* 1-Click Purge Runes Grid */}
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-[#cf7070] mb-2 flex items-center gap-1.5">
                                    <span>🚫 1-Click Purge Runes</span>
                                    <span className="text-[9px] text-[#70757e] font-sans lowercase">(click to toggle banishment)</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {PURGE_RUNES.map((rune) => {
                                        const active = isPurgeRuneActive(rune);
                                        return (
                                            <button
                                                key={rune.id}
                                                type="button"
                                                disabled={disabled}
                                                onClick={() => handleTogglePurgeRune(rune)}
                                                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden select-none group ${
                                                    active
                                                        ? 'bg-gradient-to-r from-[#8d1a1a]/40 to-[#c26b3a]/30 border-[#ff4d4d] text-white shadow-[0_0_15px_rgba(255,0,0,0.3)] ring-1 ring-[#ff0000]/40'
                                                        : 'bg-[#140d0d]/80 border-[#3d1818] text-[#a89090] hover:border-[#8d1a1a] hover:text-white hover:bg-[#1a0f0f]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <span className="text-xs font-black flex items-center gap-1.5 truncate">
                                                        <span className={active ? 'text-[#ff4d4d]' : 'text-[#70757e]'}>
                                                            {active ? '⛔' : '🚫'}
                                                        </span>
                                                        <span className={active ? 'line-through opacity-90' : ''}>
                                                            {rune.label}
                                                        </span>
                                                    </span>
                                                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                                                        active 
                                                            ? 'bg-[#ff0000] text-white font-bold' 
                                                            : 'bg-[#241111] text-[#70757e] group-hover:text-white'
                                                    }`}>
                                                        {active ? 'BANISHED' : 'PURGE'}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-[#7d6565] mt-1 line-clamp-1">
                                                    {rune.description}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
