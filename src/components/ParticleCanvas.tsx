import React, { useEffect, useRef, useState } from 'react';

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛈ', 'ᛇ', 'ᛉ', 'ᛋ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
const ANGELIC_RUNES = ['✦', '✧', '☼', '🪽', '🕊', '✙', '👑', '✨', '⚡'];

interface Ember {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
    maxAlpha: number;
    life: number;
    maxLife: number;
    rune?: string;
    isRune: boolean;
    hue: number;
}

interface ParticleCanvasProps {
    mode?: string;
    density?: number;
    interactive?: boolean;
    isBloodRitual?: boolean;
    isAngelicSanctum?: boolean;
    onToggleBloodRitual?: () => void;
    enabled?: boolean;
    onToggleEnabled?: () => void;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
    density = 42,
    interactive = true,
    isBloodRitual = false,
    isAngelicSanctum = false,
    onToggleBloodRitual,
    enabled: externalEnabled,
    onToggleEnabled
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number; lastX: number; lastY: number; active: boolean }>({
        x: -100,
        y: -100,
        vx: 0,
        vy: 0,
        lastX: -100,
        lastY: -100,
        active: false
    });
    const [internalEnabled, setInternalEnabled] = useState<boolean>(true);
    const isEmberEnabled = externalEnabled !== undefined ? externalEnabled : internalEnabled;

    const handleToggle = () => {
        if (onToggleEnabled) {
            onToggleEnabled();
        } else {
            setInternalEnabled(prev => !prev);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isEmberEnabled) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        const particles: Ember[] = [];
        // Intensify particle density when Blood Ritual is active
        const effectiveDensity = isBloodRitual ? Math.max(Math.round(density * 2.2), 85) : density;

        const createParticle = (customY?: number): Ember => {
            const isRune = Math.random() < (isBloodRitual ? 0.28 : (isAngelicSanctum ? 0.26 : 0.22));
            
            // In Blood Ritual mode, particles are falling blood embers descending downwards
            // In Angelic Sanctum mode, particles float gracefully upwards like golden starlight
            const vy = isBloodRitual 
                ? (Math.random() * 2.4 + 1.2)
                : (isAngelicSanctum ? -(Math.random() * 1.1 + 0.3) : -(Math.random() * 1.4 + 0.4));

            const vx = isBloodRitual
                ? (Math.random() - 0.5) * 1.4
                : (Math.random() - 0.5) * (isAngelicSanctum ? 0.7 : 0.9);

            // In Blood Ritual mode: pure blood crimson
            // In Angelic Sanctum mode: radiant golden starlight (42 - 54 deg)
            const hue = isBloodRitual
                ? (Math.random() < 0.8 ? 350 + Math.random() * 12 : Math.random() * 10)
                : (isAngelicSanctum 
                    ? (45 + Math.random() * 10) 
                    : (isRune ? (Math.random() < 0.5 ? 185 : 10) : (5 + Math.random() * 30)));

            const currentRuneList = isAngelicSanctum ? ANGELIC_RUNES : RUNES;

            return {
                x: Math.random() * width,
                y: customY !== undefined ? customY : Math.random() * height,
                vx,
                vy,
                size: isRune 
                    ? (Math.random() * 8 + (isBloodRitual ? 14 : (isAngelicSanctum ? 13 : 12))) 
                    : (Math.random() * (isBloodRitual ? 3.5 : 2.8) + (isBloodRitual ? 1.2 : 0.8)),
                alpha: 0.1,
                maxAlpha: isRune 
                    ? (isBloodRitual ? Math.random() * 0.6 + 0.35 : (isAngelicSanctum ? Math.random() * 0.65 + 0.3 : Math.random() * 0.45 + 0.2)) 
                    : (isBloodRitual ? Math.random() * 0.85 + 0.4 : (isAngelicSanctum ? Math.random() * 0.75 + 0.35 : Math.random() * 0.7 + 0.3)),
                life: 0,
                maxLife: isBloodRitual ? Math.random() * 220 + 130 : (isAngelicSanctum ? Math.random() * 280 + 160 : Math.random() * 260 + 140),
                isRune,
                rune: isRune ? currentRuneList[Math.floor(Math.random() * currentRuneList.length)] : undefined,
                hue
            };
        };

        for (let i = 0; i < effectiveDensity; i++) {
            particles.push(createParticle());
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            const mx = mouseRef.current.x;
            const my = mouseRef.current.y;
            const mvx = mouseRef.current.vx;
            const mvy = mouseRef.current.vy;
            const mouseActive = mouseRef.current.active;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.life++;

                // Float / Fall motion + sine wave sway
                const swayFreq = isBloodRitual ? 0.035 : 0.025;
                const swayAmp = isBloodRitual ? 0.8 : 0.5;
                p.x += p.vx + Math.sin(p.life * swayFreq) * swayAmp;
                p.y += p.vy;

                // Mouse / Cursor velocity interaction - swirl and splash
                if (interactive && mouseActive) {
                    const dx = p.x - mx;
                    const dy = p.y - my;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const reach = isBloodRitual ? 160 : 140;
                    if (dist < reach) {
                        const force = (reach - dist) / reach;
                        const pushMultiplier = isBloodRitual ? 4.5 : 3.0;
                        p.x += (dx / (dist || 1)) * force * pushMultiplier + mvx * 0.2;
                        p.y += (dy / (dist || 1)) * force * pushMultiplier + mvy * 0.2;
                    }
                }

                // Alpha envelope
                const progress = p.life / p.maxLife;
                if (progress < 0.18) {
                    p.alpha = (progress / 0.18) * p.maxAlpha;
                } else if (progress > 0.72) {
                    p.alpha = ((1 - progress) / 0.28) * p.maxAlpha;
                }

                if (p.isRune && p.rune) {
                    // Draw glowing occult blood rune
                    ctx.save();
                    ctx.font = `bold ${p.size}px monospace`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = `hsla(${p.hue}, 100%, ${isBloodRitual ? '65%' : '65%'}, ${Math.max(0, p.alpha)})`;
                    ctx.shadowColor = isBloodRitual ? 'rgba(255, 0, 30, 0.95)' : `hsla(${p.hue}, 100%, 50%, 0.8)`;
                    ctx.shadowBlur = isBloodRitual ? 18 : 12;
                    ctx.fillText(p.rune, p.x, p.y);
                    ctx.restore();
                } else if (isBloodRitual) {
                    // Draw falling blood ember / dripping elongated molten tear
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    // Angle following downward trajectory
                    const angle = Math.atan2(p.vy, p.vx) - Math.PI / 2;
                    ctx.rotate(angle);

                    ctx.beginPath();
                    // Elongated droplet falling down
                    const length = p.size * 2.3;
                    const radius = p.size;
                    ctx.ellipse(0, 0, radius, length, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 100%, 52%, ${Math.max(0, p.alpha)})`;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.95)`;
                    ctx.fill();

                    // Incandescent molten ruby core
                    ctx.beginPath();
                    ctx.arc(0, length * 0.2, radius * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 220, 220, ${Math.max(0, p.alpha * 0.85)})`;
                    ctx.fill();

                    ctx.restore();
                } else {
                    // Standard hellfire ember spark
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${Math.max(0, p.alpha)})`;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = `hsla(${p.hue}, 100%, 50%, 0.9)`;
                    ctx.fill();
                }

                // Reset dead particles
                if (isBloodRitual) {
                    // Blood embers fall from the top of the screen down
                    if (p.life >= p.maxLife || p.y > height + 25 || p.x < -30 || p.x > width + 30) {
                        particles[i] = createParticle(-20);
                    }
                } else {
                    // Hellfire embers float from bottom up
                    if (p.life >= p.maxLife || p.y < -20 || p.x < -20 || p.x > width + 20) {
                        particles[i] = createParticle(height + 20);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        const handleMouseMove = (e: MouseEvent) => {
            const last = mouseRef.current;
            const vx = e.clientX - (last.lastX || e.clientX);
            const vy = e.clientY - (last.lastY || e.clientY);
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY,
                vx,
                vy,
                lastX: e.clientX,
                lastY: e.clientY,
                active: true
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [density, interactive, isEmberEnabled, isBloodRitual, isAngelicSanctum]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <canvas ref={canvasRef} className={`w-full h-full block transition-opacity duration-500 ${isBloodRitual ? 'opacity-90' : 'opacity-75'}`} />
            <div className="absolute bottom-3 left-3 pointer-events-auto flex items-center gap-2">
                <button
                    onClick={handleToggle}
                    title={isEmberEnabled ? "Extinguish Embers & Runes" : "Ignite Embers & Runes"}
                    className="px-2 py-1 bg-[#111318]/70 hover:bg-[#8d1a1a]/40 border border-[#242830] hover:border-[#8d1a1a] rounded text-[9px] font-mono text-[#70757e] hover:text-[#ff4d4d] transition-all flex items-center gap-1.5 backdrop-blur-sm"
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isEmberEnabled ? (isBloodRitual ? 'bg-[#ff0000] animate-ping' : 'bg-[#ff4d4d] animate-pulse') : 'bg-[#444]'}`}></span>
                    <span>{isEmberEnabled ? (isBloodRitual ? 'BLOOD EMBERS ON' : 'EMBERS ON') : 'EMBERS OFF'}</span>
                </button>

                {onToggleBloodRitual && (
                    <button
                        onClick={onToggleBloodRitual}
                        title={isBloodRitual ? "Deactivate Blood Ritual Theme" : "Activate Blood Ritual (Crimson Overlay & Falling Blood Embers)"}
                        className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm border ${
                            isBloodRitual
                                ? 'bg-[#8d1a1a] text-white border-[#ff0000] shadow-[0_0_15px_rgba(255,0,0,0.7)] animate-pulse'
                                : 'bg-[#111318]/70 hover:bg-[#8d1a1a]/30 border-[#242830] hover:border-[#8d1a1a] text-[#70757e] hover:text-[#ff4d4d]'
                        }`}
                    >
                        <span>🩸</span>
                        <span>{isBloodRitual ? 'BLOOD RITUAL: ACTIVE' : 'BLOOD RITUAL'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ParticleCanvas;
