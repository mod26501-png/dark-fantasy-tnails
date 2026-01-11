import React, { useState } from 'react';

interface GeneratorFormProps {
    initialValue: string;
    onGenerate: (idea: string) => void;
    isGenerating: boolean;
}

const examples = [
    { label: 'The Black Oathkeeper', theme: 'Armored knight with cracked helm, haunted eyes' },
    { label: `Wyrm's Reckoning`, theme: 'Ancient dragon curled around shattered cathedral' },
    { label: 'Watcher Beneath the Ash', theme: 'Hooded figure with luminous glyph tattoos in an ash storm' },
    { label: 'The Ossuary Throne', theme: 'Undead king seated on bone throne' },
    { label: 'Sigil Echo Variant', theme: 'Abstract arcane sigil pulsing with light' },
    { label: 'Timekeeper’s Crypt', theme: 'glowing fractures, whisper gears, eternal dusk' },
    { label: 'Void Weaver', theme: 'cosmic threads, lone monologues, space-sigil textures' },
    { label: 'Mirror Sovereign', theme: 'identity loops, crown paradoxes, ocular myths' },
    { label: 'The Crimson Alchemist', theme: 'A haunted alchemist surrounded by bubbling potions and vengeful spirits' },
    { label: 'Ghost of the Old War', theme: 'A spectral soldier patrolling the ruins of a forgotten battlefield' },
    { label: 'Cathedral of Whispers', theme: 'An immense, silent cathedral where the walls whisper secrets to those who listen' },
    { label: 'The Star-Forged Blade', theme: 'A legendary sword forged from a fallen star, glowing with cosmic energy' },
    { label: 'Nightmare\'s Menagerie', theme: 'A bizarre collection of creatures born from nightmares, displayed in an otherworldly zoo' },
];


export const GeneratorForm: React.FC<GeneratorFormProps> = ({ initialValue, onGenerate, isGenerating }) => {
    const [idea, setIdea] = useState(initialValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim() && !isGenerating) {
            onGenerate(idea.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col items-center gap-4">
            <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Enter a dark fantasy theme, e.g., 'The Sunken Kingdom'"
                className="w-full p-4 rounded-lg border-2 border-[#242830] focus:border-[#c26b3a] focus:ring-2 focus:ring-[#c26b3a]/50 transition-colors bg-[#111318] shadow-inner text-lg text-[#e8e6e3] placeholder:text-[#70757e]"
                rows={3}
                disabled={isGenerating}
                aria-label="Fantasy theme input"
            />

            <div className="w-full text-center">
                <p className="text-sm text-[#9aa0a6] mb-2">Or try an example:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {examples.map(ex => (
                        <button 
                            key={ex.label}
                            type="button" 
                            onClick={() => !isGenerating && setIdea(ex.theme)} 
                            disabled={isGenerating}
                            className="bg-[#1b1f27] border border-[#242830] rounded-full px-4 py-1.5 text-sm text-[#dcd8d3] hover:bg-[#242830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Set theme to ${ex.theme}`}
                        >
                            {ex.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={isGenerating || !idea.trim()}
                className="w-full md:w-auto bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white font-bold text-lg py-3 px-12 rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-xl"
            >
                {isGenerating ? 'Summoning...' : 'Generate Relics'}
            </button>
        </form>
    );
};