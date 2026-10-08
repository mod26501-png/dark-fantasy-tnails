import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, ExternalLink, Trash2, Eye, EyeOff, Check, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { getUserApiKey, setUserApiKey, clearUserApiKey, validateApiKey, isCustomUserKeyActive } from '../services/geminiService';
import { audioFX } from '../services/audioService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasKey: boolean) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [savedKeyMasked, setSavedKeyMasked] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getUserApiKey();
      setHasCustomKey(!!current);
      if (current) {
        setApiKeyInput(current);
        const prefix = current.substring(0, 6);
        const suffix = current.substring(current.length - 4);
        setSavedKeyMasked(`${prefix}••••••••${suffix}`);
      } else {
        setApiKeyInput('');
        setSavedKeyMasked('');
      }
      setValidationStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = apiKeyInput.trim();

    if (!cleanKey) {
      setValidationStatus('error');
      setStatusMessage('Please enter a valid Google Gemini API key.');
      return;
    }

    setIsValidating(true);
    setValidationStatus('idle');
    setStatusMessage('Validating mystical link with Google AI Studio...');
    audioFX.playStoneRuneThud();

    try {
      const result = await validateApiKey(cleanKey);
      if (result.valid) {
        setUserApiKey(cleanKey);
        setHasCustomKey(true);
        const prefix = cleanKey.substring(0, 6);
        const suffix = cleanKey.substring(cleanKey.length - 4);
        setSavedKeyMasked(`${prefix}••••••••${suffix}`);
        setValidationStatus('success');
        setStatusMessage('Manifestation Engine ascended! Key verified and active for 2K/4K Pro rituals.');
        audioFX.playRuneChime();
        onKeyUpdated?.(true);
      } else {
        setValidationStatus('error');
        setStatusMessage(result.error || 'Failed to authenticate with Google Gemini. Check your key.');
      }
    } catch (err: any) {
      setValidationStatus('error');
      setStatusMessage(err?.message || 'Error reaching the Gemini API.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    audioFX.playStoneRuneThud();
    clearUserApiKey();
    setApiKeyInput('');
    setHasCustomKey(false);
    setSavedKeyMasked('');
    setValidationStatus('idle');
    setStatusMessage('Custom key removed. The Demon Codex will use the default Flash engine.');
    onKeyUpdated?.(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1017] border-2 border-[#c26b3a]/50 p-6 sm:p-8 rounded-3xl max-w-lg w-full text-left shadow-[0_0_60px_rgba(194,107,58,0.25)] relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#242830]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8d1a1a]/40 to-[#c26b3a]/30 border border-[#c26b3a]/40 flex items-center justify-center text-[#ff9966] shadow-[0_0_20px_rgba(194,107,58,0.2)]">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight">
                Manifestation Engine
              </h2>
              <p className="text-[10px] sm:text-xs text-[#70757e] tracking-widest uppercase font-mono">
                Google Gemini API Key Sanctum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#70757e] hover:text-white font-bold p-1 text-sm rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Engine Status Banner */}
        <div className="my-5 p-3.5 rounded-2xl bg-[#141721] border border-[#242830] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${hasCustomKey ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-[#00d2ff] shadow-[0_0_8px_#00d2ff]'}`} />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {hasCustomKey ? 'Custom Sovereign Key Active' : 'Demon Codex Flash Engine Active'}
              </p>
              <p className="text-[10px] text-[#70757e] font-mono">
                {hasCustomKey ? savedKeyMasked : 'Free standard 1K relics powered by Flash Tier'}
              </p>
            </div>
          </div>
          {hasCustomKey && (
            <button
              onClick={handleClear}
              className="text-[10px] text-[#ff7b7b] hover:text-white border border-[#ff4d4d]/30 hover:bg-[#8d1a1a]/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 font-bold"
              title="Remove custom API key"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>

        {/* Instructions */}
        <p className="text-xs text-[#9aa0a6] leading-relaxed mb-4">
          To forge relics in ultra-high fidelity (<strong className="text-white">2K / 4K</strong>), engage the <strong className="text-[#00d2ff]">Gemini 3 Pro</strong> visual engine, or activate <strong className="text-[#ffd27f]">Occult Intellect</strong> reasoning, supply your personal Google Gemini API key below.
        </p>

        {/* Form */}
        <form onSubmit={handleSaveAndTest} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#70757e] mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setValidationStatus('idle');
                }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 bg-[#07080b] border border-[#242830] focus:border-[#c26b3a] focus:ring-2 focus:ring-[#c26b3a]/20 rounded-xl text-xs font-mono text-white placeholder:text-[#444] transition-all pr-10 focus:outline-none"
                disabled={isValidating}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70757e] hover:text-white transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback status message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
                validationStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : validationStatus === 'error'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
              }`}
            >
              {validationStatus === 'success' && <Check className="w-4 h-4 flex-shrink-0" />}
              {validationStatus === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {validationStatus === 'idle' && <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />}
              <span className="leading-snug">{statusMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="submit"
              disabled={isValidating || !apiKeyInput.trim()}
              className="flex-1 py-3 px-5 bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:shadow-[0_0_25px_#c26b3a] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Validating Key...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save & Activate Engine</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 bg-[#141721] hover:bg-[#202533] text-[#cfd3d8] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-[#242830]"
            >
              Done
            </button>
          </div>
        </form>

        {/* Free API Key Link & Feature Perks */}
        <div className="mt-6 pt-5 border-t border-[#242830] space-y-3">
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-[#00d2ff] text-xs font-bold transition-all flex items-center justify-between group"
          >
            <span className="flex items-center gap-2">
              <span>✦</span>
              <span>Get a Free Key at Google AI Studio</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#70757e] pt-1 font-mono">
            <div className="p-2 rounded-lg bg-[#07080b] border border-[#1b1e28]">
              <span className="text-[#00d2ff] font-bold block mb-0.5">Flash Engine</span>
              <span>1K standard relics, fast synthesis, zero configuration.</span>
            </div>
            <div className="p-2 rounded-lg bg-[#07080b] border border-[#1b1e28]">
              <span className="text-[#c26b3a] font-bold block mb-0.5">Custom Pro Engine</span>
              <span>2K/4K resolution, Gemini 3 Pro reasoning & image rendering.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
