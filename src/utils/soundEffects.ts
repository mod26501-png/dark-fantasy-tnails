/**
 * Procedural Audio FX & Occult Haptic Sound Synthesizer Bridge
 * Powered by Abyssal Choir engine in services/audioService.ts
 */
import { audioFX } from '../../services/audioService';

export const playBladeClang = () => audioFX.playBladeUnsheathe();
export const playBladeUnsheathe = () => audioFX.playBladeUnsheathe();
export const playStoneRuneThud = () => audioFX.playStoneRuneThud();
export const playRuneHum = () => audioFX.playStoneRuneThud();
export const playPurgeBanish = () => audioFX.playPurgeBanish();
export const playIgnitionBurst = () => audioFX.playBladeUnsheathe();
export const toggleAudioMute = () => audioFX.toggleSfxMute();
export const isAudioMuted = () => audioFX.getIsSfxMuted();

export const soundEffects = {
    playBladeClang: () => audioFX.playBladeUnsheathe(),
    playStoneRuneThud: () => audioFX.playStoneRuneThud(),
    playRuneHum: () => audioFX.playStoneRuneThud(),
    playPurgeBanish: () => audioFX.playPurgeBanish(),
    playIgnitionBurst: () => audioFX.playBladeUnsheathe(),
    toggleMute: () => audioFX.toggleSfxMute(),
    getIsMuted: () => audioFX.getIsSfxMuted(),
};
