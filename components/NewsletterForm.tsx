
import React, { useState } from 'react';

export const NewsletterForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'binding' | 'bound'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setStatus('binding');
        // Simulate a ritual binding
        setTimeout(() => {
            setStatus('bound');
            setEmail('');
        }, 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-[#111318] border border-[#8d1a1a]/30 shadow-[0_0_40px_rgba(141,26,26,0.1)] relative group hover:border-[#8d1a1a]/60 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity">
                <span className="text-6xl text-[#8d1a1a]">✉</span>
            </div>
            
            <div className="relative z-10 text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Join the Blood-Compact</h3>
                <p className="text-[10px] text-[#70757e] font-bold uppercase tracking-[0.3em] mb-6">Receive whispers of new rituals, tools, and forbidden knowledge.</p>
                
                {status === 'bound' ? (
                    <div className="py-4 animate-fade-in">
                        <span className="lightning-text text-sm uppercase italic">Your spirit is bound to the codex. Check your portal.</span>
                        <button onClick={() => setStatus('idle')} className="block mx-auto mt-4 text-[9px] font-black text-[#8d1a1a] uppercase tracking-widest hover:text-white transition-colors">Manifest Another?</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your mortal email..."
                            required
                            className="flex-grow bg-black/40 border border-[#242830] rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-[#8d1a1a] focus:ring-1 focus:ring-[#8d1a1a] transition-all placeholder:text-[#444]"
                        />
                        <button 
                            type="submit" 
                            disabled={status === 'binding'}
                            className="bg-[#8d1a1a] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#ff0000] hover:shadow-[0_0_20px_#ff0000] transition-all disabled:opacity-50 hover-blood"
                        >
                            {status === 'binding' ? 'BINDING...' : 'SACRIFICE EMAIL'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
