import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, Terminal, Edit3, X, Info, ShieldAlert } from 'lucide-react';
import type { ImageDiagnostic } from '../types';

interface ImageDiagnosticOverlayProps {
  diagnostic?: ImageDiagnostic;
  assetTitle?: string;
  originalPrompt?: string;
  onRetry: (updatedPrompt?: string) => Promise<void> | void;
  isRetrying?: boolean;
  compact?: boolean;
}

export const ImageDiagnosticOverlay: React.FC<ImageDiagnosticOverlayProps> = ({
  diagnostic,
  assetTitle = 'Asset',
  originalPrompt = '',
  onRetry,
  isRetrying = false,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(originalPrompt);

  const rawError = diagnostic?.rawError || 'Image failed to load or render from server / client buffer.';
  const statusCode = diagnostic?.statusCode ? String(diagnostic?.statusCode) : 'UNKNOWN_ERR';
  const modelName = diagnostic?.modelName || 'gemini-3.1-flash-image';
  const promptAttempted = diagnostic?.promptAttempted || originalPrompt;
  const timestamp = diagnostic?.timestamp || new Date().toLocaleTimeString();

  // Categorize error for actionable troubleshooting insights
  const errorLower = rawError.toLowerCase();
  let category = 'Runtime Render Failure';
  let advice = 'The client could not decode or manifest the image bytes. Check network connection or retry.';
  let badgeColor = 'bg-[#8d1a1a] text-white border-red-500/50';

  if (errorLower.includes('402') || errorLower.includes('prepayment') || errorLower.includes('credits are depleted') || errorLower.includes('prepay')) {
    category = 'Prepayment Credits Depleted (Billing)';
    advice = 'Your prepayment credits on Google AI Studio are depleted. Visit https://ai.studio/projects to manage your project and add billing credits for image generation.';
    badgeColor = 'bg-yellow-950 text-yellow-300 border-yellow-500/50';
  } else if (errorLower.includes('403') || errorLower.includes('api_key') || errorLower.includes('permission_denied') || errorLower.includes('credentials')) {
    category = 'Authentication / API Key Error';
    advice = 'Your Gemini API key is missing, unauthorized, or does not have access to Imagen/Gemini image generation models. Click "Link API Key" in the top bar.';
    badgeColor = 'bg-amber-950 text-amber-300 border-amber-500/50';
  } else if (errorLower.includes('safety') || errorLower.includes('filter') || errorLower.includes('blocked') || errorLower.includes('content policy')) {
    category = 'Safety Filter Suppression';
    advice = 'The occult/dark fantasy terms triggered the model safety guardrails. Click "Tweak Prompt" below to replace sensitive keywords with atmospheric alternatives.';
    badgeColor = 'bg-rose-950 text-rose-300 border-rose-500/50';
  } else if (errorLower.includes('quota') || errorLower.includes('429') || errorLower.includes('resource_exhausted') || errorLower.includes('spending cap') || errorLower.includes('spend cap')) {
    category = 'Spending Cap / Quota Exhausted';
    advice = 'Your Google AI Studio project has exceeded its monthly spending cap or rate limits. Review or increase your spend cap at https://ai.studio/spend.';
    badgeColor = 'bg-orange-950 text-orange-300 border-orange-500/50';
  } else if (errorLower.includes('404') || errorLower.includes('not found')) {
    category = 'Model Endpoint Unavailable';
    advice = 'The requested image model endpoint is unavailable in your current project region or configuration.';
    badgeColor = 'bg-purple-950 text-purple-300 border-purple-500/50';
  }

  const handleCopyRaw = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const debugPayload = JSON.stringify(
        {
          assetTitle,
          category,
          statusCode,
          modelName,
          timestamp,
          rawError,
          promptAttempted,
        },
        null,
        2
      );
      await navigator.clipboard.writeText(debugPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy diagnostics', err);
    }
  };

  const handleRetryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRetrying) return;
    onRetry(editedPrompt !== originalPrompt ? editedPrompt : undefined);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPromptEditor(false);
    onRetry(editedPrompt);
  };

  return (
    <>
      <div 
        className="absolute inset-0 z-30 bg-[#090a0f]/95 backdrop-blur-md flex flex-col justify-between p-3.5 sm:p-4 text-left font-mono border-2 border-[#8d1a1a]/70 rounded-inherit overflow-hidden transition-all select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 border-b border-[#242830] pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-[#ff4d4d] shrink-0 animate-pulse" />
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider block truncate">
                Manifestation Interrupted
              </span>
              <span className="text-[8px] sm:text-[9px] text-[#ff7b7b] uppercase tracking-tight block truncate font-sans">
                {category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleCopyRaw}
              title="Copy Raw Diagnostic Data"
              className="p-1 rounded bg-[#151821] border border-[#2d3240] hover:border-[#00d2ff] text-[#70757e] hover:text-[#00d2ff] transition-all text-[9px] flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setShowFullModal(true)}
              title="Expand Raw Log"
              className="p-1 rounded bg-[#151821] border border-[#2d3240] hover:border-[#8d1a1a] text-[#70757e] hover:text-white transition-all text-[9px]"
            >
              <Terminal className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Middle Diagnostic Terminal */}
        <div className="my-2 flex-1 min-h-0 flex flex-col justify-center gap-1.5 overflow-hidden">
          <div className="bg-[#050608] border border-[#1e222d] rounded-lg p-2 overflow-y-auto max-h-[85px] sm:max-h-[110px] text-[9px] sm:text-[10px] leading-relaxed text-[#e0e4eb]">
            <div className="flex items-center justify-between text-[8px] text-[#70757e] border-b border-[#1a1d26] pb-1 mb-1 font-sans">
              <span className="text-[#ff4d4d] font-bold">ERR_TRACE [{statusCode}]</span>
              <span>{modelName}</span>
            </div>
            <p className="text-[#ff9b9b] font-mono break-all line-clamp-3 hover:line-clamp-none transition-all">
              {rawError}
            </p>
          </div>

          <div className="bg-[#12151d]/70 rounded p-1.5 border border-[#202533] flex items-start gap-1.5 text-[8px] sm:text-[9px] text-[#9aa0a6] font-sans">
            <Info className="w-3 h-3 text-[#00d2ff] shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-tight">
              {advice}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-[#242830] flex items-center gap-2">
          <button
            onClick={handleRetryClick}
            disabled={isRetrying}
            className="flex-1 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#8d1a1a] to-[#c26b3a] hover:from-[#ff0000] hover:to-[#e88147] text-white text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(141,26,26,0.5)] disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Re-Invoking...' : 'Retry Asset'}</span>
          </button>

          <button
            onClick={() => setShowPromptEditor(true)}
            disabled={isRetrying}
            className="py-2 px-2.5 rounded-lg bg-[#151821] hover:bg-[#1f2430] border border-[#2d3240] hover:border-[#00d2ff] text-[#00d2ff] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
            title="Edit prompt & retry"
          >
            <Edit3 className="w-3 h-3" />
            <span className="hidden sm:inline">Tweak</span>
          </button>
        </div>
      </div>

      {/* Full Diagnostic Modal */}
      {showFullModal && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowFullModal(false)}
        >
          <div
            className="bg-[#0e1017] border-2 border-[#8d1a1a] rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(141,26,26,0.6)] text-left font-sans flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#242830] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#ff4d4d]" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Diagnostic Telemetry: {assetTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowFullModal(false)}
                className="text-[#70757e] hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-3 rounded-xl border text-xs leading-relaxed font-sans ${badgeColor}`}>
              <p className="font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <span>{category}</span> • <span>Status: {statusCode}</span>
              </p>
              <p>{advice}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[#70757e] tracking-wider">
                <span>Raw Error Payload</span>
                <button
                  onClick={handleCopyRaw}
                  className="text-[#00d2ff] hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied to Clipboard' : 'Copy Payload'}
                </button>
              </div>
              <pre className="p-3 bg-[#050608] border border-[#242830] rounded-xl text-xs font-mono text-[#ff8080] overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-[160px]">
                {rawError}
              </pre>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase font-bold text-[#70757e] tracking-wider">
                Prompt Sent to Image Engine
              </span>
              <p className="p-3 bg-[#050608] border border-[#242830] rounded-xl text-xs font-mono text-[#b3f2ff] leading-relaxed max-h-[120px] overflow-y-auto">
                {promptAttempted}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono bg-[#151821] p-3 rounded-xl border border-[#242830]">
              <div>
                <span className="text-[#70757e] block">Model Target:</span>
                <span className="text-white font-bold">{modelName}</span>
              </div>
              <div>
                <span className="text-[#70757e] block">Timestamp:</span>
                <span className="text-white">{timestamp}</span>
              </div>
              <div>
                <span className="text-[#70757e] block">Resolution/State:</span>
                <span className="text-[#ff4d4d] font-bold">Unresolved</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#242830] pt-4 mt-2">
              <button
                onClick={() => setShowFullModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#242830] text-xs font-bold text-[#70757e] hover:text-white"
              >
                Close Trace
              </button>
              <button
                onClick={(e) => {
                  setShowFullModal(false);
                  handleRetryClick(e);
                }}
                disabled={isRetrying}
                className="px-6 py-2.5 rounded-xl bg-[#8d1a1a] hover:bg-[#ff0000] text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_#8d1a1a] flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>Retry Manifestation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Tweak Modal */}
      {showPromptEditor && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setShowPromptEditor(false)}
        >
          <form
            onSubmit={handlePromptSubmit}
            className="bg-[#0e1017] border-2 border-[#00d2ff]/40 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(0,210,255,0.2)] text-left font-sans flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#242830] pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#00d2ff]" />
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                  Tweak Prompt & Retry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPromptEditor(false)}
                className="text-[#70757e] hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9aa0a6] leading-relaxed">
              If the image was blocked by safety filters or produced an unexpected error, adjust the wording below to replace violent/forbidden keywords with atmospheric dark fantasy terms (e.g. use "crimson mist" instead of "blood").
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#70757e]">
                Asset Visual Prompt
              </label>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                rows={4}
                className="w-full p-3 bg-[#050608] border border-[#242830] focus:border-[#00d2ff] rounded-xl text-xs font-mono text-[#e8e6e3] focus:outline-none leading-relaxed"
                placeholder="Atmospheric dark fantasy prompt..."
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-[#242830] pt-4">
              <button
                type="button"
                onClick={() => setShowPromptEditor(false)}
                className="px-5 py-2.5 rounded-xl border border-[#242830] text-xs font-bold text-[#70757e] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRetrying || !editedPrompt.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#00d2ff] hover:bg-[#33ddff] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>Save & Retry Ritual</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
