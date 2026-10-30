import React from 'react';
import { Volume2, Brain, Flame, Users, Sparkles } from 'lucide-react';
import { AIPersonality } from '../../types';
import { AudioVisualizer } from './AudioVisualizer';

interface ParticipantCardProps {
  participant: AIPersonality;
  isSpeaking: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  isSpeaking 
}) => {
  const getRoleIcon = (id: string) => {
    switch (id) {
      case 'analytical':
        return <Brain className="w-3.5 h-3.5 text-accent-cyan" />;
      case 'devils_advocate':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'collaborative':
        return <Users className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-accent-violet" />;
    }
  };

  const getBorderColor = () => {
    if (isSpeaking) return 'border-accent-violet shadow-lg shadow-accent-violet/20 bg-navy-800/90';
    return 'border-navy-800 bg-navy-850/60 hover:border-navy-700';
  };

  return (
    <div className={`relative p-3.5 rounded-xl border transition-all duration-300 ${getBorderColor()}`}>
      
      {/* Speaking badge indicator */}
      {isSpeaking && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-accent-violet text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
          <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          <img 
            src={participant.avatar} 
            alt={participant.name} 
            className={`w-12 h-12 rounded-xl object-cover border-2 transition-all ${
              isSpeaking ? 'border-accent-violet scale-105' : 'border-navy-700'
            }`}
          />
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-navy-950 border border-navy-700">
            {getRoleIcon(participant.id)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white truncate">
              {participant.name}
            </h4>
            <AudioVisualizer isActive={isSpeaking} color="violet" />
          </div>
          <p className="text-xs text-accent-violet font-medium truncate">
            {participant.roleTitle}
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5" title={participant.description}>
            {participant.description}
          </p>
        </div>
      </div>
    </div>
  );
};
