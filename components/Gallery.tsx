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
    Globe
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
import { saveToHistory } from '../services/storageService';
import { audioFX } from '../services/audioService';
import type { GeneratedData } from '../types';

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

const Sparkline: React.FC<{ color: string; seed: number }> = ({ color, seed }) => {
    const points = [40, 35, 55, 45, 70, 65, 85].map((p, i) => `${i * 30},${100 - (p + (seed * 5))}`);
    const path = `M ${points.join(' L ')}`;

    return (
        <div className="w-full h-16 mt-4 mb-2 relative group-hover:scale-105 transition-transform duration-500">
            <svg viewBox="0 0 180 100" className="w-full h-full overflow-visible">
                <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-80"
                    style={{ filter: `drop-shadow(0 0 5px ${color})` }}
                />
                <circle cx="180" cy={100 - (85 + (seed * 5))} r="4" fill={color} className="animate-pulse" />
            </svg>
            <div className="absolute top-0 right-0 text-[8px] font-black uppercase tracking-tighter" style={{ color }}>
                +{10 + seed * 2.1}% Power
            </div>
        </div>
    );
};

export const Gallery: React.FC<GalleryProps> = ({ onBack, onSelectRelic, onForgePrompt }) => {
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [activeTab, setActiveTab] = useState<'cloud_history' | 'community'>('community');
    const [cloudHistory, setCloudHistory] = useState<GeneratedData[]>([]);
    const [communityGallery, setCommunityGallery] = useState<GeneratedData[]>([]);
    const [isLoadingFirestore, setIsLoadingFirestore] = useState(true);

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

    const activeList = activeTab === 'cloud_history' ? (cloudHistory.length > 0 ? cloudHistory : localHistory) : communityGallery;

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

    // Handle image file selection (both drag-drop and click upload)
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
                    // Compress to guarantee safe Firestore document storage
                    const compressed = await compressImageForFirestore(rawDataUrl, 900, 0.82);
                    setUploadImage(compressed);
                    audioFX.playBladeUnsheathe();
                    // Auto-fill title if empty
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
            const tags = uploadTags
                .split(',')
                .map(t => t.trim().replace(/^#/, ''))
                .filter(Boolean);

            const newRelic: GeneratedData = {
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
                        tags: tags.length > 0 ? tags : ['relic', 'abyssal', 'dark-fantasy'],
                        imageUrl: uploadImage,
                    }
                ],
                negativePrompts: [],
                remixSuggestions: []
            };

            // 1. First guarantee local preservation in history & IndexedDB so work is never lost
            saveToHistory(newRelic, uploadLore);

            // 2. Save to Firestore (both user private sessions & public gallery if checked)
            await saveManifestationToFirestore(newRelic, uploadLore, publishToPublic);

            audioFX.playStoneRuneThud();

            // Real-time state update
            setCloudHistory(prev => [newRelic, ...prev]);
            if (publishToPublic) {
                setCommunityGallery(prev => [newRelic, ...prev]);
                setActiveTab('community');
            } else {
                setActiveTab('cloud_history');
            }

            // Reset form
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

    // 1-Click publish session to public community gallery
    const handlePublishSessionToCommunity = async (session: GeneratedData, index: number) => {
        const idKey = `${session.mainTitle}_${index}`;
        setPublishingId(idKey);
        try {
            await publishSessionToPublicGallery(session);
            audioFX.playBladeUnsheathe();
            setPublishedIds(prev => ({ ...prev, [idKey]: true }));
            setCommunityGallery(prev => [session, ...prev]);
        } catch (err) {
            console.error("Publish to community failed:", err);
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <div className="w-full animate-fade-in pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 pt-4 sm:pt-6 gap-6">
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

            {/* Tab navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#242830] pb-4 mb-8 gap-4">
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
                        const idKey = `${data.mainTitle}_${i}`;
                        const isPublished = publishedIds[idKey];
                        const isPublishing = publishingId === idKey;

                        return (
                            <div 
                                key={i} 
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
                        );
                    })}

                    {/* Interactive "Inscribe New Relic" Action Cards:
                        If list is empty, display 6 interactive manifestation slots.
                        If list has items, append 1 interactive manifestation slot at the end so the user can easily add more!
                    */}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#111318] border border-[#242830] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 flex flex-col relative">
                        {/* Close button */}
                        <button 
                            onClick={() => {
                                audioFX.playBladeUnsheathe();
                                setIsInscribing(false);
                            }}
                            className="absolute top-6 right-6 p-2 rounded-full border border-[#242830] text-[#70757e] hover:text-white hover:border-[#ff4d4d] transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-[#ff4d4d] text-[10px] font-black uppercase tracking-widest mb-2">
                                <span>✦ CLOUD FIRESTORE ARCHIVE</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
                                Inscribe Into The Codex
                            </h3>
                            <p className="text-xs text-[#70757e] uppercase tracking-wider mt-1">
                                Add your dark fantasy imagery to the public archive or forge anew with the AI engine.
                            </p>
                        </div>

                        {/* Mode Switcher */}
                        <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-[#0b0c10] rounded-2xl border border-[#242830]">
                            <button
                                type="button"
                                onClick={() => {
                                    audioFX.playStoneRuneThud();
                                    setInscribeMode('upload');
                                }}
                                className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                    inscribeMode === 'upload'
                                    ? 'bg-[#8d1a1a] text-white shadow-[0_0_15px_rgba(141,26,26,0.5)]'
                                    : 'text-[#70757e] hover:text-[#e8e6e3]'
                                }`}
                            >
                                <Upload className="w-4 h-4" />
                                <span>Direct Image Upload</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    audioFX.playStoneRuneThud();
                                    setInscribeMode('forge');
                                }}
                                className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
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
                                {/* Upload / Drag-and-drop Zone */}
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

                                {/* Title & Archetype Fields */}
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
                                            <option value="Abyssal Armor">Abyssal Armor</option>
                                            <option value="Eldritch Amulet">Eldritch Amulet</option>
                                            <option value="Unholy Idol">Unholy Idol</option>
                                            <option value="Spectral Tome">Spectral Tome</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Lore / Description */}
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

                                {/* Tags */}
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
                                            Shares this relic with the community archive so other cultists can view it.
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
                                        onClick={() => {
                                            if (onForgePrompt && forgeIdea.trim()) {
                                                audioFX.playBladeUnsheathe();
                                                setIsInscribing(false);
                                                onForgePrompt(forgeIdea.trim());
                                            } else {
                                                setIsInscribing(false);
                                                onBack();
                                            }
                                        }}
                                        className="px-6 py-3 rounded-xl bg-[#00d2ff] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>ENTER FORGE WITH THIS VISION</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sacrifice tiers / pricing */}
            <div className="mt-20 relative z-10">
                <div className="text-center mb-12">
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">Sacrifice for Greater Power</h3>
                    <p className="text-[#70757e] max-w-2xl mx-auto uppercase text-[10px] font-bold tracking-[0.3em]">Unlock the Forbidden Tiers of the Codex</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[2rem] bg-[#111318] border border-[#242830] flex flex-col group">
                        <h4 className="text-[#70757e] text-xs font-black uppercase mb-2">Initiate</h4>
                        <div className="text-3xl font-black text-white mb-2">Free <span className="text-sm font-normal text-[#444]">/ life</span></div>
                        <Sparkline color="#444" seed={1} />
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="text-xs text-[#9aa0a6] flex items-center gap-2">✓ Gemini Flash Tier</li>
                            <li className="text-xs text-[#9aa0a6] flex items-center gap-2">✓ Standard 1K Resolving</li>
                            <li className="text-xs text-[#444] flex items-center gap-2">✕ Ephemeral Slots</li>
                        </ul>
                        <button disabled className="w-full py-4 rounded-xl border border-[#242830] text-xs font-black uppercase text-[#444]">Current Path</button>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-gradient-to-b from-[#111318] to-[#0b0b0f] border border-[#00d2ff]/30 shadow-[0_0_30px_rgba(0,210,255,0.1)] flex flex-col relative overflow-hidden group hover:border-[#00d2ff] transition-all">
                        <div className="absolute top-0 right-0 bg-[#00d2ff] text-black text-[9px] font-black px-4 py-1 uppercase tracking-widest rotate-45 translate-x-4 translate-y-2">Popular</div>
                        <h4 className="text-[#00d2ff] text-xs font-black uppercase mb-2">Scribe</h4>
                        <div className="text-3xl font-black text-white mb-2">$19 <span className="text-sm font-normal text-[#70757e]">/ month</span></div>
                        <Sparkline color="#00d2ff" seed={2} />
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#00d2ff]">✦</span> Unlimited Abyssal Archive</li>
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#00d2ff]">✦</span> 2K Vector Manifestation</li>
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#00d2ff]">✦</span> No Manifestation Cooldown</li>
                        </ul>
                        <button className="w-full py-4 rounded-xl bg-transparent border border-[#00d2ff] text-[#00d2ff] text-xs font-black uppercase hover:bg-[#00d2ff] hover:text-black transition-all">Bind Spirit</button>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#1b1212] to-[#111318] border-2 border-[#8d1a1a] shadow-[0_0_50px_rgba(141,26,26,0.3)] flex flex-col group hover:scale-105 transition-all">
                        <h4 className="text-[#ff4d4d] text-xs font-black uppercase mb-2">High Priest</h4>
                        <div className="text-3xl font-black text-white mb-2">$49 <span className="text-sm font-normal text-[#70757e]">/ month</span></div>
                        <Sparkline color="#ff0000" seed={3} />
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#ff4d4d]">◈</span> 4K Ultra-Fidelity Relics</li>
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#ff4d4d]">◈</span> Gemini 3 Pro Engine</li>
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#ff4d4d]">◈</span> Veo 3.1 Video Rituals</li>
                            <li className="text-xs text-[#e8e6e3] flex items-center gap-2"><span className="text-[#ff4d4d]">◈</span> Commercial Rights Grimoire</li>
                        </ul>
                        <button className="w-full py-4 rounded-xl bg-[#8d1a1a] text-white text-xs font-black uppercase shadow-[0_0_20px_#8d1a1a] hover:bg-[#ff0000] transition-all">Ascend Now</button>
                    </div>
                </div>
                
                <p className="text-center mt-12 text-[9px] font-bold text-[#444] uppercase tracking-[0.4em]">All rituals processed with 40% margin for the Great Architect</p>
            </div>
        </div>
    );
};
