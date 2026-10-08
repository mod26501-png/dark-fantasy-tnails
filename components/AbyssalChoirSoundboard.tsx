import React, { useEffect, useState, useRef } from 'react';
import { audioFX, ChoirState } from '../services/audioService';

interface AbyssalChoirSoundboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AbyssalChoirSoundboard: React.FC<AbyssalChoirSoundboardProps> = ({ isOpen, onClose }) => {
    const [choirState, setChoirState] = useState<ChoirState>(audioFX.getState());
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = audioFX.subscribe((state) => {
            setChoirState(state);
        });
        return unsubscribe;
    }, []);

    // Close on escape key or outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                // If clicked outside
                const audioHeaderBtn = document.getElementById('audio-hud-trigger');
                if (audioHeaderBtn && audioHeaderBtn.contains(e.target as Node)) {
                    return;
                }
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleToggleMaster = () => {
        audioFX.playStoneRuneThud();
        audioFX.toggleMasterDrone();
    };

    const handleChannelVolume = (channel: 'subterranean' | 'embers' | 'chants', value: number) => {
        audioFX.setChannelVolume(channel, value);
    };

    const handleToggleChannelMute = (channel: 'subterranean' | 'embers' | 'chants') => {
        audioFX.playStoneRuneThud();
        audioFX.toggleChannelMute(channel);
    };

    const handleToggleSfx = () => {
        audioFX.toggleSfxMute();
    };

    const channels: Array<'subterranean' | 'embers' | 'chants'> = ['subterranean', 'embers', 'chants'];

    return (
        <div 
            ref={panelRef}
            className="fixed top-28 right-4 sm:right-8 z-[120] w-[92vw] sm:w-96 backdrop-blur-xl bg-black/90 border border-red-900/50 shadow-2xl p-4 sm:p-5 rounded-xl text-[#e8e6e3] animate-fade-in select-none border-red-950/80 ring-1 ring-red-500/20"
            style={{
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(141, 26, 26, 0.35)"
            }}
        >
            {/* Header with Occult Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#8d1a1a]/40">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#8d1a1a]/20 border border-[#8d1a1a]/60 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(255,0,0,0.3)]">
                        <span className={choirState.masterDroneActive ? "animate-pulse" : ""}>📿</span>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#ff7b7b] flex items-center gap-1.5">
                            THE ABYSSAL CHOIR
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#8d1a1a]/30 border border-[#8d1a1a]/50 text-[#ff4d4d] font-mono">
                                {choirState.masterDroneActive ? 'SINGING' : 'DORMANT'}
                            </span>
                        </h3>
                        <p className="text-[10px] text-[#8d929b] font-mono">Procedural 3-Channel Drone & Occult FX</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-6 h-6 rounded-md bg-[#111318] border border-[#242830] text-[#70757e] hover:text-white hover:border-[#ff4d4d] transition-colors flex items-center justify-center text-xs"
                    title="Close Choir Panel"
                >
                    ✕
                </button>
            </div>

            {/* Master Drone Ignition Bar */}
            <div className="mt-3.5 mb-4 p-3 rounded-lg bg-[#111318]/80 border border-[#242830] flex items-center justify-between gap-3">
                <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-white">Master Soundscape</span>
                    <span className="text-[9px] text-[#70757e] font-mono">
                        {choirState.masterDroneActive ? 'Synthesizing infinite ambient drone' : 'All channels hushed'}
                    </span>
                </div>
                <button
                    onClick={handleToggleMaster}
                    className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                        choirState.masterDroneActive
                            ? 'bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white shadow-[0_0_15px_rgba(255,0,0,0.6)] border border-[#ff4d4d]'
                            : 'bg-[#181b22] border border-[#242830] text-[#8d929b] hover:text-white hover:border-[#8d1a1a]'
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${choirState.masterDroneActive ? 'bg-white animate-ping' : 'bg-[#444]'}`} />
                    {choirState.masterDroneActive ? 'SILENCE CHOIR' : 'IGNITE CHOIR'}
                </button>
            </div>

            {/* Channel Sliders Section */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#70757e]">
                    <span>Channels</span>
                    <span>Mix Level</span>
                </div>

                {channels.map((chKey) => {
                    const ch = choirState.channels[chKey];
                    const isActive = choirState.masterDroneActive && !ch.muted && ch.volume > 0;

                    return (
                        <div key={chKey} className="p-2.5 rounded-lg bg-[#0d0f14]/80 border border-[#1b1f27] space-y-2 hover:border-[#8d1a1a]/40 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{ch.icon}</span>
                                    <div>
                                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                            {ch.name}
                                            {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d] animate-pulse" />
                                            )}
                                        </div>
                                        <div className="text-[9px] text-[#70757e] line-clamp-1">{ch.description}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleChannelMute(chKey)}
                                    title={ch.muted ? "Unmute Channel" : "Mute Channel"}
                                    className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border transition-colors ${
                                        ch.muted
                                            ? 'bg-[#8d1a1a]/30 border-[#8d1a1a] text-[#ff7b7b]'
                                            : 'bg-[#181b22] border-[#242830] text-[#8d929b] hover:text-white'
                                    }`}
                                >
                                    {ch.muted ? 'MUTED' : 'MUTE'}
                                </button>
                            </div>

                            {/* Volume Slider */}
                            <div className="flex items-center gap-2.5">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={ch.muted ? 0 : ch.volume}
                                    onChange={(e) => handleChannelVolume(chKey, parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-[#1b1f27] rounded-lg appearance-none cursor-pointer accent-[#c26b3a]"
                                />
                                <span className="text-[10px] font-mono text-[#8d929b] w-8 text-right">
                                    {ch.muted ? '0%' : `${Math.round(ch.volume * 100)}%`}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Occult Haptic Sound Effects Config */}
            <div className="mt-4 pt-3 border-t border-[#8d1a1a]/30">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-[#cfd3d8] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={choirState.sfxMuted}
                            onChange={handleToggleSfx}
                            className="w-3.5 h-3.5 rounded border-[#242830] bg-[#111318] text-[#c26b3a] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#c26b3a]"
                        />
                        <span className="font-bold">Mute Occult Sound FX</span>
                    </label>
                    <span className="text-[9px] font-mono text-[#70757e]">
                        {choirState.sfxMuted ? 'Haptics Hushed' : 'Haptics Active'}
                    </span>
                </div>

                {/* Audition Trigger Pills */}
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <span className="text-[8px] font-mono uppercase text-[#70757e] tracking-widest mr-1">Audition:</span>
                    <button
                        onClick={() => audioFX.playBladeUnsheathe()}
                        className="px-2 py-0.5 rounded bg-[#181b22] border border-[#242830] text-[9px] font-mono text-[#8d929b] hover:text-white hover:border-[#c26b3a] transition-all flex items-center gap-1"
                        title="Audition Blade Draw"
                    >
                        <span>⚔️</span> Blade
                    </button>
                    <button
                        onClick={() => audioFX.playStoneRuneThud()}
                        className="px-2 py-0.5 rounded bg-[#181b22] border border-[#242830] text-[9px] font-mono text-[#8d929b] hover:text-white hover:border-[#c26b3a] transition-all flex items-center gap-1"
                        title="Audition Stone Rune Thud"
                    >
                        <span>🗿</span> Thud
                    </button>
                    <button
                        onClick={() => audioFX.playPurgeBanish()}
                        className="px-2 py-0.5 rounded bg-[#181b22] border border-[#242830] text-[9px] font-mono text-[#8d929b] hover:text-white hover:border-[#ff4d4d] transition-all flex items-center gap-1"
                        title="Audition Banished Seal"
                    >
                        <span>🚫</span> Purge
                    </button>
                </div>
            </div>
        </div>
    );
};
