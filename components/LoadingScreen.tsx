
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
    message: string;
}

const BloodDrops: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            {[10, 25, 45, 70, 85].map((left, i) => (
                <motion.span 
                    key={i}
                    className="blood-drop" 
                    initial={{ top: '-10%', opacity: 0 }}
                    animate={{ top: '110%', opacity: [0, 1, 1, 0] }}
                    transition={{ 
                        duration: 3 + i, 
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "linear"
                    }}
                    style={{ left: `${left}%` } as any}
                />
            ))}
        </div>
    );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => (prev < 99 ? prev + Math.random() * 2 : 99));
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-[#0b0b0f] flex flex-col items-center justify-center z-[300] p-6 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(141,26,26,0.15)_0%,transparent_70%)]"
            />
            <BloodDrops />
            
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative w-48 h-48 mb-12 group"
            >
                {/* Ritual Outer Ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-[1px] border-[#8d1a1a]/30 rounded-full"
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-10px] border-[1px] border-[#00d2ff]/10 rounded-full"
                />
                
                {/* Core Pulsing Glyph */}
                <motion.div 
                    animate={{ boxShadow: ["0 0 20px rgba(141,26,26,0.2)", "0 0 50px rgba(141,26,26,0.6)", "0 0 20px rgba(141,26,26,0.2)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-4 bg-[#111318] rounded-full border-2 border-[#8d1a1a] flex items-center justify-center overflow-hidden"
                >
                    <motion.div 
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-t from-[#8d1a1a]/20 to-transparent"
                    />
                    <span className="demon-title text-5xl relative z-10 select-none" data-text="✧">✧</span>
                </motion.div>

                {/* Rotating Progress Beads */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <motion.circle
                        cx="96"
                        cy="96"
                        r="90"
                        fill="none"
                        stroke="#8d1a1a"
                        strokeWidth="2"
                        strokeDasharray="565.48"
                        animate={{ strokeDashoffset: 565.48 - (565.48 * progress) / 100 }}
                        transition={{ duration: 0.3 }}
                        style={{ filter: 'drop-shadow(0 0 8px #ff0000)' }}
                    />
                </svg>
            </motion.div>
            
            <div className="text-center relative z-10">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="inline-block mb-4"
                >
                    <span className="text-[10px] font-black text-[#00d2ff] uppercase tracking-[0.5em] animate-pulse">
                        Synchronizing Relic Matrix
                    </span>
                </motion.div>
                
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="demon-title text-4xl md:text-5xl mb-6 block" 
                    data-text="The Forge Awakes"
                >
                    The Forge Awakes
                </motion.h2>

                <div className="max-w-md mx-auto mb-8">
                    <AnimatePresence mode="wait">
                        <motion.p 
                            key={message}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="text-[#f5a16f] font-mono text-xs uppercase tracking-widest leading-relaxed h-12 flex items-center justify-center italic"
                        >
                            {message || 'Awakening the Neural Abyss...'}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Progress Stats */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="w-64 h-[2px] bg-[#1b1f27] rounded-full relative overflow-hidden mb-2">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8d1a1a] via-[#ff0000] to-[#00d2ff] shadow-[0_0_10px_#ff0000]"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="flex justify-between w-64 text-[9px] font-black text-[#70757e] uppercase tracking-tighter">
                        <span>Manifesting...</span>
                        <span className="text-[#00d2ff] tabular-nums">{Math.floor(progress)}%</span>
                    </div>
                </motion.div>
            </div>

            {/* Background Atmosphere */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none"
            >
                <div className="text-[12rem] font-black text-[#8d1a1a] select-none leading-none blur-3xl uppercase">GEMINI</div>
            </motion.div>
        </div>
    );
};
