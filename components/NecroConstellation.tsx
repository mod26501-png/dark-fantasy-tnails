import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Flame, 
  Eye, 
  Compass, 
  Maximize2, 
  Search, 
  Share2, 
  X, 
  Scroll, 
  Layers, 
  ArrowUpRight,
  RefreshCw,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { audioFX } from '../services/audioService';
import { playBladeClang } from '../src/utils/soundEffects';
import { DarkSealsBar } from './DarkSealsBar';
import { HoloFoilCard } from './HoloFoilCard';
import type { RelicItem } from './GrimoireViewer';

interface NecroConstellationProps {
  relics: RelicItem[];
  onBack?: () => void;
  onSelectRelic?: (relic: RelicItem) => void;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  relic: RelicItem;
  radius: number;
  color: string;
  glowColor: string;
  sealType: 'blood' | 'void' | 'spark' | 'soul';
}

interface ConstellationEdge {
  source: number;
  target: number;
  affinity: string;
  strength: number;
}

export const NecroConstellation: React.FC<NecroConstellationProps> = ({
  relics = [],
  onBack,
  onSelectRelic
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedRelic, setSelectedRelic] = useState<RelicItem | null>(null);
  const [secondaryRelic, setSecondaryRelic] = useState<RelicItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'blood' | 'void' | 'spark' | 'soul'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lore Chronicle Generator State
  const [isSynthesizingLore, setIsSynthesizingLore] = useState(false);
  const [chronicleResult, setChronicleResult] = useState<{
    title: string;
    story: string;
    epoch: string;
  } | null>(null);

  // Compute node properties deterministically
  const nodes: NodePosition[] = useMemo(() => {
    if (!relics || relics.length === 0) return [];
    
    const count = relics.length;
    const colors = {
      blood: { base: '#ff4d4d', glow: 'rgba(255, 77, 77, 0.6)' },
      void: { base: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' },
      spark: { base: '#00d2ff', glow: 'rgba(0, 210, 255, 0.6)' },
      soul: { base: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' }
    };
    const sealKeys: ('blood' | 'void' | 'spark' | 'soul')[] = ['blood', 'void', 'spark', 'soul'];

    return relics.map((r, idx) => {
      const hash = r.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), idx * 17);
      const sealType = sealKeys[hash % sealKeys.length];
      const colorSet = colors[sealType];

      // Distribute in a celestial spiral/elliptical orbit
      const angle = (idx / count) * Math.PI * 2 + (hash % 10) * 0.1;
      const dist = 140 + ((hash % 120) * 1.5);

      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        relic: r,
        radius: 22 + (hash % 8),
        color: colorSet.base,
        glowColor: colorSet.glow,
        sealType
      };
    });
  }, [relics]);

  // Compute edges (bloodline filaments) between relics that share keywords or affinities
  const edges: ConstellationEdge[] = useMemo(() => {
    if (nodes.length < 2) return [];
    const list: ConstellationEdge[] = [];
    const keywords = ['blade', 'scythe', 'crown', 'helm', 'obsidian', 'soul', 'blood', 'void', 'cursed', 'ancient', 'dark', 'flame', 'crucible'];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const titleA = (nodes[i].relic.title || '').toLowerCase();
        const descA = (nodes[i].relic.description || '').toLowerCase();
        const titleB = (nodes[j].relic.title || '').toLowerCase();
        const descB = (nodes[j].relic.description || '').toLowerCase();

        // Check for shared keywords or seals
        let sharedAffinity = '';
        for (const kw of keywords) {
          if ((titleA.includes(kw) || descA.includes(kw)) && (titleB.includes(kw) || descB.includes(kw))) {
            sharedAffinity = kw.toUpperCase();
            break;
          }
        }

        if (sharedAffinity || nodes[i].sealType === nodes[j].sealType || (i % 2 === 0 && j === i + 1)) {
          list.push({
            source: i,
            target: j,
            affinity: sharedAffinity || `${nodes[i].sealType.toUpperCase()} BLOODLINE`,
            strength: sharedAffinity ? 0.8 : 0.4
          });
        }
      }
    }
    return list;
  }, [nodes]);

  // Canvas render loop with interactive starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = Math.max(560, (canvas.parentElement?.clientHeight || 600)));

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = Math.max(560, canvas.parentElement.clientHeight || 600);
      }
    };
    window.addEventListener('resize', handleResize);

    const centerX = width / 2;
    const centerY = height / 2;

    // Stars background
    const stars = Array.from({ length: 80 }).map(() => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      r: Math.random() * 1.4,
      alpha: 0.2 + Math.random() * 0.6,
      speed: 0.003 + Math.random() * 0.008
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep void radial gradient
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, Math.max(width, height) / 1.2);
      bgGrad.addColorStop(0, '#150a12');
      bgGrad.addColorStop(0.5, '#0b0609');
      bgGrad.addColorStop(1, '#050305');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Celestial stars twinkling
      stars.forEach((s) => {
        s.alpha += (Math.random() - 0.5) * 0.02;
        s.alpha = Math.max(0.1, Math.min(0.85, s.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(centerX + s.x, centerY + s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Orbital guide rings
      ctx.strokeStyle = 'rgba(255, 77, 77, 0.08)';
      ctx.lineWidth = 1;
      [140, 220, 300].forEach((rad) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, rad, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw Filaments (edges)
      edges.forEach((edge) => {
        const nA = nodes[edge.source];
        const nB = nodes[edge.target];
        if (!nA || !nB) return;

        const isFilteredOut = 
          (activeFilter !== 'all' && nA.sealType !== activeFilter && nB.sealType !== activeFilter);
        if (isFilteredOut) return;

        const isHighlighted = 
          (selectedRelic && (selectedRelic.title === nA.relic.title || selectedRelic.title === nB.relic.title));

        ctx.beginPath();
        ctx.moveTo(centerX + nA.x, centerY + nA.y);
        ctx.lineTo(centerX + nB.x, centerY + nB.y);
        
        if (isHighlighted) {
          ctx.strokeStyle = '#ff4d4d';
          ctx.lineWidth = 2.2;
          ctx.shadowColor = 'rgba(255, 77, 77, 0.8)';
          ctx.shadowBlur = 10;
        } else {
          ctx.strokeStyle = `rgba(168, 85, 247, ${edge.strength * 0.35})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw Star Nodes
      nodes.forEach((node) => {
        const isMatchFilter = activeFilter === 'all' || node.sealType === activeFilter;
        const isMatchSearch = !searchQuery || node.relic.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isSelected = selectedRelic?.title === node.relic.title;
        const isSecondary = secondaryRelic?.title === node.relic.title;

        const alpha = isMatchFilter && isMatchSearch ? 1 : 0.2;

        const posX = centerX + node.x;
        const posY = centerY + node.y;

        // Subtle gentle breathing movement
        node.x += node.vx;
        node.y += node.vy;
        if (Math.abs(node.x) > width / 2.2) node.vx *= -1;
        if (Math.abs(node.y) > height / 2.2) node.vy *= -1;

        // Outer Glow Aura
        const auraGrad = ctx.createRadialGradient(posX, posY, 2, posX, posY, node.radius * 2.2);
        auraGrad.addColorStop(0, isSelected ? 'rgba(255, 77, 77, 0.7)' : node.glowColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(posX, posY, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Core Node Circle
        ctx.beginPath();
        ctx.arc(posX, posY, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ff4d4d' : isSecondary ? '#00d2ff' : '#140c12';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : isSecondary ? '#00d2ff' : node.color;
        ctx.lineWidth = isSelected || isSecondary ? 2.5 : 1.5;
        ctx.stroke();

        // Node Sigil Character
        ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
        ctx.font = 'bold 10px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isSelected ? '✦' : '✙', posX, posY);

        // Label underneath
        if (isMatchFilter && (isSelected || isSecondary || width > 640)) {
          ctx.fillStyle = isSelected ? '#ff8080' : isSecondary ? '#00d2ff' : 'rgba(232, 230, 227, 0.75)';
          ctx.font = isSelected || isSecondary ? 'bold 11px sans-serif' : '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.relic.title.slice(0, 18), posX, posY + node.radius + 12);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, edges, activeFilter, searchQuery, selectedRelic, secondaryRelic]);

  // Click on Canvas to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Check hit test against nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const posX = centerX + node.x;
      const posY = centerY + node.y;
      const dist = Math.hypot(mouseX - posX, mouseY - posY);

      if (dist <= node.radius + 8) {
        audioFX.playStoneRuneThud();
        if (!selectedRelic) {
          setSelectedRelic(node.relic);
        } else if (selectedRelic.title === node.relic.title) {
          // Deselect
          setSelectedRelic(null);
          setSecondaryRelic(null);
        } else if (!secondaryRelic) {
          audioFX.playBladeUnsheathe();
          setSecondaryRelic(node.relic);
        } else {
          setSelectedRelic(node.relic);
          setSecondaryRelic(null);
        }
        return;
      }
    }

    // Clicked background: clear selection
    setSelectedRelic(null);
    setSecondaryRelic(null);
  };

  // Summon Canon Lore Chronicle between two selected relics
  const handleSummonChronicle = () => {
    if (!selectedRelic) return;
    setIsSynthesizingLore(true);
    audioFX.playBladeUnsheathe();
    playBladeClang();

    const titleA = selectedRelic.title;
    const titleB = secondaryRelic ? secondaryRelic.title : 'The Abyssal Void';

    setTimeout(() => {
      setChronicleResult({
        title: `The Covenant of ${titleA} and ${titleB}`,
        epoch: "Epoch of the Shattered Eclipse (3rd Age)",
        story: `Before the Great Ruin, when the cultists of the Obsidian Sanctum forged ${titleA}, their high sorcerers realized it could not hold mortal power alone. They journeyed across the ash wastes to bind it unto ${titleB}. In doing so, the two constructs formed an eternal resonance—each strike of ${titleA} feeding the dormant dark embers within ${titleB}. Whoever wields both relics commands the sacred threshold where void and crimson fire meet.`
      });
      setIsSynthesizingLore(false);
      audioFX.playRuneChime();
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#242830]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#12081f] to-[#09040f] border border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <Compass className="w-5 h-5 text-[#c084fc]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase font-serif tracking-wider flex items-center gap-2">
              <span>The Necro-Constellation</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#a855f7]/20 border border-[#a855f7]/40 text-[#c084fc] font-mono">
                {relics.length} Relic Stars
              </span>
            </h2>
            <p className="text-[11px] text-[#70757e] tracking-widest uppercase">
              Living Lore Web &bull; Bloodline Filaments &bull; Canon Chronicle Synthesis
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { audioFX.playStoneRuneThud(); setActiveFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeFilter === 'all'
                ? 'bg-[#242830] text-white shadow'
                : 'text-[#70757e] hover:text-[#e8e6e3]'
            }`}
          >
            All Stars
          </button>
          <button
            type="button"
            onClick={() => { audioFX.playDarkSealOffering('blood'); setActiveFilter('blood'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              activeFilter === 'blood'
                ? 'bg-[#ff4d4d]/20 text-[#ff4d4d] border border-[#ff4d4d]/40'
                : 'text-[#70757e] hover:text-[#ff4d4d]'
            }`}
          >
            <span>🩸</span>
            <span>Blood</span>
          </button>
          <button
            type="button"
            onClick={() => { audioFX.playDarkSealOffering('void'); setActiveFilter('void'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              activeFilter === 'void'
                ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40'
                : 'text-[#70757e] hover:text-[#a855f7]'
            }`}
          >
            <span>👁️</span>
            <span>Void</span>
          </button>
          <button
            type="button"
            onClick={() => { audioFX.playDarkSealOffering('spark'); setActiveFilter('spark'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              activeFilter === 'spark'
                ? 'bg-[#00d2ff]/20 text-[#00d2ff] border border-[#00d2ff]/40'
                : 'text-[#70757e] hover:text-[#00d2ff]'
            }`}
          >
            <span>⚡</span>
            <span>Spark</span>
          </button>
          <button
            type="button"
            onClick={() => { audioFX.playDarkSealOffering('soul'); setActiveFilter('soul'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              activeFilter === 'soul'
                ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                : 'text-[#70757e] hover:text-[#f59e0b]'
            }`}
          >
            <span>🏺</span>
            <span>Soul</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-[#24101e] shadow-[0_20px_70px_rgba(0,0,0,0.95)] bg-black">
        {/* Floating Instruction overlay */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff8080] bg-black/60 px-3 py-1.5 rounded-lg border border-[#ff4d4d]/30 backdrop-blur-md">
            ✦ Click star nodes to bind bloodlines &bull; Select two to summon Lore Chronicle
          </span>
        </div>

        {/* Action Panel for selected nodes */}
        {selectedRelic && (
          <div className="absolute top-4 right-4 z-30 max-w-sm w-full p-4 rounded-2xl bg-[#0f0b14]/95 border-2 border-[#ff4d4d]/60 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-md animate-fade-in">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ff4d4d]">
                  {secondaryRelic ? 'Primary Star Selected' : 'Relic Star In Orbit'}
                </span>
                <h3 className="text-base font-bold text-white font-serif leading-tight">
                  {selectedRelic.title}
                </h3>
              </div>
              <button
                onClick={() => { setSelectedRelic(null); setSecondaryRelic(null); }}
                className="text-[#70757e] hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            {selectedRelic.image && (
              <div className="w-full h-28 rounded-xl overflow-hidden mb-3 border border-[#331118]">
                <img src={selectedRelic.image} alt={selectedRelic.title} className="w-full h-full object-cover" />
              </div>
            )}

            <p className="text-xs text-[#9aa0a6] line-clamp-2 mb-3 italic">
              &ldquo;{selectedRelic.description}&rdquo;
            </p>

            {/* If secondary relic is selected, show combination */}
            {secondaryRelic && (
              <div className="p-2.5 rounded-xl bg-[#1a1226] border border-[#a855f7]/50 mb-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#c084fc] block mb-1">
                  Bound with Secondary Star:
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {secondaryRelic.title}
                </span>
              </div>
            )}

            {/* Button to summon lore chronicle */}
            <button
              onClick={handleSummonChronicle}
              disabled={isSynthesizingLore}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8d1a1a] via-[#ff4d4d] to-[#8d1a1a] hover:from-[#ff4d4d] hover:to-[#ff1a1a] text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,77,77,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSynthesizingLore ? (
                <span>CONSULTING ANCIENT ORACLE...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{secondaryRelic ? 'SYNTHESIZE DUAL COVENANT' : 'SUMMON CANON CHRONICLE'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* The HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-[580px] sm:h-[640px] cursor-crosshair block"
        />
      </div>

      {/* MODAL: CHRONICLE REVELATION RESULT */}
      {chronicleResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setChronicleResult(null)}>
          <div 
            className="bg-[#110c14] border-2 border-[#a855f7] shadow-[0_0_60px_rgba(168,85,247,0.4)] max-w-2xl w-full rounded-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2d1b3b]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#c084fc] flex items-center gap-1.5">
                  <span>✦</span> {chronicleResult.epoch}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-serif uppercase tracking-wide mt-1">
                  {chronicleResult.title}
                </h3>
              </div>
              <button onClick={() => setChronicleResult(null)} className="text-[#70757e] hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="p-4 sm:p-6 rounded-xl bg-black/50 border border-[#a855f7]/30 mb-6">
              <p className="text-sm sm:text-base text-[#e9d5ff] font-serif leading-relaxed italic">
                &ldquo;{chronicleResult.story}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${chronicleResult.title}\n${chronicleResult.epoch}\n\n${chronicleResult.story}`);
                  alert("✓ Lore Chronicle copied to clipboard!");
                }}
                className="px-4 py-2.5 rounded-xl bg-[#241738] hover:bg-[#341f52] text-[#c084fc] hover:text-white border border-[#a855f7]/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <span>Copy Chronicle</span>
              </button>
              <button
                onClick={() => setChronicleResult(null)}
                className="px-5 py-2.5 rounded-xl bg-[#8d1a1a] hover:bg-[#ff4d4d] text-white text-xs font-black uppercase tracking-wider transition-all"
              >
                Seal In Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
