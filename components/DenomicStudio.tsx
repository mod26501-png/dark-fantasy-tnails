import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { audioFX } from '../services/audioService';
import { 
    Terminal, 
    ShoppingBag, 
    ExternalLink, 
    Sparkles, 
    Copy, 
    Check, 
    Bot, 
    Zap, 
    ShieldAlert, 
    Code, 
    Layers, 
    Flame, 
    Maximize2, 
    Minimize2, 
    RefreshCw, 
    ArrowLeft,
    Download,
    Cpu,
    BookOpen,
    X
} from 'lucide-react';

interface DenomicStudioProps {
    onBack: () => void;
    onNavigateForge?: () => void;
    onNavigateCrucible?: () => void;
}

interface EmporiumProduct {
    id: string;
    title: string;
    tagline: string;
    description: string;
    price: string;
    category: 'Prompts' | 'Assets' | 'Templates' | 'Commissions';
    gumroadUrl: string;
    badge: string;
    highlightColor: string;
    features: string[];
}

const EMPORIUM_PRODUCTS: EmporiumProduct[] = [
    {
        id: 'demon-codex-ultimate-vault',
        title: 'The Demon Codex: Ultimate 4K Dark Fantasy Wallpapers, Motion Loops & Heavy Metal Stems',
        tagline: '500+ Curated Dark Fantasy & Occult AI Directives',
        description: 'Comprehensive prompt engineering compendium engineered for Midjourney v6, Gemini 3 Pro, and Stable Diffusion. Includes negative prompt matrices, lighting formulas, and atmospheric modifiers.',
        price: '$9.99',
        category: 'Assets',
        gumroadUrl: 'https://denomicdesigns2.gumroad.com/l/wmyzpb',
        badge: 'FLAGSHIP VAULT',
        highlightColor: '#ff0000',
        features: [
            '500+ High-Contrast Gothic & Dark Art Prompts',
            'Veo 3.1 & Runway Gen-3 Cinematic Motion Formulas',
            'Negative Prompt & Geometry Artifact Shields',
            'Lifetime Monthly Grimoire Updates'
        ]
    },
    {
        id: 'veo-cinematics',
        title: 'Veo 3.1 Occult Cinematography Pack',
        tagline: 'High-Bitrate Atmospheric Motion & Video Directives',
        description: 'Master camera movement, volumetric mist, spectral embers, and abyssal entity physics for Google Veo 3.1 and Sora video alchemy engines.',
        price: '$14.99',
        category: 'Prompts',
        gumroadUrl: 'https://denomicdesigns2.gumroad.com/',
        badge: 'NEW RELEASE',
        highlightColor: '#ffaa00',
        features: [
            '120+ Motion-Tested Camera Dolly & Drone Prompts',
            'Volumetric Smoke & Abyssal Lightning Shaders',
            'Aspect Ratio & Aspect-Ratio-Preserving Ratios',
            'Audio Prompting Stems for Sound Design'
        ]
    },
    {
        id: 'texture-vault',
        title: '8K Abyssal Texture & Alpha Maps Vault',
        tagline: 'Demonic Runes, Grimoire Parchment & Alchemical Sigils',
        description: 'Ultra-high-resolution displacement maps, demonic rune sets, corrupted gold leaf textures, and weathered parchment alphas for Photoshop, Blender, and 2D/3D compositing.',
        price: '$19.99',
        category: 'Assets',
        gumroadUrl: 'https://denomicdesigns2.gumroad.com/',
        badge: '8K ASSETS',
        highlightColor: '#00d2ff',
        features: [
            '85+ Transparent Demonic Sigil Alphas (PNG & SVG)',
            '40+ 8K Seamless Parchment & Corroded Metal Shaders',
            'Photoshop Custom Brushes & Layer Styles',
            'Commercial Use License Included'
        ]
    },
    {
        id: 'custom-codex',
        title: 'Custom Alchemical Codex Commission',
        tagline: 'Bespoke Worldbuilding, Agent Logic & Relic Creation',
        description: 'Direct collaboration with the creator of Denomic Designs to engineer a personalized dark fantasy universe, customized Streamlit agent, or branded visual relic system.',
        price: '$49.99',
        category: 'Commissions',
        gumroadUrl: 'https://denomicdesigns2.gumroad.com/',
        badge: 'BESPOKE TIER',
        highlightColor: '#ff4d4d',
        features: [
            'Dedicated 1-on-1 Concept & Prompt Engineering Session',
            'Custom Streamlit Agent Pipeline / API Hook',
            'Full 4K Upscaled Relic Suite with Lore Scribing',
            'Direct Delivery & Source Code / Prompt Archives'
        ]
    }
];

