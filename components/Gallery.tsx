import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Upload, 
    Plus, 
    Image as ImageIcon, 
    Sparkles, 
    X, 
    Flame, 
    Cloud, 
    Check, 
    ArrowUpRight, 
    Layers, 
    Eye,
    Globe,
    Compass,
    Award
} from 'lucide-react';
import { generateSoundscape } from '../services/geminiService';
import { 
    fetchPublicGalleryFromFirestore, 
    fetchUserHistoryFromFirestore,
    saveManifestationToFirestore,
    publishSessionToPublicGallery,
    compressImageForFirestore
} from '../services/firebaseService';
import { getAllSessionsIDB } from '../services/idbStorage';
import { HoloFoilCard } from './HoloFoilCard';
import { DarkSealsBar } from './DarkSealsBar';
import { DailyRitualBanner } from './DailyRitualBanner';
import { getTodayRitual } from '../services/dailyRitualService';
import { saveToHistory } from '../services/storageService';
import { audioFX } from '../services/audioService';
import type { GeneratedData, DarkSealType } from '../types';

interface GalleryProps {
    onBack: () => void;
    onSelectRelic: (data: GeneratedData) => void;
    onForgePrompt?: (prompt: string) => void;
}

const BloodDrops: React.FC = () => {
    return (
        <>
            <span className="blood-drop" style={{ '--drop-left': '10%', '--drop-duration': '3s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '30%', '--drop-duration': '6s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '50%', '--drop-duration': '4s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '75%', '--drop-duration': '8s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '90%', '--drop-duration': '5s' } as any}></span>
        </>
    );
};

