import React from 'react';
import { Mic, MicOff, User as UserIcon } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface UserCardProps {
  displayName: string;
  isListening: boolean;
  isMuted: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  displayName, 
  isListening, 
  isMuted 
}) => {
  const getBorderColor = () => {
    if (isListening) return 'border-accent-blue shadow-lg shadow-accent-blue/20 bg-navy-800/90';
    if (isMuted) return 'border-navy-800 bg-navy-900/60 opacity-80';
    return 'border-navy-700 bg-navy-850/80';
  };

  return (
    <div className={`relative p-3.5 rounded-xl border transition-all duration-300 ${getBorderColor()}`}>
      
      {/* Speaking badge indicator */}
      {isListening && (
        <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-accent-blue text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
          <Mic className="w-3 h-3 animate-pulse" /> Your Turn (Speaking)
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/30 to-accent-violet/30 border-2 flex items-center justify-center text-accent-blue font-bold text-lg ${
            isListening ? 'border-accent-blue scale-105' : 'border-navy-750'
          }`}>
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-0.5 rounded-md bg-navy-950 border border-navy-700">
            {isMuted ? (
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white truncate">
              {displayName}
            </h4>
            <AudioVisualizer isActive={isListening} color="blue" />
          </div>
          <p className="text-xs text-accent-blue font-medium">
            Candidate (You)
          </p>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {isListening 
              ? 'Microphone active — speaking to group' 
              : isMuted 
                ? 'Microphone muted' 
                : 'Listening to discussion'}
          </p>
        </div>
      </div>
    </div>
  );
};
