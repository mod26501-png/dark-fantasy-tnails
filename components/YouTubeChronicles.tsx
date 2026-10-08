import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Play, 
    ExternalLink, 
    Sparkles, 
    Copy, 
    Check, 
    Video, 
    Flame, 
    Radio, 
    Share2, 
    Film, 
    Tv,
    X,
    RefreshCw,
    Maximize2,
    Calendar,
    Eye,
    Search
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { 
    fetchLatestYouTubeVideos, 
    YouTubeVideo, 
    YouTubeChannelInfo, 
    FALLBACK_CHRONICLES 
} from '../services/youtubeService';

interface YouTubeChroniclesProps {
    onBack: () => void;
    onNavigateCrucible?: () => void;
}

export const YouTubeChronicles: React.FC<YouTubeChroniclesProps> = ({ onBack, onNavigateCrucible }) => {
    const [videos, setVideos] = useState<YouTubeVideo[]>(FALLBACK_CHRONICLES);
    const [channelInfo, setChannelInfo] = useState<YouTubeChannelInfo | null>(null);
    const [isLoadingVideos, setIsLoadingVideos] = useState<boolean>(true);
    const [apiSource, setApiSource] = useState<'api' | 'fallback'>('fallback');
    const [activeTab, setActiveTab] = useState<'all' | 'shorts' | 'lore' | 'tutorials' | 'soundscapes'>('all');
    const [selectedFeatured, setSelectedFeatured] = useState<YouTubeVideo>(FALLBACK_CHRONICLES[0]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isPlayingInline, setIsPlayingInline] = useState<boolean>(false);
    
    // Modal Player State
    const [modalVideo, setModalVideo] = useState<YouTubeVideo | null>(null);

    // YouTube Script & Metadata Generator state
    const [topicInput, setTopicInput] = useState<string>('The Archdemon of the Ashen Void');
    const [videoType, setVideoType] = useState<'shorts' | 'long_lore' | 'tutorial'>('shorts');
    const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
    const [generatedKit, setGeneratedKit] = useState<{
        title: string;
        description: string;
        tags: string[];
        narrationScript: string;
        visualPrompts: string[];
    } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const channelHandle = '@thedemoncodex';
    const channelUrl = 'https://www.youtube.com/@thedemoncodex';

    const loadVideos = async () => {
        setIsLoadingVideos(true);
        try {
            const result = await fetchLatestYouTubeVideos(channelHandle);
            setVideos(result.videos);
            setChannelInfo(result.channel);
            setApiSource(result.source);
            if (result.videos.length > 0) {
                setSelectedFeatured(result.videos[0]);
            }
        } catch (err) {
            console.error("Failed to load YouTube videos:", err);
            setVideos(FALLBACK_CHRONICLES);
            setSelectedFeatured(FALLBACK_CHRONICLES[0]);
        } finally {
            setIsLoadingVideos(false);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setModalVideo(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const filteredVideos = videos.filter((v) => {
        const matchesCategory = activeTab === 'all' || v.category === activeTab;
        const query = searchQuery.trim().toLowerCase();
        if (!query) return matchesCategory;

        const matchesTitle = v.title.toLowerCase().includes(query);
        const matchesDesc = (v.description || '').toLowerCase().includes(query);
        const matchesTags = (v.tags || []).some(t => t.toLowerCase().includes(query));
        const matchesCategoryName = v.category.toLowerCase().includes(query);

        return matchesCategory && (matchesTitle || matchesDesc || matchesTags || matchesCategoryName);
    });

    const handleCopy = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleGenerateYouTubeKit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicInput.trim() || isGeneratingScript) return;
        setIsGeneratingScript(true);
        setGeneratedKit(null);

        try {
            const ai = new GoogleGenAI({});
            const prompt = `You are the lead content architect and occult scribe for the YouTube channel @thedemoncodex.
Generate a complete YouTube production package for a ${videoType === 'shorts' ? '60-second YouTube Short' : videoType === 'long_lore' ? '5-minute deep lore documentary' : 'creative AI tutorial'}.
Subject: "${topicInput}".

Respond in strictly valid JSON format matching this exact schema:
{
  "title": "A captivating, atmospheric title designed for high YouTube CTR (under 70 chars, including emojis like ⚡ or ✙)",
  "description": "A compelling 3-paragraph YouTube description with lore backstory, channel links to @thedemoncodex, calls to subscribe, and relevant hashtags (#Shorts #DarkFantasy #TheDemonCodex #AIAnimation)",
  "tags": ["#TheDemonCodex", "#DarkFantasy", "#AIArt", "#Veo3", "#GeminiFlash", "#Lore"],
  "narrationScript": "Full atmospheric voiceover narration text paced dramatically with pauses [pause] and sinister tone markers",
  "visualPrompts": [
    "Scene 1 visual prompt for Gemini/Veo...",
    "Scene 2 visual prompt for Gemini/Veo...",
    "Scene 3 visual prompt for Gemini/Veo..."
  ]
}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    temperature: 0.8
                }
            });

            const text = response.text || '{}';
            const parsed = JSON.parse(text);
            setGeneratedKit(parsed);
        } catch (err) {
            console.error("YouTube kit generation error:", err);
            setGeneratedKit({
                title: `⚡ ${topicInput} | The Demon Codex Lore`,
                description: `Witness the forbidden chronicle of ${topicInput}.\n\n🔥 Subscribe to @thedemoncodex for weekly dark fantasy lore, Veo animations, and AI artifact reveals.\n\nForged on The Demon Codex App.\n#TheDemonCodex #DarkFantasy #AIArt #Shorts #OccultLore`,
                tags: ['#TheDemonCodex', '#DarkFantasy', '#Veo', '#Gemini', '#AIArt', '#Grimoire'],
                narrationScript: `In the hollow silence of the abyss, ${topicInput} awakened. [pause] For centuries, the ancient texts spoke of its inevitable manifestation... [pause] What lies beyond the veil is no longer hidden.`,
                visualPrompts: [
                    `Ultra-cinematic dark fantasy portrait of ${topicInput}, volumetric crimson lighting, 8k resolution`,
                    `Slow cinematic aerial zoom into ${topicInput} amidst smoldering ruins, 16:9 aspect ratio`
                ]
            });
        } finally {
            setIsGeneratingScript(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-10 pt-4 sm:pt-6 pb-12 animate-fade-in">
            {/* Header with Channel Identity & Live API Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#242830] pb-6">
                <div className="flex flex-col gap-2">
                    <div className="codex-title-wrapper !items-start !justify-start !m-0 !mt-6 sm:!mt-8 !mb-3 !w-auto">
                        <h2 className="codex-title text-4xl sm:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-3" data-text="ARCANE BROADCASTS">
                            ARCANE BROADCASTS
                            <span className="rune">📺</span>
                            <span className="rune">✦</span>
                            <span className="rune">✙</span>
                            <span className="rune">⚡</span>
                            <span className="blood-drop" style={{ '--drop-left': '14%', '--drop-duration': '3.2s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '32%', '--drop-duration': '4.8s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '58%', '--drop-duration': '2.9s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '75%', '--drop-duration': '4.1s' } as React.CSSProperties}></span>
                            <span className="blood-drop" style={{ '--drop-left': '90%', '--drop-duration': '3.5s' } as React.CSSProperties}></span>
                        </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                        <p className="text-xs text-[#70757e] uppercase tracking-widest font-bold flex items-center gap-2">
                            <span>Official YouTube Data Sync for</span>
                            <span className="text-[#ff4d4d] font-black">{channelHandle}</span>
                        </p>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            apiSource === 'api' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-[#1a1215] text-[#ffaa00] border border-[#ffaa00]/30'
                        }`}>
                            {apiSource === 'api' ? '⚡ LIVE DATA API SYNCED' : '✦ OCCULT ARCHIVE ACTIVE'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadVideos}
                        disabled={isLoadingVideos}
                        title="Re-sync latest metadata from YouTube API"
                        className="px-3.5 py-2.5 rounded-xl bg-[#111318] border border-[#242830] hover:border-[#ff0000] text-xs font-bold text-[#e8e6e3] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingVideos ? 'animate-spin text-[#ff0000]' : ''}`} />
                        <span className="hidden sm:inline">Sync Channel</span>
                    </button>
                    <a 
                        href={channelUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_25px_rgba(255,0,0,0.4)] hover:scale-105 active:scale-95"
                    >
                        <Tv className="w-4 h-4" />
                        <span>Subscribe</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                        onClick={onBack}
                        className="px-5 py-2.5 rounded-xl bg-[#111318] border border-[#242830] hover:border-[#8d1a1a] text-xs font-black text-[#e8e6e3] uppercase tracking-widest transition-all hover-blood"
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* YouTube Channel Hero Card */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#111318] via-[#1a0f0f] to-[#111318] border-2 border-[#8d1a1a]/40 p-6 md:p-8 shadow-[0_0_50px_rgba(141,26,26,0.2)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff0000]/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <img 
                                src={channelInfo?.avatarUrl || "/demon-ai-1781131108810.jpg"} 
                                alt="The Demon Codex YouTube Avatar" 
                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-[#ff0000] object-cover shadow-[0_0_25px_rgba(255,0,0,0.5)] group-hover:rotate-3 transition-transform"
                            />
                            <span className="absolute -bottom-2 -right-2 bg-[#ff0000] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
                                LIVE
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                                    {channelInfo?.title || "The Demon Codex"}
                                </h3>
                                <span className="bg-[#ff0000]/20 border border-[#ff0000]/50 text-[#ff4d4d] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                    Official
                                </span>
                            </div>
                            <p className="text-xs text-[#9aa0a6] mt-1 font-mono">
                                {channelInfo?.customUrl || channelHandle} • {videos.length} Chronicles Synced • Veo 3.1 & Dark Fantasy AI
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#70757e] font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 text-[#00d2ff]">
                                    <Film className="w-3.5 h-3.5" /> Veo & Suno Masterworks
                                </span>
                                <span className="flex items-center gap-1.5 text-[#ffaa00]">
                                    <Flame className="w-3.5 h-3.5" /> Weekly Rituals
                                </span>
                                <span className="flex items-center gap-1.5 text-[#ff4d4d]">
                                    <Radio className="w-3.5 h-3.5 animate-pulse" /> Dark Lore Stream
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <button
                            onClick={() => selectedFeatured && setModalVideo(selectedFeatured)}
                            className="flex-1 lg:flex-none px-5 py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,0,0.5)] transition-all hover:scale-105 active:scale-95"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Watch Featured</span>
                        </button>
                        <a
                            href={`${channelUrl}/shorts`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 lg:flex-none px-4 py-3 bg-[#111318] border border-[#242830] hover:border-[#ff0000] rounded-xl text-xs font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-[#1f1515]"
                        >
                            <span>🔥 Shorts Hub</span>
                        </a>
                        {onNavigateCrucible && (
                            <button
                                onClick={onNavigateCrucible}
                                className="flex-1 lg:flex-none px-4 py-3 bg-[#8d1a1a] hover:bg-[#a61f1f] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(141,26,26,0.5)] transition-all"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Create for YouTube</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Layout: Video Showcase + Creator Toolkit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Video Broadcast Chamber */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Active Theater Screen */}
                    <div className="bg-[#0e1015] border-2 border-[#8d1a1a]/50 rounded-3xl p-4 md:p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(141,26,26,0.2)]">
                        <div className="flex items-center justify-between border-b border-[#242830] pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff0000] animate-ping"></span>
                                <h4 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                                    <span>📺 Occult Transmission Theater</span>
                                    {selectedFeatured.id === 'XLSvy1jHihE' && (
                                        <span className="bg-gradient-to-r from-[#ffaa00] to-[#ff0000] text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ml-2">
                                            👑 FEATURED SOVEREIGN ANTHEM
                                        </span>
                                    )}
                                </h4>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-[#70757e] uppercase">{selectedFeatured.category} • {selectedFeatured.duration}</span>
                            </div>
                        </div>

                        {/* Video Display Area with Direct Inline or Modal Player */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-[#242830] flex items-center justify-center group shadow-2xl">
                            {isPlayingInline ? (
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${selectedFeatured.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                                    title={selectedFeatured.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            ) : (
                                <>
                                    <img 
                                        src={selectedFeatured.thumbnailUrl} 
                                        alt={selectedFeatured.title} 
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                                    {/* Play Overlay */}
                                    <div className="absolute z-20 flex flex-col items-center gap-3 p-4 text-center">
                                        <button
                                            onClick={() => setIsPlayingInline(true)}
                                            className="w-16 h-16 rounded-full bg-[#ff0000] text-white flex items-center justify-center shadow-[0_0_35px_#ff0000] hover:scale-110 hover:bg-white hover:text-[#ff0000] transition-all cursor-pointer group/play"
                                            title="Play Inline"
                                        >
                                            <Play className="w-8 h-8 fill-current ml-1 group-hover/play:scale-110 transition-transform" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setIsPlayingInline(true)}
                                                className="text-xs font-black uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/80 hover:bg-[#ff0000] px-4 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer flex items-center gap-2"
                                            >
                                                <span>Play Transmission</span>
                                                <Play className="w-3 h-3 fill-current" />
                                            </button>
                                            <button
                                                onClick={() => setModalVideo(selectedFeatured)}
                                                className="text-xs font-black uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-[#8d1a1a]/80 hover:bg-[#ff0000] px-3.5 py-1.5 rounded-full border border-[#ff0000]/40 transition-all cursor-pointer flex items-center gap-1.5"
                                            >
                                                <span>Expand</span>
                                                <Maximize2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                                        <div className="flex items-center gap-2 mb-1">
                                            {selectedFeatured.id === 'XLSvy1jHihE' && (
                                                <span className="bg-[#ffaa00] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                                    👑 Featured
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono text-[#ff4d4d] bg-black/80 px-2 py-0.5 rounded uppercase border border-[#ff4d4d]/30">
                                                {selectedFeatured.category}
                                            </span>
                                        </div>
                                        <h3 className="text-base sm:text-xl font-black text-white drop-shadow-md">{selectedFeatured.title}</h3>
                                        <p className="text-xs text-[#ccc] line-clamp-1 mt-1">{selectedFeatured.description}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Video Metadata Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <div className="flex flex-wrap gap-1.5">
                                {selectedFeatured.tags.map((t, idx) => (
                                    <span key={idx} className="text-[10px] font-mono text-[#00d2ff] bg-[#00d2ff]/10 px-2 py-0.5 rounded-md">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                {isPlayingInline ? (
                                    <button
                                        onClick={() => setIsPlayingInline(false)}
                                        className="px-3 py-1.5 bg-[#242830] hover:bg-[#343842] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                    >
                                        <span>Reset Frame</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsPlayingInline(true)}
                                        className="px-3 py-1.5 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition-all"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>Play Frame</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setModalVideo(selectedFeatured)}
                                    className="px-3 py-1.5 bg-[#111318] border border-[#242830] hover:border-[#ff0000] text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                    <span>Theater Modal</span>
                                </button>
                                <a
                                    href={`https://www.youtube.com/watch?v=${selectedFeatured.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-[#70757e] hover:text-white flex items-center gap-1 transition-colors px-2 py-1"
                                >
                                    <span>YouTube</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Search Input, Filter Tabs & Video Playlist with 'Watch' Buttons */}
                    <div className="flex flex-col gap-4">
                        {/* Search Bar Input */}
                        <div className="relative flex items-center w-full">
                            <div className="absolute left-3.5 text-[#70757e] pointer-events-none flex items-center">
                                <Search className="w-4 h-4 text-[#70757e]" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search chronicles by title, keywords, #Shorts, or lore..."
                                className="w-full pl-10 pr-10 py-2.5 bg-[#0e1015] border border-[#242830] focus:border-[#ff0000] focus:shadow-[0_0_15px_rgba(255,0,0,0.2)] rounded-xl text-xs text-[#e8e6e3] placeholder-[#555] transition-all outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 p-1 rounded-md text-[#70757e] hover:text-white hover:bg-[#242830] transition-colors"
                                    title="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Category Tabs & Count */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#242830] pb-2">
                            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                                {(['all', 'shorts', 'lore', 'soundscapes', 'tutorials'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                                            activeTab === tab 
                                                ? 'bg-[#8d1a1a] text-white shadow-md' 
                                                : 'text-[#70757e] hover:text-white hover:bg-[#111318]'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#70757e]">
                                {searchQuery && (
                                    <span className="text-[#ff4d4d] font-bold">Filtered: "{searchQuery}"</span>
                                )}
                                <span>{filteredVideos.length} Broadcasts</span>
                            </div>
                        </div>

                        {isLoadingVideos ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-3 bg-[#111318]/40 rounded-2xl border border-[#242830]">
                                <span className="w-6 h-6 border-2 border-[#ff0000]/20 border-t-[#ff0000] rounded-full animate-spin"></span>
                                <span className="text-xs text-[#70757e] font-mono uppercase tracking-widest">Querying YouTube Data API...</span>
                            </div>
                        ) : filteredVideos.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center text-center gap-3 bg-[#111318]/50 rounded-2xl border border-[#242830]/80">
                                <Search className="w-8 h-8 text-[#70757e]" />
                                <div>
                                    <h5 className="text-sm font-bold text-white">No Chronicles Found</h5>
                                    <p className="text-xs text-[#70757e] mt-1">
                                        No video transmissions matched "{searchQuery}" in {activeTab === 'all' ? 'all categories' : activeTab}.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#8d1a1a] hover:bg-[#ff0000] text-white text-xs font-bold uppercase tracking-wider transition-all shadow"
                                    >
                                        Clear Search
                                    </button>
                                    {activeTab !== 'all' && (
                                        <button
                                            onClick={() => setActiveTab('all')}
                                            className="px-3.5 py-1.5 rounded-lg bg-[#242830] hover:bg-[#343842] text-white text-xs font-bold uppercase tracking-wider transition-all"
                                        >
                                            Show All Categories
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {filteredVideos.map((video) => (
                                    <div
                                        key={video.id}
                                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-3 group/card ${
                                            selectedFeatured.id === video.id
                                                ? 'bg-[#1a1215] border-[#ff0000]/60 shadow-[0_0_20px_rgba(255,0,0,0.15)]'
                                                : 'bg-[#111318]/70 border-[#242830] hover:border-[#8d1a1a] hover:bg-[#111318]'
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div 
                                                onClick={() => setModalVideo(video)}
                                                className="relative w-28 h-18 rounded-lg overflow-hidden bg-black flex-shrink-0 cursor-pointer group/thumb"
                                            >
                                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                                    <Play className="w-6 h-6 text-white fill-current drop-shadow" />
                                                </div>
                                                <span className="absolute bottom-1 right-1 bg-black/90 text-[8px] font-mono text-white px-1.5 py-0.5 rounded">
                                                    {video.duration}
                                                </span>
                                            </div>

                                            <div className="flex flex-col justify-between overflow-hidden flex-1">
                                                <div className="flex flex-col">
                                                    {video.id === 'XLSvy1jHihE' && (
                                                        <span className="text-[8px] font-black uppercase text-[#ffaa00] flex items-center gap-1 mb-0.5">
                                                            <span>👑</span> FEATURED ANTHEM
                                                        </span>
                                                    )}
                                                    <h5 
                                                        onClick={() => {
                                                            setSelectedFeatured(video);
                                                            setIsPlayingInline(true);
                                                        }}
                                                        className="text-xs font-bold text-white line-clamp-2 leading-tight hover:text-[#ff4d4d] cursor-pointer transition-colors"
                                                    >
                                                        {video.title}
                                                    </h5>
                                                </div>
                                                <div className="flex items-center justify-between text-[9px] text-[#70757e] font-mono mt-1">
                                                    <span className="uppercase text-[#ff4d4d] font-bold">{video.category}</span>
                                                    <span>{video.viewsEstimate || (video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'Live')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Watch Button & Selection */}
                                        <div className="flex items-center justify-between pt-2 border-t border-[#242830]/60">
                                            <button
                                                onClick={() => {
                                                    setSelectedFeatured(video);
                                                    setIsPlayingInline(true);
                                                }}
                                                className={`text-[10px] font-bold uppercase transition-colors flex items-center gap-1 ${
                                                    selectedFeatured.id === video.id 
                                                        ? 'text-[#ff4d4d]' 
                                                        : 'text-[#70757e] hover:text-white'
                                                }`}
                                            >
                                                {selectedFeatured.id === video.id ? '▶ Now In Theater' : 'Select'}
                                            </button>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFeatured(video);
                                                        setIsPlayingInline(true);
                                                    }}
                                                    className="px-2.5 py-1 bg-[#242830] hover:bg-[#343842] text-white text-[10px] font-bold uppercase rounded-lg transition-all"
                                                >
                                                    Play Inline
                                                </button>
                                                <button
                                                    onClick={() => setModalVideo(video)}
                                                    className="px-3 py-1 bg-[#ff0000]/90 hover:bg-[#ff0000] text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <Play className="w-3 h-3 fill-current" />
                                                    <span>Modal</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: AI YouTube Scribe & Shorts Generator */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-[#111318] border-2 border-[#ff0000]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(255,0,0,0.1)] flex flex-col gap-5">
                        <div className="flex items-center gap-3 border-b border-[#242830] pb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#ff0000]/10 text-[#ff0000] flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-white">YouTube Content Scribe</h3>
                                <p className="text-[10px] text-[#70757e]">Generate ready-to-upload YouTube Shorts & Lore scripts for @thedemoncodex</p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerateYouTubeKit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#70757e]">Chronicle Theme / Subject</label>
                                <input
                                    type="text"
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                    placeholder="e.g., The Cursed Spire of Azazel, Void Knights..."
                                    className="w-full bg-[#09090f] border border-[#242830] rounded-xl px-3.5 py-2.5 text-xs text-[#e8e6e3] focus:outline-none focus:border-[#ff0000]"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#70757e]">YouTube Format</label>
                                <div className="grid grid-cols-3 gap-1.5 bg-[#09090f] p-1 rounded-xl border border-[#242830]">
                                    {[
                                        { id: 'shorts', label: 'Shorts (60s)' },
                                        { id: 'long_lore', label: 'Deep Lore' },
                                        { id: 'tutorial', label: 'Tutorial' }
                                    ].map((fmt) => (
                                        <button
                                            key={fmt.id}
                                            type="button"
                                            onClick={() => setVideoType(fmt.id as any)}
                                            className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                                                videoType === fmt.id 
                                                    ? 'bg-[#ff0000] text-white shadow-md' 
                                                    : 'text-[#70757e] hover:text-white'
                                            }`}
                                        >
                                            {fmt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isGeneratingScript || !topicInput.trim()}
                                className="w-full py-3.5 bg-gradient-to-r from-[#ff0000] to-[#8d1a1a] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_25px_#ff0000] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGeneratingScript ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                                        <span>Consulting the YouTube Grimoire...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Manifest YouTube Package</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Generated Kit Display */}
                        {generatedKit && (
                            <div className="flex flex-col gap-4 border-t border-[#242830] pt-4 animate-fade-in">
                                {/* Title */}
                                <div className="bg-[#09090f] p-3 rounded-xl border border-[#242830] flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-[#ff4d4d] uppercase">YouTube Title</span>
                                        <button 
                                            onClick={() => handleCopy(generatedKit.title, 'title')}
                                            className="text-[10px] text-[#70757e] hover:text-white flex items-center gap-1"
                                        >
                                            {copiedField === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedField === 'title' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs font-bold text-white">{generatedKit.title}</p>
                                </div>

                                {/* Narration Voiceover Script */}
                                <div className="bg-[#09090f] p-3 rounded-xl border border-[#242830] flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-[#00d2ff] uppercase">Voiceover / Narration Script</span>
                                        <button 
                                            onClick={() => handleCopy(generatedKit.narrationScript, 'script')}
                                            className="text-[10px] text-[#70757e] hover:text-white flex items-center gap-1"
                                        >
                                            {copiedField === 'script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedField === 'script' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-[#ccc] leading-relaxed italic max-h-36 overflow-y-auto whitespace-pre-line">
                                        "{generatedKit.narrationScript}"
                                    </p>
                                </div>

                                {/* Description & Hashtags */}
                                <div className="bg-[#09090f] p-3 rounded-xl border border-[#242830] flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-[#ffaa00] uppercase">Description & Tags</span>
                                        <button 
                                            onClick={() => handleCopy(generatedKit.description, 'desc')}
                                            className="text-[10px] text-[#70757e] hover:text-white flex items-center gap-1"
                                        >
                                            {copiedField === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                            <span>{copiedField === 'desc' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-[#9aa0a6] leading-normal max-h-28 overflow-y-auto whitespace-pre-line">
                                        {generatedKit.description}
                                    </p>
                                </div>

                                {/* One-Click Action: Open YouTube Upload */}
                                <a
                                    href="https://studio.youtube.com/channel/upload"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 bg-[#111318] border border-[#ff0000]/60 hover:bg-[#ff0000] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_#ff0000]"
                                >
                                    <Tv className="w-4 h-4" />
                                    <span>Open YouTube Studio Upload ↗</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* VIDEO PLAYER MODAL OVERLAY */}
            <AnimatePresence>
                {modalVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
                        onClick={() => setModalVideo(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl bg-[#0e1015] border-2 border-[#ff0000]/50 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(255,0,0,0.3)] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#242830] bg-[#111318]">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-7 h-7 rounded-lg bg-[#ff0000] text-white flex items-center justify-center flex-shrink-0">
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-sm sm:text-base font-black text-white uppercase truncate">{modalVideo.title}</h3>
                                        <p className="text-[10px] text-[#70757e] font-mono truncate">{channelHandle} • {modalVideo.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={`https://www.youtube.com/watch?v=${modalVideo.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 rounded-xl bg-[#242830] hover:bg-[#ff0000] text-white transition-all"
                                        title="Open in new YouTube tab"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button 
                                        onClick={() => setModalVideo(null)}
                                        className="p-2 rounded-xl bg-[#242830] hover:bg-[#ff0000] text-white transition-all"
                                        title="Close Player (Esc)"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Video Embed Iframe Container */}
                            <div className="relative aspect-video w-full bg-black">
                                <iframe
                                    src={`https://www.youtube-nocookie.com/embed/${modalVideo.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                                    title={modalVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            </div>

                            {/* Modal Footer / Video Metadata */}
                            <div className="p-4 sm:p-6 bg-[#111318] flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h4 className="text-base font-bold text-white">{modalVideo.title}</h4>
                                        <p className="text-xs text-[#9aa0a6] mt-1 line-clamp-2">{modalVideo.description}</p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button 
                                            onClick={() => handleCopy(`https://www.youtube.com/watch?v=${modalVideo.id}`, 'modal_link')}
                                            className="px-4 py-2 rounded-xl bg-[#242830] hover:bg-[#343842] text-xs font-bold text-white transition-all flex items-center gap-1.5"
                                        >
                                            {copiedField === 'modal_link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedField === 'modal_link' ? 'Copied' : 'Share Link'}</span>
                                        </button>
                                        <a 
                                            href={channelUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-4 py-2 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-xs font-black uppercase tracking-wider text-white transition-all shadow"
                                        >
                                            Subscribe
                                        </a>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#242830]/50">
                                    {modalVideo.tags.map((tag, idx) => (
                                        <span key={idx} className="text-[10px] font-mono text-[#ff4d4d] bg-[#ff0000]/10 px-2 py-0.5 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
