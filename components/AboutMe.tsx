
import React, { useState } from 'react';
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
    Send
} from 'lucide-react';

export type AppView = 'forge' | 'gallery' | 'crucible' | 'codex' | 'youtube' | 'studio' | 'about';

interface AboutMeProps {
    onBack: () => void;
    onNavigate?: (view: 'forge' | 'gallery' | 'crucible' | 'codex' | 'youtube' | 'studio') => void;
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <span className="blood-drop" style={{ '--drop-left': '5%', '--drop-duration': '3.5s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '15%', '--drop-duration': '6s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '85%', '--drop-duration': '4s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '95%', '--drop-duration': '7s' } as any}></span>
        </div>
    );
};

export const AboutMe: React.FC<AboutMeProps> = ({ onBack, onNavigate }) => {
    const [isCollabModalOpen, setIsCollabModalOpen] = useState<boolean>(false);
    const [selectedTrackId, setSelectedTrackId] = useState<string>('video');
    const [senderName, setSenderName] = useState<string>('');
    const [projectNotes, setProjectNotes] = useState<string>('');
    const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

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
            <div className="max-w-4xl mx-auto bg-[#111318]/80 backdrop-blur-xl border-2 border-[#8d1a1a]/40 rounded-[3rem] p-8 md:p-16 relative shadow-[0_0_100px_rgba(141,26,26,0.1)]">
                <BloodDrops />
                
                <header className="mb-12 text-center flex flex-col items-center">
                    <div className="codex-title-wrapper !m-0 !mt-6 sm:!mt-8 !mb-3 !w-auto">
                        <h2 className="codex-title text-4xl sm:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-3" data-text="THE ARCH-SCRIBE">
                            THE ARCH-SCRIBE
                            <span className="rune">✦</span>
                            <span className="rune">✙</span>
                            <span className="rune">✦</span>
                            <span className="rune">✙</span>
                            <span className="blood-drop" style={{ '--drop-left': '12%', '--drop-duration': '3.2s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '28%', '--drop-duration': '4.5s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '48%', '--drop-duration': '2.8s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '64%', '--drop-duration': '5.1s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '80%', '--drop-duration': '3.7s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '94%', '--drop-duration': '4.2s' } as React.CSSProperties}></span>
                        </h2>
                    </div>
                    <div className="inline-block py-1 px-4 rounded-full bg-[#8d1a1a]/20 border border-[#8d1a1a]/40 text-[#ff4d4d] text-xs font-black tracking-widest uppercase italic mt-4">
                        Rick Modster Manifestation
                    </div>
                </header>

                <div className="space-y-8 relative z-10">
                    <section className="space-y-4">
                        <p className="text-xl md:text-2xl font-bold leading-relaxed text-[#ff4d4d] drop-shadow-[0_0_10px_rgba(255,77,77,0.3)] italic">
                            I’m Richard (Rick), an AI & digital creator with almost three years of hands-on experience working with different AI models and tools. I combine AI annotation, music creation, video editing, and graphic design to build content and products that are both creative and useful.
                        </p>
                    </section>

                    <section className="bg-black/40 border border-[#242830] rounded-2xl p-6 md:p-10 hover:border-[#8d1a1a]/60 transition-colors">
                        <h3 className="text-[#8d1a1a] text-xs font-black uppercase tracking-[0.4em] mb-4">The Night Watch</h3>
                        <p className="text-[#e8e6e3] text-lg leading-relaxed">
                            By night, I work as a Senior AI Annotator for Outlier (Scale AI), helping train and evaluate advanced AI systems. I review and label data, score AI responses, and follow detailed guidelines to improve quality, safety, and accuracy. This work has sharpened my research skills, critical thinking, and prompt engineering.
                        </p>
                    </section>

                    {/* Official YouTube Channel Spotlight */}
                    <section className="bg-gradient-to-r from-[#1b1212] via-[#111318] to-[#1a0f0f] border-2 border-[#ff0000]/40 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(255,0,0,0.15)]">
                        <div className="flex items-center gap-5">
                            <img 
                                src="/demon-ai-1781131108810.jpg" 
                                alt="The Demon Codex YouTube" 
                                className="w-16 h-16 rounded-2xl border border-[#ff0000] object-cover shadow-[0_0_20px_#ff0000]"
                            />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-lg font-black text-white uppercase">The Demon Codex on YouTube</h4>
                                    <span className="bg-[#ff0000] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">@thedemoncodex</span>
                                </div>
                                <p className="text-xs text-[#9aa0a6] mt-1">Dark fantasy lore broadcasts, Veo 3.1 visual experiments, and occult soundscapes.</p>
                            </div>
                        </div>
                        <a 
                            href="https://www.youtube.com/@thedemoncodex"
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,0,0.4)] whitespace-nowrap hover:scale-105"
                        >
                            Subscribe on YouTube ↗
                        </a>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <h3 className="text-[#00d2ff] text-xs font-black uppercase tracking-[0.4em]">The Studio Rituals</h3>
                            <ul className="space-y-4 text-sm text-[#9aa0a6] uppercase font-bold tracking-wider">
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#8d1a1a]"></span>
                                    Original Music with Suno
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#8d1a1a]"></span>
                                    Visual Sync AI Generation
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#8d1a1a]"></span>
                                    CapCut Motion Alchemy
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#8d1a1a]"></span>
                                    Bone-Deep Graphic Design
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-[#8d1a1a]"></span>
                                    React & TS Web Forging
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#8d1a1a]/5 border border-[#8d1a1a]/20 rounded-2xl p-6">
                            <h3 className="text-[#ff4d4d] text-xs font-black uppercase tracking-[0.4em] mb-4">Eternal Learning</h3>
                            <p className="text-sm text-[#e8e6e3] italic leading-relaxed">
                                I’m always learning—whether it’s new AI platforms, creative workflows, or development tools—and I enjoy blending technology, storytelling, and design into projects that stand out.
                            </p>
                        </div>
                    </section>

                    <section className="pt-8 border-t border-[#242830]">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                            <div className="text-center sm:text-left">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff4d4d] block">
                                    Direct Client & Creator Commissions
                                </span>
                                <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-wider">
                                    Collaborate on the Forbidden
                                </h3>
                            </div>

                            <button
                                id="initiate-collab-btn"
                                onClick={() => handleOpenInquiry()}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8d1a1a] via-[#c26b3a] to-[#8d1a1a] hover:from-[#ff0000] hover:to-[#ff4d4d] text-white text-xs font-black uppercase tracking-[0.15em] shadow-[0_0_25px_rgba(255,0,0,0.4)] hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <Mail className="w-4 h-4" />
                                <span>✦ Initiate Collaboration ✦</span>
                            </button>
                        </div>

                        <p className="text-sm text-[#9aa0a6] mb-6 leading-relaxed">
                            Looking to collaborate on AI architectures, dark fantasy video edits, bespoke lore universes, or high-fidelity graphic design? Each pillar connects directly to active systems across the codex:
                        </p>

                        {/* 4 Interactive Discipline Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {COLLAB_TRACKS.map((track) => (
                                <div
                                    key={track.id}
                                    className="p-5 rounded-2xl bg-[#0e1015] border border-[#242830] hover:border-[#8d1a1a]/70 transition-all flex flex-col justify-between group relative overflow-hidden shadow-lg"
                                >
                                    <div 
                                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
                                        style={{ backgroundColor: track.accentColor }}
                                    />

                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span 
                                                    className="p-2 rounded-lg text-white"
                                                    style={{ backgroundColor: `${track.accentColor}25`, border: `1px solid ${track.accentColor}60` }}
                                                >
                                                    {track.icon}
                                                </span>
                                                <h4 className="text-base font-black uppercase text-white tracking-wide">
                                                    {track.title}
                                                </h4>
                                            </div>
                                            <span 
                                                className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border text-white"
                                                style={{ borderColor: `${track.accentColor}60`, backgroundColor: `${track.accentColor}15` }}
                                            >
                                                {track.badge}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#9aa0a6] leading-relaxed mb-4">
                                            {track.description}
                                        </p>

                                        <ul className="space-y-1 mb-5">
                                            {track.skills.map((skill, sIdx) => (
                                                <li key={sIdx} className="text-[11px] text-[#70757e] flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: track.accentColor }} />
                                                    <span>{skill}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Buttons for each track */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-[#242830]/80">
                                        <button
                                            id={`nav-track-${track.id}-btn`}
                                            onClick={() => handleNavigatePage(track.targetView)}
                                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#161820] hover:bg-[#20242f] text-white text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-[#2e3340] hover:border-white/30"
                                            title={`Go to ${track.pageName}`}
                                        >
                                            <span>Open {track.pageName}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#00d2ff]" />
                                        </button>

                                        <button
                                            id={`inquire-track-${track.id}-btn`}
                                            onClick={() => handleOpenInquiry(track.id)}
                                            className="py-2.5 px-3 rounded-xl text-white text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border shadow"
                                            style={{ 
                                                backgroundColor: `${track.accentColor}20`,
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

                        {/* Direct Email Banner */}
                        <div className="mt-6 p-4 rounded-2xl bg-[#111318] border border-[#242830] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-[#8d1a1a]/20 border border-[#8d1a1a]/40 text-[#ff4d4d]">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#70757e]">
                                        Direct Scribe Transmission
                                    </p>
                                    <p className="text-sm font-bold text-white select-all font-mono">
                                        {CONTACT_EMAIL}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    id="copy-collab-email-btn"
                                    onClick={handleCopyEmail}
                                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1c202a] hover:bg-[#282d3b] text-white text-xs font-black uppercase tracking-wider border border-[#2e3340] transition-all flex items-center justify-center gap-2"
                                >
                                    {copiedEmail ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-[#00ff66]" />
                                            <span className="text-[#00ff66]">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 text-[#00d2ff]" />
                                            <span>Copy Email</span>
                                        </>
                                    )}
                                </button>
                                <a
                                    id="direct-mailto-collab-btn"
                                    href={generateMailtoUrl()}
                                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#8d1a1a] hover:bg-[#ff0000] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Raven ↗</span>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>

                <NewsletterForm />

                <div className="mt-12 text-center">
                    <button 
                        id="return-to-forge-btn"
                        onClick={onBack}
                        className="bg-[#8d1a1a] text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_#8d1a1a] hover:bg-[#ff0000] hover:scale-105 transition-all"
                    >
                        RETURN TO THE FORGE
                    </button>
                </div>
            </div>

            {/* Interactive Collaboration Modal */}
            {isCollabModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
                    <div 
                        className="bg-[#111318] border-2 border-[#8d1a1a]/60 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_0_80px_rgba(141,26,26,0.3)] relative max-h-[92vh] overflow-y-auto"
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            id="close-collab-modal-btn"
                            onClick={() => setIsCollabModalOpen(false)}
                            className="absolute top-5 right-5 p-2 rounded-xl bg-[#1c202a] text-[#70757e] hover:text-white hover:bg-[#282d3b] transition-all"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8d1a1a]/20 border border-[#8d1a1a]/40 text-[#ff4d4d] text-[10px] font-black uppercase tracking-widest mb-2">
                                <Sparkles className="w-3 h-3" />
                                Transmit to the Arch-Scribe
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Collaborate on the Forbidden
                            </h3>
                            <p className="text-xs text-[#9aa0a6] mt-1">
                                Connect directly with Rick Modster for AI development, custom prompt architectures, video editing, or dark fantasy branding.
                            </p>
                        </div>

                        {/* Domain Track Selection */}
                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] font-black uppercase tracking-wider text-[#70757e] block">
                                Select Collaboration Discipline:
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {COLLAB_TRACKS.map((t) => {
                                    const isSelected = selectedTrackId === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setSelectedTrackId(t.id)}
                                            className={`p-3 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                                                isSelected 
                                                    ? 'bg-[#1c202a] text-white shadow'
                                                    : 'bg-[#0b0c10] border-[#242830] text-[#70757e] hover:text-white hover:border-[#383e4e]'
                                            }`}
                                            style={isSelected ? { borderColor: t.accentColor } : {}}
                                        >
                                            <span 
                                                className="p-1.5 rounded-lg text-white text-xs"
                                                style={{ backgroundColor: `${t.accentColor}30` }}
                                            >
                                                {t.icon}
                                            </span>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-wide leading-tight">
                                                    {t.title}
                                                </p>
                                                <p className="text-[9px] text-[#70757e]">
                                                    {t.badge}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Project Input Fields */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-[#70757e] block mb-1.5">
                                    Your Name / Studio / Handle:
                                </label>
                                <input
                                    type="text"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    placeholder="e.g. Ashen Sovereign / Creative Director"
                                    className="w-full bg-[#0b0c10] border border-[#242830] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff4d4d] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-[#70757e] block mb-1.5">
                                    Project Scope / Vision:
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

                        {/* Actions */}
                        <div className="space-y-3">
                            <a
                                id="send-collab-email-btn"
                                href={generateMailtoUrl()}
                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8d1a1a] to-[#ff0000] hover:from-[#ff0000] hover:to-[#ff4d4d] text-white text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:scale-[1.01]"
                            >
                                <Send className="w-4 h-4" />
                                <span>Launch Email Client with Details ↗</span>
                            </a>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopyEmail}
                                    className="flex-1 py-2.5 rounded-xl bg-[#1c202a] hover:bg-[#282d3b] text-white text-xs font-bold uppercase tracking-wider border border-[#2e3340] transition-all flex items-center justify-center gap-2"
                                >
                                    {copiedEmail ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-[#00ff66]" />
                                            <span className="text-[#00ff66]">Copied {CONTACT_EMAIL}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 text-[#00d2ff]" />
                                            <span>Copy Email ({CONTACT_EMAIL})</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCollabModalOpen(false);
                                        handleNavigatePage(activeTrackObj.targetView);
                                    }}
                                    className="py-2.5 px-4 rounded-xl bg-[#161820] hover:bg-[#20242f] text-[#00d2ff] text-xs font-bold uppercase tracking-wider border border-[#00d2ff]/30 transition-all flex items-center gap-1.5"
                                    title={`Explore ${activeTrackObj.pageName}`}
                                >
                                    <span>Visit {activeTrackObj.pageName}</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Extra channels */}
                        <div className="mt-6 pt-4 border-t border-[#242830] flex flex-wrap items-center justify-between text-[11px] text-[#70757e]">
                            <span>Alternative Portals:</span>
                            <div className="flex gap-3">
                                <a 
                                    href="https://www.youtube.com/@thedemoncodex"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-[#ff4d4d] transition-colors"
                                >
                                    YouTube ↗
                                </a>
                                <a 
                                    href="https://denomicdesigns2.gumroad.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-[#ffaa00] transition-colors"
                                >
                                    Gumroad ↗
                                </a>
                                <a 
                                    href="https://denomic-designs-ai.streamlit.app/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:text-[#00d2ff] transition-colors"
                                >
                                    Streamlit ↗
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#8d1a1a]/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#00d2ff]/10 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
    );
};
