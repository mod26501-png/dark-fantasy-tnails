import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Clock, Award, ArrowRight, Compass, ShieldAlert } from 'lucide-react';
import { getTodayRitual, getTimeUntilMidnight } from '../services/dailyRitualService';
import { audioFX } from '../services/audioService';
import type { DailyRitual, GeneratedData } from '../types';

interface DailyRitualBannerProps {
  onAcceptRitual: (prompt: string, theme: string) => void;
  onFilterRitualEntries?: () => void;
  isFilteringRitual?: boolean;
  ritualEntriesCount?: number;
  crownedRelic?: GeneratedData | null;
  onSelectRelic?: (relic: GeneratedData) => void;
}

export const DailyRitualBanner: React.FC<DailyRitualBannerProps> = ({
  onAcceptRitual,
  onFilterRitualEntries,
  isFilteringRitual = false,
  ritualEntriesCount = 0,
  crownedRelic,
  onSelectRelic,
}) => {
  const [ritual, setRitual] = useState<DailyRitual>(getTodayRitual);
  const [countdown, setCountdown] = useState<string>(getTimeUntilMidnight().formatted);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  useEffect(() => {
    // Update countdown timer every second
    const interval = setInterval(() => {
      const time = getTimeUntilMidnight();
      setCountdown(time.formatted);

      // If midnight crossed, re-fetch ritual
      if (time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
        setRitual(getTodayRitual());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAccept = () => {
    audioFX.playBladeUnsheathe();
    onAcceptRitual(ritual.suggestedPrompt, ritual.theme);
  };

  return (
    <div className="w-full relative overflow-hidden rounded-2xl mb-8 border-2 border-[#8d1a1a]/60 bg-gradient-to-b from-[#180d0d] via-[#100a0a] to-[#0a0606] shadow-[0_0_35px_rgba(141,26,26,0.3)] transition-all">
      {/* Background Occult Overlay Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff1a1a]/15 via-transparent to-transparent pointer-events-none"></div>

      {/* Top Banner Header */}
      <div className="relative p-5 sm:p-6 border-b border-[#301616] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8d1a1a] to-[#3a0808] border border-[#ff4d4d]/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,77,77,0.4)] animate-pulse">
            <Flame className="w-5 h-5 text-[#ff4d4d]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff4d4d]">
                ✦ HIGH ALTAR &bull; MIDNIGHT RITUAL CHALLENGE
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/30 font-mono">
                CYCLE {ritual.dateKey}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#e8e6e3] tracking-wide uppercase drop-shadow-md">
              {ritual.title}
            </h2>
          </div>
        </div>

        {/* Real-time Countdown Timer */}
        <div className="flex items-center gap-3 bg-black/60 border border-[#8d1a1a]/50 rounded-xl px-4 py-2.5 backdrop-blur-sm shadow-inner self-start md:self-auto">
          <Clock className="w-4 h-4 text-[#ff4d4d] animate-spin" style={{ animationDuration: '10s' }} />
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-[#9aa0a6]">
              NEXT ECLIPSE RESET IN
            </span>
            <span className="font-mono text-sm font-black text-[#ff4d4d] tracking-wider">
              {countdown}
            </span>
          </div>
        </div>
      </div>

      {/* Main Altar Content */}
      <div className="relative p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lore and Directive */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed italic border-l-2 border-[#8d1a1a] pl-3">
              "{ritual.lore}"
            </p>
            <div className="bg-[#1a0f0f]/80 border border-[#441a1a] p-3.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#ff7878] mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#ff4d4d]" />
                <span>DAILY ALTAR DIRECTIVE</span>
              </div>
              <p className="text-xs text-[#e2e8f0] font-medium leading-normal">
                {ritual.directive}
              </p>
            </div>
          </div>

          {/* Theme Meta Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#260e0e] text-[#ff7878] border border-[#ff4d4d]/30">
              #{ritual.tag}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#111a26] text-[#00d2ff] border border-[#00d2ff]/30">
              ARCHETYPE: {ritual.recommendedArchetype}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#221c0e] text-[#fbbf24] border border-[#fbbf24]/30">
              {ritual.altarBoon}
            </span>
          </div>
        </div>

        {/* Right Column: Actions & Crowned Relic */}
        <div className="flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-[#301616] pt-4 lg:pt-0 lg:pl-6">
          {/* Crowned Relic Card Preview (if one has highest votes) */}
          {crownedRelic ? (
            <div 
              onClick={() => onSelectRelic && onSelectRelic(crownedRelic)}
              className="group/crown cursor-pointer bg-[#180a0a] border border-[#fbbf24]/40 hover:border-[#fbbf24] rounded-xl p-3 flex items-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#fbbf24]/60 flex-shrink-0">
                <img 
                  src={crownedRelic.bannerImageUrl || crownedRelic.cards?.[0]?.imageUrl || ''} 
                  alt={crownedRelic.mainTitle}
                  className="w-full h-full object-cover group-hover/crown:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-0 right-0 bg-[#fbbf24] text-black text-[8px] font-black px-1 rounded-bl">
                  👑 #1
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-[#fbbf24] tracking-wider">
                  <Award className="w-3 h-3" />
                  <span>CROWNED ALTAR RELIC</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate group-hover/crown:text-[#fbbf24] transition-colors">
                  {crownedRelic.mainTitle}
                </h4>
                <div className="text-[10px] text-[#ff7878] font-mono mt-0.5">
                  🩸 {crownedRelic.darkSeals?.blood || 0} &bull; 👁️ {crownedRelic.darkSeals?.void || 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#180a0a]/60 border border-[#301616] rounded-xl p-3.5 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#9aa0a6] block mb-1">
                ✦ THE ALTAR IS HUNGRY
              </span>
              <p className="text-[11px] text-[#70757e]">
                No relic crowned yet today. Forge an entry to claim the High Altar!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              id="accept-ritual-btn"
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-[#8d1a1a] via-[#b31e1e] to-[#ff4d4d] hover:from-[#b31e1e] hover:to-[#ff1a1a] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,77,77,0.4)] hover:shadow-[0_0_30px_rgba(255,77,77,0.7)] transition-all hover-blood"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>✦ ACCEPT RITUAL & FORGE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {onFilterRitualEntries && (
              <button
                type="button"
                onClick={() => {
                  audioFX.playStoneRuneThud();
                  onFilterRitualEntries();
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                  isFilteringRitual
                    ? 'bg-[#ff4d4d]/25 text-[#ff4d4d] border-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.3)]'
                    : 'bg-[#0f0808] text-[#9aa0a6] border-[#301616] hover:text-[#e8e6e3] hover:border-[#ff4d4d]/40'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#ff4d4d]" />
                <span>
                  {isFilteringRitual
                    ? 'SHOWING RITUAL ENTRIES (CLICK FOR ALL)'
                    : `VIEW RITUAL ENTRIES (${ritualEntriesCount})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
