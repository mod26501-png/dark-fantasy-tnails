import React, { useState, useEffect } from 'react';
import { NewsletterForm } from './NewsletterForm';
import { 
    Video, 
    Bot, 
    Palette, 
    Code2, 
    Mail, 
    ExternalLink, 
    Sparkles, 
    Check, 
    Copy, 
    ArrowRight, 
    X, 
    MessageSquare,
    Send,
    BookOpen,
    Layers,
    Cpu,
    ShieldCheck,
    Flame,
    Scroll
} from 'lucide-react';

export type AppView = 'forge' | 'gallery' | 'crucible' | 'codex' | 'youtube' | 'studio' | 'about';

interface AboutMeProps {
    onBack: () => void;
    onNavigate?: (view: 'forge' | 'gallery' | 'crucible' | 'codex' | 'youtube' | 'studio') => void;
    initialTab?: 'codex' | 'scribe';
}

interface CollabTrack {
    id: 'video' | 'ai' | 'design' | 'web';
    title: string;
    badge: string;
    targetView: 'youtube' | 'studio' | 'gallery' | 'crucible';
    pageName: string;
    description: string;
    accentColor: string;
    icon: React.ReactNode;
    skills: string[];
}

const COLLAB_TRACKS: CollabTrack[] = [
    {
        id: 'video',
        title: 'Video Editing',
        badge: 'YouTube & Motion',
        targetView: 'youtube',
        pageName: 'YouTube Chronicles',
        description: 'Cinematic dark fantasy edits, CapCut motion alchemy, audio synchronization with Suno, and Veo 3.1 video workflows.',
        accentColor: '#ff0000',
        icon: <Video className="w-4 h-4" />,
        skills: ['4K Dark Fantasy Montages', 'Suno Soundscape Syncing', 'Veo 3.1 Directives', 'Shorts & Long-Form Scribing']
    },
    {
        id: 'ai',
        title: 'AI Content',
        badge: 'Agent & Prompts',
        targetView: 'studio',
        pageName: 'Denomic Studio',
        description: 'Multi-model prompt engineering, Scale AI / Outlier annotation standards, Streamlit agent logic, and grimoire synthesis.',
        accentColor: '#00d2ff',
        icon: <Bot className="w-4 h-4" />,
        skills: ['Prompt Matrix Design', 'Agent API Architecture', 'AI Data Labeling / RLHF', 'Bespoke Universe Codexes']
    },
    {
        id: 'design',
        title: 'Graphic Design',
        badge: 'Visual Relics',
        targetView: 'gallery',
        pageName: 'Relic Gallery',
        description: 'High-contrast dark art compositions, 8K demonic alpha textures, weathered grimoire assets, and occult brand identity.',
        accentColor: '#ffaa00',
        icon: <Palette className="w-4 h-4" />,
        skills: ['4K Visual Relics Suite', '8K Displacement Alphas', 'Gothic Branding & Logos', 'Photoshop Compositing']
    },
    {
        id: 'web',
        title: 'Web Forging',
        badge: 'Full-Stack Apps',
        targetView: 'crucible',
        pageName: "Crucible & Forge",
        description: 'Modern full-stack web engineering with React 18, TypeScript, Tailwind CSS, Vite, Cloud APIs, and interactive UI systems.',
        accentColor: '#c26b3a',
        icon: <Code2 className="w-4 h-4" />,
        skills: ['React & TypeScript SPAs', 'Express / Node Cloud APIs', 'Tailwind & Motion FX', 'Ritualistic Interactive UIs']
    }
];

const BloodDrops: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <span className="blood-drop" style={{ left: '10%', animationDelay: '0s', animationDuration: '6s' }} />
            <span className="blood-drop" style={{ left: '25%', animationDelay: '2s', animationDuration: '7s' }} />
            <span className="blood-drop" style={{ left: '45%', animationDelay: '4s', animationDuration: '5.5s' }} />
            <span className="blood-drop" style={{ left: '70%', animationDelay: '1s', animationDuration: '6.5s' }} />
            <span className="blood-drop" style={{ left: '85%', animationDelay: '3s', animationDuration: '8s' }} />
        </div>
    );
};

