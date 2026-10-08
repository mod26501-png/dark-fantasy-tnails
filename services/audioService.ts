/**
 * Multi-Channel Procedural Web Audio Engine for The Demon Codex
 * Synthesizes "The Abyssal Choir" and occult haptic audio feedback.
 * 100% native Web Audio API — zero external audio assets required.
 */

export interface ChannelConfig {
    volume: number; // 0.0 to 1.0
    muted: boolean;
    name: string;
    description: string;
    icon: string;
}

export interface ChoirState {
    masterDroneActive: boolean;
    masterVolume: number;
    sfxMuted: boolean;
    channels: {
        subterranean: ChannelConfig;
        embers: ChannelConfig;
        chants: ChannelConfig;
    };
}

class AbyssalChoirEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private droneMasterGain: GainNode | null = null;
    private sfxMasterGain: GainNode | null = null;

    // Channel 1: Subterranean Drone nodes
    private ch1Gain: GainNode | null = null;
    private ch1NoiseSource: AudioBufferSourceNode | null = null;
    private ch1Osc1: OscillatorNode | null = null;
    private ch1Osc2: OscillatorNode | null = null;
    private ch1Filter: BiquadFilterNode | null = null;
    private ch1Lfo: OscillatorNode | null = null;

    // Channel 2: Infernal Embers nodes
    private ch2Gain: GainNode | null = null;
    private ch2CrackleSource: AudioBufferSourceNode | null = null;
    private ch2Filter: BiquadFilterNode | null = null;

    // Channel 3: Whispering Chants nodes
    private ch3Gain: GainNode | null = null;
    private ch3Osc1: OscillatorNode | null = null;
    private ch3Osc2: OscillatorNode | null = null;
    private ch3Filter1: BiquadFilterNode | null = null;
    private ch3Filter2: BiquadFilterNode | null = null;
    private ch3Lfo: OscillatorNode | null = null;

    private listeners: Array<(state: ChoirState) => void> = [];

    private state: ChoirState = {
        masterDroneActive: false,
        masterVolume: 0.65,
        sfxMuted: false,
        channels: {
            subterranean: {
                volume: 0.75,
                muted: false,
                name: "Subterranean Drone",
                description: "Deep tectonic brown noise & sub-bass resonance",
                icon: "🌋"
            },
            embers: {
                volume: 0.60,
                muted: false,
                name: "Infernal Embers",
                description: "Procedural crackling pyre sparks & heat hiss",
                icon: "🔥"
            },
            chants: {
                volume: 0.55,
                muted: false,
                name: "Whispering Chants",
                description: "Ethereal resonant spectral vocal formant hum",
                icon: "🕯️"
            }
        }
    };

    constructor() {
        // Safe lazy init
    }

    private initContext(): AudioContext | null {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();

                // Master Destination Routing
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.state.masterVolume, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                // Master Drone Sub-bus
                this.droneMasterGain = this.ctx.createGain();
                this.droneMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
                this.droneMasterGain.connect(this.masterGain);

                // Master SFX Sub-bus
                this.sfxMasterGain = this.ctx.createGain();
                this.sfxMasterGain.gain.setValueAtTime(this.state.sfxMuted ? 0 : 0.7, this.ctx.currentTime);
                this.sfxMasterGain.connect(this.masterGain);
            }
        }

        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }

        return this.ctx;
    }

    public subscribe(listener: (state: ChoirState) => void): () => void {
        this.listeners.push(listener);
        listener(this.getState());
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify(): void {
        const copy = this.getState();
        this.listeners.forEach(l => {
            try { l(copy); } catch {}
        });
    }

    public getState(): ChoirState {
        return JSON.parse(JSON.stringify(this.state));
    }

    /* -------------------------------------------------------------
     * Multi-Channel Synthesizer Control
     * ----------------------------------------------------------- */

    public toggleMasterDrone(): boolean {
        if (this.state.masterDroneActive) {
            this.stopChoir();
        } else {
            this.startChoir();
        }
        return this.state.masterDroneActive;
    }

    public startChoir(): void {
        const ctx = this.initContext();
        if (!ctx) return;

        if (this.state.masterDroneActive) return;

        try {
            const now = ctx.currentTime;

            // Fade in master drone gain
            if (this.droneMasterGain) {
                this.droneMasterGain.gain.setValueAtTime(0.001, now);
                this.droneMasterGain.gain.exponentialRampToValueAtTime(1.0, now + 1.5);
            }

            // 1. Channel 1: Subterranean Drone
            this.startSubterraneanChannel(ctx);

            // 2. Channel 2: Infernal Embers
            this.startEmbersChannel(ctx);

            // 3. Channel 3: Whispering Chants
            this.startChantsChannel(ctx);

            this.state.masterDroneActive = true;
            this.notify();
        } catch (err) {
            console.warn("Choir ignition notice:", err);
        }
    }

    public stopChoir(): void {
        if (!this.state.masterDroneActive || !this.ctx || !this.droneMasterGain) return;

        try {
            const now = this.ctx.currentTime;
            this.droneMasterGain.gain.setValueAtTime(this.droneMasterGain.gain.value, now);
            this.droneMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

            setTimeout(() => {
                this.cleanupChannels();
                this.state.masterDroneActive = false;
                this.notify();
            }, 1250);
        } catch {
            this.cleanupChannels();
            this.state.masterDroneActive = false;
            this.notify();
        }
    }

    private cleanupChannels(): void {
        try {
            // Ch 1
            this.ch1NoiseSource?.stop();
            this.ch1NoiseSource?.disconnect();
            this.ch1Osc1?.stop();
            this.ch1Osc1?.disconnect();
            this.ch1Osc2?.stop();
            this.ch1Osc2?.disconnect();
            this.ch1Lfo?.stop();
            this.ch1Lfo?.disconnect();
            this.ch1NoiseSource = null;
            this.ch1Osc1 = null;
            this.ch1Osc2 = null;
            this.ch1Lfo = null;

            // Ch 2
            this.ch2CrackleSource?.stop();
            this.ch2CrackleSource?.disconnect();
            this.ch2CrackleSource = null;

            // Ch 3
            this.ch3Osc1?.stop();
            this.ch3Osc1?.disconnect();
            this.ch3Osc2?.stop();
            this.ch3Osc2?.disconnect();
            this.ch3Lfo?.stop();
            this.ch3Lfo?.disconnect();
            this.ch3Osc1 = null;
            this.ch3Osc2 = null;
            this.ch3Lfo = null;
        } catch {}
    }

    /**
     * Channel 1 Synthesis: Deep brownian noise & lowpass resonant bass
     */
    private startSubterraneanChannel(ctx: AudioContext): void {
        this.ch1Gain = ctx.createGain();
        const ch1Vol = this.state.channels.subterranean.muted ? 0 : this.state.channels.subterranean.volume * 0.35;
        this.ch1Gain.gain.setValueAtTime(ch1Vol, ctx.currentTime);

        // Resonant Lowpass Filter
        this.ch1Filter = ctx.createBiquadFilter();
        this.ch1Filter.type = 'lowpass';
        this.ch1Filter.frequency.setValueAtTime(115, ctx.currentTime);
        this.ch1Filter.Q.setValueAtTime(3.8, ctx.currentTime);

        // Brown noise generator buffer (4-second seamless loop)
        const bufferSize = ctx.sampleRate * 4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            output[i] = lastOut * 3.5;
        }

        this.ch1NoiseSource = ctx.createBufferSource();
        this.ch1NoiseSource.buffer = noiseBuffer;
        this.ch1NoiseSource.loop = true;

        // Sub bass oscillators
        this.ch1Osc1 = ctx.createOscillator();
        this.ch1Osc1.type = 'sawtooth';
        this.ch1Osc1.frequency.setValueAtTime(48.0, ctx.currentTime); // Low G0/A0 bass

        this.ch1Osc2 = ctx.createOscillator();
        this.ch1Osc2.type = 'sine';
        this.ch1Osc2.frequency.setValueAtTime(47.4, ctx.currentTime); // Detuned beating

        // Slow LFO for sweeping filter
        this.ch1Lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        this.ch1Lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
        lfoGain.gain.setValueAtTime(40, ctx.currentTime);
        this.ch1Lfo.connect(lfoGain);
        lfoGain.connect(this.ch1Filter.frequency);

        // Routing
        this.ch1NoiseSource.connect(this.ch1Filter);
        this.ch1Osc1.connect(this.ch1Filter);
        this.ch1Osc2.connect(this.ch1Filter);
        this.ch1Filter.connect(this.ch1Gain);

        if (this.droneMasterGain) {
            this.ch1Gain.connect(this.droneMasterGain);
        }

        this.ch1NoiseSource.start();
        this.ch1Osc1.start();
        this.ch1Osc2.start();
        this.ch1Lfo.start();
    }

    /**
     * Channel 2 Synthesis: Infernal Embers procedural crackling pyre
     */
    private startEmbersChannel(ctx: AudioContext): void {
        this.ch2Gain = ctx.createGain();
        const ch2Vol = this.state.channels.embers.muted ? 0 : this.state.channels.embers.volume * 0.28;
        this.ch2Gain.gain.setValueAtTime(ch2Vol, ctx.currentTime);

        // Bandpass filter centered on ember sizzle
        this.ch2Filter = ctx.createBiquadFilter();
        this.ch2Filter.type = 'bandpass';
        this.ch2Filter.frequency.setValueAtTime(1800, ctx.currentTime);
        this.ch2Filter.Q.setValueAtTime(1.8, ctx.currentTime);

        // 3-second procedural fire buffer with random transient spark micro-pops
        const bufferSize = ctx.sampleRate * 3;
        const emberBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = emberBuffer.getChannelData(0);

        // Base pink hiss
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            data[i] = (b0 + b1 + b2 + white * 0.05) * 0.08;

            // Random spark pops
            if (Math.random() < 0.0012) {
                const popLength = Math.floor(ctx.sampleRate * (0.004 + Math.random() * 0.015));
                const popPitch = 1200 + Math.random() * 2800;
                for (let p = 0; p < popLength && (i + p) < bufferSize; p++) {
                    const t = p / ctx.sampleRate;
                    const decay = Math.exp(-p / (popLength * 0.25));
                    data[i + p] += Math.sin(2 * Math.PI * popPitch * t) * decay * (0.35 + Math.random() * 0.65);
                }
            }
        }

        this.ch2CrackleSource = ctx.createBufferSource();
        this.ch2CrackleSource.buffer = emberBuffer;
        this.ch2CrackleSource.loop = true;

        this.ch2CrackleSource.connect(this.ch2Filter);
        this.ch2Filter.connect(this.ch2Gain);

        if (this.droneMasterGain) {
            this.ch2Gain.connect(this.droneMasterGain);
        }

        this.ch2CrackleSource.start();
    }

    /**
     * Channel 3 Synthesis: Whispering Chants spectral vocal formant hum
     */
    private startChantsChannel(ctx: AudioContext): void {
        this.ch3Gain = ctx.createGain();
        const ch3Vol = this.state.channels.chants.muted ? 0 : this.state.channels.chants.volume * 0.22;
        this.ch3Gain.gain.setValueAtTime(ch3Vol, ctx.currentTime);

        // Formant filters (vocal tract simulation: 'U' -> 'O' -> 'A' vowel resonances)
        this.ch3Filter1 = ctx.createBiquadFilter();
        this.ch3Filter1.type = 'bandpass';
        this.ch3Filter1.frequency.setValueAtTime(360, ctx.currentTime); // F1
        this.ch3Filter1.Q.setValueAtTime(6.0, ctx.currentTime);

        this.ch3Filter2 = ctx.createBiquadFilter();
        this.ch3Filter2.type = 'bandpass';
        this.ch3Filter2.frequency.setValueAtTime(840, ctx.currentTime); // F2
        this.ch3Filter2.Q.setValueAtTime(5.5, ctx.currentTime);

        // Detuned spectral choir harmonic oscillators
        this.ch3Osc1 = ctx.createOscillator();
        this.ch3Osc1.type = 'triangle';
        this.ch3Osc1.frequency.setValueAtTime(110.0, ctx.currentTime); // A2 fundamental

        this.ch3Osc2 = ctx.createOscillator();
        this.ch3Osc2.type = 'sawtooth';
        this.ch3Osc2.frequency.setValueAtTime(164.8, ctx.currentTime); // Minor third / fifth overtone

        // Subtle slow formant sweep LFO
        this.ch3Lfo = ctx.createOscillator();
        const lfoGain1 = ctx.createGain();
        const lfoGain2 = ctx.createGain();
        this.ch3Lfo.frequency.setValueAtTime(0.06, ctx.currentTime);
        lfoGain1.gain.setValueAtTime(70, ctx.currentTime);
        lfoGain2.gain.setValueAtTime(120, ctx.currentTime);

        this.ch3Lfo.connect(lfoGain1);
        this.ch3Lfo.connect(lfoGain2);
        lfoGain1.connect(this.ch3Filter1.frequency);
        lfoGain2.connect(this.ch3Filter2.frequency);

        this.ch3Osc1.connect(this.ch3Filter1);
        this.ch3Osc2.connect(this.ch3Filter2);

        this.ch3Filter1.connect(this.ch3Gain);
        this.ch3Filter2.connect(this.ch3Gain);

        if (this.droneMasterGain) {
            this.ch3Gain.connect(this.droneMasterGain);
        }

        this.ch3Osc1.start();
        this.ch3Osc2.start();
        this.ch3Lfo.start();
    }

    public setChannelVolume(channel: 'subterranean' | 'embers' | 'chants', volume: number): void {
        const clamped = Math.max(0, Math.min(1, volume));
        this.state.channels[channel].volume = clamped;

        if (this.ctx) {
            const isMuted = this.state.channels[channel].muted;
            const targetGain = isMuted ? 0 : (
                channel === 'subterranean' ? clamped * 0.35 :
                channel === 'embers' ? clamped * 0.28 :
                clamped * 0.22
            );

            const gainNode = channel === 'subterranean' ? this.ch1Gain :
                             channel === 'embers' ? this.ch2Gain : this.ch3Gain;

            if (gainNode) {
                gainNode.gain.setValueAtTime(gainNode.gain.value, this.ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
            }
        }
        this.notify();
    }

    public toggleChannelMute(channel: 'subterranean' | 'embers' | 'chants'): boolean {
        const isNowMuted = !this.state.channels[channel].muted;
        this.state.channels[channel].muted = isNowMuted;

        if (this.ctx) {
            const vol = this.state.channels[channel].volume;
            const targetGain = isNowMuted ? 0 : (
                channel === 'subterranean' ? vol * 0.35 :
                channel === 'embers' ? vol * 0.28 :
                vol * 0.22
            );

            const gainNode = channel === 'subterranean' ? this.ch1Gain :
                             channel === 'embers' ? this.ch2Gain : this.ch3Gain;

            if (gainNode) {
                gainNode.gain.setValueAtTime(gainNode.gain.value, this.ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
            }
        }
        this.notify();
        return isNowMuted;
    }

    public toggleSfxMute(): boolean {
        this.state.sfxMuted = !this.state.sfxMuted;
        if (this.ctx && this.sfxMasterGain) {
            this.sfxMasterGain.gain.setValueAtTime(this.state.sfxMuted ? 0 : 0.7, this.ctx.currentTime);
        }
        this.notify();
        return this.state.sfxMuted;
    }

    public getIsSfxMuted(): boolean {
        return this.state.sfxMuted;
    }

    /* -------------------------------------------------------------
     * Occult Haptic Micro-Clicks & Sound FX
     * ----------------------------------------------------------- */

    /**
     * Heavy metallic blade unsheathe & crisp click
     * Triggered on "GENERATE RELICS" and "TRANSMUTE"
     */
    public playBladeUnsheathe(): void {
        if (this.state.sfxMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            // 1. Friction sweep (blade sliding against sheath)
            const frictionOsc = ctx.createOscillator();
            const frictionFilter = ctx.createBiquadFilter();
            const frictionGain = ctx.createGain();

            frictionOsc.type = 'sawtooth';
            frictionOsc.frequency.setValueAtTime(450, now);
            frictionOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

            frictionFilter.type = 'bandpass';
            frictionFilter.frequency.setValueAtTime(2200, now);
            frictionFilter.frequency.linearRampToValueAtTime(4200, now + 0.12);
            frictionFilter.Q.setValueAtTime(4.0, now);

            frictionGain.gain.setValueAtTime(0.01, now);
            frictionGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
            frictionGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            frictionOsc.connect(frictionFilter);
            frictionFilter.connect(frictionGain);
            if (this.sfxMasterGain) frictionGain.connect(this.sfxMasterGain);

            frictionOsc.start(now);
            frictionOsc.stop(now + 0.15);

            // 2. Resonant steel ping & ring
            const pingOsc = ctx.createOscillator();
            const pingGain = ctx.createGain();

            pingOsc.type = 'triangle';
            pingOsc.frequency.setValueAtTime(1640, now + 0.11);
            pingOsc.frequency.exponentialRampToValueAtTime(480, now + 0.45);

            pingGain.gain.setValueAtTime(0.0001, now);
            pingGain.gain.setValueAtTime(0.3, now + 0.11);
            pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            pingOsc.connect(pingGain);
            if (this.sfxMasterGain) pingGain.connect(this.sfxMasterGain);

            pingOsc.start(now + 0.11);
            pingOsc.stop(now + 0.52);
        } catch {}
    }

    /**
     * Stone rune thud: deep, tactile granite impact when toggling chips & modifier tags
     */
    public playStoneRuneThud(): void {
        if (this.state.sfxMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            // Pitch-dropping heavy sub transient
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();

            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(140, now);
            subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.12);

            subGain.gain.setValueAtTime(0.32, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            subOsc.connect(subGain);
            if (this.sfxMasterGain) subGain.connect(this.sfxMasterGain);

            subOsc.start(now);
            subOsc.stop(now + 0.15);

            // Stone scrape transient
            const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
            }

            const noiseSource = ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(450, now);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.18, now);

            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            if (this.sfxMasterGain) noiseGain.connect(this.sfxMasterGain);

            noiseSource.start(now);
            noiseSource.stop(now + 0.06);
        } catch {}
    }

    /**
     * Banished Seal Exorcism hiss & occult vacuum release
     */
    public playPurgeBanish(): void {
        if (this.state.sfxMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, now);

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(2400, now);
            filter.frequency.exponentialRampToValueAtTime(280, now + 0.25);
            filter.Q.setValueAtTime(6.0, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

            osc.connect(filter);
            filter.connect(gain);
            if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);

            osc.start(now);
            osc.stop(now + 0.28);
        } catch {}
    }

    // -------------------------------------------------------------
    // Backward Compatibility Wrappers for existing code
    // -------------------------------------------------------------

    public toggleMute(): boolean {
        return this.toggleSfxMute();
    }

    public getIsMuted(): boolean {
        return this.getIsSfxMuted();
    }

    public getIsDronePlaying(): boolean {
        return this.state.masterDroneActive;
    }

    public startAbyssalDrone(): void {
        this.startChoir();
    }

    public stopAbyssalDrone(): void {
        this.stopChoir();
    }

    public playTransmuteSpark(): void {
        this.playBladeUnsheathe();
    }

    public playRuneChime(): void {
        if (this.state.sfxMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50];

            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                const volume = 0.1 / (idx + 1);
                gain.gain.setValueAtTime(volume, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.2);

                osc.connect(gain);
                if (this.sfxMasterGain) gain.connect(this.sfxMasterGain);

                osc.start(now);
                osc.stop(now + 1.2);
            });
        } catch {}
    }

    public playPortalWhoosh(): void {
        this.playPurgeBanish();
    }

    public playBloodRitual(active: boolean): void {
        if (this.state.sfxMuted) return;
        const ctx = this.initContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();

            sub.type = 'sine';
            sub.frequency.setValueAtTime(active ? 55 : 110, now);
            sub.frequency.exponentialRampToValueAtTime(active ? 38 : 70, now + 0.9);

            subGain.gain.setValueAtTime(0.35, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

            sub.connect(subGain);
            if (this.sfxMasterGain) subGain.connect(this.sfxMasterGain);

            sub.start(now);
            sub.stop(now + 1.15);
        } catch {}
    }

    public playIgnition(): void {
        this.playBladeUnsheathe();
    }

    public playAscensionChime(): void {
        this.playRuneChime();
    }
}

export const audioFX = new AbyssalChoirEngine();
