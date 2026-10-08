import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Flame, Sparkles, Video, Download, RefreshCw, AlertTriangle, ArrowRight, Tv, Copy, Check, ExternalLink } from 'lucide-react';
import { editImage, generateRelicVideo, generateImage } from '../services/geminiService';
import type { AllowedAspectRatio } from './GeneratorForm';

// Sample dark fantasy base images to help users get started immediately if they don't have their own upload
const STARTER_SAMPLES = [
    {
        name: 'Void Core',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzA5MDkwZiIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMTIwIiBmaWxsPSIjMTExMzE4IiBzdHJva2U9IiM4ZDFhMWEiIHN0cm9rZS13aWR0aD0iOCIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZDJmZiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSI4IDQiLz48cGF0aCBkPSJNMjU2IDUwbDEwIDEwMC0yMCAwIDEwLTEwMHpNMjU2IDQ2MmwMTAtMTAwLTIwIDAgMTAtMTAwek01MCAyNTZsMTAwLTEwIDAgMjAtMTAwLTEwek00NjIgMjU2bC0xMDAtMTAgMCAyMCAxMDAtMTB6IiBmaWxsPSIjOGQxYTFhIi8+PC9zdmc+'
    },
    {
        name: 'Occult Rune',
        url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzA5MDkwZiIvPjxwYXRoIGQ9Ik0xMjAgMTIwbDI3MiAyNzJNMzkyIDEyMEwxMjAgMzkyTTI1NiA5MHYzMzJNMTAwIDI1NmgzMTIiIHN0cm9rZT0iIzhkMWExYSIgc3Ryb2tlLXdpZHRoPSIxMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+'
    }
];

