import React, { useEffect, useRef } from 'react';
import { Volume2, User, Sparkles } from 'lucide-react';
import { DiscussionMessage, AIPersonality } from '../../types';

interface LiveTranscriptProps {
  messages: DiscussionMessage[];
  participants: AIPersonality[];
  interimUserSpeech?: string;
  isAiGenerating?: boolean;
  onRepeatAudio?: (text: string, personalityId?: string) => void;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  messages,
  participants,
  interimUserSpeech,
  isAiGenerating,
  onRepeatAudio
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest turn
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimUserSpeech, isAiGenerating]);

  const getParticipant = (personalityId?: string) => {
    return participants.find(p => p.id === personalityId);
  };

  return (
    <div className="flex flex-col h-full bg-navy-950/70 rounded-2xl border border-navy-800 overflow-hidden shadow-inner">
      
      {/* Transcript Header */}
      <div className="px-5 py-3.5 border-b border-navy-800 bg-navy-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white tracking-wide">
            Live Discussion Transcript
          </h3>
          <span className="text-xs text-slate-400">
            ({messages.length} contributions)
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent-violet" /> Turn-Taking Active
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4"
      >
        {messages.map((message) => {
          const isUser = message.speaker_type === 'user';
          const participant = getParticipant(message.personality);

          return (
            <div 
              key={message.id || message.sequence_number}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {isUser ? (
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue/30 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <img 
                    src={participant?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'} 
                    alt={message.speaker_name} 
                    className="w-8 h-8 rounded-lg object-cover border border-navy-700"
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`space-y-1 ${isUser ? 'items-end text-right' : 'items-start text-left'}`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-semibold ${isUser ? 'text-accent-blue' : 'text-slate-200'}`}>
                    {message.speaker_name}
                  </span>
                  {!isUser && participant && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-medium">
                      {participant.roleTitle}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">
                    #{message.sequence_number}
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-gradient-to-r from-accent-blue/20 to-accent-blue/10 border border-accent-blue/30 text-white rounded-tr-none' 
                    : 'bg-navy-850 border border-navy-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  <p>{message.message_text}</p>
                  
                  {/* Replay voice button for AI statements */}
                  {!isUser && onRepeatAudio && (
                    <button
                      onClick={() => onRepeatAudio(message.message_text, message.personality)}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-accent-violet transition-colors"
                      title="Replay speech audio"
                    >
                      <Volume2 className="w-3 h-3" /> Replay
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Interim Speech Bubble */}
        {interimUserSpeech && (
          <div className="flex gap-3 max-w-2xl ml-auto flex-row-reverse animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/20 text-accent-blue border border-accent-blue/30 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="space-y-1 items-end text-right">
              <span className="text-xs font-semibold text-accent-blue">You (Speaking live...)</span>
              <div className="p-3.5 rounded-2xl text-sm bg-accent-blue/20 border border-accent-blue/40 text-blue-100 rounded-tr-none italic">
                "{interimUserSpeech}..."
              </div>
            </div>
          </div>
        )}

        {/* AI Thinking Indicator */}
        {isAiGenerating && (
          <div className="flex gap-3 max-w-sm mr-auto items-center py-2">
            <div className="w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-violet animate-spin" />
            </div>
            <div className="flex items-center gap-1 text-xs text-accent-violet bg-navy-850 px-3 py-2 rounded-xl border border-navy-800">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-violet animate-ping" />
              AI participant formulating response...
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
