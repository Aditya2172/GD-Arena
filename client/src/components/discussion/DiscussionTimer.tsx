import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface DiscussionTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
}

export const DiscussionTimer: React.FC<DiscussionTimerProps> = ({ 
  secondsRemaining, 
  totalSeconds 
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const percentage = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));
  const isLowTime = secondsRemaining <= 60;

  return (
    <div className="flex items-center gap-3 bg-navy-850 px-3.5 py-1.5 rounded-xl border border-navy-800">
      <div className={`p-1.5 rounded-lg ${
        isLowTime ? 'bg-rose-500/10 text-rose-400' : 'bg-accent-blue/10 text-accent-blue'
      }`}>
        {isLowTime ? <AlertCircle className="w-4 h-4 animate-pulse" /> : <Clock className="w-4 h-4" />}
      </div>
      
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Time Remaining
          </span>
        </div>
        <div className={`font-mono text-base font-bold leading-none mt-0.5 ${
          isLowTime ? 'text-rose-400' : 'text-white'
        }`}>
          {formatted}
        </div>
      </div>

      <div className="hidden sm:block w-16 h-1.5 bg-navy-800 rounded-full overflow-hidden ml-1">
        <div 
          className={`h-full transition-all duration-1000 ${
            isLowTime ? 'bg-rose-500' : 'bg-accent-blue'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
