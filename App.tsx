
import React, { useState, useCallback, useEffect } from 'react';
import { GeneratorForm } from './components/GeneratorForm';
import { ApiKeyModal } from './components/ApiKeyModal';
import { LoadingScreen } from './components/LoadingScreen';
import { PromptCardSet } from './components/PromptCardSet';
import { Gallery } from './components/Gallery';
import { AboutMe } from './components/AboutMe';
import { NewsletterForm } from './components/NewsletterForm';
import { Crucible } from './components/Crucible';
import { YouTubeChronicles } from './components/YouTubeChronicles';
import { DenomicStudio } from './components/DenomicStudio';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PricingTiers } from './components/PricingTiers';
import { AngelicAgentModal } from './components/AngelicAgentModal';
import { AngelicAgent, AngelicAgentErrorBoundary } from './components/AngelicAgent';
import { ParticleCanvas } from './components/ParticleCanvas';
import { AbyssalChoirSoundboard } from './components/AbyssalChoirSoundboard';
import { audioFX } from './services/audioService';
import RelicCodex from './pages/RelicCodex';
import * as geminiService from './services/geminiService';
import { saveToHistory as safeSaveToHistory } from './services/storageService';
import { getUserSubscription, setUserSubscription, verifyCheckoutSession, UserSubscriptionInfo } from './services/stripeService';
import { signInWithGoogle, signOutUser, onUserAuthStateChanged } from './services/firebaseService';
import type { User } from 'firebase/auth';
import type { GeneratedData } from './types';