export const DenomicStudio: React.FC<DenomicStudioProps> = ({ 
    onBack, 
    onNavigateForge, 
    onNavigateCrucible 
}) => {
    const [activeTab, setActiveTab] = useState<'agent' | 'powershell' | 'emporium' | 'teleporter'>('agent');
    const [iframeHeight, setIframeHeight] = useState<'compact' | 'standard' | 'expanded' | 'modal'>('standard');
    const [isIframeFullscreen, setIsIframeFullscreen] = useState<boolean>(false);
    const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

    // Prompt Teleporter state
    const [targetAgent, setTargetAgent] = useState<'streamlit' | 'powershell' | 'gemini'>('streamlit');
    const [promptTopic, setPromptTopic] = useState<string>('Abyssal Sovereign Crown forged from obsidian and living crimson lightning');
    const [agentStyle, setAgentStyle] = useState<string>('Dark Fantasy / Atmospheric Gothic / 8K Octane Render');
    const [teleportResult, setTeleportResult] = useState<string>('');

    // Dark Fantasy Background Themes for Streamlit Studio
    const [backgroundTheme, setBackgroundTheme] = useState<'blood-altar' | 'abyssal-void' | 'hellfire-forge' | 'grimoire-runes'>('blood-altar');
    const [studioViewMode, setStudioViewMode] = useState<'altar' | 'frame'>('altar');

    const STREAMLIT_EMBED_URL = "https://denomic-designs-ai.streamlit.app/?embed=true&theme.base=dark&theme.primaryColor=%23ff4d4d&theme.backgroundColor=%230c0e14&theme.secondaryBackgroundColor=%23141822&theme.textColor=%23e8e6e3";
    const DIRECT_STREAMLIT_URL = "https://denomic-designs-ai.streamlit.app/";
    const STREAMLIT_URL = STREAMLIT_EMBED_URL;
    const GUMROAD_URL = "https://denomicdesigns2.gumroad.com/";

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (iframeHeight === 'modal') {
                    setIframeHeight('standard');
                } else {
                    onBack();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [iframeHeight, onBack]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    const generateTeleportPayload = () => {
        let payload = "";
        if (targetAgent === 'streamlit') {
            payload = `[DENOMIC DESIGNS AGENT INPUT]\nTask: Generate Visual & Narrative Codex\nTopic: ${promptTopic}\nStyle Directive: ${agentStyle}\nParameters: { fidelity: "Maximum", color_palette: "Obsidian / Crimson / Abyssal Gold", engine: "Gemini 3 Pro" }\nOutput Format: Relic Card + Cinematic Prompt + Lore Inscription`;
        } else if (targetAgent === 'powershell') {
            payload = `$Prompt = @"
Manifestation Directive: ${promptTopic}
Aesthetic: ${agentStyle}
High-fidelity render with dark ambient lighting, cinematic 8k resolution, intricate demonic runes.
"@

# PowerShell Local Agent Invocation with Tier-Preservation Timeout
Write-Host "[*] Teleporting prompt to Denomic Local Agent..." -ForegroundColor Red
Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$env:GEMINI_API_KEY" \`
  -Method POST \`
  -Headers @{ "Content-Type" = "application/json" } \`
  -Body (@{ contents = @(@{ parts = @(@{ text = $Prompt }) }) } | ConvertTo-Json -Depth 5)`;
        } else {
            payload = `Act as the Denomic Designs Occult Master. Construct a complete dark fantasy visual relic suite for "${promptTopic}". Apply the style: "${agentStyle}". Include: 1) Cinematic Image Prompt, 2) Veo 3.1 Motion Camera Directive, 3) Grim Lore Inscription, and 4) Alchemical Artifact Stats.`;
        }
        setTeleportResult(payload);
    };

    return (
        <div className="w-full flex flex-col gap-6 pb-16 animate-fade-in text-[#e8e6e3] relative">
            {/* Sticky Navigation & Quick Exit Bar — ALWAYS visible below ribbon */}
            <div className="sticky top-28 z-40 bg-[#0c0e14]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#c26b3a]/40 shadow-[0_4px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                    <button 
                        onClick={onBack}
                        className="p-1.5 rounded-lg bg-[#111318] border border-[#242830] text-[#70757e] hover:text-white hover:border-[#c26b3a] transition-all"
                        title="Return to Forge (Esc)"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c26b3a] animate-pulse"></span>
                        <span className="font-bold text-white uppercase tracking-wider text-[11px]">Streamlit Agent & Nexus Studio</span>
                    </div>
                </div>
                <button 
                    onClick={onBack}
                    className="px-3.5 py-1.5 rounded-xl bg-[#8d1a1a]/40 border border-[#ff4d4d]/60 text-white hover:bg-[#8d1a1a] hover:border-[#ff4d4d] hover:shadow-[0_0_18px_rgba(255,77,77,0.7)] transition-all font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
                    title="Close Studio and return to Forge (Esc)"
                >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Close & Return to Forge</span>
                    <span className="sm:hidden">Close</span>
                </button>
            </div>

            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0e1015] via-[#16121b] to-[#0e1015] p-6 sm:p-8 rounded-3xl border border-[#c26b3a]/30 shadow-[0_0_50px_rgba(194,107,58,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ff4d4d]/10 via-[#c26b3a]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex items-start gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2.5 rounded-xl bg-[#111318] border border-[#242830] text-[#70757e] hover:text-white hover:border-[#c26b3a] transition-all group"
                        title="Return to Forge"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c26b3a]/15 border border-[#c26b3a]/40 text-[#c26b3a] text-[10px] font-black tracking-widest uppercase mb-2">
                            <Bot className="w-3.5 h-3.5 animate-pulse" />
                            Denomic Multi-App Ecosystem
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                            Denomic Designs Studio
                            <span className="text-sm font-mono text-[#70757e] not-italic px-2.5 py-0.5 rounded-md bg-[#111318] border border-[#242830]">
                                v2.5 Nexus
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-[#9aa0a6] mt-1 max-w-xl">
                            Unified portal connecting the <strong className="text-white">Streamlit Agentic Studio</strong>, <strong className="text-[#00d2ff]">PowerShell Local Bridge</strong>, and the official <strong className="text-[#ff4d4d]">Gumroad Emporium</strong>.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => {
                            setActiveTab('agent');
                            setIframeHeight('modal');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#ff4d4d]/20 border border-[#ff4d4d] hover:bg-[#ff4d4d] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_18px_rgba(255,77,77,0.3)] hover:shadow-[0_0_25px_rgba(255,77,77,0.6)]"
                    >
                        <span>🤖</span>
                        <span>Open Streamlit Agent ↗</span>
                    </button>
                    <a
                        href={GUMROAD_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#c26b3a]/20 border border-[#c26b3a] hover:bg-[#c26b3a] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(194,107,58,0.3)] hover:shadow-[0_0_25px_rgba(194,107,58,0.6)]"
                    >
                        <span>🛍️</span>
                        <span>Gumroad Store ↗</span>
                    </a>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242830] pb-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTab('agent')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                            activeTab === 'agent'
                                ? 'bg-[#ff4d4d] text-white border-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.4)]'
                                : 'bg-[#111318] border-[#242830] text-[#70757e] hover:text-white hover:border-[#ff4d4d]/50'
                        }`}
                    >
                        <Bot className="w-4 h-4" />
                        Streamlit Agent Portal
                    </button>
                    <button
                        onClick={() => setActiveTab('powershell')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                            activeTab === 'powershell'
                                ? 'bg-[#00d2ff] text-black border-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.4)]'
                                : 'bg-[#111318] border-[#242830] text-[#70757e] hover:text-white hover:border-[#00d2ff]/50'
                        }`}
                    >
                        <Terminal className="w-4 h-4" />
                        PowerShell Local Bridge & Tier Saver
                    </button>
                    <button
                        onClick={() => setActiveTab('emporium')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                            activeTab === 'emporium'
                                ? 'bg-[#c26b3a] text-white border-[#c26b3a] shadow-[0_0_20px_rgba(194,107,58,0.4)]'
                                : 'bg-[#111318] border-[#242830] text-[#70757e] hover:text-white hover:border-[#c26b3a]/50'
                        }`}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Gumroad Emporium (4 Products)
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('teleporter');
                            if (!teleportResult) generateTeleportPayload();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                            activeTab === 'teleporter'
                                ? 'bg-[#ffaa00] text-black border-[#ffaa00] shadow-[0_0_20px_rgba(255,170,0,0.4)]'
                                : 'bg-[#111318] border-[#242830] text-[#70757e] hover:text-white hover:border-[#ffaa00]/50'
                        }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        Prompt Relay & Teleporter
                    </button>
                </div>

                <div className="text-[10px] font-mono text-[#70757e] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse"></span>
                    <span>ALL CHANNELS ACTIVE</span>
                </div>
            </div>

            {/* TAB 1: Streamlit Agent Portal */}
            {activeTab === 'agent' && (
                <div className="flex flex-col gap-5">
                    {/* Dark Fantasy Customization Ribbon */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#100d14]/95 border border-[#2a1c2e] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-xl backdrop-blur-md">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl select-none">🤖</span>
                                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2 uppercase tracking-wide">
                                    Denomic Designs AI (Streamlit Agentic Studio)
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#ff4d4d]/15 border border-[#ff4d4d]/40 text-[9px] font-mono font-bold text-[#ff4d4d] uppercase tracking-widest hidden sm:inline">
                                    Agentic Engine
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-[#a094a8] mt-1">
                                Occult intelligence node hosted at <a href={DIRECT_STREAMLIT_URL} target="_blank" rel="noreferrer" className="font-mono text-[#ff4d4d] hover:underline">{DIRECT_STREAMLIT_URL}</a>.
                            </p>
                        </div>

                        {/* Top Controls: Background Themes, View Mode & Launch */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
                            {/* Background Selector */}
                            <div className="flex items-center bg-[#0a070e] border border-[#2e1d35] rounded-xl p-1 gap-1">
                                <span className="text-[9px] font-mono text-[#8a7a94] uppercase tracking-wider px-1.5 hidden sm:inline">Theme:</span>
                                <button
                                    onClick={() => setBackgroundTheme('blood-altar')}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
                                        backgroundTheme === 'blood-altar'
                                            ? 'bg-[#8d1a1a] text-white shadow-[0_0_10px_rgba(255,77,77,0.5)]'
                                            : 'text-[#9e8fa6] hover:text-white'
                                    }`}
                                    title="Blood Ritual Altar Theme"
                                >
                                    <span>🩸</span>
                                    <span className="hidden md:inline">Blood Altar</span>
                                </button>
                                <button
                                    onClick={() => setBackgroundTheme('abyssal-void')}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
                                        backgroundTheme === 'abyssal-void'
                                            ? 'bg-[#006699] text-white shadow-[0_0_10px_rgba(0,210,255,0.5)]'
                                            : 'text-[#9e8fa6] hover:text-white'
                                    }`}
                                    title="Abyssal Void Arcane Theme"
                                >
                                    <span>⚔️</span>
                                    <span className="hidden md:inline">Abyssal Void</span>
                                </button>
                                <button
                                    onClick={() => setBackgroundTheme('hellfire-forge')}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
                                        backgroundTheme === 'hellfire-forge'
                                            ? 'bg-[#b35900] text-white shadow-[0_0_10px_rgba(255,170,0,0.5)]'
                                            : 'text-[#9e8fa6] hover:text-white'
                                    }`}
                                    title="Hellfire Molten Forge Theme"
                                >
                                    <span>🔥</span>
                                    <span className="hidden md:inline">Hellfire</span>
                                </button>
                                <button
                                    onClick={() => setBackgroundTheme('grimoire-runes')}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${
                                        backgroundTheme === 'grimoire-runes'
                                            ? 'bg-[#997300] text-white shadow-[0_0_10px_rgba(255,210,127,0.5)]'
                                            : 'text-[#9e8fa6] hover:text-white'
                                    }`}
                                    title="Grimoire Sanctum Theme"
                                >
                                    <span>📜</span>
                                    <span className="hidden md:inline">Grimoire</span>
                                </button>
                            </div>

                            {/* Mode Toggle: Command Altar vs Live Embedded Frame */}
                            <div className="flex items-center bg-[#0a070e] border border-[#2e1d35] rounded-xl p-1 gap-1">
                                <button
                                    onClick={() => setStudioViewMode('altar')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                                        studioViewMode === 'altar'
                                            ? 'bg-gradient-to-r from-[#8d1a1a] to-[#ff4d4d] text-white shadow-[0_0_12px_rgba(255,77,77,0.4)]'
                                            : 'text-[#9e8fa6] hover:text-white'
                                    }`}
                                >
                                    <span>🛡️ Altar Hub</span>
                                </button>
                                <button
                                    onClick={() => setStudioViewMode('frame')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                                        studioViewMode === 'frame'
                                            ? 'bg-gradient-to-r from-[#8d1a1a] to-[#ff4d4d] text-white shadow-[0_0_12px_rgba(255,77,77,0.4)]'
                                            : 'text-[#9e8fa6] hover:text-white'
                                    }`}
                                >
                                    <span>🖥️ Live Frame</span>
                                </button>
                            </div>

                            {/* Direct Open in New Tab Button */}
                            <a
                                href={DIRECT_STREAMLIT_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8d1a1a] via-[#b82424] to-[#8d1a1a] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,77,77,0.4)] hover:scale-105 active:scale-95"
                            >
                                <span>Direct Launch ↗</span>
                            </a>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA: Render either Dark Fantasy Command Altar OR Embedded Live Frame */}
                    {studioViewMode === 'altar' ? (
                        /* OCCULT COMMAND ALTAR WITH RICH DARK FANTASY BACKGROUND */
                        <div className={`relative w-full rounded-3xl border-2 p-6 sm:p-10 flex flex-col items-center text-center overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] transition-all duration-500 ${
                            backgroundTheme === 'blood-altar'
                                ? 'bg-gradient-to-b from-[#180507] via-[#10060d] to-[#070407] border-[#8d1a1a]/70 shadow-[inset_0_0_90px_rgba(255,20,20,0.2)]'
                                : backgroundTheme === 'abyssal-void'
                                ? 'bg-gradient-to-b from-[#060a16] via-[#090716] to-[#04040a] border-[#00d2ff]/50 shadow-[inset_0_0_90px_rgba(0,210,255,0.2)]'
                                : backgroundTheme === 'hellfire-forge'
                                ? 'bg-gradient-to-b from-[#180b03] via-[#120704] to-[#070403] border-[#ffaa00]/60 shadow-[inset_0_0_90px_rgba(255,170,0,0.2)]'
                                : 'bg-gradient-to-b from-[#14100a] via-[#0e0b08] to-[#070604] border-[#ffd27f]/60 shadow-[inset_0_0_90px_rgba(255,210,127,0.2)]'
                        }`}>
                            {/* Ambient Occult Glow Haloes */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#ff4d4d]/15 rounded-full blur-3xl pointer-events-none -mt-32" />
                            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#ffd27f]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mb-20" />

                            {/* Runic Background Watermark */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none font-mono text-8xl tracking-[2em] text-[#ff4d4d]">
                                ᛟ ᚱ ᚦ ᚨ ᛏ ᛋ
                            </div>

                            {/* Alchemical Ritual Circle & Logo */}
                            <div className="relative z-10 mb-6 flex flex-col items-center">
                                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-[#ff4d4d] via-[#ffd27f] to-[#ff4d4d] shadow-[0_0_35px_rgba(255,77,77,0.6)] relative flex items-center justify-center mb-4">
                                    <div className="w-full h-full rounded-full bg-[#0d070b] overflow-hidden flex items-center justify-center border-2 border-black">
                                        <img
                                            src="/logo.png"
                                            alt="Denomic Designs Logo"
                                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_0_12px_rgba(255,77,77,0.8)] animate-pulse"
                                            onError={(e) => {
                                                // Fallback if logo fails to load
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <div className="absolute -inset-2 border border-dashed border-[#ff4d4d]/40 rounded-full animate-[spin_40s_linear_infinite]" />
                                </div>

                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-[10px] font-mono text-[#ff4d4d] uppercase tracking-widest mb-2">
                                    <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-ping" />
                                    <span>Streamlit Agentic Node Online</span>
                                </div>

                                <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] via-[#fff] to-[#ff4d4d] uppercase tracking-wider font-serif mb-2">
                                    Denomic Designs AI Studio
                                </h2>

                                <p className="text-xs sm:text-sm text-[#c8bccc] max-w-xl leading-relaxed mb-6">
                                    Full dark fantasy agentic studio with custom autonomous workflows, prompt intelligence, and generative relic synthesis.
                                </p>

                                {/* Primary Big Action Buttons */}
                                <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
                                    <a
                                        href={DIRECT_STREAMLIT_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#8d1a1a] via-[#ff4d4d] to-[#8d1a1a] hover:brightness-125 active:scale-95 text-white font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(255,77,77,0.6)] flex items-center gap-2.5 cursor-pointer"
                                    >
                                        <span>⚡ Launch Studio in Dedicated Window</span>
                                        <span>↗</span>
                                    </a>

                                    <button
                                        onClick={() => setStudioViewMode('frame')}
                                        className="px-5 py-3.5 rounded-2xl bg-[#1b121c] border border-[#ff4d4d]/40 hover:bg-[#ff4d4d]/20 text-[#ff4d4d] hover:text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                                    >
                                        <span>🖥️ Open Embedded Canvas</span>
                                    </button>
                                </div>

                                {/* Quick Prompt Teleport Presets */}
                                <div className="w-full max-w-2xl bg-[#0d070f]/80 border border-[#ff4d4d]/30 rounded-2xl p-4 sm:p-5 text-left">
                                    <div className="flex items-center justify-between mb-3 border-b border-[#ff4d4d]/20 pb-2">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-[#ff4d4d] flex items-center gap-1.5">
                                            <span>🔮</span>
                                            <span>Quick Direct Prompts for Streamlit Agent:</span>
                                        </span>
                                        <span className="text-[9px] font-mono text-[#8a7a94]">
                                            Click to copy & launch
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {[
                                            {
                                                title: 'Abyssal Soulblade',
                                                prompt: 'Forged runic soulblade in obsidian stone with crimson mist and volumetric embers 8K render',
                                                icon: '⚔️'
                                            },
                                            {
                                                title: 'Demon Codex Altar',
                                                prompt: 'Ancient demonic summoning circle on cracked basalt with blood runes and gothic candelabras',
                                                icon: '🩸'
                                            },
                                            {
                                                title: 'Necromantic Relic',
                                                prompt: 'Corrupted golden reliquary pulsing with purple abyssal electricity and carved occult scriptures',
                                                icon: '💀'
                                            }
                                        ].map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.prompt);
                                                    audioFX.playRuneChime();
                                                    window.open(DIRECT_STREAMLIT_URL, '_blank');
                                                }}
                                                className="p-3 rounded-xl bg-[#160d19] border border-[#ff4d4d]/20 hover:border-[#ff4d4d] hover:bg-[#ff4d4d]/10 transition-all text-left group"
                                            >
                                                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                                                    <span>{item.icon} {item.title}</span>
                                                    <span className="text-[10px] text-[#ff4d4d] opacity-0 group-hover:opacity-100 transition-opacity">Copy ↗</span>
                                                </div>
                                                <p className="text-[10px] text-[#a899af] line-clamp-2 leading-snug">
                                                    {item.prompt}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* LIVE EMBEDDED FRAME WITH DARK FANTASY STYLED BORDER & BACKGROUND */
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2 text-xs text-[#baa98c]">
                                    <span className="w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
                                    <span>Streamlit Live Canvas Mode</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Sizing Controls */}
                                    <div className="flex items-center bg-[#090b0e] border border-[#242830] rounded-xl p-1 gap-1">
                                        <button
                                            onClick={() => setIframeHeight('compact')}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                                iframeHeight === 'compact'
                                                    ? 'bg-[#c26b3a] text-white shadow'
                                                    : 'text-[#8b949e] hover:text-white'
                                            }`}
                                        >
                                            Compact
                                        </button>
                                        <button
                                            onClick={() => setIframeHeight('standard')}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                                iframeHeight === 'standard'
                                                    ? 'bg-[#c26b3a] text-white shadow'
                                                    : 'text-[#8b949e] hover:text-white'
                                            }`}
                                        >
                                            Standard
                                        </button>
                                        <button
                                            onClick={() => setIframeHeight('expanded')}
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                                iframeHeight === 'expanded'
                                                    ? 'bg-[#c26b3a] text-white shadow'
                                                    : 'text-[#8b949e] hover:text-white'
                                            }`}
                                        >
                                            Expanded
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setIframeHeight('modal')}
                                        className="px-3 py-1 rounded-xl bg-[#ff4d4d]/15 border border-[#ff4d4d]/60 hover:bg-[#ff4d4d] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(255,77,77,0.3)]"
                                    >
                                        <Maximize2 className="w-3 h-3" />
                                        <span>Theater View</span>
                                    </button>
                                </div>
                            </div>

                            <div className={`relative w-full rounded-3xl border-2 overflow-hidden transition-all duration-300 ${
                                backgroundTheme === 'blood-altar'
                                    ? 'bg-gradient-to-b from-[#180507] via-[#10060d] to-[#070407] border-[#8d1a1a]/70'
                                    : backgroundTheme === 'abyssal-void'
                                    ? 'bg-gradient-to-b from-[#060a16] via-[#090716] to-[#04040a] border-[#00d2ff]/50'
                                    : backgroundTheme === 'hellfire-forge'
                                    ? 'bg-gradient-to-b from-[#180b03] via-[#120704] to-[#070403] border-[#ffaa00]/60'
                                    : 'bg-gradient-to-b from-[#14100a] via-[#0e0b08] to-[#070604] border-[#ffd27f]/60'
                            } ${
                                iframeHeight === 'compact' ? 'h-[460px]' : iframeHeight === 'expanded' ? 'h-[720px]' : 'h-[580px]'
                            }`}>
                                {!iframeLoaded && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d070f]/95 backdrop-blur-sm gap-3 p-6 text-center">
                                        <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-[#ff4d4d] to-[#ffd27f] mb-1 animate-pulse">
                                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                        </div>
                                        <span className="w-8 h-8 border-3 border-[#ff4d4d]/30 border-t-[#ff4d4d] rounded-full animate-spin"></span>
                                        <p className="text-xs font-mono uppercase tracking-widest text-[#ffd27f]">
                                            Summoning Streamlit Agentic Studio...
                                        </p>
                                        <p className="text-[11px] text-[#998b9e] max-w-sm">
                                            If your browser blocks embedded frames, click the direct button below:
                                        </p>
                                        <a
                                            href={DIRECT_STREAMLIT_URL}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8d1a1a] to-[#ff4d4d] text-white font-black text-xs uppercase tracking-wider shadow"
                                        >
                                            Launch in Dedicated Tab ↗
                                        </a>
                                    </div>
                                )}
                                <iframe
                                    src={STREAMLIT_EMBED_URL}
                                    title="Denomic Designs AI Streamlit Agent"
                                    className="w-full h-full border-0"
                                    style={{ backgroundColor: '#0c0e14' }}
                                    onLoad={() => setIframeLoaded(true)}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                                />
                            </div>
                        </div>
                    )}

                    {/* Quick Exit Reminder Bar beneath the studio */}
                    <div className="flex items-center justify-between p-3.5 bg-[#110d16]/90 border border-[#2e1d35] rounded-xl text-xs text-[#a094a8]">
                        <span>Streamlit Agent portal active. Press <strong className="text-white font-mono bg-black/50 px-1.5 py-0.5 rounded border border-[#333]">Esc</strong> or click Return anytime:</span>
                        <button
                            onClick={onBack}
                            className="px-3 py-1 bg-[#8d1a1a]/30 border border-[#ff4d4d]/50 hover:bg-[#8d1a1a] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Return to Forge</span>
                        </button>
                    </div>
                </div>
            )}

            {/* FULLSCREEN THEATER MODAL (When Theater View is chosen) */}
            {iframeHeight === 'modal' && (
                <div className="fixed inset-0 z-[260] bg-black/95 backdrop-blur-md flex flex-col p-2 sm:p-4 animate-fade-in">
                    {/* Fixed Modal Header — GUARANTEED visible, never scrolls off */}
                    <div className="flex items-center justify-between bg-[#110d16] border border-[#ff4d4d]/40 px-4 py-3 rounded-2xl mb-2 shadow-[0_0_30px_rgba(0,0,0,0.9)] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">🤖</span>
                            <div>
                                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    Streamlit Agentic Studio
                                    <span className="text-[10px] text-[#ff4d4d] font-mono px-2 py-0.5 bg-[#ff4d4d]/10 rounded border border-[#ff4d4d]/30">
                                        Theater Mode
                                    </span>
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <a
                                href={DIRECT_STREAMLIT_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b121e] hover:bg-[#28182d] text-white border border-[#ff4d4d]/40 rounded-xl text-xs font-bold transition-all shadow-[0_0_10px_rgba(255,77,77,0.3)]"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Direct Tab ↗</span>
                            </a>
                            <button
                                onClick={() => setIframeHeight('standard')}
                                className="px-4 py-2 bg-gradient-to-r from-[#8d1a1a] to-[#ff4d4d] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,77,77,0.7)] flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                title="Exit Fullscreen Theater (Esc)"
                            >
                                <X className="w-4 h-4" />
                                <span>Close (Esc)</span>
                            </button>
                        </div>
                    </div>

                    {/* Full Height Modal Iframe with dark fantasy backdrop */}
                    <div className="flex-grow w-full rounded-2xl border-2 border-[#ff4d4d]/40 bg-gradient-to-b from-[#180507] via-[#10060d] to-[#070407] overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                        <iframe
                            src={STREAMLIT_EMBED_URL}
                            title="Denomic Designs AI Streamlit Agent Fullscreen"
                            className="w-full h-full border-0"
                            style={{ backgroundColor: '#0c0e14' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: PowerShell Local Bridge & Tier Preservation */}
            {activeTab === 'powershell' && (
                <div className="flex flex-col gap-6">
                    {/* Tier Advisory Alert */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#00d2ff]/10 via-[#111318] to-[#ffaa00]/10 border border-[#00d2ff]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,210,255,0.1)]">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[#00d2ff]/20 text-[#00d2ff] flex items-center justify-center font-black text-lg flex-shrink-0 border border-[#00d2ff]/40">
                                ⚡
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    Local PowerShell Agent + Quota Preservation Mode
                                </h3>
                                <p className="text-xs text-[#9aa0a6] mt-0.5 leading-relaxed">
                                    Running agents locally in PowerShell is blazing fast, but tier timeouts or rate limits can drain session allowances. Use these optimized scripts to batch generation, cache results, and gracefully fallback to Flash tier!
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#00d2ff]/20 text-[#00d2ff] text-[10px] font-mono font-bold tracking-wider uppercase border border-[#00d2ff]/40">
                            POWERSHELL 7+ READY
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Script 1: Rapid CLI Manifest Script */}
                        <div className="p-6 rounded-2xl bg-[#111318] border border-[#242830] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-[#00d2ff]" />
                                        <h4 className="text-sm font-bold text-white">1. One-Liner PowerShell Prompt Runner</h4>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(`$idea = "Demon Codex Relic: Abyssal Blade of Cinders"
$body = @{ contents = @(@{ parts = @(@{ text = "Generate 3 dark fantasy relic prompts for: $idea in 8k cinematic format." }) }) } | ConvertTo-Json -Depth 5
$response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$env:GEMINI_API_KEY" -Method POST -Headers @{ "Content-Type" = "application/json" } -Body $body
$response.candidates[0].content.parts[0].text`, 'ps-oneliner')}
                                        className="px-3 py-1.5 rounded-lg bg-[#1e232d] hover:bg-[#00d2ff] hover:text-black text-[#00d2ff] text-xs font-bold transition-all flex items-center gap-1.5"
                                    >
                                        {copiedIndex === 'ps-oneliner' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedIndex === 'ps-oneliner' ? 'Copied' : 'Copy Script'}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-[#70757e] mb-4">
                                    Runs entirely in Windows PowerShell without web GUI overhead. Uses Flash tier to consume virtually zero quota.
                                </p>
                                <pre className="p-4 rounded-xl bg-[#090b0e] border border-[#1b1e26] text-[11px] font-mono text-[#00d2ff] overflow-x-auto leading-relaxed">
{`# Set your relic concept
$idea = "Demon Codex Relic: Abyssal Blade of Cinders"

# Build minimal JSON payload
$body = @{
  contents = @(@{
    parts = @(@{ text = "Generate 3 dark fantasy relic prompts for: $idea in 8k cinematic format." })
  })
} | ConvertTo-Json -Depth 5

# Execute direct REST call to Gemini
$response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$env:GEMINI_API_KEY" \`
  -Method POST \`
  -Headers @{ "Content-Type" = "application/json" } \`
  -Body $body

$response.candidates[0].content.parts[0].text`}
                                </pre>
                            </div>
                        </div>

                        {/* Script 2: Streamlit Agent Local Keep-Alive & Runner */}
                        <div className="p-6 rounded-2xl bg-[#111318] border border-[#242830] flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-[#ffaa00]" />
                                        <h4 className="text-sm font-bold text-white">2. Launch Agent Locally (Zero Tier Timeout)</h4>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(`git clone https://github.com/your-repo/denomic-designs-ai.git
cd denomic-designs-ai
pip install streamlit google-genai
$env:GEMINI_API_KEY="your_api_key_here"
streamlit run app.py --server.port 8501`, 'ps-local-streamlit')}
                                        className="px-3 py-1.5 rounded-lg bg-[#1e232d] hover:bg-[#ffaa00] hover:text-black text-[#ffaa00] text-xs font-bold transition-all flex items-center gap-1.5"
                                    >
                                        {copiedIndex === 'ps-local-streamlit' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedIndex === 'ps-local-streamlit' ? 'Copied' : 'Copy Commands'}</span>
                                    </button>
                                </div>
                                <p className="text-xs text-[#70757e] mb-4">
                                    If your cloud Streamlit tier expires or times out, run the Streamlit agent on your local machine localhost with no runtime limits:
                                </p>
                                <pre className="p-4 rounded-xl bg-[#090b0e] border border-[#1b1e26] text-[11px] font-mono text-[#ffaa00] overflow-x-auto leading-relaxed">
{`# 1. Install local dependencies in PowerShell
pip install streamlit google-genai pillow

# 2. Set environment API key
$env:GEMINI_API_KEY="AIzaSyYourKeyHere..."

# 3. Launch Streamlit agent on local machine
streamlit run app.py --server.port 8501

# Opens in your browser at http://localhost:8501 with NO time limits`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips for Quota Optimization */}
                    <div className="p-6 rounded-2xl bg-[#0e1015] border border-[#242830] grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-[#111318] border border-[#242830]/80">
                            <h5 className="text-xs font-bold text-white flex items-center gap-2 mb-1">
                                <span className="text-[#34a853]">✓</span> Batch Prompts in One Turn
                            </h5>
                            <p className="text-[11px] text-[#70757e] leading-relaxed">
                                Ask for 5 relics or 3 scripts in a single prompt rather than 5 separate requests to conserve agent tool turns.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#111318] border border-[#242830]/80">
                            <h5 className="text-xs font-bold text-white flex items-center gap-2 mb-1">
                                <span className="text-[#00d2ff]">✓</span> Target Flash Tier for Drafts
                            </h5>
                            <p className="text-[11px] text-[#70757e] leading-relaxed">
                                Use Gemini 2.5 Flash for rapid prototyping, and save Gemini 3 Pro / Veo 3.1 for your finalized master relics.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#111318] border border-[#242830]/80">
                            <h5 className="text-xs font-bold text-white flex items-center gap-2 mb-1">
                                <span className="text-[#ff4d4d]">✓</span> Save to Cloud Codex
                            </h5>
                            <p className="text-[11px] text-[#70757e] leading-relaxed">
                                Synchronize your relics to Firebase and Cloud SQL directly in the Codex tab so you never lose prompt work.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Gumroad Emporium */}
            {activeTab === 'emporium' && (
                <div className="flex flex-col gap-8">
                    {/* Store Hero Banner */}
                    <div className="p-8 rounded-3xl bg-gradient-to-r from-[#181212] via-[#211512] to-[#181212] border border-[#c26b3a]/40 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_40px_rgba(194,107,58,0.2)]">
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c26b3a]/20 text-[#c26b3a] text-[10px] font-black uppercase tracking-wider mb-3">
                                🛍️ Official Storefront
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
                                Denomic Designs Gumroad Vault
                            </h2>
                            <p className="text-xs sm:text-sm text-[#a0a5ad] mt-2 leading-relaxed">
                                Direct access to master grimoire prompt packages, high-bitrate video blueprints, 8K texture packs, and bespoke alchemical commissions.
                            </p>
                        </div>
                        <a
                            href={GUMROAD_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#c26b3a] to-[#ff4d4d] hover:from-[#ff4d4d] hover:to-[#ff0000] text-white font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(194,107,58,0.4)] flex items-center gap-2.5 flex-shrink-0"
                        >
                            <span>Visit Store: denomicdesigns2.gumroad.com</span>
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Product Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {EMPORIUM_PRODUCTS.map((prod) => (
                            <div
                                key={prod.id}
                                className="p-6 rounded-2xl bg-[#111318] border border-[#242830] hover:border-[#c26b3a]/60 transition-all flex flex-col justify-between group shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span 
                                            className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider text-white shadow"
                                            style={{ backgroundColor: prod.highlightColor }}
                                        >
                                            {prod.badge}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-[#70757e] uppercase">
                                            {prod.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black text-white group-hover:text-[#c26b3a] transition-colors">
                                        {prod.title}
                                    </h3>
                                    <p className="text-xs font-bold text-[#c26b3a] mt-1 mb-2">
                                        {prod.tagline}
                                    </p>
                                    <p className="text-xs text-[#70757e] leading-relaxed mb-4">
                                        {prod.description}
                                    </p>

                                    <div className="space-y-1.5 mb-6 pt-3 border-t border-[#242830]">
                                        {prod.features.map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-[#9aa0a6]">
                                                <span className="text-[#34a853] text-[10px]">✓</span>
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[#242830]">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-white">{prod.price}</span>
                                        <span className="text-[10px] text-[#70757e] uppercase">USD</span>
                                    </div>
                                    <a
                                        href={prod.gumroadUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2.5 rounded-xl bg-[#242830] hover:bg-[#c26b3a] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow"
                                    >
                                        <span>Unlock on Gumroad</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: Prompt Relay & Teleporter */}
            {activeTab === 'teleporter' && (
                <div className="flex flex-col gap-6">
                    <div className="p-6 rounded-2xl bg-[#111318] border border-[#242830] flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-[#ffaa00]" />
                            <h3 className="text-base font-bold text-white">
                                Bi-Directional Prompt & Relic Teleporter
                            </h3>
                        </div>
                        <p className="text-xs text-[#70757e]">
                            Format any relic concept, demon lore, or cinematography idea into a ready-to-inject command payload for the Streamlit Agent or your PowerShell console.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#70757e] mb-2">
                                    Target Environment
                                </label>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'streamlit', label: '🤖 Streamlit Web Agent' },
                                        { id: 'powershell', label: '⚡ Local PowerShell CLI' },
                                        { id: 'gemini', label: '🔮 Gemini 3 Pro Prompt' },
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setTargetAgent(t.id as any);
                                            }}
                                            className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                                                targetAgent === t.id
                                                    ? 'bg-[#ffaa00]/15 border-[#ffaa00] text-white'
                                                    : 'bg-[#0e1015] border-[#242830] text-[#70757e] hover:text-white'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#70757e] mb-1">
                                        Relic Subject or Concept
                                    </label>
                                    <input
                                        type="text"
                                        value={promptTopic}
                                        onChange={(e) => setPromptTopic(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e1015] border border-[#242830] text-xs text-white focus:border-[#ffaa00] outline-none"
                                        placeholder="e.g. Abyssal Horned Sovereign, Necrotic Citadel..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#70757e] mb-1">
                                        Style & Aesthetics Matrix
                                    </label>
                                    <input
                                        type="text"
                                        value={agentStyle}
                                        onChange={(e) => setAgentStyle(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e1015] border border-[#242830] text-xs text-white focus:border-[#ffaa00] outline-none"
                                        placeholder="e.g. Dark Fantasy, Unreal Engine 5, Octane Shaders..."
                                    />
                                </div>

                                <button
                                    onClick={generateTeleportPayload}
                                    className="mt-2 py-3 rounded-xl bg-[#ffaa00] hover:bg-[#ff8800] text-black font-black text-xs uppercase tracking-widest transition-all shadow"
                                >
                                    Build Teleport Payload
                                </button>
                            </div>
                        </div>

                        {teleportResult && (
                            <div className="mt-4 pt-4 border-t border-[#242830] flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono font-bold text-[#ffaa00]">
                                        Generated Payload for {targetAgent.toUpperCase()}:
                                    </span>
                                    <button
                                        onClick={() => handleCopy(teleportResult, 'teleport-payload')}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#242830] hover:bg-[#ffaa00] hover:text-black text-white text-xs font-bold transition-all flex items-center gap-1.5"
                                    >
                                        {copiedIndex === 'teleport-payload' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedIndex === 'teleport-payload' ? 'Copied to Clipboard' : 'Copy Payload'}</span>
                                    </button>
                                </div>
                                <pre className="p-4 rounded-xl bg-[#090b0e] border border-[#1b1e26] text-xs font-mono text-[#e8e6e3] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                    {teleportResult}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
