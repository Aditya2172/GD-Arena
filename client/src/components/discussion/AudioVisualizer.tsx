import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: 'blue' | 'violet' | 'emerald' | 'amber';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isActive, 
  color = 'blue' 
}) => {
  const colorMap = {
    blue: 'bg-accent-blue',
    violet: 'bg-accent-violet',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400'
  };

  const barColor = colorMap[color];

  return (
    <div className="flex items-center gap-1 h-5 px-1">
      <span 
        className={`w-1 rounded-full transition-all duration-200 ${barColor} ${
          isActive ? 'h-5 animate-pulse' : 'h-1.5 opacity-40'
        }`} 
      />
      <span 
        className={`w-1 rounded-full transition-all duration-200 ${barColor} ${
          isActive ? 'h-3 animate-pulse delay-75' : 'h-1.5 opacity-40'
        }`} 
      />
      <span 
        className={`w-1 rounded-full transition-all duration-200 ${barColor} ${
          isActive ? 'h-4 animate-pulse delay-150' : 'h-1.5 opacity-40'
        }`} 
      />
      <span 
        className={`w-1 rounded-full transition-all duration-200 ${barColor} ${
          isActive ? 'h-2 animate-pulse delay-100' : 'h-1.5 opacity-40'
        }`} 
      />
    </div>
  );
};