const LegalModal: React.FC<{ 
    title: string; 
    standaloneUrl: string;
    content: React.ReactNode; 
    isOpen: boolean; 
    onClose: () => void 
}> = ({ title, standaloneUrl, content, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-[#111318] border-2 border-[#8d1a1a] shadow-[0_0_50px_rgba(141,26,26,0.4)] max-w-3xl w-full max-h-[85vh] overflow-y-auto rounded-2xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[#242830] pb-4">
                    <div>
                        <h2 className="lightning-text text-2xl uppercase italic">{title}</h2>
                        <span className="text-[10px] text-[#70757e] tracking-widest uppercase">The Demon Codex &bull; Legal Compliance</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href={standaloneUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] font-bold text-[#00d2ff] hover:underline uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-[#00d2ff]/30 hover:bg-[#00d2ff]/10 transition-all flex items-center gap-1"
                            title="Open standalone document in new tab"
                        >
                            <span>↗</span> Open Standalone Page
                        </a>
                        <button onClick={onClose} className="text-[#70757e] hover:text-white font-black p-2 text-lg">✕</button>
                    </div>
                </div>
                <div className="text-[#9aa0a6] text-sm leading-relaxed space-y-4">
                    {content}
                </div>
                <div className="mt-8 pt-4 border-t border-[#242830] flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <a 
                        href={standaloneUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#00d2ff] hover:underline flex items-center gap-1"
                    >
                        <span>🔗</span> Public URL: {standaloneUrl}
                    </a>
                    <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 bg-[#8d1a1a] text-white font-bold rounded-lg hover:shadow-[0_0_20px_#ff0000] transition-all text-xs uppercase tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const BloodDrops: React.FC<{ isBloodRitual?: boolean }> = ({ isBloodRitual = false }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[12] overflow-hidden">
            <span className="blood-drop" style={{ '--drop-left': '8%', '--drop-duration': isBloodRitual ? '2.4s' : '4s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '22%', '--drop-duration': isBloodRitual ? '3.2s' : '7s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '38%', '--drop-duration': isBloodRitual ? '2.0s' : '5s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '52%', '--drop-duration': isBloodRitual ? '3.8s' : '9s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '68%', '--drop-duration': isBloodRitual ? '2.5s' : '6s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '84%', '--drop-duration': isBloodRitual ? '3.0s' : '8s' } as any}></span>
            <span className="blood-drop" style={{ '--drop-left': '94%', '--drop-duration': isBloodRitual ? '2.1s' : '3s' } as any}></span>
            {isBloodRitual && (
                <>
                    <span className="blood-drop" style={{ '--drop-left': '4%', '--drop-duration': '1.8s' } as any}></span>
                    <span className="blood-drop" style={{ '--drop-left': '14%', '--drop-duration': '2.6s' } as any}></span>
                    <span className="blood-drop" style={{ '--drop-left': '30%', '--drop-duration': '2.2s' } as any}></span>
                    <span className="blood-drop" style={{ '--drop-left': '46%', '--drop-duration': '3.1s' } as any}></span>
                    <span className="blood-drop" style={{ '--drop-left': '60%', '--drop-duration': '1.9s' } as any}></span>
                    <span className="blood-drop" style={{ '--drop-left': '76%', '--drop-duration': '2.8s' } as any}></span>
                    <span className="blood-drop" style={{ '--drop-left': '90%', '--drop-duration': '2.3s' } as any}></span>
                </>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const [view, setView] = useState<'forge' | 'gallery' | 'about' | 'crucible' | 'codex' | 'youtube' | 'studio' | 'ascend' | 'angelic' | 'angelic-agent'>('forge');
    const [userInput, setUserInput] = useState<string>('');
    const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
    
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9'>('16:9');
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [needsKey, setNeedsKey] = useState<boolean>(false);
    const [hasKeySelected, setHasKeySelected] = useState<boolean>(false);
    const [hasCustomKey, setHasCustomKey] = useState<boolean>(() => geminiService.isCustomUserKeyActive());
    const [keySource, setKeySource] = useState<string>('free');
    const [useThinking, setUseThinking] = useState<boolean>(false);
    const [isStudioQuality, setIsStudioQuality] = useState<boolean>(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
    const pendingGenerateRef = React.useRef<{ idea: string; options?: any } | null>(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState<boolean>(false);
    const [userSubscription, setUserSubscriptionState] = useState<UserSubscriptionInfo>(() => getUserSubscription());
    const [ascensionMessage, setAscensionMessage] = useState<string | null>(null);
    const [ascensionTransitionPlan, setAscensionTransitionPlan] = useState<string | null>(null);

    // Blood Ritual Theme Toggle State (Deep Crimson Overlay & Falling Blood Embers)
    const [isBloodRitual, setIsBloodRitual] = useState<boolean>(() => {
        try {
            return localStorage.getItem('demon_codex_blood_ritual') === 'true';
        } catch {
            return false;
        }
    });

    const toggleBloodRitual = () => {
        setIsBloodRitual(prev => {
            const next = !prev;
            try {
                localStorage.setItem('demon_codex_blood_ritual', String(next));
            } catch {}
            audioFX.playBloodRitual(next);
            return next;
        });
    };

    // Ambient Embers & Rune FX Toggle State
    const [isEmbersEnabled, setIsEmbersEnabled] = useState<boolean>(() => {
        try {
            return localStorage.getItem('demon_codex_embers') !== 'false';
        } catch {
            return true;
        }
    });

    const toggleEmbers = () => {
        setIsEmbersEnabled(prev => {
            const next = !prev;
            try {
                localStorage.setItem('demon_codex_embers', String(next));
            } catch {}
            audioFX.playRuneChime();
            return next;
        });
    };

    // Angelic Agent State (Seraphic Oracle & Prompt Purifier)
    const [showAngelicModal, setShowAngelicModal] = useState<boolean>(false);
    const [isAngelicSanctum, setIsAngelicSanctum] = useState<boolean>(() => {
        try {
            return localStorage.getItem('demon_codex_angelic_sanctum') === 'true';
        } catch {
            return false;
        }
    });

    const activateAngelicAgent = useCallback(() => {
        console.log("Angelic Agent Activated");
        audioFX.playRuneChime();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setView('angelic');
        setShowAngelicModal(false);
    }, []);

    const toggleAngelicSanctum = useCallback(() => {
        setIsAngelicSanctum(prev => {
            const next = !prev;
            try {
                localStorage.setItem('demon_codex_angelic_sanctum', String(next));
            } catch {}
            audioFX.playRuneChime();
            return next;
        });
    }, []);

    // Firebase Google Auth State
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
    const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
    const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

    // Procedural Web Audio FX & Abyssal Choir State
    const [isDronePlaying, setIsDronePlaying] = useState<boolean>(() => audioFX.getState().masterDroneActive);
    const [isMuted, setIsMuted] = useState<boolean>(() => audioFX.getState().sfxMuted);
    const [showChoirSoundboard, setShowChoirSoundboard] = useState<boolean>(false);
    const [negativePrompt, setNegativePrompt] = useState<string>('');

    const toggleDrone = () => {
        audioFX.playStoneRuneThud();
        audioFX.toggleMasterDrone();
    };

    const toggleAudioMute = () => {
        audioFX.toggleSfxMute();
    };

    React.useEffect(() => {
        const unsubAudio = audioFX.subscribe((state) => {
            setIsDronePlaying(state.masterDroneActive);
            setIsMuted(state.sfxMuted);
        });
        return () => {
            unsubAudio();
        };
    }, []);

    React.useEffect(() => {
        // Subscribe to Firebase Auth state
        const unsubscribeAuth = onUserAuthStateChanged((user) => {
            setAuthUser(user);
        });

        // Close dropdown on outside click
        const handleOutsideClick = () => {
            setShowUserDropdown(false);
        };
        window.addEventListener('click', handleOutsideClick);

        // Check server and client environment for Dark Fantasy / Gemini API keys
        geminiService.checkServerKeyStatus().then(status => {
            if (status.hasKey) {
                setHasKeySelected(true);
                if (status.keySource) setKeySource(status.keySource);
            }
        });

        let selected = geminiService.isCustomUserKeyActive();
        if (!selected && window.aistudio?.hasSelectedApiKey) {
            selected = window.aistudio.hasSelectedApiKey();
        }
        if (!selected) {
            selected = geminiService.hasApiKeySelected();
        }
        setHasKeySelected(selected);
        setHasCustomKey(geminiService.isCustomUserKeyActive());

        // Check for return from Stripe Checkout (/payment/success, /payment/cancel, or query params)
        const currentPath = window.location.pathname.toLowerCase();
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const checkoutStatus = urlParams.get('checkout_status');
        const planParam = urlParams.get('plan') || undefined;
        const isSuccess = currentPath.includes('/payment/success') || checkoutStatus === 'success';
        const isCancelled = currentPath.includes('/payment/cancel') || checkoutStatus === 'cancelled';

        if (isSuccess && sessionId) {
            const currentUid = authUser?.uid;
            verifyCheckoutSession(sessionId, planParam, currentUid).then((sub) => {
                if (sub) {
                    setUserSubscriptionState(sub);
                    setAscensionMessage(`⚡ Compact Sealed! You have ascended to ${sub.planName}. Unlimited powers unlocked.`);
                    try {
                        localStorage.setItem('demon_codex_premium', 'true');
                        localStorage.setItem('demon_codex_tier', sub.tier);
                    } catch {}
                    setAscensionTransitionPlan(sub.planId);
                    setIsSubscriptionModalOpen(true);
                }
            });
            window.history.replaceState({}, '', '/');
        } else if (isCancelled) {
            setAscensionMessage(`Ascension deferred. You remain in Mortal tier.`);
            window.history.replaceState({}, '', '/');
        }

        // Check for Privacy Policy, Terms of Service, or Angelic deep links
        const checkLegalDeepLinks = () => {
            const currentPath = window.location.pathname.toLowerCase();
            const currentHash = window.location.hash.toLowerCase();
            const searchParams = new URLSearchParams(window.location.search);
            const pageParam = searchParams.get('page')?.toLowerCase();
            const viewParam = searchParams.get('view')?.toLowerCase();

            if (currentPath.includes('/angelic') || currentHash === '#angelic' || pageParam === 'angelic' || viewParam === 'angelic') {
                setView('angelic');
            } else if (currentPath.includes('/privacy') || currentHash === '#privacy' || pageParam === 'privacy') {
                setActiveModal('privacy');
            } else if (currentPath.includes('/terms') || currentHash === '#terms' || pageParam === 'terms') {
                setActiveModal('terms');
            }
        };

        checkLegalDeepLinks();

        const handlePopState = () => {
            checkLegalDeepLinks();
        };
        window.addEventListener('popstate', handlePopState);

        return () => {
            unsubscribeAuth();
            window.removeEventListener('click', handleOutsideClick);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Angelic Agent Global & DOM Click Listener
    useEffect(() => {
        const handler = () => {
            activateAngelicAgent();
        };
        const el = document.querySelector('.angelic-agent');
        el?.addEventListener('click', handler);
        (window as any).activateAngelicAgent = activateAngelicAgent;

        return () => {
            el?.removeEventListener('click', handler);
            delete (window as any).activateAngelicAgent;
        };
    }, [activateAngelicAgent]);

    const handleGoogleSignIn = async () => {
        setAuthErrorNotice(null);
        try {
            setIsAuthLoading(true);
            await signInWithGoogle();
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
                return;
            }
            const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
            if (error?.code === 'auth/internal-error') {
                if (isInIframe || error?.isInIframe) {
                    setAuthErrorNotice("Google authentication was blocked by browser iframe security (third-party storage partitioning in embedded preview). Click 'Open in New Tab' below to sign in directly, or verify Google Sign-in is enabled in Firebase Console.");
                } else {
                    setAuthErrorNotice("Firebase Internal Error (auth/internal-error): Please verify that the Google provider is Enabled in Firebase Console (Authentication > Sign-in method > Google) and this domain is added to Authorized Domains.");
                }
            } else if (error?.code === 'auth/unauthorized-domain') {
                setAuthErrorNotice("Domain authorization required: please add this domain to Firebase Console > Authentication > Settings > Authorized domains, or open the app in a new tab.");
            } else if (error?.code === 'auth/popup-blocked') {
                setAuthErrorNotice("Google Sign-In popup was blocked by your browser. Please allow popups or click 'Open in New Tab' below.");
            } else if (error?.code === 'auth/operation-not-allowed') {
                setAuthErrorNotice("Google Sign-In provider is currently disabled in Firebase. Enable it under Firebase Console > Authentication > Sign-in method > Google.");
            } else {
                setAuthErrorNotice(error?.message || "Google Sign-In failed. Please try again.");
            }
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOutUser();
            setShowUserDropdown(false);
        } catch (error: any) {
            console.error("Sign out error:", error);
        }
    };

    const handleSelectKey = async () => {
        if (window.aistudio?.openSelectKey) {
            try {
                await window.aistudio.openSelectKey();
                const selected = window.aistudio.hasSelectedApiKey?.() || false;
                setHasKeySelected(selected);
                if (selected) {
                    setNeedsKey(false);
                    if (pendingGenerateRef.current) {
                        const { idea, options } = pendingGenerateRef.current;
                        pendingGenerateRef.current = null;
                        handleGenerate(idea, options);
                    }
                    return;
                }
            } catch (err) {
                console.warn("AI Studio key selector notice:", err);
            }
        }
        setNeedsKey(false);
        setIsApiKeyModalOpen(true);
    };

    const saveToHistory = useCallback((data: GeneratedData, userIdea?: string) => {
        safeSaveToHistory(data, userIdea);
    }, []);

    const handleGenerate = useCallback(async (
        idea: string, 
        options?: { useThinking: boolean; isStudioQuality: boolean; negativePrompt?: string }
    ) => {
        const thinkingOpt = options?.useThinking ?? useThinking;
        const studioQualityOpt = options?.isStudioQuality ?? isStudioQuality;
        const banishText = options?.negativePrompt?.trim() || '';
        if (banishText) {
            setNegativePrompt(banishText);
        }

        // Dynamic re-check of key right before starting
        const customActive = geminiService.isCustomUserKeyActive();
        setHasCustomKey(customActive);

        let selected = customActive;
        if (!selected && window.aistudio?.hasSelectedApiKey) {
            selected = window.aistudio.hasSelectedApiKey();
        }
        if (!selected) {
            selected = geminiService.hasApiKeySelected();
        }
        setHasKeySelected(selected);

        // If requesting 2K/4K or Pro Studio Quality or Deep Occult Intellect
        // without custom key or AI Studio active key:
        if (!customActive && !window.aistudio?.hasSelectedApiKey?.() && (imageSize !== '1K' || studioQualityOpt || thinkingOpt)) {
            pendingGenerateRef.current = { 
                idea, 
                options: { useThinking: thinkingOpt, isStudioQuality: studioQualityOpt, negativePrompt: banishText } 
            };
            setNeedsKey(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedData(null);
        setUserInput(idea);

        try {
            setLoadingMessage(thinkingOpt ? 'Invoking Occult Intellect (High Thinking)...' : 'Consulting the Flash Engine...');
            const textData = await geminiService.generatePromptSet(idea, thinkingOpt, banishText);

            setLoadingMessage('Manifesting Cinematic Vectors...');
            
            const banishSuffix = banishText ? ` (Strictly avoid / Banished: ${banishText})` : '';
            const imagePrompts = [
                { type: 'banner', prompt: `Wide cinematic dark fantasy landscape, ${textData.tone}, gothic architecture, volumetric lighting, high contrast, 8k resolution.${banishSuffix}`, aspectRatio: aspectRatio, size: imageSize, isStudioQuality: studioQualityOpt },
                ...textData.cards.map((card, index) => ({
                    type: `card-${index}`,
                    prompt: `${card.title}, ${card.prompt.replace(/\n/g, ', ')}, atmospheric dark fantasy, gothic aesthetic, vivid colors, sharp focus.${banishSuffix}`,
                    aspectRatio: aspectRatio,
                    size: imageSize,
                    isStudioQuality: studioQualityOpt
                }))
            ];

            const imageResults: { [key: string]: geminiService.GenerateImageResult } = {};
            
            for (let i = 0; i < imagePrompts.length; i++) {
                const p = imagePrompts[i];
                setLoadingMessage(`Manifesting Relic ${i + 1}/${imagePrompts.length}...`);
                try {
                    const result = await geminiService.generateImageWithDiagnostics(p.prompt, p.aspectRatio, p.size, p.isStudioQuality);
                    imageResults[p.type] = result;
                    if (result.diagnostic?.hasError) {
                        if (result.diagnostic.statusCode === '403_KEY_REQUIRED' || result.diagnostic.statusCode === '403_PERMISSION_DENIED') {
                            setNeedsKey(true);
                        } else if (result.diagnostic.statusCode === '402_PREPAYMENT_DEPLETED') {
                            setError("Your Google AI Studio prepayment credits are depleted. Visit https://ai.studio/projects to top up credits for image generation.");
                        }
                    }
                } catch (imgErr: any) {
                    console.error(`Asset manifestation error for ${p.type}:`, imgErr);
                    imageResults[p.type] = {
                        imageUrl: geminiService.FAILED_IMAGE_PLACEHOLDER,
                        diagnostic: {
                            hasError: true,
                            rawError: imgErr?.message || String(imgErr),
                            statusCode: imgErr?.status || "RUNTIME_ERR",
                            modelName: p.isStudioQuality ? 'gemini-3-pro-image' : 'gemini-3.1-flash-image',
                            promptAttempted: p.prompt,
                            timestamp: new Date().toLocaleTimeString()
                        }
                    };
                }
            }

            const finalData: GeneratedData = {
                ...textData,
                mainTitle: 'The Demon Codex',
                bannerImageUrl: imageResults['banner']?.imageUrl || geminiService.FAILED_IMAGE_PLACEHOLDER,
                bannerDiagnostic: imageResults['banner']?.diagnostic,
                cards: textData.cards.map((card, index) => ({
                    ...card,
                    imageUrl: imageResults[`card-${index}`]?.imageUrl || geminiService.FAILED_IMAGE_PLACEHOLDER,
                    diagnostic: imageResults[`card-${index}`]?.diagnostic,
                })),
            };

            setGeneratedData(finalData);
            saveToHistory(finalData, idea);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ancient engine failure.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [aspectRatio, imageSize, useThinking, isStudioQuality, hasKeySelected]);
    
    const handleStartOver = () => {
        setGeneratedData(null);
        setError(null);
        setUserInput('');
        setView('forge');
    }

    const openGallery = () => {
        audioFX.playRuneChime();
        setView('gallery');
    };
    const openAbout = () => {
        audioFX.playRuneChime();
        setView('about');
    };

    return (
        <div className={`bg-transparent text-[#e8e6e3] font-['Inter'] min-h-screen w-full selection:bg-[#ff0000] selection:text-white flex flex-col relative overflow-x-hidden transition-colors duration-700 ${isBloodRitual ? 'blood-ritual-active' : ''}`}>
            {/* Interactive Procedural Dark Fantasy Particle Canvas */}
            <ParticleCanvas 
                mode="ember" 
                density={36} 
                isBloodRitual={isBloodRitual} 
                isAngelicSanctum={isAngelicSanctum}
                onToggleBloodRitual={toggleBloodRitual} 
                enabled={isEmbersEnabled}
                onToggleEnabled={toggleEmbers}
            />
            <BloodDrops isBloodRitual={isBloodRitual} />

            {/* Angelic Sanctum Golden Starlight Wash */}
            {isAngelicSanctum && !isBloodRitual && (
                <div className="fixed inset-0 pointer-events-none z-[15] transition-opacity duration-700 animate-fade-in">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#ffd27f]/10 via-transparent to-[#ffd27f]/5 mix-blend-screen" />
                    <div className="absolute inset-0 shadow-[inset_0_0_140px_rgba(255,210,127,0.18)]" />
                </div>
            )}

            {/* Blood Ritual Deep Crimson Overlay to the entire UI */}
            {isBloodRitual && (
                <div className="fixed inset-0 pointer-events-none z-[15] transition-opacity duration-700 animate-fade-in">
                    {/* Deep crimson vignette & abyssal ambient wash */}
                    <div className="absolute inset-0 blood-ritual-vignette opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#8d1a1a]/30 via-[#500202]/15 to-[#240000]/50 mix-blend-color-burn" />
                    <div className="absolute inset-0 shadow-[inset_0_0_160px_rgba(255,0,0,0.55)]" />
                    {/* Subtle rhythmic pulse for ritual heartbeat aura */}
                    <div className="absolute inset-0 bg-[#ff0000]/[0.04] animate-blood-pulse mix-blend-overlay" />
                </div>
            )}

            {/* Authentication Notice Banner */}
            {authErrorNotice && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] max-w-xl w-[92%] p-4 sm:p-5 rounded-2xl bg-[#14161d] border border-[#ff4d4d]/60 text-white shadow-[0_15px_50px_rgba(0,0,0,0.95)] flex items-start justify-between gap-3 animate-fade-in">
                    <div className="flex items-start gap-3 w-full">
                        <span className="text-2xl flex-shrink-0 mt-0.5">⚠️</span>
                        <div className="w-full">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-black uppercase tracking-wider text-[#ff7b7b]">Authentication Notice</p>
                                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#8d1a1a]/30 border border-[#8d1a1a] text-[#ff9999]">
                                    Google Sign-In
                                </span>
                            </div>
                            <p className="text-[11px] text-[#cfd3d8] mt-1.5 leading-relaxed">{authErrorNotice}</p>

                            <div className="mt-3 pt-3 border-t border-[#242830] flex flex-wrap items-center gap-2.5">
                                <a
                                    href={window.location.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 border border-[#00d2ff]/50 text-[#00d2ff] text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1 shadow-[0_0_10px_rgba(0,210,255,0.2)]"
                                >
                                    <span>Open in New Tab & Sign In</span>
                                    <span>↗</span>
                                </a>

                                <button
                                    onClick={() => setAuthErrorNotice(null)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#111318] hover:bg-[#242830] border border-[#242830] text-[#cfd3d8] hover:text-white text-[10px] font-semibold transition-colors"
                                >
                                    Continue in Local Cultist Session
                                </button>

                                <a
                                    href="https://console.firebase.google.com/project/gen-lang-client-0064975005/authentication/providers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-[#70757e] hover:text-[#00d2ff] underline transition-colors inline-flex items-center gap-1 ml-auto"
                                    title="Open Firebase Console Authentication Settings"
                                >
                                    <span>Firebase Console</span>
                                    <span>↗</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setAuthErrorNotice(null)}
                        className="text-[#70757e] hover:text-white text-xs font-black p-1 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                        title="Dismiss Notice"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* 1. TOP NAVIGATION BAR (Header HUD) */}
            <header className="fixed top-0 left-0 right-0 z-[60] h-16 backdrop-blur-md bg-black/85 border-b border-red-950/40 px-3 sm:px-6 flex items-center justify-between no-print shadow-[0_4px_30px_rgba(0,0,0,0.85)]">
                {/* Left side: DEMON CODEX branding with sigil/logo icon */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                        onClick={handleStartOver} 
                        className="flex items-center gap-2.5 group focus:outline-none"
                        title="The Demon Codex — Forge Home"
                    >
                        <div className="relative">
                            <img 
                                src="/demon-ai-1781131108810.jpg" 
                                alt="The Demon Codex Sigil" 
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#8d1a1a] object-cover shadow-[0_0_15px_#8d1a1a] group-hover:scale-105 group-hover:border-[#ff4d4d] transition-all duration-300"
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ff0000] shadow-[0_0_6px_#ff0000]" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-[#e8e6e3] group-hover:text-white font-serif transition-colors whitespace-nowrap">
                                Demon Codex
                            </span>
                            <span className="text-[8px] font-mono uppercase tracking-widest text-[#70757e] group-hover:text-[#ff4d4d] hidden sm:block">
                                Relic Series Forge
                            </span>
                        </div>
                    </button>
                </div>

                {/* Center: Main navigation links in sleek horizontal pill container */}
                <nav className="flex items-center gap-1 bg-[#0c0e14]/95 border border-[#242830] rounded-full p-1 shadow-[0_4px_30px_rgba(0,0,0,0.8)] overflow-x-auto no-scrollbar max-w-[42vw] md:max-w-none mx-2">
                    <button
                        onClick={handleStartOver}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'forge'
                                ? 'bg-[#8d1a1a] text-white border-[#ff4d4d] shadow-[0_0_20px_rgba(255,77,77,0.7)] font-bold'
                                : 'border-transparent text-[#cfd3d8] hover:text-white hover:border-[#ff4d4d]/70 hover:bg-[#8d1a1a]/30 hover:shadow-[0_0_20px_rgba(255,77,77,0.65)] hover:scale-105 active:scale-95'
                        }`}
                        title="Relic Generator Forge"
                    >
                        <span className={view === 'forge' ? 'text-white' : 'text-[#ff4d4d] drop-shadow-[0_0_8px_rgba(255,77,77,0.8)]'}>⚡</span>
                        <span>Forge</span>
                    </button>

                    <button 
                        onClick={openGallery}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'gallery' 
                                ? 'bg-[#00d2ff] text-black border-[#00d2ff] shadow-[0_0_22px_rgba(0,210,255,0.7)] font-bold' 
                                : 'border-transparent text-[#cfd3d8] hover:text-[#00d2ff] hover:border-[#00d2ff]/70 hover:bg-[#00d2ff]/15 hover:shadow-[0_0_22px_rgba(0,210,255,0.65)] hover:scale-105 active:scale-95'
                        }`}
                        title="Relic Gallery"
                    >
                        <span className={view === 'gallery' ? 'text-black' : 'text-[#00d2ff] drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]'}>◈</span>
                        <span className="hidden sm:inline">Relic</span> Gallery
                    </button>

                    <button 
                        onClick={() => { audioFX.playRuneChime(); setView('crucible'); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'crucible' 
                                ? 'bg-[#ffaa00] text-black border-[#ffaa00] shadow-[0_0_22px_rgba(255,170,0,0.7)] font-bold' 
                                : 'border-transparent text-[#cfd3d8] hover:text-[#ffaa00] hover:border-[#ffaa00]/70 hover:bg-[#ffaa00]/15 hover:shadow-[0_0_22px_rgba(255,170,0,0.65)] hover:scale-105 active:scale-95'
                        }`}
                        title="Alchemist's Crucible"
                    >
                        <span className={view === 'crucible' ? 'text-black' : 'text-[#ffaa00] drop-shadow-[0_0_8px_rgba(255,170,0,0.8)]'}>🔥</span>
                        <span className="hidden sm:inline">Alchemist's</span> Crucible
                    </button>

                    <button 
                        onClick={() => { audioFX.playRuneChime(); setView('codex'); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'codex' 
                                ? 'bg-[#ff0000] text-white border-[#ff4d4d] shadow-[0_0_22px_rgba(255,0,0,0.7)] font-bold' 
                                : 'border-transparent text-[#cfd3d8] hover:text-[#ff4d4d] hover:border-[#ff0000]/70 hover:bg-[#ff0000]/15 hover:shadow-[0_0_22px_rgba(255,0,0,0.65)] hover:scale-105 active:scale-95'
                        }`}
                        title="Relic Codex"
                    >
                        <span className={view === 'codex' ? 'text-white' : 'text-[#ff0000] drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]'}>✙</span>
                        <span className="hidden sm:inline">Relic</span> Codex
                    </button>

                    <button 
                        onClick={() => { audioFX.playRuneChime(); setView('youtube'); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'youtube' 
                                ? 'bg-[#ff2a2a] text-white border-[#ff4d4d] shadow-[0_0_22px_rgba(255,42,42,0.7)] font-bold' 
                                : 'border-transparent text-[#cfd3d8] hover:text-[#ff4d4d] hover:border-[#ff2a2a]/70 hover:bg-[#ff2a2a]/15 hover:shadow-[0_0_22px_rgba(255,42,42,0.65)] hover:scale-105 active:scale-95'
                        }`}
                        title="YouTube Chronicles"
                    >
                        <span className={view === 'youtube' ? 'text-white' : 'text-[#ff2a2a] drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]'}>📺</span>
                        <span className="hidden sm:inline">YouTube</span> Chronicles
                    </button>

                    <button 
                        onClick={() => { audioFX.playRuneChime(); setView('studio'); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'studio' 
                                ? 'bg-gradient-to-r from-[#c26b3a] to-[#ff4d4d] text-white border-[#ff4d4d] shadow-[0_0_22px_rgba(194,107,58,0.7)] font-bold' 
                                : 'border-transparent text-[#cfd3d8] hover:text-[#ff8a50] hover:border-[#c26b3a]/70 hover:bg-[#c26b3a]/20 hover:shadow-[0_0_22px_rgba(194,107,58,0.65)] hover:scale-105 active:scale-95'
                        }`}
                        title="Denomic Studio"
                    >
                        <span className={view === 'studio' ? 'text-white' : 'text-[#c26b3a] drop-shadow-[0_0_8px_rgba(194,107,58,0.8)]'}>🔮</span>
                        <span className="hidden sm:inline">Denomic</span> Studio
                    </button>

                    <button 
                        onClick={activateAngelicAgent}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 border ${
                            view === 'angelic' || view === 'angelic-agent'
                                ? 'bg-gradient-to-r from-[#ffd27f] via-[#ffe099] to-[#ffd27f] text-[#14110b] border-[#ffd27f] shadow-[0_0_22px_rgba(255,210,127,0.75)] font-bold' 
                                : 'border-[#ffd27f]/40 text-[#ffd27f] hover:text-[#fff3db] hover:border-[#ffd27f] hover:bg-[#ffd27f]/20 hover:shadow-[0_0_25px_rgba(255,210,127,0.75)] hover:scale-105 active:scale-95'
                        }`}
                        title="Angelic Agent & Seraphic Prompt Refiner"
                    >
                        <span className="drop-shadow-[0_0_8px_rgba(255,210,127,0.8)]">👼</span>
                        <span className="hidden sm:inline">Angelic</span> Agent
                    </button>
                </nav>

                {/* Right side: User actions and high-priority triggers */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                    {/* ⚔ ASCEND / PLANS */}
                    <button 
                        onClick={() => { audioFX.playRuneChime(); setView('ascend'); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap border ${
                            view === 'ascend' 
                                ? 'bg-gradient-to-r from-[#a855f7] to-[#ff2a2a] text-white border-[#ff2a2a] shadow-[0_0_25px_rgba(168,85,247,0.7)]' 
                                : 'bg-gradient-to-r from-[#191124] to-[#200d14] border-[#a855f7]/60 text-[#e9d5ff] hover:border-[#ff2a2a] hover:text-white shadow-[0_0_14px_rgba(168,85,247,0.25)] hover:shadow-[0_0_26px_rgba(255,42,42,0.6)] hover:scale-105 active:scale-95'
                        }`}
                        title="Ascend to Sovereign Tier / View Plans"
                    >
                        <span className="text-[#ffd27f] drop-shadow-[0_0_6px_rgba(255,210,127,0.8)]">⚔</span>
                        <span className="hidden sm:inline">ASCEND / PLANS</span>
                        <span className="sm:hidden">PLANS</span>
                    </button>

                    {/* [✦ BUY PREMIUM] (or Covenant token counter / tier badge) */}
                    <button
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shadow-lg border ${
                            userSubscription.isSubscribed
                                ? 'bg-[#00d2ff]/15 border-[#00d2ff] text-[#00d2ff] shadow-[0_0_18px_rgba(0,210,255,0.35)] hover:bg-[#00d2ff]/30 hover:shadow-[0_0_26px_rgba(0,210,255,0.7)] hover:scale-105 active:scale-95'
                                : 'bg-gradient-to-r from-[#ff0000] via-[#c26b3a] to-[#ffaa00] text-white border-[#ffaa00]/70 shadow-[0_0_18px_rgba(255,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,170,0,0.85)] hover:brightness-120 hover:scale-105 active:scale-95'
                        }`}
                        title="Ascend to Sovereign Covenant / Buy Premium"
                    >
                        <span className="drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">{userSubscription.isSubscribed ? '👑' : '✦'}</span>
                        <span className="hidden md:inline">{userSubscription.isSubscribed ? userSubscription.tier.toUpperCase() : 'BUY PREMIUM'}</span>
                        <span className="md:hidden">{userSubscription.isSubscribed ? 'VIP' : 'PREMIUM'}</span>
                    </button>

                    {/* [SIGN IN] / Profile Icon */}
                    {authUser ? (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-[#111318] border border-[#00d2ff]/40 hover:border-[#00d2ff] transition-all shadow-md group"
                                title={authUser.displayName || authUser.email || 'User Profile'}
                            >
                                {authUser.photoURL ? (
                                    <img 
                                        src={authUser.photoURL} 
                                        alt={authUser.displayName || "Google Avatar"} 
                                        className="w-6 h-6 rounded-full border border-[#00d2ff] object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-[#8d1a1a] text-white text-[10px] font-black flex items-center justify-center border border-[#ff4d4d]">
                                        {(authUser.displayName || authUser.email || 'C')[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="text-[11px] font-bold text-[#e8e6e3] max-w-[80px] truncate hidden md:inline group-hover:text-white">
                                    {authUser.displayName?.split(' ')[0] || authUser.email?.split('@')[0] || 'Cultist'}
                                </span>
                                <span className="text-[8px] text-[#70757e] transition-transform group-hover:text-[#00d2ff]">
                                    {showUserDropdown ? '▲' : '▼'}
                                </span>
                            </button>

                            {showUserDropdown && (
                                <div 
                                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0e1015] border border-[#242830] shadow-[0_10px_40px_rgba(0,0,0,0.9)] py-3 px-4 z-[200] animate-fade-in"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-3 pb-3 border-b border-[#242830]">
                                        {authUser.photoURL ? (
                                            <img 
                                                src={authUser.photoURL} 
                                                alt="Avatar" 
                                                className="w-10 h-10 rounded-full border border-[#00d2ff] object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#8d1a1a] text-white text-sm font-black flex items-center justify-center border border-[#ff4d4d]">
                                                {(authUser.displayName || authUser.email || 'C')[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-white truncate">{authUser.displayName || 'Arcane Cultist'}</p>
                                            <p className="text-[10px] text-[#70757e] truncate">{authUser.email || ''}</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-[#242830] flex flex-col gap-1 mt-2">
                                        <a 
                                            href="/privacy"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.history.pushState(null, '', '/privacy');
                                                setActiveModal('privacy');
                                                setShowUserDropdown(false);
                                            }}
                                            className="text-[10px] text-[#70757e] hover:text-[#00d2ff] px-2 py-1.5 transition-colors flex items-center gap-1.5 rounded hover:bg-[#111318]"
                                        >
                                            <span>📜</span> Privacy Policy
                                        </a>
                                        <a 
                                            href="/terms"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.history.pushState(null, '', '/terms');
                                                setActiveModal('terms');
                                                setShowUserDropdown(false);
                                            }}
                                            className="text-[10px] text-[#70757e] hover:text-[#00d2ff] px-2 py-1.5 transition-colors flex items-center gap-1.5 rounded hover:bg-[#111318]"
                                        >
                                            <span>⚖️</span> Terms of Service
                                        </a>
                                        <a 
                                            href="https://billing.stripe.com/p/login/dRm5kD7oU42N7EgcKL1gs00"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-[#70757e] hover:text-[#00d2ff] px-2 py-1.5 transition-colors flex items-center gap-1.5 rounded hover:bg-[#111318]"
                                        >
                                            <span>💳</span> Stripe Billing Portal ↗
                                        </a>
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full text-left py-2 px-2 text-xs font-black uppercase tracking-wider text-[#ff4d4d] hover:bg-[#ff0000]/10 rounded-lg transition-colors flex items-center gap-2 mt-1 border-t border-[#242830]/60"
                                        >
                                            <span>🚪</span> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isAuthLoading}
                            className="px-3 py-1.5 rounded-full bg-[#111318] border border-[#242830] hover:border-[#00d2ff]/70 text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover-blood group whitespace-nowrap"
                            title="Sign in with Google"
                        >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
                            </svg>
                            <span className="hidden sm:inline group-hover:text-[#00d2ff] transition-colors">
                                {isAuthLoading ? 'Signing In...' : 'Sign In'}
                            </span>
                            <span className="sm:hidden">
                                {isAuthLoading ? '...' : 'Sign In'}
                            </span>
                        </button>
                    )}
                </div>
            </header>

            {/* 2. SECONDARY CONTROLS & QUICK TOGGLES (Sub-header Tool Ribbon) */}
            <div className="fixed top-16 left-0 right-0 z-[50] h-10 backdrop-blur-md bg-[#090a0e]/90 border-b border-[#242830]/60 px-3 sm:px-6 flex items-center justify-between text-xs overflow-x-auto no-scrollbar no-print shadow-[0_2px_15px_rgba(0,0,0,0.5)]">
                {/* Left utilities */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Angelic Agent UI Element */}
                    <div
                        id="angelic-agent-header"
                        className={`angelic-agent px-2.5 py-1 rounded-full border transition-all duration-300 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider select-none hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${
                            view === 'angelic' || view === 'angelic-agent'
                                ? 'bg-[#ffd27f] text-[#14110b] border-[#ffd27f] shadow-[0_0_18px_rgba(255,210,127,0.8)]'
                                : 'bg-[#181510]/90 border border-[#ffd27f]/50 hover:border-[#ffd27f] hover:bg-[#251f14] text-[#ffd27f] shadow-[0_0_12px_rgba(255,210,127,0.2)] hover:shadow-[0_0_20px_rgba(255,210,127,0.7)]'
                        }`}
                        onClick={activateAngelicAgent}
                        title="👼 Activate Angelic Agent — Channel Seraphic Prompt Transmutation & Celestial Sanctum"
                    >
                        <span>👼</span>
                        <span className="hidden sm:inline">Angelic Agent</span>
                        <span className="sm:hidden">Angelic</span>
                    </div>

                    {/* Blood Ritual Theme Toggle Button */}
                    <button
                        onClick={toggleBloodRitual}
                        title={isBloodRitual ? "Extinguish Blood Ritual (Restore Default Hellfire Theme)" : "Ignite Blood Ritual (Deep Crimson Overlay & Falling Blood Embers)"}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 border whitespace-nowrap ${
                            isBloodRitual 
                                ? 'bg-[#8d1a1a] text-white border-[#ff0000] shadow-[0_0_18px_rgba(255,0,0,0.9)] animate-pulse' 
                                : 'bg-[#111318]/90 border-[#8d1a1a]/50 text-[#ff7b7b] hover:border-[#ff0000] hover:text-white hover:bg-[#8d1a1a]/40 hover:shadow-[0_0_18px_rgba(255,0,0,0.7)] hover:scale-105 active:scale-95'
                        }`}
                    >
                        <span className={`text-[11px] ${isBloodRitual ? 'scale-125' : ''} transition-transform`}>🩸</span>
                        <span className="hidden sm:inline">{isBloodRitual ? 'RITUAL ACTIVE' : 'BLOOD RITUAL'}</span>
                        <span className="sm:hidden">{isBloodRitual ? 'ACTIVE' : 'RITUAL'}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isBloodRitual ? 'bg-[#ff0000] shadow-[0_0_6px_#ff0000]' : 'bg-[#444]'}`} />
                    </button>

                    {/* Embers FX Toggle */}
                    <button
                        onClick={toggleEmbers}
                        title={isEmbersEnabled ? "Extinguish Ambient Embers & Runes" : "Ignite Ambient Embers & Runes"}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 border whitespace-nowrap ${
                            isEmbersEnabled
                                ? 'bg-[#111318]/90 border-[#ff4d4d]/50 text-[#cfd3d8] hover:border-[#ff4d4d] hover:text-white hover:shadow-[0_0_16px_rgba(255,77,77,0.6)] hover:scale-105 active:scale-95'
                                : 'bg-[#111318]/70 border-[#242830] text-[#70757e] hover:text-[#cfd3d8] hover:border-[#70757e] hover:scale-105 active:scale-95'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isEmbersEnabled ? (isBloodRitual ? 'bg-[#ff0000] animate-ping' : 'bg-[#ff4d4d] animate-pulse') : 'bg-[#444]'}`} />
                        <span>{isEmbersEnabled ? 'EMBERS ON' : 'EMBERS OFF'}</span>
                    </button>

                    {/* The Abyssal Choir (Multi-Channel Soundscape & Occult FX HUD) */}
                    <div id="audio-hud-trigger" className="relative flex items-center gap-1 bg-[#111318]/90 border border-[#242830] px-2 py-0.5 rounded-full whitespace-nowrap">
                        <button
                            onClick={() => {
                                setShowChoirSoundboard(prev => !prev);
                            }}
                            title="The Abyssal Choir: Open Multi-Channel Soundscape & Occult FX Mixer"
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
                                isDronePlaying 
                                    ? 'bg-[#8d1a1a] text-white shadow-[0_0_12px_#ff0000]' 
                                    : 'text-[#70757e] hover:text-[#ff4d4d]'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${isDronePlaying ? 'bg-white animate-ping' : 'bg-[#444]'}`}></span>
                            <span>{isDronePlaying ? 'CHOIR ON' : 'CHOIR'}</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowChoirSoundboard(prev => !prev);
                            }}
                            title={isMuted ? "Occult FX Muted - Click to open soundboard" : "Occult FX Active - Click to open soundboard"}
                            className="p-1 text-[#70757e] hover:text-white transition-colors text-xs"
                        >
                            {isMuted ? '🔇' : '📿'}
                        </button>
                    </div>
                </div>

                {/* Right utilities */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <button 
                        onClick={openAbout}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 border whitespace-nowrap ${
                            view === 'about' 
                                ? 'bg-[#ff4d4d] text-white border-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.4)]' 
                                : 'bg-[#111318]/80 border-[#242830] text-[#70757e] hover:text-[#ff4d4d] hover:border-[#ff4d4d]/40'
                        }`}
                        title="About The Demon Codex & System Specifications"
                    >
                        <span>✧</span>
                        <span>The Scribe</span>
                    </button>

                    <button
                        onClick={() => setIsApiKeyModalOpen(true)}
                        className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border border-[#242830] bg-[#111318]/90 hover:border-[#c26b3a]/70 hover:text-white transition-all shadow-sm"
                        title="Configure Gemini API Key / Manifestation Engine"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${hasCustomKey ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : (hasKeySelected ? 'bg-[#00d2ff] shadow-[0_0_6px_#00d2ff]' : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]')}`} />
                        <span>{hasCustomKey ? 'CUSTOM API KEY' : (hasKeySelected ? 'FLASH ENGINE' : 'ADD API KEY')}</span>
                        <span className="text-[9px] text-[#70757e]">⚙️</span>
                    </button>
                </div>
            </div>

            {/* Floating Abyssal Choir Soundboard Dropdown */}
            <AbyssalChoirSoundboard
                isOpen={showChoirSoundboard}
                onClose={() => setShowChoirSoundboard(false)}
            />

            <main className="flex-grow max-w-[1100px] mx-auto p-4 md:p-5 pt-36 sm:pt-[152px] md:pt-[160px] w-full relative">
                {ascensionMessage && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-[#00d2ff]/15 via-[#8d1a1a]/20 to-[#00d2ff]/15 border-2 border-[#00d2ff]/50 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(0,210,255,0.2)] animate-fade-in">
                        <div className="flex items-center gap-3">
                            <span className="text-xl animate-bounce">⚡</span>
                            <span className="text-xs sm:text-sm font-black text-[#00d2ff] uppercase tracking-wide">
                                {ascensionMessage}
                            </span>
                        </div>
                        <button 
                            onClick={() => setAscensionMessage(null)}
                            className="text-[#70757e] hover:text-white font-black p-1 text-sm"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {needsKey && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/75 backdrop-blur-md animate-fade-in">
                        <div className="bg-[#111318] border border-[#c26b3a]/40 p-8 rounded-3xl max-w-md text-center shadow-[0_0_50px_rgba(194,107,58,0.25)]">
                            <div className="w-16 h-16 bg-[#c26b3a]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c26b3a]/30">
                                <span className="text-[#c26b3a] text-2xl font-bold">⚡</span>
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter italic">Enhance Manifestation?</h2>
                            <p className="text-[#9aa0a6] text-xs sm:text-sm mb-6 leading-relaxed">
                                You selected high-fidelity features (2K/4K resolution or Gemini 3 Pro studio engines). To forge at maximum fidelity, provide your personal Gemini API key. Or continue instantly with the free Flash Engine!
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleSelectKey}
                                    className="w-full py-4 bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white font-black rounded-xl hover:shadow-[0_0_25px_#c26b3a] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover-blood"
                                >
                                    <span>🔑</span>
                                    <span>Provide Custom API Key</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        setNeedsKey(false);
                                        setImageSize('1K');
                                        setIsStudioQuality(false);
                                        setUseThinking(false);
                                        if (pendingGenerateRef.current) {
                                            const { idea } = pendingGenerateRef.current;
                                            pendingGenerateRef.current = null;
                                            setTimeout(() => {
                                                handleGenerate(idea, { useThinking: false, isStudioQuality: false });
                                            }, 50);
                                        }
                                    }}
                                    className="w-full py-3.5 bg-[#14161f] hover:bg-[#1e2230] text-[#cfd3d8] hover:text-white font-bold rounded-xl transition-colors uppercase tracking-[0.15em] text-xs border border-[#242830]"
                                >
                                    Stay with Flash (Free & Fast)
                                </button>
                            </div>
                            <p className="mt-4 text-[10px] text-[#70757e]">
                                Free API keys are available in seconds at{' '}
                                <a 
                                    href="https://aistudio.google.com/apikey" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-[#00d2ff] underline"
                                >
                                    Google AI Studio
                                </a>
                            </p>
                        </div>
                    </div>
                )}
                {isLoading && <LoadingScreen message={loadingMessage} />}
                
                {!isLoading && view === 'gallery' && (
                    <Gallery 
                        onBack={() => setView('forge')} 
                        onSelectRelic={(data) => {
                            setGeneratedData(data);
                            setView('forge');
                        }}
                        onForgePrompt={(prompt) => {
                            setUserInput(prompt);
                            setView('forge');
                        }}
                    />
                )}

                {!isLoading && view === 'crucible' && (
                    <Crucible onBack={() => setView('forge')} />
                )}

                {!isLoading && view === 'about' && (
                    <AboutMe 
                        onBack={() => setView('forge')} 
                        onNavigate={(targetView) => {
                            audioFX.playRuneChime();
                            setView(targetView);
                        }}
                    />
                )}

                {!isLoading && view === 'codex' && (
                    <RelicCodex onBack={() => setView('forge')} />
                )}

                {!isLoading && view === 'youtube' && (
                    <YouTubeChronicles 
                        onBack={() => setView('forge')} 
                        onNavigateCrucible={() => setView('crucible')}
                    />
                )}

                {!isLoading && view === 'studio' && (
                    <DenomicStudio 
                        onBack={() => setView('forge')} 
                        onNavigateForge={() => setView('forge')}
                        onNavigateCrucible={() => setView('crucible')}
                    />
                )}

                {!isLoading && (view === 'angelic' || view === 'angelic-agent') && (
                    <AngelicAgentErrorBoundary onBack={() => setView('forge')}>
                        <AngelicAgent
                            onBack={() => setView('forge')}
                            onInjectPrompt={(promptText, titleText) => {
                                handleStartOver();
                                setTimeout(() => {
                                    const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                                    if (input) {
                                        input.value = titleText;
                                        input.dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }, 100);
                            }}
                            isAngelicSanctum={isAngelicSanctum}
                            onToggleSanctum={toggleAngelicSanctum}
                            onOpenModal={() => setShowAngelicModal(true)}
                        />
                    </AngelicAgentErrorBoundary>
                )}

                {!isLoading && view === 'ascend' && (
                    <div className="w-full pt-16 pb-12 flex flex-col items-center animate-fade-in">
                        <div className="w-full max-w-6xl px-4 mb-4 flex justify-between items-center">
                            <button
                                onClick={() => setView('forge')}
                                className="px-3.5 py-1.5 rounded-lg bg-[#111318] border border-[#242830] hover:border-[#a855f7] text-[#8d929b] hover:text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
                            >
                                <span>← Return to Forge</span>
                            </button>
                            <span className="text-[10px] font-mono text-[#a855f7] uppercase tracking-widest">
                                The Demon Codex &bull; Covenant Tiers
                            </span>
                        </div>
                        <PricingTiers />
                    </div>
                )}

                {!isLoading && view === 'forge' && !generatedData && (
                     <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
                        <div className="text-center mb-6 animate-fade-in">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse shadow-[0_0_8px_#00d2ff]"></span>
                                {hasKeySelected ? 'Dark Fantasy API • Active' : 'Free Dark Fantasy Tier'}
                            </div>
                            
                            <div className="codex-title-wrapper">
                                <div className="codex-title text-5xl sm:text-7xl md:text-[10rem] font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none" data-text="THE DEMON CODEX">
                                    THE DEMON CODEX
                                    <div className="rune">ᚱ</div>
                                    <div className="rune">ᛟ</div>
                                    <div className="rune">ᚾ</div>
                                    <div className="rune">ᛉ</div>
                                    <BloodDrops />
                                </div>
                                <img src="/demon-ai-1781131108810.jpg" className="codex-sublogo" />
                            </div>

                            <p className="lightning-text text-lg md:text-xl mt-4 max-w-lg mx-auto leading-relaxed uppercase italic text-center">
                                Forge high-fidelity dark fantasy relics and cinematic visual prompts.
                            </p>
                        </div>

                        <div className="w-full max-w-3xl mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div 
                                onClick={() => setView('youtube')}
                                className="flex items-center justify-between py-2.5 px-3.5 bg-gradient-to-r from-[#ff0000]/15 to-[#8d1a1a]/20 border border-[#ff0000]/40 rounded-2xl group cursor-pointer hover:border-[#ff0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)] transition-all"
                            >
                                <span className="text-white text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 truncate">
                                    <span className="text-sm">📺</span> 
                                    YOUTUBE CHRONICLES
                                </span>
                                <span className="bg-[#ff0000] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow">Watch</span>
                            </div>

                            <div 
                                onClick={() => setView('crucible')}
                                className="flex items-center justify-between py-2.5 px-3.5 bg-[#8d1a1a]/10 border border-[#8d1a1a]/30 rounded-2xl group cursor-pointer hover:bg-[#8d1a1a]/20 transition-all"
                            >
                                <span className="text-[#ff4d4d] text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 truncate">
                                    <span className="text-sm">🔥</span> 
                                    VEO 3.1 CRUCIBLE
                                </span>
                                <span className="bg-[#8d1a1a] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase hover:shadow-[0_0_10px_#ff0000]">Enter</span>
                            </div>

                            <div 
                                onClick={() => setView('studio')}
                                className="flex items-center justify-between py-2.5 px-3.5 bg-gradient-to-r from-[#c26b3a]/20 to-[#ff4d4d]/15 border border-[#c26b3a]/50 rounded-2xl group cursor-pointer hover:border-[#c26b3a] hover:shadow-[0_0_20px_rgba(194,107,58,0.3)] transition-all"
                            >
                                <span className="text-[#c26b3a] group-hover:text-white text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 truncate">
                                    <span className="text-sm">🔮</span> 
                                    DENOMIC STUDIO & STORE
                                </span>
                                <span className="bg-[#c26b3a] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow">Nexus</span>
                            </div>
                        </div>
                        
                        <GeneratorForm
                            initialValue={userInput}
                            initialNegativePrompt={negativePrompt}
                            onGenerate={handleGenerate}
                            isGenerating={isLoading}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                            imageSize={imageSize}
                            setImageSize={setImageSize}
                            hasKeySelected={hasKeySelected}
                        />
                        
                         {error && (
                            <div className="mt-8 p-5 bg-[#8d1a1a]/20 border border-[#8d1a1a]/40 text-[#ff7b7b] rounded-xl max-w-xl text-center backdrop-blur-md shadow-2xl">
                                <p className="font-bold flex items-center justify-center gap-2 text-white"><span className="text-xl">⚠️</span> Forge Interrupted</p>
                                <p className="text-sm mt-1 opacity-90">{error}</p>
                            </div>
                        )}

                        {/* Clean Direct Stripe Pricing Tiers */}
                        <PricingTiers className="mt-8 border-t border-[#242830] pt-10" />

                        <NewsletterForm />
                    </div>
                )}

                {!isLoading && view === 'forge' && generatedData && (
                    <PromptCardSet data={generatedData} onStartOver={handleStartOver} onOpenGallery={openGallery} />
                )}
            </main>

            <footer className="w-full max-w-[1100px] mx-auto p-8 mt-auto border-t border-[#242830]/50 no-print">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <a 
                            href="/privacy" 
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.pushState(null, '', '/privacy');
                                setActiveModal('privacy');
                            }}
                            className="bg-[#111318] border border-[#242830] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] hover:text-[#00d2ff] hover:border-[#00d2ff]/30 transition-all hover-blood inline-flex items-center gap-1.5"
                            title="Read Privacy Policy"
                        >
                            <span>📜</span> Privacy Policy
                        </a>
                        <a 
                            href="/terms" 
                            onClick={(e) => {
                                e.preventDefault();
                                window.history.pushState(null, '', '/terms');
                                setActiveModal('terms');
                            }}
                            className="bg-[#111318] border border-[#242830] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#70757e] hover:text-[#00d2ff] hover:border-[#00d2ff]/30 transition-all hover-blood inline-flex items-center gap-1.5"
                            title="Read Terms of Service"
                        >
                            <span>⚖️</span> Terms of Service
                        </a>
                        <a 
                            href="https://billing.stripe.com/p/login/dRm5kD7oU42N7EgcKL1gs00" 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-[#111318] border border-[#00d2ff]/30 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#00d2ff] hover:bg-[#00d2ff]/20 transition-all inline-flex items-center gap-1.5"
                            title="Manage Stripe Subscriptions, Invoices & Payment Methods"
                        >
                            <span>💳</span> Billing Portal ↗
                        </a>
                        <a 
                            href="https://www.youtube.com/@thedemoncodex"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#111318] border border-[#ff0000]/40 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4d] hover:bg-[#ff0000] hover:text-white transition-all shadow"
                        >
                            📺 YouTube @thedemoncodex ↗
                        </a>
                        <button 
                            id="footer-collab-btn"
                            onClick={() => {
                                audioFX.playRuneChime();
                                setView('about');
                            }} 
                            className="bg-[#111318] border border-[#ff4d4d]/60 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4d] hover:bg-[#8d1a1a] hover:text-white transition-all shadow inline-flex items-center gap-1.5"
                            title="Collaborate on AI, Video, Design & Web Projects"
                        >
                            <span>🤝</span> Collaborate
                        </button>
                        <button 
                            onClick={() => setView('studio')} 
                            className="bg-[#111318] border border-[#c26b3a]/50 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#c26b3a] hover:bg-[#c26b3a] hover:text-white transition-all shadow"
                        >
                            🔮 Denomic Studio & Store
                        </button>
                        <a 
                            href="https://denomicdesigns2.gumroad.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#111318] border border-[#ff4d4d]/40 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-[#ff4d4d] hover:bg-[#ff0000] hover:text-white transition-all shadow"
                        >
                            🛍️ Gumroad Store ↗
                        </a>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#444] tracking-widest uppercase">
                        <span className="w-2 h-2 rounded-full bg-[#8d1a1a]"></span>
                        &copy; 2026 The Demon Codex — All Relics Reserved
                    </div>
                </div>
            </footer>

            <LegalModal 
                title="Privacy Policy"
                standaloneUrl="/privacy.html"
                isOpen={activeModal === 'privacy'}
                onClose={() => {
                    setActiveModal(null);
                    if (window.location.pathname.toLowerCase().includes('/privacy')) {
                        window.history.pushState(null, '', '/');
                    }
                }}
                content={
                    <div className="space-y-4 text-xs sm:text-sm text-[#9aa0a6] leading-relaxed">
                        <p>
                            Welcome to <strong className="text-white">The Demon Codex — Relic Series Generator</strong>. We are committed to protecting your privacy and transparently handling user data in accordance with Google API policies, GDPR, and global data privacy standards.
                        </p>

                        <div className="p-3 bg-[#8d1a1a]/15 border border-[#8d1a1a]/40 rounded-lg text-[#e8e6e3]">
                            <strong className="text-[#ff7b7b] block mb-1">Google API Services User Data Policy Compliance:</strong>
                            The Demon Codex's use and transfer to any other app of information received from Google APIs adheres to the{' '}
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-[#00d2ff] underline">
                                Google API Services User Data Policy
                            </a>
                            , including the <strong>Limited Use</strong> requirements.
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">1. Google Account & Auth Information</h3>
                            <p>
                                When you sign in using Google Identity Services (Firebase Authentication), we receive your Google Account ID, display name, verified email address, and avatar image. We use this information exclusively to authenticate your account, maintain your personal session, and sync your forged relics across devices.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">2. Google Workspace (Google Drive) Integration</h3>
                            <p>
                                When explicitly authorized by you, the app requests the <code>drive.file</code> scope solely to upload user-requested prompt collections and Markdown lore backups to your personal Google Drive. We never access, read, or modify other files on your Google Drive.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">3. Data Sharing & Third-Party Protection</h3>
                            <p>
                                We do not sell, rent, or trade your personal data or Google user data to data brokers, advertising networks, or third parties. We never use Google user data to train generalized AI/ML models without your explicit consent.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">4. Data Retention and Account Deletion</h3>
                            <p>
                                Your relics and profile are stored in Google Cloud / Firebase while your account remains active. You may request immediate, permanent deletion of your account and all stored relics at any time by contacting our administrator at{' '}
                                <a href="mailto:mod26501@gmail.com" className="text-[#00d2ff] underline font-bold">mod26501@gmail.com</a>. We honor deletion requests within 30 days.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">5. Contact Us</h3>
                            <p>
                                Questions regarding privacy or data handling can be directed to <strong className="text-white">The Demon Codex Team</strong> at{' '}
                                <a href="mailto:mod26501@gmail.com" className="text-[#00d2ff] underline">mod26501@gmail.com</a>.
                            </p>
                        </div>
                    </div>
                }
            />

            <LegalModal 
                title="Terms of Service"
                standaloneUrl="/terms.html"
                isOpen={activeModal === 'terms'}
                onClose={() => {
                    setActiveModal(null);
                    if (window.location.pathname.toLowerCase().includes('/terms')) {
                        window.history.pushState(null, '', '/');
                    }
                }}
                content={
                    <div className="space-y-4 text-xs sm:text-sm text-[#9aa0a6] leading-relaxed">
                        <p>
                            By entering and using <strong className="text-white">The Demon Codex</strong>, you agree to these Terms of Service. If you disagree, please discontinue use of the platform.
                        </p>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">1. Creative License to Relics</h3>
                            <p>
                                Prompts, lore descriptions, and visual relics generated through the platform using Gemini AI may be utilized in your personal and commercial storytelling, video creation, gaming, and artistic projects, with optional credit to The Demon Codex appreciated.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">2. Prohibited Conduct</h3>
                            <p>
                                Users must not generate illegal, defamatory, hateful, or abusive imagery or text, reverse-engineer platform APIs, or attempt to bypass security or authentication controls.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">3. Third-Party & Google Services</h3>
                            <p>
                                Use of Google Sign-In and Google Drive features is subject to Google's applicable Terms of Service and API policies.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">4. Subscriptions and Tokens</h3>
                            <p>
                                Subscriptions (Cultist Initiate, Archdemon Sovereign) and Arcane Token Packs provide computational access to AI generation resources. Active periods and consumed computational tokens are non-refundable once invoked.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider text-[#00d2ff]">5. Disclaimers & Contact</h3>
                            <p>
                                The Service is provided "AS IS". For inquiries or disputes, contact us at{' '}
                                <a href="mailto:mod26501@gmail.com" className="text-[#00d2ff] underline font-bold">mod26501@gmail.com</a>.
                            </p>
                        </div>
                    </div>
                }
            />

            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onKeyUpdated={(hasKey) => {
                    setHasCustomKey(hasKey);
                    setHasKeySelected(hasKey || geminiService.hasApiKeySelected());
                    if (hasKey && pendingGenerateRef.current) {
                        const { idea, options } = pendingGenerateRef.current;
                        pendingGenerateRef.current = null;
                        setTimeout(() => {
                            handleGenerate(idea, options);
                        }, 100);
                    }
                }}
            />

            <SubscriptionModal 
                isOpen={isSubscriptionModalOpen}
                onClose={() => {
                    setIsSubscriptionModalOpen(false);
                    setAscensionTransitionPlan(null);
                }}
                currentSubscription={userSubscription}
                onSubscriptionUpdated={setUserSubscriptionState}
                initialAscendingPlan={ascensionTransitionPlan}
            />

            <AngelicAgentErrorBoundary>
                <AngelicAgentModal
                    isOpen={showAngelicModal}
                    onClose={() => setShowAngelicModal(false)}
                    onExpandView={() => {
                        setShowAngelicModal(false);
                        setView('angelic');
                    }}
                    onInjectPrompt={(promptText, titleText) => {
                        handleStartOver();
                        setTimeout(() => {
                            const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                            if (input) {
                                input.value = titleText;
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                            }
                        }, 100);
                    }}
                    isAngelicSanctum={isAngelicSanctum}
                    onToggleSanctum={toggleAngelicSanctum}
                />
            </AngelicAgentErrorBoundary>
        </div>
    );
};

export default App;