export const AboutMe: React.FC<AboutMeProps> = ({ onBack, onNavigate, initialTab = 'codex' }) => {
    const [activeTab, setActiveTab] = useState<'codex' | 'scribe'>(initialTab);
    const [isCollabModalOpen, setIsCollabModalOpen] = useState<boolean>(false);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('video');
    const [senderName, setSenderName] = useState<string>('');
    const [projectNotes, setProjectNotes] = useState<string>('');
    const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const CONTACT_EMAIL = "mod26501@gmail.com";

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(CONTACT_EMAIL);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2500);
    };

    const handleNavigatePage = (target: 'forge' | 'gallery' | 'crucible' | 'codex' | 'youtube' | 'studio') => {
        if (onNavigate) {
            onNavigate(target);
        }
    };

    const handleOpenInquiry = (trackId?: string) => {
        if (trackId) setSelectedTrackId(trackId);
        setIsCollabModalOpen(true);
    };

    const activeTrackObj = COLLAB_TRACKS.find(t => t.id === selectedTrackId) || COLLAB_TRACKS[0];

    const generateMailtoUrl = () => {
        const subject = encodeURIComponent(`The Demon Codex — Collaboration Inquiry: ${activeTrackObj.title}`);
        const bodyText = `Greetings Rick,

I would like to collaborate with you on a project regarding: ${activeTrackObj.title} (${activeTrackObj.badge}).

From: ${senderName || 'Mortal Collaborator'}
Target Domain: ${activeTrackObj.title}
Project Brief / Scope:
${projectNotes || 'I am interested in discussing a creative AI / content / design collaboration.'}

Looking forward to connecting!
`;
        return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    };

    return (
        <div className="w-full animate-fade-in py-12 relative">
            <div className="max-w-4xl mx-auto bg-[#111318]/90 backdrop-blur-xl border-2 border-[#8d1a1a]/40 rounded-[3rem] p-6 sm:p-8 md:p-14 relative shadow-[0_0_100px_rgba(141,26,26,0.15)]">
                <BloodDrops />
                
                <div className="flex justify-between items-center mb-6 w-full relative z-10">
                    <button
                        onClick={onBack}
                        className="px-3.5 py-1.5 rounded-lg bg-[#111318] hover:bg-[#1c202a] border border-[#242830] hover:border-[#ff4d4d] text-[#8d929b] hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                        <span>← Back to Forge</span>
                    </button>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#70757e]">Codex Specification • v3.8</span>
                </div>

                {/* Primary Dual-Tab Switcher: The Demon Codex vs The Arch-Scribe */}
                <div className="flex items-center justify-center mb-10 w-full relative z-10">
                    <div className="flex p-1.5 bg-[#0b0c10] border border-[#242830] rounded-2xl shadow-2xl max-w-md w-full">
                        <button
                            id="tab-btn-codex"
                            type="button"
                            onClick={() => setActiveTab('codex')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'codex'
                                    ? 'bg-gradient-to-r from-[#8d1a1a] via-[#ff0000] to-[#8d1a1a] text-white shadow-[0_0_20px_rgba(255,0,0,0.6)] border border-white/20'
                                    : 'text-[#70757e] hover:text-white hover:bg-[#151821]'
                            }`}
                        >
                            <span>📜</span>
                            <span>The Demon Codex</span>
                        </button>
                        <button
                            id="tab-btn-scribe"
                            type="button"
                            onClick={() => setActiveTab('scribe')}
                            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'scribe'
                                    ? 'bg-gradient-to-r from-[#8d1a1a] via-[#ff0000] to-[#8d1a1a] text-white shadow-[0_0_20px_rgba(255,0,0,0.6)] border border-white/20'
                                    : 'text-[#70757e] hover:text-white hover:bg-[#151821]'
                            }`}
                        >
                            <span>✍</span>
                            <span>The Arch-Scribe</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================
                    TAB 1: ABOUT THE DEMON CODEX (SYSTEM SPECS & CANON)
                    ======================================================== */}
                {activeTab === 'codex' && (
                    <div className="space-y-10 relative z-10 animate-fade-in">
                        <header className="text-center flex flex-col items-center">
                            <div className="codex-title-wrapper !m-0 !mt-2 !mb-3 !w-auto">
                                <h2 className="codex-title text-3xl sm:text-4xl md:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-2" data-text="THE DEMON CODEX">
                                    THE DEMON CODEX
                                    <span className="rune">ᚱ</span>
                                    <span className="rune">ᛟ</span>
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-[#8d1a1a]/20 border border-[#8d1a1a]/40 text-[#ff4d4d] text-xs font-black tracking-widest uppercase italic mt-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Platform Overview & System Specifications</span>
                            </div>
                        </header>

                        {/* Section 1: Overview */}
                        <section className="bg-black/40 border border-[#242830] rounded-2xl p-6 md:p-8 hover:border-[#8d1a1a]/60 transition-colors">
                            <div className="flex items-center gap-2 text-[#ff4d4d] text-xs font-black uppercase tracking-[0.3em] mb-3">
                                <Flame className="w-4 h-4 text-[#ff4d4d]" />
                                <span>Dark Fantasy Creative Sanctuary</span>
                            </div>
                            <p className="text-sm md:text-base text-[#d1d5db] leading-relaxed font-sans mb-3">
                                <strong>The Demon Codex</strong> is an authentic creative platform engineered specifically for dark fantasy authors, tabletop game masters, concept artists, and grimdark worldbuilders. Powered by advanced Google Gemini and Veo models, the platform empowers creators to summon hyper-detailed 4K visual relics, cinematic artifacts, ancient scrolls, and deciphered runic lore through an immersive occult interface.
                            </p>
                            <p className="text-xs md:text-sm text-[#9aa0a6] leading-relaxed">
                                Unlike generic diffusion tools that produce flat, plastic representations, The Demon Codex employs multi-vector prompt architecture—layering tactile metallurgy, atmospheric suspensions, and extreme chiaroscuro lighting to produce gallery-grade masterworks.
                            </p>
                        </section>

                        {/* Section 2: Canonical Relic Taxonomy */}
                        <section className="bg-gradient-to-r from-[#181116] via-[#111318] to-[#121620] border border-[#242830] rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-2 text-[#00d2ff] text-xs font-black uppercase tracking-[0.3em] mb-4">
                                <Layers className="w-4 h-4 text-[#00d2ff]" />
                                <span>The 5 Canonical Relic Classifications</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-[#090b10] border border-[#242830]/80">
                                    <span className="text-[#ff4d4d] font-bold uppercase tracking-wider block mb-1">1. Necrotic Grimoires</span>
                                    <p className="text-[#9aa0a6] leading-relaxed">Ancient tomes, scorched vellum, and forbidden incantations bound in shadow and ash.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#090b10] border border-[#242830]/80">
                                    <span className="text-[#c26b3a] font-bold uppercase tracking-wider block mb-1">2. Abyssal Weaponry</span>
                                    <p className="text-[#9aa0a6] leading-relaxed">3D blood-chrome blades, obsidian polearms, and damascene steel forged in subterranean fire.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#090b10] border border-[#242830]/80">
                                    <span className="text-[#ffd27f] font-bold uppercase tracking-wider block mb-1">3. Soulbound Catalysts</span>
                                    <p className="text-[#9aa0a6] leading-relaxed">Occult amulets, fractured gemstones, and sacrificial chalices channeling spectral runes.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#090b10] border border-[#242830]/80">
                                    <span className="text-[#a855f7] font-bold uppercase tracking-wider block mb-1">4. Void Reliquaries</span>
                                    <p className="text-[#9aa0a6] leading-relaxed">Floating monolithic shrines, necrotic citadels, and gargantuan architectural sanctums.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#090b10] border border-[#ffd27f]/30 sm:col-span-2">
                                    <span className="text-[#ffd27f] font-bold uppercase tracking-wider block mb-1">5. Seraphic Counter-Relics</span>
                                    <p className="text-[#9aa0a6] leading-relaxed">Transmuted holy shields, opalescent electrum spears, and radiant celestial halos channelled via the Angelic Agent.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: System Engine Architecture */}
                        <section className="bg-black/40 border border-[#242830] rounded-2xl p-6 md:p-8">
                            <div className="flex items-center gap-2 text-[#ffd27f] text-xs font-black uppercase tracking-[0.3em] mb-4">
                                <Cpu className="w-4 h-4 text-[#ffd27f]" />
                                <span>Engine Matrix & Technological Stack</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-xl bg-[#111318] border border-[#242830]">
                                    <span className="text-white font-black uppercase tracking-wider block mb-1">⚡ Gemini 3.8 Flash</span>
                                    <p className="text-[#70757e] leading-relaxed">High-velocity dark fantasy prompt synthesis, banish seal validation, and structured occult lore decoding.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#111318] border border-[#242830]">
                                    <span className="text-white font-black uppercase tracking-wider block mb-1">🎬 Google Veo 3.1</span>
                                    <p className="text-[#70757e] leading-relaxed">Kinematic video generation engine with custom volumetric lighting, camera orbiting, and embers physics.</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[#111318] border border-[#242830]">
                                    <span className="text-white font-black uppercase tracking-wider block mb-1">📿 Abyssal Audio FX</span>
                                    <p className="text-[#70757e] leading-relaxed">Procedural 432Hz master drone oscillator and multi-channel occult choir soundboard via Web Audio API.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Commercial Rights & Licensing */}
                        <section className="bg-gradient-to-r from-[#1b1212] via-[#111318] to-[#1a0f0f] border-2 border-[#ff0000]/40 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,0,0,0.15)]">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[#10b981] text-xs font-black uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Unrestricted Commercial Rights</span>
                                </div>
                                <h3 className="text-white text-lg font-black uppercase tracking-tight">Worldwide Commercial Rights</h3>
                                <p className="text-xs text-[#d1d5db] max-w-xl leading-relaxed">
                                    Creators retain full worldwide commercial ownership of all visual relics, prompts, lore scripts, and YouTube packages generated through The Demon Codex. Use them freely in novels, commercial video games, tabletop campaigns, and album covers without royalties.
                                </p>
                            </div>
                            <button
                                onClick={() => handleNavigatePage('forge')}
                                className="px-6 py-3 rounded-xl bg-[#ff0000] hover:bg-[#ff2222] text-white text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-[0_0_20px_rgba(255,0,0,0.6)] transition-all hover:scale-105"
                            >
                                Enter Forge
                            </button>
                        </section>
                    </div>
                )}

                {/* ========================================================
                    TAB 2: ABOUT THE ARCH-SCRIBE (CREATOR PROFILE & COLLAB)
                    ======================================================== */}
                {activeTab === 'scribe' && (
                    <div className="space-y-8 relative z-10 animate-fade-in">
                        <header className="mb-8 text-center flex flex-col items-center">
                            <div className="codex-title-wrapper !m-0 !mt-2 !mb-3 !w-auto">
                                <h2 className="codex-title text-4xl sm:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-3" data-text="THE ARCH-SCRIBE">
                                    THE ARCH-SCRIBE
                                    <span className="rune">✦</span>
                                    <span className="rune">✙</span>
                                </h2>
                            </div>
                            <div className="inline-block py-1 px-4 rounded-full bg-[#8d1a1a]/20 border border-[#8d1a1a]/40 text-[#ff4d4d] text-xs font-black tracking-widest uppercase italic mt-4">
                                Rick Modster Manifestation
                            </div>
                        </header>

                        <section className="space-y-4">
                            <p className="text-xl md:text-2xl font-bold leading-relaxed text-[#ff4d4d] drop-shadow-[0_0_10px_rgba(255,77,77,0.3)] italic">
                                "I am an Outlier AI human-in-the-loop specialist, creative technologist, and digital blacksmith forging the bleeding edge of cinematic AI worldbuilding."
                            </p>
                            <p className="text-sm md:text-base text-[#cfd3d8] leading-relaxed font-sans">
                                At the intersection of high-tier large language model fine-tuning and grimdark aesthetics lies <strong>The Demon Codex</strong>. My craft revolves around decomposing complex AI mechanisms—from multi-modal image tokenizers to reactive Web Audio synthesizers—into ritualistic, high-yield creative instruments for digital artists, grimdark authors, and game designers.
                            </p>
                        </section>

                        <section className="bg-black/40 border border-[#242830] rounded-2xl p-6 md:p-10 hover:border-[#8d1a1a]/60 transition-colors">
                            <h3 className="text-[#8d1a1a] text-xs font-black uppercase tracking-[0.4em] mb-4">The Night Watch</h3>
                            <p className="text-sm text-[#70757e] leading-relaxed mb-4">
                                As an operational expert evaluating frontier reasoning engines at Outlier AI, my daily focus includes rigorous alignment, synthetic data creation, safety auditing, and prompt engineering at industrial scale. Every prompt template and heuristic encoded in The Demon Codex reflects hundreds of hours testing model boundaries, eliminating token drift, and enforcing cinematic composition standards.
                            </p>
                            <p className="text-sm text-[#70757e] leading-relaxed">
                                When not training model horizons, I run <strong>The Demon Codex Studio</strong>—producing YouTube dark fantasy lore documentaries, generating modular stem soundscapes, and writing bespoke worldbuilding scripts.
                            </p>
                        </section>

                        {/* Direct Contact Banner */}
                        <section className="bg-gradient-to-r from-[#1b1212] via-[#111318] to-[#1a0f0f] border-2 border-[#ff0000]/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,0,0,0.15)]">
                            <div className="space-y-1.5 text-center md:text-left">
                                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ff4d4d] font-bold">Direct Channel</span>
                                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">Summon The Arch-Scribe</h3>
                                <p className="text-xs text-[#70757e] max-w-md">Reach out directly for freelance contracts, custom AI pipelines, video editing commissions, or corporate consulting.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                                <a 
                                    href={`mailto:${CONTACT_EMAIL}?subject=The%20Demon%20Codex%20Inquiry`}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#ff0000] hover:bg-[#8d1a1a] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:scale-105 active:scale-95"
                                >
                                    <Mail className="w-4 h-4" />
                                    <span>Send Transmission</span>
                                </a>
                                <button
                                    onClick={handleCopyEmail}
                                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#111318] hover:bg-[#242830] border border-[#242830] text-xs font-mono text-[#e8e6e3] transition-all flex items-center justify-center gap-2"
                                    title="Copy mod26501@gmail.com"
                                >
                                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#70757e]" />}
                                    <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
                                </button>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/40 border border-[#242830] rounded-2xl p-6 md:p-8">
                                <h3 className="text-[#00d2ff] text-xs font-black uppercase tracking-[0.4em] mb-4">The Studio Rituals</h3>
                                <ul className="space-y-3 text-xs text-[#70757e]">
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-[#00d2ff] mt-0.5">✦</span>
                                        <span><strong>YouTube Production:</strong> Authoring @thedemoncodex lore stories, pacing motion loops, and soundscape syncing.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-[#00d2ff] mt-0.5">✦</span>
                                        <span><strong>Prompt Engineering:</strong> Structuring multi-tiered negative prompt matrices and cinematic lighting constraints.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-[#00d2ff] mt-0.5">✦</span>
                                        <span><strong>Audio Engineering:</strong> Composing 432Hz ambient soundscapes and industrial horror stems for game soundtracks.</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="text-[#00d2ff] mt-0.5">✦</span>
                                        <span><strong>Full-Stack Architecture:</strong> Building responsive React, Vite, Node, and Cloud Run production applications.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-black/40 border border-[#242830] rounded-2xl p-6 md:p-8">
                                <h3 className="text-[#ff4d4d] text-xs font-black uppercase tracking-[0.4em] mb-4">Eternal Learning</h3>
                                <p className="text-xs text-[#70757e] leading-relaxed mb-4">
                                    Software engineering and AI iteration are living rituals. The Demon Codex codebase undergoes continuous optimization—incorporating zero-overhead audio filters, strict Cloud Firestore rules, and real-time community seal reactions.
                                </p>
                                <p className="text-xs text-[#70757e] leading-relaxed">
                                    Every relic forged through this tool contributes to the permanent lore web, demonstrating what is possible when dark romantic fantasy meets state-of-the-art computational creativity.
                                </p>
                            </div>
                        </section>

                        {/* Interactive Collaboration Matrix */}
                        <section className="pt-8 border-t border-[#242830]">
                            <div className="text-center max-w-xl mx-auto mb-8">
                                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ff4d4d] block mb-2">Pact of Creation</span>
                                <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-wider">
                                    Commission The Scribe & Collaborate
                                </h3>
                                <p className="text-xs text-[#70757e] mt-2 leading-relaxed">
                                    Select an arcane domain below to learn more, visit dedicated platform pages, or directly submit a collaboration brief to Rick.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {COLLAB_TRACKS.map((track) => (
                                    <div
                                        key={track.id}
                                        className="p-5 rounded-2xl bg-[#090b10] border border-[#242830] hover:border-[#ff4d4d]/60 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                                    style={{ backgroundColor: `${track.accentColor}20`, color: track.accentColor }}
                                                >
                                                    {track.icon}
                                                </div>
                                                <span 
                                                    className="px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold"
                                                    style={{ 
                                                        backgroundColor: `${track.accentColor}15`,
                                                        color: track.accentColor,
                                                        border: `1px solid ${track.accentColor}40`
                                                    }}
                                                >
                                                    {track.badge}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#ff4d4d] transition-colors mb-1.5">
                                                {track.title}
                                            </h4>
                                            <p className="text-xs text-[#70757e] leading-relaxed mb-4">
                                                {track.description}
                                            </p>

                                            <div className="space-y-1.5 mb-5 pt-3 border-t border-[#1a1e27]">
                                                {track.skills.map((skill, sIdx) => (
                                                    <div key={sIdx} className="flex items-center gap-1.5 text-[10px] text-[#9aa0a6]">
                                                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: track.accentColor }} />
                                                        <span>{skill}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-[#1a1e27]">
                                            <button
                                                type="button"
                                                onClick={() => handleNavigatePage(track.targetView)}
                                                className="flex-1 py-2 px-3 rounded-lg bg-[#111318] hover:bg-[#1a1f2c] border border-[#242830] text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                                                title={`Go to ${track.pageName}`}
                                            >
                                                <span>Visit {track.pageName}</span>
                                                <ArrowRight className="w-3 h-3 text-[#70757e]" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenInquiry(track.id)}
                                                className="py-2 px-3 rounded-lg text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border"
                                                style={{ 
                                                    backgroundColor: `${track.accentColor}25`,
                                                    borderColor: `${track.accentColor}60`
                                                }}
                                                title={`Inquire about ${track.title}`}
                                            >
                                                <Mail className="w-3.5 h-3.5" />
                                                <span>Inquire</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                <footer className="mt-12 pt-8 border-t border-[#242830] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#70757e] relative z-10">
                    <div>
                        <span>The Demon Codex</span> &bull; <span>Mod26 Creative Labs</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="text-[#ff4d4d] hover:underline uppercase text-[10px] font-bold"
                        >
                            Return to Forge
                        </button>
                        <span>&bull;</span>
                        <a 
                            href="https://www.youtube.com/@thedemoncodex" 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[#00d2ff] hover:underline flex items-center gap-1"
                        >
                            <span>@thedemoncodex</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </footer>
            </div>

            {/* Quick Inquiry / Commission Modal */}
            {isCollabModalOpen && (
                <div 
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setIsCollabModalOpen(false)}
                >
                    <div 
                        className="bg-[#111318] border-2 border-[#8d1a1a]/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-[0_0_50px_rgba(141,26,26,0.5)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsCollabModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-[#70757e] hover:text-white transition-colors rounded-lg bg-[#0b0c10] border border-[#242830]"
                            title="Close Modal"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                style={{ backgroundColor: `${activeTrackObj.accentColor}25`, color: activeTrackObj.accentColor }}
                            >
                                {activeTrackObj.icon}
                            </div>
                            <div>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-[#70757e] block">
                                    Commission Brief &bull; {activeTrackObj.badge}
                                </span>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                                    {activeTrackObj.title} Collaboration
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-[#70757e] mb-4 leading-relaxed">
                            Send your project scope directly to Rick Modster. A pre-formatted transmission will be summoned via your mail client or email.
                        </p>

                        <div className="space-y-3 mb-5">
                            <div>
                                <label className="text-[10px] font-mono text-[#8d929b] uppercase tracking-wider block mb-1">
                                    Your Name / Handle
                                </label>
                                <input 
                                    type="text"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    placeholder="e.g. Ronald, Cultist99, Studio Director"
                                    className="w-full bg-[#0b0c10] border border-[#242830] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ff4d4d] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-[#8d929b] uppercase tracking-wider block mb-1">
                                    Arcane Domain
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {COLLAB_TRACKS.map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setSelectedTrackId(t.id)}
                                            className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all ${
                                                selectedTrackId === t.id
                                                    ? 'bg-[#1b1f2b] border-[#ff4d4d] text-white shadow-[0_0_10px_rgba(255,77,77,0.3)]'
                                                    : 'bg-[#0b0c10] border-[#242830] text-[#70757e] hover:border-[#444]'
                                            }`}
                                        >
                                            {t.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-[#8d929b] uppercase tracking-wider block mb-1">
                                    Project Scope & Notes
                                </label>
                                <textarea 
                                    rows={3}
                                    value={projectNotes}
                                    onChange={(e) => setProjectNotes(e.target.value)}
                                    placeholder={`Tell Rick about what you want to manifest in ${activeTrackObj.title} (timeline, aesthetic, deliverables)...`}
                                    className="w-full bg-[#0b0c10] border border-[#242830] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#ff4d4d] transition-colors resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href={generateMailtoUrl()}
                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#8d1a1a] via-[#ff0000] to-[#8d1a1a] hover:opacity-90 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.4)]"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Launch Email Transmission</span>
                            </a>
                            <button
                                type="button"
                                onClick={handleCopyEmail}
                                className="py-3 px-4 rounded-xl bg-[#0b0c10] border border-[#242830] hover:border-white/30 text-xs text-[#cfd3d8] transition-colors flex items-center gap-1.5"
                                title="Copy Email Address"
                            >
                                {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#70757e]" />}
                                <span className="hidden sm:inline">{copiedEmail ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
