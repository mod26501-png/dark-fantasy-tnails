import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';

export type HoloFoilTier = 'blood-foil' | 'abyssal-gold' | 'void-cosmic' | 'auto';

export interface HoloFoilCardProps {
  children: React.ReactNode;
  className?: string;
  tier?: HoloFoilTier;
  rarity?: number; // 0 to 100, used if tier is 'auto'
  isInteractive?: boolean;
  showBadge?: boolean;
  maxTilt?: number; // Maximum tilt angle in degrees (default 12)
  onClick?: () => void;
}

/**
 * HoloFoilCard — 3D Holographic Parallax & Occult Metallic Foil Sheen
 * 
 * Features:
 * - Dynamic 3D perspective tilt that smoothly tracks mouse cursor on desktop
 * - Specular spotlight glare overlay moving across the card surface
 * - Occult chromatic dispersion & iridescent holographic diffraction foil
 * - Mobile gyroscope & touch-drag interaction
 * - Blood-Foil, Abyssal-Gold, and Void-Cosmic dark fantasy tiers
 */
export const HoloFoilCard: React.FC<HoloFoilCardProps> = ({
  children,
  className = '',
  tier = 'blood-foil',
  rarity = 85,
  isInteractive = true,
  showBadge = true,
  maxTilt = 12,
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [hasGyro, setHasGyro] = useState(false);
  const [isFoilActive, setIsFoilActive] = useState(true);

  // Resolve active visual tier based on explicit choice or rarity threshold
  const activeTier: 'blood-foil' | 'abyssal-gold' | 'void-cosmic' = React.useMemo(() => {
    if (tier !== 'auto') return tier;
    if (rarity >= 90) return 'abyssal-gold';
    if (rarity >= 70) return 'blood-foil';
    return 'void-cosmic';
  }, [tier, rarity]);

  // Handle Desktop Mouse Move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isInteractive || !isFoilActive) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Calculate perspective rotation (-maxTilt to +maxTilt)
    const rotateY = ((xPercent - 50) / 50) * maxTilt;
    const rotateX = ((yPercent - 50) / 50) * -maxTilt;

    setIsResetting(false);
    setCoords({ x: xPercent, y: yPercent });
    setTilt({ rotateX, rotateY });
  }, [isInteractive, isFoilActive, maxTilt]);

  const handleMouseEnter = () => {
    if (!isInteractive) return;
    setIsHovered(true);
    setIsResetting(false);
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setIsHovered(false);
    setIsResetting(true);
    setTilt({ rotateX: 0, rotateY: 0 });
    setCoords({ x: 50, y: 50 });
  };

  // Handle Mobile Touch Movement
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isInteractive || !isFoilActive || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, touch.clientY - rect.top));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const rotateY = ((xPercent - 50) / 50) * maxTilt;
    const rotateX = ((yPercent - 50) / 50) * -maxTilt;

    setIsHovered(true);
    setIsResetting(false);
    setCoords({ x: xPercent, y: yPercent });
    setTilt({ rotateX, rotateY });
  }, [isInteractive, isFoilActive, maxTilt]);

  const handleTouchEnd = () => {
    setIsHovered(false);
    setIsResetting(true);
    setTilt({ rotateX: 0, rotateY: 0 });
    setCoords({ x: 50, y: 50 });
  };

  // Gyroscope tilt support on supported mobile devices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent || !isInteractive) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      setHasGyro(true);

      // Clamp gamma (-30deg to 30deg) and beta (15deg to 75deg)
      const clampedGamma = Math.max(-25, Math.min(25, e.gamma));
      const clampedBeta = Math.max(15, Math.min(65, e.beta)) - 40;

      const rotateY = (clampedGamma / 25) * (maxTilt * 0.8);
      const rotateX = (-clampedBeta / 25) * (maxTilt * 0.8);

      const xPercent = 50 + (clampedGamma / 25) * 50;
      const yPercent = 50 + (clampedBeta / 25) * 50;

      setCoords({ x: xPercent, y: yPercent });
      setTilt({ rotateX, rotateY });
      setIsHovered(true);
    };

    window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isInteractive, maxTilt]);

  // Compute dynamic 3D shadow and glow based on tilt direction
  const shadowStyle = React.useMemo(() => {
    if (!isHovered && !hasGyro) {
      return '0 10px 30px -10px rgba(0, 0, 0, 0.8)';
    }

    const shadowX = -tilt.rotateY * 1.5;
    const shadowY = tilt.rotateX * 1.5 + 15;

    let glowColor = 'rgba(255, 77, 77, 0.35)';
    if (activeTier === 'abyssal-gold') glowColor = 'rgba(255, 215, 0, 0.35)';
    if (activeTier === 'void-cosmic') glowColor = 'rgba(0, 210, 255, 0.35)';

    return `${shadowX}px ${shadowY}px 35px -5px rgba(0, 0, 0, 0.9), 0 0 25px ${glowColor}`;
  }, [isHovered, hasGyro, tilt, activeTier]);

  const badgeInfo = React.useMemo(() => {
    switch (activeTier) {
      case 'abyssal-gold':
        return { text: '✦ GOLD FOIL', color: 'text-amber-300 border-amber-400/40 bg-amber-950/60' };
      case 'void-cosmic':
        return { text: '⚡ VOID FOIL', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-950/60' };
      case 'blood-foil':
      default:
        return { text: '🩸 BLOOD FOIL', color: 'text-red-400 border-red-500/40 bg-red-950/60' };
    }
  }, [activeTier]);

  return (
    <div 
      className={`holo-card-container relative select-none ${className}`}
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`holo-card-surface holo-tier-${activeTier} relative h-full w-full rounded-2xl overflow-hidden cursor-pointer ${
          isResetting ? 'holo-resetting' : ''
        }`}
        style={{
          transform: isFoilActive && (isHovered || hasGyro)
            ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          boxShadow: isFoilActive ? shadowStyle : undefined,
          ['--holo-x' as any]: `${coords.x}%`,
          ['--holo-y' as any]: `${coords.y}%`,
          ['--holo-angle' as any]: `${115 + (coords.x - 50) * 0.8}deg`,
        }}
      >
        {/* Child Card Content (Original Relic Card elements) */}
        <div className="relative z-10 h-full w-full">
          {children}
        </div>

        {/* Holographic Prismatic Diffraction Foil Layer */}
        {isFoilActive && (
          <div
            className="holo-foil-layer pointer-events-none"
            style={{
              opacity: isHovered || hasGyro ? 0.65 : 0.08,
              backgroundPosition: `${coords.x}% ${coords.y}%`,
            }}
          />
        )}

        {/* Specular Spotlight Glare Overlay */}
        {isFoilActive && (
          <div
            className="holo-glare-overlay pointer-events-none"
            style={{
              opacity: isHovered || hasGyro ? 0.55 : 0,
              background: `radial-gradient(circle 350px at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 75%)`,
            }}
          />
        )}

        {/* Runic Micro-Sparkle Texture Etching */}
        {isFoilActive && (
          <div
            className="holo-runic-sparkles pointer-events-none"
            style={{
              opacity: isHovered || hasGyro ? 0.75 : 0.15,
            }}
          />
        )}

        {/* Optional Holographic Rarity Badge (Floating in 3D depth) */}
        {showBadge && (
          <div 
            className="absolute top-2.5 left-2.5 z-30 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsFoilActive(!isFoilActive);
            }}
            title="Click to toggle holographic foil sheen"
          >
            <div 
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md transition-all hover:scale-105 ${
                isFoilActive ? badgeInfo.color : 'text-neutral-500 border-neutral-700/40 bg-black/60'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
              <span>{isFoilActive ? badgeInfo.text : 'MATTE'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoloFoilCard;
