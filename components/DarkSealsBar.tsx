import React, { useState, useEffect } from 'react';
import { audioFX } from '../services/audioService';
import { bestowDarkSeal, hasUserBestowedSeal } from '../services/firebaseService';
import type { DarkSeals, DarkSealType } from '../types';

interface DarkSealsBarProps {
  relicId: string;
  initialSeals?: DarkSeals;
  onSealBestowed?: (sealType: DarkSealType, newCounts: DarkSeals) => void;
  compact?: boolean;
}

interface FloatingNotice {
  id: number;
  type: DarkSealType;
  label: string;
  color: string;
}

const SEAL_CONFIG: Record<DarkSealType, {
  name: string;
  glyph: string;
  description: string;
  activeColor: string;
  hoverColor: string;
  borderColor: string;
  bgGlow: string;
}> = {
  blood: {
    name: 'Blood Offering',
    glyph: '🩸',
    description: 'Vital sacrifice of crimson essence',
    activeColor: 'text-[#ff4d4d]',
    hoverColor: 'hover:text-[#ff4d4d]',
    borderColor: 'border-[#ff4d4d]/50',
    bgGlow: 'bg-[#ff4d4d]/15 shadow-[0_0_12px_rgba(255,77,77,0.35)]',
  },
  void: {
    name: 'Void Gaze',
    glyph: '👁️',
    description: 'Elder perception into the cosmic abyss',
    activeColor: 'text-[#a855f7]',
    hoverColor: 'hover:text-[#a855f7]',
    borderColor: 'border-[#a855f7]/50',
    bgGlow: 'bg-[#a855f7]/15 shadow-[0_0_12px_rgba(168,85,247,0.35)]',
  },
  spark: {
    name: 'Arcane Spark',
    glyph: '⚡',
    description: 'Forbidden lightning & sorcerous fury',
    activeColor: 'text-[#f59e0b]',
    hoverColor: 'hover:text-[#f59e0b]',
    borderColor: 'border-[#f59e0b]/50',
    bgGlow: 'bg-[#f59e0b]/15 shadow-[0_0_12px_rgba(245,158,11,0.35)]',
  },
  soul: {
    name: 'Soul Bound',
    glyph: '💀',
    description: 'Necromantic pact etched in bone',
    activeColor: 'text-[#cbd5e1]',
    hoverColor: 'hover:text-[#cbd5e1]',
    borderColor: 'border-[#cbd5e1]/50',
    bgGlow: 'bg-[#cbd5e1]/15 shadow-[0_0_12px_rgba(203,213,225,0.3)]',
  },
};

export const DarkSealsBar: React.FC<DarkSealsBarProps> = ({
  relicId,
  initialSeals,
  onSealBestowed,
  compact = false,
}) => {
  const [seals, setSeals] = useState<DarkSeals>({
    blood: initialSeals?.blood || 0,
    void: initialSeals?.void || 0,
    spark: initialSeals?.spark || 0,
    soul: initialSeals?.soul || 0,
  });

  const [bestowed, setBestowed] = useState<Record<DarkSealType, boolean>>({
    blood: false,
    void: false,
    spark: false,
    soul: false,
  });

  const [floatingNotices, setFloatingNotices] = useState<FloatingNotice[]>([]);

  useEffect(() => {
    if (initialSeals) {
      setSeals({
        blood: initialSeals.blood || 0,
        void: initialSeals.void || 0,
        spark: initialSeals.spark || 0,
        soul: initialSeals.soul || 0,
      });
    }
  }, [initialSeals]);

  useEffect(() => {
    if (relicId) {
      setBestowed({
        blood: hasUserBestowedSeal(relicId, 'blood'),
        void: hasUserBestowedSeal(relicId, 'void'),
        spark: hasUserBestowedSeal(relicId, 'spark'),
        soul: hasUserBestowedSeal(relicId, 'soul'),
      });
    }
  }, [relicId]);

  const handleBestow = async (type: DarkSealType, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Play synthesized occult audio for this seal
    audioFX.playDarkSealOffering(type);

    // Optimistically update counts
    const isFirstTime = !bestowed[type];
    const newSeals = {
      ...seals,
      [type]: seals[type] + 1,
    };
    setSeals(newSeals);
    setBestowed((prev) => ({ ...prev, [type]: true }));

    // Trigger floating "+1 Offering" visual popup
    const noticeId = Date.now() + Math.random();
    const config = SEAL_CONFIG[type];
    setFloatingNotices((prev) => [
      ...prev,
      {
        id: noticeId,
        type,
        label: isFirstTime ? `+1 ${config.name}!` : `✦ ${config.name}`,
        color: config.activeColor,
      },
    ]);

    setTimeout(() => {
      setFloatingNotices((prev) => prev.filter((n) => n.id !== noticeId));
    }, 1400);

    // Notify parent if provided
    if (onSealBestowed) {
      onSealBestowed(type, newSeals);
    }

    // Persist to Cloud Firestore & localStorage
    await bestowDarkSeal(relicId, type);
  };

  const sealKeys: DarkSealType[] = ['blood', 'void', 'spark', 'soul'];

  return (
    <div className="relative inline-flex items-center gap-1.5 z-30 select-none">
      {/* Floating Burst Notifications */}
      {floatingNotices.map((n) => (
        <span
          key={n.id}
          className={`absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none text-[10px] font-black uppercase tracking-wider ${n.color} bg-black/90 px-2 py-0.5 rounded-full border border-current shadow-lg animate-float-fade z-40 whitespace-nowrap`}
        >
          {n.label}
        </span>
      ))}

      {sealKeys.map((type) => {
        const config = SEAL_CONFIG[type];
        const isBestowed = bestowed[type];
        const count = seals[type];

        return (
          <button
            key={type}
            type="button"
            onClick={(e) => handleBestow(type, e)}
            title={`${config.name}: ${config.description} (Click to bestow seal)`}
            className={`group/seal relative flex items-center gap-1 transition-all duration-200 rounded-lg border font-mono ${
              compact
                ? 'px-1.5 py-0.5 text-[10px]'
                : 'px-2.5 py-1 text-xs'
            } ${
              isBestowed
                ? `${config.bgGlow} ${config.borderColor} ${config.activeColor}`
                : `bg-[#0f1115]/90 border-[#242830] text-[#9aa0a6] ${config.hoverColor} hover:border-[#383f4d] hover:bg-[#161a22]`
            }`}
          >
            <span className="text-xs transition-transform duration-200 group-hover/seal:scale-125 inline-block">
              {config.glyph}
            </span>
            <span
              className={`font-black tracking-tight transition-colors ${
                isBestowed ? config.activeColor : 'text-[#70757e] group-hover/seal:text-white'
              }`}
            >
              {count > 0 ? count : '0'}
            </span>

            {/* Micro tooltip on desktop hover */}
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/seal:block bg-black/95 text-[9px] text-[#e8e6e3] font-sans px-2 py-1 rounded shadow-xl border border-[#242830] whitespace-nowrap z-50">
              <span className={`font-bold block ${config.activeColor}`}>{config.name}</span>
              <span className="text-[#70757e] block text-[8px]">{config.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
