import React, { useState } from 'react';
import { ArcaneModifiers } from './ArcaneModifiers';
import { DualCrucible } from './DualCrucible';
import { audioFX } from '../services/audioService';

export type AllowedAspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export interface GenerateOptions {
    useThinking: boolean;
    isStudioQuality: boolean;
    negativePrompt?: string;
}

interface GeneratorFormProps {
    initialValue: string;
    initialNegativePrompt?: string;
    onGenerate: (idea: string, options: GenerateOptions) => void;
    isGenerating: boolean;
    aspectRatio: AllowedAspectRatio;
    setAspectRatio: (ratio: AllowedAspectRatio) => void;
    imageSize: '1K' | '2K' | '4K';
    setImageSize: (size: '1K' | '2K' | '4K') => void;
    hasKeySelected?: boolean;
    hasCustomKey?: boolean;
    useThinking?: boolean;
    setUseThinking?: (val: boolean) => void;
    isStudioQuality?: boolean;
    setIsStudioQuality?: (val: boolean) => void;
    onOpenKeyModal?: () => void;
}

const examples = [
    { label: 'Shattered Citadel', theme: 'Floating gothic cathedral pieces suspended in a vortex of red clouds' },
    { label: 'Eldritch Knight', theme: 'Heavy obsidian armor leaking cosmic smoke, standing in a field of glass flowers' },
    { label: 'The Sunken Altar', theme: 'Underwater marble altar glowing with bioluminescent tentacles' },
    { label: 'Ash Wasteland', theme: 'Infinite grey dunes with massive skeletal ribcages emerging from sand' },
    { label: 'Void Alchemist', theme: 'A hooded figure mixing glowing violet mercury in a lab made of living bone' },
    { label: 'Crimson Eclipse', theme: 'A blood-red sun hanging over a frozen ocean of black jagged ice' },
    { label: 'Soul Weaver', theme: 'Ghostly spiders spinning silver webs between the horns of an ancient colossus' },
    { label: 'Clockwork Plague', theme: 'A Victorian city where citizens have brass prosthetic limbs leaking green gas' },
    { label: 'Petrified Forest', theme: 'Giant stone trees with weeping faces and glowing embers for leaves' },
];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ 
    initialValue, 
    initialNegativePrompt = '',
    onGenerate, 
    isGenerating, 
    aspectRatio, 
    setAspectRatio,
    imageSize, 
    setImageSize,
    hasKeySelected = false,
    hasCustomKey = false,
    useThinking: controlledThinking,
    setUseThinking: controlledSetThinking,
    isStudioQuality: controlledStudioQuality,
    setIsStudioQuality: controlledSetStudioQuality,
    onOpenKeyModal
}) => {
    const [idea, setIdea] = useState(initialValue);
    const [negativePrompt, setNegativePrompt] = useState(initialNegativePrompt);
    const [internalThinking, setInternalThinking] = useState(false);
    const [internalStudioQuality, setInternalStudioQuality] = useState(false);

    const useThinking = controlledThinking !== undefined ? controlledThinking : internalThinking;
    const setUseThinking = controlledSetThinking || setInternalThinking;

    const isStudioQuality = controlledStudioQuality !== undefined ? controlledStudioQuality : internalStudioQuality;
    const setIsStudioQuality = controlledSetStudioQuality || setInternalStudioQuality;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim() && !isGenerating) {
            audioFX.playBladeUnsheathe();
            onGenerate(idea.trim(), { 
                useThinking, 
                isStudioQuality,
                negativePrompt: negativePrompt.trim()
            });
        }
    };

    const handleInjectModifier = (snippet: string) => {
        audioFX.playStoneRuneThud();
        setIdea(prev => {
            const clean = prev.trim();
            if (!clean) return snippet;
            if (clean.includes(snippet)) return clean;
            return `${clean}, ${snippet}`;
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex flex-col items-center gap-6">
            <div className="w-full flex flex-col gap-4">
                {/* Main Dark Fantasy Concept Prompt Textarea */}
                <div className="relative">
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="Whisper your dark fantasy concept into the abyss..."
                        className="w-full p-6 rounded-2xl border border-[#242830] focus:border-[#c26b3a] focus:ring-4 focus:ring-[#c26b3a]/10 transition-all bg-[#111318] shadow-2xl text-xl text-[#e8e6e3] placeholder:text-[#70757e] min-h-[140px] focus:outline-none"
                        disabled={isGenerating}
                    />
                </div>

                {/* ━━━ FEATURE 1: THE DUAL CRUCIBLE (Prompt Amplifiers & Negative Banished Seal) ━━━ */}
                <DualCrucible
                    prompt={idea}
                    onPromptChange={setIdea}
                    negativePrompt={negativePrompt}
                    onNegativePromptChange={setNegativePrompt}
                    disabled={isGenerating}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto mt-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#70757e] uppercase tracking-widest text-center">Aspect Ratio</label>
                        <div className="grid grid-cols-4 gap-1 bg-[#111318] p-1.5 rounded-xl border border-[#242830]">
                            {(['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'] as const).map((ratio) => (
                                <button
                                    key={ratio}
                                    type="button"
                                    onClick={() => {
                                        audioFX.playStoneRuneThud();
                                        setAspectRatio(ratio);
                                    }}
                                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        aspectRatio === ratio 
                                        ? 'bg-[#c26b3a] text-white shadow-lg' 
                                        : 'text-[#70757e] hover:text-white'
                                    }`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#70757e] uppercase tracking-widest text-center flex items-center justify-center gap-2">
                            Render Size
                        </label>
                        <div className="flex bg-[#111318] p-1.5 rounded-xl border border-[#242830] h-full items-center">
                            {(['1K', '2K', '4K'] as const).map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => {
                                        audioFX.playStoneRuneThud();
                                        setImageSize(size);
                                    }}
                                    className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1 ${
                                        imageSize === size 
                                        ? 'bg-[#8d1a1a] text-white shadow-lg' 
                                        : 'text-[#70757e] hover:text-white'
                                    }`}
                                >
                                    {size}
                                    {(size !== '1K' && !hasCustomKey && !hasKeySelected) && (
    <span 
        onClick={(e) => {
            if (onOpenKeyModal) {
                e.stopPropagation();
                onOpenKeyModal();
            }
        }}
        className="text-[7px] bg-[#c26b3a] text-white px-1 rounded-sm cursor-pointer hover:bg-[#e07b42]"
        title="Custom Gemini API Key unlocks 2K/4K ultra resolution"
    >
        PRO
    </span>
)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl mx-auto mt-2">
                    <button
                        type="button"
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setUseThinking(!useThinking);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                            useThinking 
                            ? 'bg-[#00d2ff]/10 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)]' 
                            : 'bg-[#111318] border-[#242830] text-[#70757e] hover:text-white'
                        }`}
                    >
                        <span className={useThinking ? 'animate-pulse text-[#00d2ff]' : ''}>👁️</span>
                        <span>Occult Intellect {useThinking ? '(Active)' : '(Disabled)'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setIsStudioQuality(!isStudioQuality);
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                            isStudioQuality 
                            ? 'bg-[#ff4d4d]/10 border-[#ff4d4d] text-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.2)]' 
                            : 'bg-[#111318] border-[#242830] text-[#70757e] hover:text-white'
                        }`}
                    >
                        <span>✧</span>
                        <span>Studio Quality {isStudioQuality ? '(Pro Active)' : '(Standard)'}</span>
                    </button>
                </div>
            </div>

            {/* Quick-Select Dark Fantasy Arcane Modifiers */}
            <div className="w-full">
                <ArcaneModifiers onSelectModifier={handleInjectModifier} />
            </div>

            <div className="w-full">
                <div className="flex flex-wrap justify-center gap-3">
                    {examples.map(ex => (
                        <button 
                            key={ex.label}
                            type="button" 
                            onClick={() => {
                                if (!isGenerating) {
                                    audioFX.playStoneRuneThud();
                                    setIdea(ex.theme);
                                }
                            }} 
                            disabled={isGenerating}
                            className="bg-[#1b1f27]/50 border border-[#242830] rounded-full px-5 py-2 text-sm text-[#dcd8d3] hover:border-[#c26b3a] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 hover-blood"
                        >
                            {ex.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isGenerating || !idea.trim()}
                className="group relative w-full md:w-auto bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white font-black text-xl py-5 px-16 rounded-2xl hover:opacity-90 transition-all duration-500 shadow-[0_0_30px_rgba(141,26,26,0.5)] active:scale-95 disabled:grayscale overflow-hidden hover-blood"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <span>⚔️</span>
                    <span>{isGenerating ? 'INITIATING...' : 'GENERATE RELICS'}</span>
                </span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[45deg] pointer-events-none rounded-2xl overflow-hidden hover-blood"></div>
            </button>
        </form>
    );
};