export const Gallery: React.FC<GalleryProps> = ({ onBack, onSelectRelic, onForgePrompt }) => {
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [activeTab, setActiveTab] = useState<'cloud_history' | 'community'>('community');
    const [cloudHistory, setCloudHistory] = useState<GeneratedData[]>([]);
    const [communityGallery, setCommunityGallery] = useState<GeneratedData[]>([]);
    const [isLoadingFirestore, setIsLoadingFirestore] = useState(true);

    // Ritual & Dark Seals Filter State
    const todayRitual = useMemo(() => getTodayRitual(), []);
    const [filterRitualOnly, setFilterRitualOnly] = useState<boolean>(false);
    const [sortMode, setSortMode] = useState<'latest' | 'blood' | 'void' | 'soul' | 'spark'>('latest');

    // Inscribe Modal States
    const [isInscribing, setIsInscribing] = useState(false);
    const [inscribeMode, setInscribeMode] = useState<'upload' | 'forge'>('upload');
    const [uploadImage, setUploadImage] = useState<string>('');
    const [uploadTitle, setUploadTitle] = useState<string>('');
    const [uploadArchetype, setUploadArchetype] = useState<string>('Cursed Relic');
    const [uploadTone, setUploadTone] = useState<string>('Atmospheric Dark Fantasy');
    const [uploadLore, setUploadLore] = useState<string>('');
    const [uploadTags, setUploadTags] = useState<string>('relic, dark fantasy, abyssal');
    const [publishToPublic, setPublishToPublic] = useState<boolean>(true);
    const [submitToDailyRitual, setSubmitToDailyRitual] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [forgeIdea, setForgeIdea] = useState<string>('');

    // Publishing state tracker for cloud sessions
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [publishedIds, setPublishedIds] = useState<Record<string, boolean>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const localHistory: GeneratedData[] = useMemo(() => {
        try {
            const h = localStorage.getItem('demon_codex_history');
            return h ? JSON.parse(h) : [];
        } catch {
            return [];
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        setIsLoadingFirestore(true);

        // First attempt immediate local restoration from IndexedDB
        getAllSessionsIDB().then((idbSessions) => {
            if (isMounted && idbSessions && idbSessions.length > 0) {
                const formatted = idbSessions.map(s => s.data || s);
                setCloudHistory(prev => prev.length === 0 ? formatted : prev);
            }
        }).catch(() => {});

        Promise.all([
            fetchUserHistoryFromFirestore(),
            fetchPublicGalleryFromFirestore()
        ]).then(([userHist, publicGal]) => {
            if (isMounted) {
                if (userHist.length > 0) {
                    setCloudHistory(userHist);
                } else {
                    setCloudHistory(prev => prev.length > 0 ? prev : localHistory);
                }
                setCommunityGallery(publicGal);
                setIsLoadingFirestore(false);
            }
        }).catch((err) => {
            console.warn("Firestore gallery fetch error:", err);
            if (isMounted) {
                setCloudHistory(prev => prev.length > 0 ? prev : localHistory);
                setIsLoadingFirestore(false);
            }
        });

        return () => { isMounted = false; };
    }, [localHistory]);

    // Check if a relic matches today's daily ritual
    const isRitualMatch = (item: GeneratedData): boolean => {
        if (item.ritualTheme && item.ritualTheme.toLowerCase() === todayRitual.theme.toLowerCase()) {
            return true;
        }
        const tagLower = todayRitual.tag.toLowerCase();
        return (item.cards || []).some(c => 
            (c.tags || []).some(t => t.toLowerCase().includes(tagLower) || t.toLowerCase().includes('dailyritual'))
        );
    };

    // Calculate count of community relics submitted to today's ritual
    const ritualEntriesCount = useMemo(() => {
        return communityGallery.filter(isRitualMatch).length;
    }, [communityGallery, todayRitual]);

    // Calculate Crowned Relic of the Day (highest total Dark Seals among ritual entries or all community entries)
    const crownedRelic = useMemo(() => {
        const pool = communityGallery.length > 0 ? communityGallery : [];
        if (pool.length === 0) return null;

        const ritualPool = pool.filter(isRitualMatch);
        const candidates = ritualPool.length > 0 ? ritualPool : pool;

        const sorted = [...candidates].sort((a, b) => {
            const aTotal = (a.darkSeals?.blood || 0) + (a.darkSeals?.void || 0) + (a.darkSeals?.spark || 0) + (a.darkSeals?.soul || 0);
            const bTotal = (b.darkSeals?.blood || 0) + (b.darkSeals?.void || 0) + (b.darkSeals?.spark || 0) + (b.darkSeals?.soul || 0);
            return bTotal - aTotal;
        });

        const top = sorted[0];
        const topTotal = (top.darkSeals?.blood || 0) + (top.darkSeals?.void || 0) + (top.darkSeals?.spark || 0) + (top.darkSeals?.soul || 0);
        return topTotal > 0 ? top : pool[0];
    }, [communityGallery, todayRitual]);

    // Apply active filters and sorting
    const activeList = useMemo(() => {
        let base = activeTab === 'cloud_history' ? (cloudHistory.length > 0 ? cloudHistory : localHistory) : communityGallery;

        if (filterRitualOnly && activeTab === 'community') {
            base = base.filter(isRitualMatch);
        }

        if (sortMode === 'latest') {
            return base;
        }

        return [...base].sort((a, b) => {
            const aSeals = a.darkSeals || { blood: 0, void: 0, spark: 0, soul: 0 };
            const bSeals = b.darkSeals || { blood: 0, void: 0, spark: 0, soul: 0 };
            if (sortMode === 'blood') return bSeals.blood - aSeals.blood;
            if (sortMode === 'void') return bSeals.void - aSeals.void;
            if (sortMode === 'soul') return bSeals.soul - aSeals.soul;
            if (sortMode === 'spark') return bSeals.spark - aSeals.spark;
            return 0;
        });
    }, [activeTab, cloudHistory, localHistory, communityGallery, filterRitualOnly, sortMode, todayRitual]);

    const handleSoundscape = async () => {
        setIsGeneratingAudio(true);
        try {
            const base64Audio = await generateSoundscape("Eerie whispers of the dead kings in a sunken vault");
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            const binary = atob(base64Audio.split(',')[1]);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const dataInt16 = new Int16Array(bytes.buffer);
            const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
        } catch (err) {
            console.error(err);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleProcessImageFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setSaveError('Please select a valid image file (PNG, JPG, WebP, etc.)');
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            setSaveError('Image file is too large (max 12MB). Please select a smaller file.');
            return;
        }

        setSaveError(null);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawDataUrl = e.target?.result as string;
            if (rawDataUrl) {
                try {
                    const compressed = await compressImageForFirestore(rawDataUrl, 900, 0.82);
                    setUploadImage(compressed);
                    audioFX.playBladeUnsheathe();
                    if (!uploadTitle) {
                        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                        const capitalized = nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
                        setUploadTitle(capitalized);
                    }
                } catch {
                    setUploadImage(rawDataUrl);
                }
            }
        };
        reader.onerror = () => {
            setSaveError('Failed to read image file from disk.');
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleProcessImageFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleProcessImageFile(e.target.files[0]);
        }
    };

    const handleInscribeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadTitle.trim()) {
            setSaveError('Please enter a title for your relic manifestation.');
            return;
        }
        if (!uploadImage) {
            setSaveError('Please upload or select an image for this relic.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const rawTags = uploadTags
                .split(',')
                .map(t => t.trim().replace(/^#/, ''))
                .filter(Boolean);

            if (submitToDailyRitual) {
                if (!rawTags.includes(todayRitual.tag)) rawTags.push(todayRitual.tag);
                if (!rawTags.includes('DailyRitual')) rawTags.push('DailyRitual');
            }

            const ritualThemeToAttach = submitToDailyRitual ? todayRitual.theme : undefined;

            const newRelic: GeneratedData = {
                id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                mainTitle: uploadTitle.trim(),
                archetype: uploadArchetype.trim() || 'Cursed Relic',
                tone: uploadTone.trim() || 'Atmospheric Dark Fantasy',
                use: 'Abyssal Codex Inscription',
                bannerImageUrl: uploadImage,
                cards: [
                    {
                        glyph: '✦',
                        title: uploadTitle.trim(),
                        prompt: uploadLore.trim() || `Manifestation of ${uploadTitle.trim()}`,
                        caption: uploadLore.trim() || `An ancient relic inscribed into the Demon Codex Abyssal Archive.`,
                        tags: rawTags.length > 0 ? rawTags : ['relic', 'abyssal', 'dark-fantasy'],
                        imageUrl: uploadImage,
                    }
                ],
                negativePrompts: [],
                remixSuggestions: [],
                darkSeals: { blood: 0, void: 0, spark: 0, soul: 0 },
                ritualTheme: ritualThemeToAttach,
                ritualDate: submitToDailyRitual ? todayRitual.dateKey : undefined,
            };

            saveToHistory(newRelic, uploadLore);
            await saveManifestationToFirestore(newRelic, uploadLore, publishToPublic, ritualThemeToAttach);

            audioFX.playStoneRuneThud();

            setCloudHistory(prev => [newRelic, ...prev]);
            if (publishToPublic) {
                setCommunityGallery(prev => [newRelic, ...prev]);
                setActiveTab('community');
            } else {
                setActiveTab('cloud_history');
            }

            setUploadImage('');
            setUploadTitle('');
            setUploadLore('');
            setIsInscribing(false);
        } catch (err: any) {
            console.error("Failed to inscribe relic:", err);
            setSaveError(err?.message || 'Failed to inscribe relic to Cloud Firestore.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublishSessionToCommunity = async (session: GeneratedData, index: number) => {
        const idKey = session.id || `${session.mainTitle}_${index}`;
        setPublishingId(idKey);
        try {
            await publishSessionToPublicGallery(session, session.ritualTheme);
            audioFX.playBladeUnsheathe();
            setPublishedIds(prev => ({ ...prev, [idKey]: true }));
            setCommunityGallery(prev => [session, ...prev]);
        } catch (err) {
            console.error("Publish to community failed:", err);
        } finally {
            setPublishingId(null);
        }
    };

    const handleAcceptDailyRitual = (prompt: string, theme: string) => {
        if (onForgePrompt) {
            onForgePrompt(prompt);
        }
    };

    return (
        <div className="w-full animate-fade-in pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 pt-4 sm:pt-6 gap-6">
                <div className="flex flex-col gap-2">
                    <div className="codex-title-wrapper !items-start !justify-start !m-0 !mt-6 sm:!mt-8 !mb-3 !w-auto">
                        <h2 className="codex-title text-4xl sm:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-3" data-text="THE ABYSSAL ARCHIVE">
                            THE ABYSSAL ARCHIVE
                            <span className="rune">✦</span>
                            <span className="rune">✙</span>
                            <span className="rune">✦</span>
                            <span className="rune">✙</span>
                            <BloodDrops />
                        </h2>
                    </div>
                    <p className="lightning-text text-sm uppercase italic opacity-80 tracking-widest">
                        A permanent record of past manifestations and community relics in Cloud Firestore.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <button 
                        id="inscribe-relic-btn"
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setIsInscribing(true);
                        }}
                        className="bg-gradient-to-r from-[#8d1a1a] to-[#b31e1e] hover:from-[#b31e1e] hover:to-[#ff4d4d] text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(141,26,26,0.4)] hover:shadow-[0_0_25px_rgba(255,77,77,0.6)] hover-blood"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>✦ INSCRIBE / UPLOAD RELIC</span>
                    </button>
                    <button 
                        onClick={handleSoundscape}
                        disabled={isGeneratingAudio}
                        className="bg-transparent border border-[#00d2ff]/40 px-5 py-3 rounded-xl text-xs font-black text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-all flex items-center gap-2"
                    >
                        <span>{isGeneratingAudio ? 'MANIFESTING AUDIO...' : '✧ SOUNDSCAPE RITUAL'}</span>
                    </button>
                    <button 
                        onClick={onBack}
                        className="bg-[#111318] border border-[#242830] px-5 py-3 rounded-xl text-xs font-black text-[#e8e6e3] hover:text-[#00d2ff] hover:border-[#00d2ff]/40 transition-all hover-blood"
                    >
                        RETURN TO FORGE
                    </button>
                </div>
            </div>

            {/* Daily Midnight Ritual Altar Challenge Banner */}
            <DailyRitualBanner
                onAcceptRitual={handleAcceptDailyRitual}
                onFilterRitualEntries={() => {
                    setActiveTab('community');
                    setFilterRitualOnly(prev => !prev);
                }}
                isFilteringRitual={filterRitualOnly}
                ritualEntriesCount={ritualEntriesCount}
                crownedRelic={crownedRelic}
                onSelectRelic={onSelectRelic}
            />

            {/* Tab navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#242830] pb-4 mb-6 gap-4">
                <div className="flex flex-wrap gap-3">
                    <button
                        id="tab-public-community"
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setActiveTab('community');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                            activeTab === 'community'
                            ? 'bg-[#ff4d4d]/20 text-[#ff4d4d] border-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.2)]'
                            : 'bg-[#111318] text-[#70757e] border-[#242830] hover:text-[#e8e6e3]'
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5 text-[#ff4d4d]" />
                        <span>🔥 PUBLIC ABYSSAL ARCHIVE</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-[#ff4d4d]">
                            {communityGallery.length}
                        </span>
                    </button>
                    <button
                        id="tab-cloud-history"
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setActiveTab('cloud_history');
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                            activeTab === 'cloud_history'
                            ? 'bg-[#00d2ff]/20 text-[#00d2ff] border-[#00d2ff] shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                            : 'bg-[#111318] text-[#70757e] border-[#242830] hover:text-[#e8e6e3]'
                        }`}
                    >
                        <Cloud className="w-3.5 h-3.5 text-[#00d2ff]" />
                        <span>☁ YOUR CLOUD SESSIONS</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/40 text-[#00d2ff]">
                            {cloudHistory.length || localHistory.length}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            audioFX.playStoneRuneThud();
                            setIsInscribing(true);
                        }}
                        className="text-xs text-[#00d2ff] hover:text-[#ff4d4d] transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Relic</span>
                    </button>
                    <div className="text-[10px] text-[#70757e] uppercase font-bold tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse"></span>
                        <span>FIRESTORE LIVE</span>
                    </div>
                </div>
            </div>

            {/* Dark Seals Sorting & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8 bg-[#0e1015] border border-[#242830] p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#70757e] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#ff4d4d]" />
                        <span>DARK SEALS SORT:</span>
                    </span>
                    <button
                        type="button"
                        onClick={() => { audioFX.playStoneRuneThud(); setSortMode('latest'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            sortMode === 'latest'
                            ? 'bg-[#242830] text-white shadow-sm'
                            : 'text-[#70757e] hover:text-[#e8e6e3]'
                        }`}
                    >
                        Latest
                    </button>
                    <button
                        type="button"
                        onClick={() => { audioFX.playDarkSealOffering('blood'); setSortMode('blood'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                            sortMode === 'blood'
                            ? 'bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/40'
                            : 'text-[#70757e] hover:text-[#ff4d4d]'
                        }`}
                    >
                        <span>🩸</span>
                        <span>Blood</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { audioFX.playDarkSealOffering('void'); setSortMode('void'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                            sortMode === 'void'
                            ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40'
                            : 'text-[#70757e] hover:text-[#a855f7]'
                        }`}
                    >
                        <span>👁️</span>
                        <span>Void</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { audioFX.playDarkSealOffering('soul'); setSortMode('soul'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                            sortMode === 'soul'
                            ? 'bg-[#cbd5e1]/20 text-[#cbd5e1] border border-[#cbd5e1]/40'
                            : 'text-[#70757e] hover:text-[#cbd5e1]'
                        }`}
                    >
                        <span>💀</span>
                        <span>Soul</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { audioFX.playDarkSealOffering('spark'); setSortMode('spark'); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                            sortMode === 'spark'
                            ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                            : 'text-[#70757e] hover:text-[#f59e0b]'
                        }`}
                    >
                        <span>⚡</span>
                        <span>Arcane</span>
                    </button>
                </div>

                {filterRitualOnly && (
                    <button
                        type="button"
                        onClick={() => setFilterRitualOnly(false)}
                        className="text-[10px] font-black uppercase tracking-wider text-[#ff7878] bg-[#ff4d4d]/10 px-3 py-1 rounded-lg border border-[#ff4d4d]/30 hover:bg-[#ff4d4d]/20 transition-all flex items-center gap-1"
                    >
                        <span>✕ CLEAR RITUAL FILTER</span>
                    </button>
                )}
            </div>

            {/* Main Gallery Content */}
            {isLoadingFirestore ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-widest text-[#70757e]">Communing with Cloud Firestore...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {/* Active Relics */}
                    {(activeList || []).map((data, i) => {
                        const idKey = data.id || `${data.mainTitle}_${i}`;
                        const isPublished = publishedIds[idKey];
                        const isPublishing = publishingId === idKey;
                        const isRitual = isRitualMatch(data);

                        return (
                          <HoloFoilCard key={idKey} tier={i % 3 === 0 ? 'abyssal-gold' : i % 2 === 0 ? 'void-cosmic' : 'blood-foil'} rarity={88} showBadge={true} className="h-full">
                            <div 
                                className="group bg-[#111318] border border-[#242830] rounded-2xl overflow-hidden hover:border-[#00d2ff]/40 transition-all hover-blood shadow-xl flex flex-col justify-between"
                            >
                                <div 
                                    onClick={() => onSelectRelic(data)}
                                    className="aspect-video relative overflow-hidden cursor-pointer"
                                >
                                    <img 
                                        src={data.bannerImageUrl || (data.cards && data.cards[0]?.imageUrl) || undefined} 
                                        alt={data.mainTitle} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                                    
                                    {/* Ritual Entry Badge */}
                                    {isRitual && (
                                        <div className="absolute top-3 right-3 bg-[#ff4d4d]/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-red-400 shadow-lg tracking-wider flex items-center gap-1 z-20">
                                            <span>✦ DAILY RITUAL</span>
                                        </div>
                                    )}

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-white font-bold leading-tight line-clamp-1 group-hover:text-[#00d2ff] transition-colors">{data.mainTitle}</h3>
                                        <p className="text-[9px] text-[#00d2ff] uppercase font-black tracking-widest">{data.archetype}</p>
                                    </div>
                                </div>

                                <div className="p-4 flex flex-col gap-3 bg-[#1b1f27]">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-[8px] font-black text-[#70757e] uppercase tracking-widest">
                                            {data.cards?.length || 1} RELIC{data.cards?.length === 1 ? '' : 'S'} ARCHIVED
                                        </span>
                                        <button 
                                            onClick={() => onSelectRelic(data)}
                                            className="text-[#00d2ff] hover:text-white flex items-center gap-1 font-bold uppercase tracking-wider"
                                        >
                                            <span>VIEW FORGE</span>
                                            <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Dark Seals Occult Reaction Bar */}
                                    <div className="pt-2 border-t border-[#242830] flex items-center justify-between">
                                        <DarkSealsBar
                                            relicId={idKey}
                                            initialSeals={data.darkSeals}
                                            compact={true}
                                        />
                                        {data.ritualTheme && (
                                            <span className="text-[8px] font-mono text-[#ff7878] truncate max-w-[100px]" title={data.ritualTheme}>
                                                #{data.ritualTheme.replace(/\s+/g, '')}
                                            </span>
                                        )}
                                    </div>

                                    {/* If in Cloud Sessions, allow 1-click publishing to Public Abyssal Archive */}
                                    {activeTab === 'cloud_history' && (
                                        <button
                                            onClick={() => handlePublishSessionToCommunity(data, i)}
                                            disabled={isPublished || isPublishing}
                                            className={`w-full py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                                                isPublished 
                                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 cursor-default'
                                                : 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30 hover:bg-[#ff4d4d] hover:text-black'
                                            }`}
                                        >
                                            {isPublished ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                    <span>IN PUBLIC ARCHIVE ✓</span>
                                                </>
                                            ) : isPublishing ? (
                                                <span>PUBLISHING TO PUBLIC...</span>
                                            ) : (
                                                <>
                                                    <Flame className="w-3 h-3 text-[#ff4d4d]" />
                                                    <span>PUBLISH TO PUBLIC ARCHIVE</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                          </HoloFoilCard>
                        );
                    })}

                    {/* Interactive "Inscribe New Relic" Action Cards */}
                    {(activeList || []).length === 0 ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div 
                                key={i} 
                                id={`empty-slot-${i}`}
                                onClick={() => {
                                    audioFX.playStoneRuneThud();
                                    setIsInscribing(true);
                                }}
                                className="aspect-video bg-[#111318]/50 border-2 border-dashed border-[#242830] hover:border-[#ff4d4d] rounded-2xl flex flex-col items-center justify-center group cursor-pointer transition-all hover-blood shadow-lg hover:shadow-[0_0_25px_rgba(255,77,77,0.25)] p-6 text-center"
                                title="Click to Inscribe an Image or Manifest a New Relic"
                            >
                                <div className="w-14 h-14 rounded-full border border-[#242830] group-hover:border-[#ff4d4d] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#ff4d4d]/10 transition-all">
                                    <Plus className="w-6 h-6 text-[#70757e] group-hover:text-[#ff4d4d] transition-colors" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#e8e6e3] group-hover:text-[#ff4d4d] transition-colors mb-1">
                                    Inscribe New Relic
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-[#70757e] group-hover:text-[#a0a5b0] transition-colors">
                                    Click to upload image or forge with AI
                                </span>
                            </div>
                        ))
                    ) : (
                        <div 
                            id="add-relic-slot"
                            onClick={() => {
                                audioFX.playStoneRuneThud();
                                setIsInscribing(true);
                            }}
                            className="aspect-video bg-[#111318]/40 border-2 border-dashed border-[#242830] hover:border-[#00d2ff] rounded-2xl flex flex-col items-center justify-center group cursor-pointer transition-all hover-blood shadow-lg hover:shadow-[0_0_25px_rgba(0,210,255,0.2)] p-6 text-center"
                            title="Inscribe another relic into this archive"
                        >
                            <div className="w-14 h-14 rounded-full border border-[#242830] group-hover:border-[#00d2ff] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#00d2ff]/10 transition-all">
                                <Plus className="w-6 h-6 text-[#70757e] group-hover:text-[#00d2ff] transition-colors" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#e8e6e3] group-hover:text-[#00d2ff] transition-colors mb-1">
                                + Inscribe Another Relic
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-[#70757e] group-hover:text-[#a0a5b0] transition-colors">
                                Add image or forge a new manifest
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Inscribe / Upload Relic Modal */}
            {isInscribing && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
                    onClick={() => setIsInscribing(false)}
                >
                    <div 
                        className="bg-[#111318] border-2 border-[#8d1a1a] shadow-[0_0_50px_rgba(141,26,26,0.5)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#242830] pb-4 mb-6">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-[#e8e6e3] flex items-center gap-2">
                                    <span>✦</span>
                                    <span>Inscribe Relic Manifest</span>
                                </h3>
                                <span className="text-[10px] text-[#70757e] uppercase tracking-widest">
                                    Preserve artwork directly into Cloud Firestore & Public Archive
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsInscribing(false)}
                                className="w-8 h-8 rounded-lg border border-[#242830] hover:border-[#ff4d4d] text-[#70757e] hover:text-[#ff4d4d] flex items-center justify-center transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mode Switcher */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0b0c10] rounded-xl border border-[#242830] mb-6">
                            <button
                                type="button"
                                onClick={() => setInscribeMode('upload')}
                                className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                    inscribeMode === 'upload'
                                    ? 'bg-[#8d1a1a] text-white shadow-[0_0_15px_rgba(141,26,26,0.4)]'
                                    : 'text-[#70757e] hover:text-[#e8e6e3]'
                                }`}
                            >
                                <Upload className="w-4 h-4" />
                                <span>Upload Image File</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInscribeMode('forge')}
                                className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                    inscribeMode === 'forge'
                                    ? 'bg-[#00d2ff] text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                                    : 'text-[#70757e] hover:text-[#e8e6e3]'
                                }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Forge With AI Engine</span>
                            </button>
                        </div>

                        {/* Mode 1: Direct Image Upload Form */}
                        {inscribeMode === 'upload' && (
                            <form onSubmit={handleInscribeSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mb-2">
                                        Relic Imagery *
                                    </label>
                                    
                                    {uploadImage ? (
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#00d2ff]/40 shadow-lg group">
                                            <img src={uploadImage} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="px-4 py-2 rounded-xl bg-[#1b1f27] border border-[#00d2ff] text-[#00d2ff] text-xs font-bold uppercase tracking-wider hover:bg-[#00d2ff] hover:text-black transition-all"
                                                >
                                                    Change Image
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadImage('')}
                                                    className="px-4 py-2 rounded-xl bg-[#8d1a1a] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#ff4d4d] transition-all"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer ${
                                                isDragging 
                                                ? 'border-[#ff4d4d] bg-[#ff4d4d]/10' 
                                                : 'border-[#242830] hover:border-[#00d2ff]/60 bg-[#0b0c10]'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-full border border-[#242830] flex items-center justify-center mb-3 text-[#70757e] group-hover:text-[#00d2ff]">
                                                <Upload className="w-5 h-5 text-[#00d2ff]" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#e8e6e3] mb-1">
                                                Drag & drop image here, or click to browse
                                            </span>
                                            <span className="text-[10px] text-[#70757e] uppercase tracking-widest">
                                                Supports PNG, JPG, WebP (Optimized for Firestore)
                                            </span>
                                        </div>
                                    )}

                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mb-2">
                                            Relic Title *
                                        </label>
                                        <input
                                            type="text"
                                            value={uploadTitle}
                                            onChange={(e) => setUploadTitle(e.target.value)}
                                            placeholder="e.g. Crown of the Blood Sovereign"
                                            className="w-full px-4 py-3 bg-[#0e1017] border border-[#242830] rounded-xl text-white placeholder-[#444] text-xs focus:border-[#00d2ff] focus:outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mb-2">
                                            Archetype / Category
                                        </label>
                                        <select
                                            value={uploadArchetype}
                                            onChange={(e) => setUploadArchetype(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#0e1017] border border-[#242830] rounded-xl text-white text-xs focus:border-[#00d2ff] focus:outline-none transition-all"
                                        >
                                            <option value="Cursed Relic">Cursed Relic</option>
                                            <option value="Forbidden Grimoire">Forbidden Grimoire</option>
                                            <option value="Demonic Blade">Demonic Blade</option>
                                            <option value="Obsidian Effigy">Obsidian Effigy</option>
                                            <option value="Blood Chalice">Blood Chalice</option>
                                            <option value="Ossuary Reliquary">Ossuary Reliquary</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mb-2">
                                        Forbidden Lore / Chronicle
                                    </label>
                                    <textarea
                                        value={uploadLore}
                                        onChange={(e) => setUploadLore(e.target.value)}
                                        placeholder="Describe the curse, origin, or power sealed within this relic..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[#0e1017] border border-[#242830] rounded-xl text-white placeholder-[#444] text-xs focus:border-[#00d2ff] focus:outline-none transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mb-2">
                                        Tags (Comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadTags}
                                        onChange={(e) => setUploadTags(e.target.value)}
                                        placeholder="relic, cursed, abyssal, blood"
                                        className="w-full px-4 py-3 bg-[#0e1017] border border-[#242830] rounded-xl text-white placeholder-[#444] text-xs focus:border-[#00d2ff] focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Daily Ritual Submission Checkbox */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#140a0a] border border-[#ff4d4d]/30">
                                    <input
                                        type="checkbox"
                                        id="daily-ritual-toggle"
                                        checked={submitToDailyRitual}
                                        onChange={(e) => setSubmitToDailyRitual(e.target.checked)}
                                        className="w-4 h-4 accent-[#ff4d4d] cursor-pointer rounded"
                                    />
                                    <label htmlFor="daily-ritual-toggle" className="text-xs font-bold text-[#e8e6e3] cursor-pointer flex flex-col">
                                        <span className="flex items-center gap-1.5 text-[#ff7878]">
                                            <Sparkles className="w-3.5 h-3.5 text-[#ff4d4d]" />
                                            <span>Submit as Entry for Today's Ritual: {todayRitual.title}</span>
                                        </span>
                                        <span className="text-[10px] font-normal text-[#9aa0a6]">
                                            Attaches the #{todayRitual.tag} sigil to contend for today's Crowned High Altar relic.
                                        </span>
                                    </label>
                                </div>

                                {/* Public Community Checkbox */}
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0e1017] border border-[#242830]">
                                    <input
                                        type="checkbox"
                                        id="publish-toggle"
                                        checked={publishToPublic}
                                        onChange={(e) => setPublishToPublic(e.target.checked)}
                                        className="w-4 h-4 accent-[#ff4d4d] cursor-pointer rounded"
                                    />
                                    <label htmlFor="publish-toggle" className="text-xs font-bold text-[#e8e6e3] cursor-pointer flex flex-col">
                                        <span className="flex items-center gap-1.5">
                                            <Flame className="w-3.5 h-3.5 text-[#ff4d4d]" />
                                            <span>Publish to Public Abyssal Archive (Firestore)</span>
                                        </span>
                                        <span className="text-[10px] font-normal text-[#70757e]">
                                            Shares this relic with the community archive so other cultists can view and bestow Dark Seals.
                                        </span>
                                    </label>
                                </div>

                                {saveError && (
                                    <div className="p-3 rounded-xl bg-[#8d1a1a]/20 border border-[#8d1a1a] text-xs text-[#ff4d4d] font-bold">
                                        {saveError}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242830]">
                                    <button
                                        type="button"
                                        onClick={() => setIsInscribing(false)}
                                        className="px-5 py-3 rounded-xl border border-[#242830] text-xs font-bold text-[#70757e] hover:text-white transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving || !uploadImage || !uploadTitle.trim()}
                                        className="px-6 py-3 rounded-xl bg-[#8d1a1a] hover:bg-[#ff4d4d] text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(141,26,26,0.5)] disabled:opacity-50 flex items-center gap-2 hover-blood"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>INSCRIBING TO FIRESTORE...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>✦ INSCRIBE INTO CODEX</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Mode 2: Quick Forge with AI */}
                        {inscribeMode === 'forge' && (
                            <div className="space-y-5">
                                <div className="p-4 rounded-2xl bg-[#0b0c10] border border-[#00d2ff]/20">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00d2ff] block mb-2">
                                        Instant Manifestation
                                    </span>
                                    <p className="text-xs text-[#9aa0a6] leading-relaxed">
                                        Type any concept or demonic vision. The Forge will summon high-contrast Dark Fantasy visuals, glyphs, and grimoire lore cards.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] mb-2">
                                        Vision / Prompt *
                                    </label>
                                    <textarea
                                        value={forgeIdea}
                                        onChange={(e) => setForgeIdea(e.target.value)}
                                        placeholder="e.g. Cursed obsidian scythe radiating necrotic mist in an ancient cathedral..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[#0e1017] border border-[#242830] rounded-xl text-white placeholder-[#444] text-xs focus:border-[#00d2ff] focus:outline-none transition-all resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#242830]">
                                    <button
                                        type="button"
                                        onClick={() => setIsInscribing(false)}
                                        className="px-5 py-3 rounded-xl border border-[#242830] text-xs font-bold text-[#70757e] hover:text-white transition-colors"
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!forgeIdea.trim()}
                                        onClick={() => {
                                            if (forgeIdea.trim()) {
                                                setIsInscribing(false);
                                                if (onForgePrompt) {
                                                    onForgePrompt(forgeIdea.trim());
                                                }
                                            }
                                        }}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#0077ff] hover:from-[#33ddff] hover:to-[#1a88ff] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Sparkles className="w-4 h-4 text-black" />
                                        <span>OPEN IN FORGE</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