export const Crucible: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [image, setImage] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [mode, setMode] = useState<'edit' | 'video'>('edit');
    const [prompt, setPrompt] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [outputImage, setOutputImage] = useState<string | null>(null);
    const [outputVideo, setOutputVideo] = useState<string | null>(null);
    
    // Config states
    const [aspectRatio, setAspectRatio] = useState<AllowedAspectRatio>('1:1');
    const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [videoRatio, setVideoRatio] = useState<'16:9' | '9:16'>('16:9');
    
    // Scratch generation state
    const [scratchPrompt, setScratchPrompt] = useState<string>('');
    const [isGeneratingScratch, setIsGeneratingScratch] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const processFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setOutputImage(null);
                setOutputVideo(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleManifestFromScratch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scratchPrompt.trim() || isGeneratingScratch) return;
        setIsGeneratingScratch(true);
        try {
            const result = await generateImage(scratchPrompt, aspectRatio, imageSize, false);
            setImage(result);
            setOutputImage(null);
            setOutputVideo(null);
        } catch (err: any) {
            console.error(err);
            if (err.message === 'API_KEY_RESET_REQUIRED') {
                alert("An API key is required for image generation. Please select an API key in the Settings > Secrets panel (or click 'Provide API Key' on the Forge).");
            } else {
                alert("Manifestation failed. The prompt might have been blocked or the API is temporarily busy.");
            }
        } finally {
            setIsGeneratingScratch(false);
        }
    };

    const handleExecuteTransmutation = async () => {
        if (!image || !prompt.trim() || isProcessing) return;
        setIsProcessing(true);
        setOutputImage(null);
        setOutputVideo(null);

        try {
            if (mode === 'edit') {
                setStatusMessage('Invoking gemini-3.1-flash-image for refinement...');
                const edited = await editImage(image, prompt, aspectRatio, imageSize);
                setOutputImage(edited);
            } else {
                setStatusMessage('Igniting veo-3.1-lite-generate-preview video ritual...');
                const video = await generateRelicVideo(image, prompt, 5, videoRatio);
                setOutputVideo(video);
            }
        } catch (error: any) {
            console.error("Transmutation error:", error);
            const errText = error?.message || String(error);
            if (errText === 'API_KEY_RESET_REQUIRED' || errText.includes('API_KEY')) {
                setStatusMessage('Ritual blocked: API key required. Configure in Settings > Secrets.');
                alert("An API key is required for this ritual. Please select your API key in the Settings > Secrets panel.");
            } else if (errText.includes('RESOURCE_EXHAUSTED') || errText.includes('spending cap') || errText.includes('429')) {
                setStatusMessage('Quota exhausted: Project monthly spending cap or rate limit reached.');
            } else {
                setStatusMessage(`Transmutation interrupted: ${errText}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadAsset = () => {
        if (mode === 'edit' && outputImage) {
            const a = document.createElement('a');
            a.href = outputImage;
            a.download = `refined_relic_${Date.now()}.png`;
            a.click();
        } else if (mode === 'video' && outputVideo) {
            const a = document.createElement('a');
            a.href = outputVideo;
            a.download = `animated_relic_${Date.now()}.mp4`;
            a.click();
        }
    };

    return (
        <div className="w-full flex flex-col gap-10 pt-4 sm:pt-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#242830] pb-6">
                <div className="flex flex-col gap-2">
                    <div className="codex-title-wrapper !items-start !justify-start !m-0 !mt-6 sm:!mt-8 !mb-3 !w-auto">
                        <h2 className="codex-title text-4xl sm:text-5xl font-normal leading-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.95)] select-none uppercase tracking-wide relative inline-block mt-3" data-text="ALCHEMIST'S CRUCIBLE">
                            ALCHEMIST'S CRUCIBLE
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
                    <p className="text-xs text-[#70757e] mt-1 uppercase tracking-widest font-bold">Refine, transmute, and animate uploaded relics using advanced Gemini & Veo engines.</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 rounded-lg bg-[#111318] border border-[#242830] hover:border-[#8d1a1a] text-xs font-black text-[#e8e6e3] uppercase tracking-widest transition-all hover-blood"
                >
                    Return to Forge
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Workspace Input Configuration */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                    {/* Image Source Selection */}
                    <div className="bg-[#111318] p-6 rounded-2xl border border-[#242830] flex flex-col gap-6">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-[#242830] pb-3">
                            <Flame className="w-4 h-4 text-[#8d1a1a]" /> Primary Relic Subject
                        </h3>

                        {!image ? (
                            <div className="flex flex-col gap-6">
                                <div
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={triggerFileSelect}
                                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
                                        dragActive 
                                        ? 'border-[#00d2ff] bg-[#00d2ff]/5' 
                                        : 'border-[#242830] hover:border-[#8d1a1a] bg-[#0d0f13]'
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <div className="w-12 h-12 bg-[#8d1a1a]/10 rounded-full flex items-center justify-center text-[#8d1a1a] hover-blood">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Upload your custom photo</p>
                                        <p className="text-xs text-[#70757e] mt-1">Drag & drop or click to select file</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-[1px] bg-[#242830] flex-1"></div>
                                    <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest">OR</span>
                                    <div className="h-[1px] bg-[#242830] flex-1"></div>
                                </div>

                                {/* Manifest scratch base image */}
                                <form onSubmit={handleManifestFromScratch} className="flex flex-col gap-3">
                                    <p className="text-xs font-bold text-[#70757e] uppercase tracking-wider">Manifest scratch base relic:</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Forge starting sigil..."
                                            value={scratchPrompt}
                                            onChange={(e) => setScratchPrompt(e.target.value)}
                                            className="flex-1 bg-[#09090f] border border-[#242830] rounded-lg px-3 py-2 text-sm text-[#e8e6e3] focus:outline-none focus:border-[#8d1a1a]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isGeneratingScratch || !scratchPrompt.trim()}
                                            className="px-4 py-2 bg-[#8d1a1a] text-white font-bold rounded-lg text-xs hover-blood disabled:opacity-50 transition-all flex items-center gap-1.5"
                                        >
                                            {isGeneratingScratch ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                            Forge
                                        </button>
                                    </div>
                                </form>

                                <div className="flex flex-col gap-3">
                                    <p className="text-xs font-bold text-[#70757e] uppercase tracking-wider">Or summon starter relic:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {STARTER_SAMPLES.map((sample) => (
                                            <button
                                                key={sample.name}
                                                type="button"
                                                onClick={() => setImage(sample.url)}
                                                className="flex items-center gap-3 p-2 rounded-xl bg-[#0d0f13] border border-[#242830] hover:border-[#8d1a1a] hover:bg-[#111318] transition-all text-left"
                                            >
                                                <img src={sample.url} alt={sample.name} className="w-10 h-10 rounded object-cover bg-black" />
                                                <span className="text-xs font-bold text-[#e8e6e3]">{sample.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden bg-black/60 p-2 border border-[#242830]">
                                <img src={image || undefined} alt="Source Relic" className="w-full h-auto max-h-[220px] object-contain rounded-lg" />
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setOutputImage(null);
                                        setOutputVideo(null);
                                    }}
                                    className="absolute top-4 right-4 bg-black/80 hover:bg-[#8d1a1a] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider transition-colors shadow-lg"
                                >
                                    Replace File
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mode, configuration controls and edit prompt */}
                    {image && (
                        <div className="bg-[#111318] p-6 rounded-2xl border border-[#242830] flex flex-col gap-6">
                            <div className="flex gap-2 p-1 bg-[#09090f] rounded-xl border border-[#242830]">
                                <button
                                    onClick={() => setMode('edit')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        mode === 'edit'
                                        ? 'bg-[#c26b3a] text-white shadow-lg'
                                        : 'text-[#70757e] hover:text-white'
                                    }`}
                                >
                                    <Sparkles className="w-4 h-4" /> Refinement (Edit)
                                </button>
                                <button
                                    onClick={() => setMode('video')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                        mode === 'video'
                                        ? 'bg-[#8d1a1a] text-white shadow-lg'
                                        : 'text-[#70757e] hover:text-white'
                                    }`}
                                >
                                    <Video className="w-4 h-4" /> Veo Animation
                                </button>
                            </div>

                            {/* Mode Specific Config Parameters */}
                            {mode === 'edit' ? (
                                <div className="flex flex-col gap-4 border-t border-[#242830]/60 pt-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-[#70757e] uppercase tracking-widest">Crucible Aspect Ratio</label>
                                        <div className="grid grid-cols-4 gap-1 bg-[#09090f] p-1 rounded-xl border border-[#242830]">
                                            {(['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'] as const).map((ratio) => (
                                                <button
                                                    key={ratio}
                                                    type="button"
                                                    onClick={() => setAspectRatio(ratio)}
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
                                        <label className="text-xs font-bold text-[#70757e] uppercase tracking-widest">Quality Size</label>
                                        <div className="flex bg-[#09090f] p-1 rounded-xl border border-[#242830]">
                                            {(['1K', '2K', '4K'] as const).map((size) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setImageSize(size)}
                                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                                                        imageSize === size 
                                                        ? 'bg-[#8d1a1a] text-white shadow-lg' 
                                                        : 'text-[#70757e] hover:text-white'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 border-t border-[#242830]/60 pt-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold text-[#70757e] uppercase tracking-widest">Veo Video Aspect Ratio</label>
                                        <div className="flex bg-[#09090f] p-1 rounded-xl border border-[#242830]">
                                            {(['16:9', '9:16'] as const).map((ratio) => (
                                                <button
                                                    key={ratio}
                                                    type="button"
                                                    onClick={() => setVideoRatio(ratio)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                                                        videoRatio === ratio 
                                                        ? 'bg-[#8d1a1a] text-white shadow-lg' 
                                                        : 'text-[#70757e] hover:text-white'
                                                    }`}
                                                >
                                                    {ratio === '16:9' ? '16:9 Landscape' : '9:16 Portrait'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Refinement instruction prompt */}
                            <div className="flex flex-col gap-2 border-t border-[#242830]/60 pt-4">
                                <label className="text-xs font-bold text-[#70757e] uppercase tracking-widest">
                                    {mode === 'edit' ? 'Transmutation Instruction (Image Edit)' : 'Cinematic Motion Prompt'}
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={mode === 'edit' 
                                        ? "e.g., 'Add heavy crimson lightning and obsidian armor spikes...'" 
                                        : "e.g., 'Eerie smoke drifting upwards, soft flickering red embers...'"
                                    }
                                    className="w-full p-4 rounded-xl border border-[#242830] bg-[#09090f] text-sm text-[#e8e6e3] placeholder:text-[#555] min-h-[90px] focus:outline-none focus:border-[#8d1a1a]"
                                    disabled={isProcessing}
                                />
                            </div>

                            <button
                                onClick={handleExecuteTransmutation}
                                disabled={isProcessing || !prompt.trim()}
                                className={`w-full py-4 text-xs font-black uppercase tracking-widest text-white rounded-xl transition-all duration-300 shadow-lg active:scale-95 disabled:grayscale ${
                                    mode === 'edit' 
                                    ? 'bg-gradient-to-r from-[#c26b3a] to-[#8d1a1a]' 
                                    : 'bg-gradient-to-r from-[#8d1a1a] to-[#5a1111]'
                                }`}
                            >
                                {isProcessing ? 'COALESCING IN THE CRUCIBLE...' : 'IGNITE TRANSMUTATION'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Crucible Workspace Stage Display */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center min-h-[400px] bg-[#0d0f13] border border-[#242830] rounded-3xl p-6 relative overflow-hidden">
                    {/* Atmospheric background aura */}
                    <div className="absolute inset-0 bg-radial-gradient from-[#8d1a1a]/5 via-transparent to-transparent pointer-events-none"></div>

                    <AnimatePresence mode="wait">
                        {isProcessing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center gap-6 text-center max-w-sm z-10"
                            >
                                <div className="w-16 h-16 rounded-full border-4 border-[#8d1a1a]/20 border-t-[#8d1a1a] animate-spin flex items-center justify-center">
                                    <Flame className="w-6 h-6 text-[#8d1a1a] animate-pulse" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Manifesting Transmutation</h4>
                                    <p className="text-xs text-[#70757e] mt-2 leading-relaxed uppercase tracking-wider font-semibold">{statusMessage}</p>
                                </div>
                            </motion.div>
                        ) : outputImage || outputVideo ? (
                            <motion.div
                                key="output"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex flex-col items-center gap-6 z-10"
                            >
                                <div className="relative max-w-full rounded-2xl overflow-hidden border border-[#242830] bg-black shadow-2xl">
                                    {outputImage && (
                                        <img src={outputImage || undefined} alt="Refined Manifestation" className="max-h-[480px] w-auto object-contain mx-auto" />
                                    )}
                                    {outputVideo && (
                                        <video
                                            src={outputVideo}
                                            controls
                                            autoPlay
                                            loop
                                            className="max-h-[480px] w-auto mx-auto object-contain"
                                        />
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button
                                        onClick={downloadAsset}
                                        className="px-6 py-3 bg-[#00d2ff] text-black font-black text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download Transmutation
                                    </button>
                                    <button
                                        onClick={() => {
                                            setOutputImage(null);
                                            setOutputVideo(null);
                                        }}
                                        className="px-6 py-3 bg-[#111318] border border-[#242830] text-xs font-black uppercase tracking-widest rounded-xl hover:border-[#8d1a1a] text-[#e8e6e3] transition-all hover-blood"
                                    >
                                        Transmute Again
                                    </button>
                                </div>

                                {outputVideo && (
                                    <div className="w-full mt-4 p-5 bg-[#111318] border border-[#ff0000]/40 rounded-2xl flex flex-col gap-4 shadow-xl text-left">
                                        <div className="flex items-center justify-between border-b border-[#242830] pb-3">
                                            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                                                <Tv className="w-4 h-4 text-[#ff0000]" />
                                                <span>YouTube Shorts Export Toolkit (@thedemoncodex)</span>
                                            </div>
                                            <span className="text-[9px] bg-[#ff0000]/20 text-[#ff4d4d] px-2 py-0.5 rounded font-black uppercase">Ready for Shorts</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                            <div className="bg-[#09090f] p-3 rounded-xl border border-[#242830] flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[9px] text-[#70757e] font-bold uppercase">Shorts Title & Hashtags</span>
                                                    <p className="text-white font-medium mt-1">⚡ Manifested with Veo 3.1 | {prompt.slice(0, 45)}... #Shorts #TheDemonCodex #DarkFantasy</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`⚡ Manifested with Veo 3.1 | ${prompt} #Shorts #TheDemonCodex #DarkFantasy #AIAnimation #Veo3`);
                                                        alert("Copied YouTube Shorts title to clipboard!");
                                                    }}
                                                    className="mt-3 py-1.5 px-3 bg-[#242830] hover:bg-[#ff0000] text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5"
                                                >
                                                    <Copy className="w-3 h-3" /> Copy Title & Tags
                                                </button>
                                            </div>

                                            <div className="bg-[#09090f] p-3 rounded-xl border border-[#242830] flex flex-col justify-between">
                                                <div>
                                                    <span className="text-[9px] text-[#70757e] font-bold uppercase">Direct YouTube Upload</span>
                                                    <p className="text-[#9aa0a6] text-[11px] mt-1">Download video then open YouTube Studio to publish to @thedemoncodex.</p>
                                                </div>
                                                <a
                                                    href="https://studio.youtube.com/channel/upload"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-3 py-1.5 px-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow"
                                                >
                                                    <span>Open YouTube Studio Upload ↗</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center p-8 max-w-md z-10"
                            >
                                <div className="w-16 h-16 bg-[#242830]/30 rounded-full flex items-center justify-center text-[#70757e] mx-auto mb-6">
                                    <Flame className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">Crucible Chamber Silent</h4>
                                <p className="text-xs text-[#70757e] mt-2 leading-relaxed uppercase tracking-wider font-semibold">
                                    Upload a subject relic in the left cabinet, select your alchemical mode, and whisper instructions to begin the manifestation ritual.
                                </p>
                                {statusMessage && statusMessage.includes('Quota') && (
                                    <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-left">
                                        <p className="text-xs font-bold text-amber-400">⚠️ Project Spending Cap Reached</p>
                                        <p className="text-[11px] text-amber-200/80 mt-1">
                                            Your Google Cloud / AI Studio project has exceeded its monthly spend cap. You can review or adjust your project spend cap at{' '}
                                            <a href="https://ai.studio/spend" target="_blank" rel="noreferrer" className="text-[#00d2ff] underline font-bold">
                                                ai.studio/spend
                                            </a>.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
