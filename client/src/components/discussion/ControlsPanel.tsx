import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  Send, 
  RotateCcw, 
  LogOut, 
  Keyboard, 
  VolumeX, 
  Volume2, 
  AlertTriangle 
} from 'lucide-react';

interface ControlsPanelProps {
  isListening: boolean;
  isSpeakingAI: boolean;
  isMuted: boolean;
  isSupported: boolean;
  permissionError: string | null;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  onToggleMute: () => void;
  onStopAudioPlayback: () => void;
  onRepeatLastAI: () => void;
  onEndDiscussion: () => void;
  onSendTypedMessage: (text: string) => void;
  disabled?: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isListening,
  isSpeakingAI,
  isMuted,
  isSupported,
  permissionError,
  onStartSpeaking,
  onStopSpeaking,
  onToggleMute,
  onStopAudioPlayback,
  onRepeatLastAI,
  onEndDiscussion,
  onSendTypedMessage,
  disabled = false
}) => {
  const [showTypedInput, setShowTypedInput] = useState(false);
  const [typedText, setTypedText] = useState('');

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim() || disabled) return;
    onSendTypedMessage(typedText.trim());
    setTypedText('');
  };

  return (
    <div className="bg-navy-950/80 backdrop-blur-md rounded-2xl border border-navy-800 p-4 space-y-3 shadow-lg">
      
      {/* Microphone error / Fallback banner */}
      {(permissionError || !isSupported) && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span className="flex-1">
            {permissionError || 'Voice recognition is unavailable in this browser. Please use the typed input box below.'}
          </span>
          <button
            onClick={() => setShowTypedInput(true)}
            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 font-semibold"
          >
            Use Typed Chat
          </button>
        </div>
      )}

      {/* Main Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Secondary Audio Controls */}
        <div className="flex items-center gap-2">
          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isMuted 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-navy-850 text-slate-300 border-navy-750 hover:bg-navy-800'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* AI audio interrupt / repeat */}
          {isSpeakingAI ? (
            <button
              onClick={onStopAudioPlayback}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-navy-850 text-amber-400 border border-navy-750 hover:bg-navy-800 transition-all"
              title="Interrupt AI speaking"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop AI Speech</span>
            </button>
          ) : (
            <button
              onClick={onRepeatLastAI}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-navy-850 text-slate-300 border border-navy-750 hover:bg-navy-800 transition-all"
              title="Replay last AI statement"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Repeat</span>
            </button>
          )}

          {/* Toggle Typed Input */}
          <button
            onClick={() => setShowTypedInput(!showTypedInput)}
            className={`p-2 rounded-xl border text-xs transition-all ${
              showTypedInput 
                ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30' 
                : 'bg-navy-850 text-slate-400 border-navy-750 hover:text-white'
            }`}
            title="Toggle text input fallback"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Hero Action Button (Start / Stop Speaking) */}
        <div className="flex-1 flex justify-center max-w-xs">
          {isListening ? (
            <button
              onClick={onStopSpeaking}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Finish Turn (Stop Speaking)</span>
            </button>
          ) : (
            <button
              onClick={onStartSpeaking}
              disabled={disabled || isMuted}
              className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                isMuted || disabled
                  ? 'bg-navy-800 text-slate-500 cursor-not-allowed border border-navy-700'
                  : 'bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white shadow-accent-blue/20 hover:scale-[1.02]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Start Speaking</span>
            </button>
          )}
        </div>

        {/* Right: End Discussion */}
        <div>
          <button
            onClick={onEndDiscussion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Discussion</span>
          </button>
        </div>

      </div>

      {/* Typed Input Fallback Drawer */}
      {showTypedInput && (
        <form onSubmit={handleSendText} className="pt-2 border-t border-navy-850 flex gap-2">
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your argument here if microphone is unavailable..."
            className="flex-1 px-4 py-2 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={!typedText.trim() || disabled}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-semibold transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      )}

    </div>
  );
};
