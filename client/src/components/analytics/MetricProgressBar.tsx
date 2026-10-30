import React from 'react';

interface MetricProgressBarProps {
  label: string;
  score: number;
  description?: string;
}

export const MetricProgressBar: React.FC<MetricProgressBarProps> = ({ 
  label, 
  score, 
  description 
}) => {
  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-emerald-400 bg-emerald-500';
    if (val >= 65) return 'text-accent-blue bg-accent-blue';
    if (val >= 50) return 'text-amber-400 bg-amber-400';
    return 'text-rose-400 bg-rose-500';
  };

  const colorClass = getScoreColor(score);
  const textColor = colorClass.split(' ')[0];
  const bgColor = colorClass.split(' ')[1];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200">{label}</span>
        <span className={`font-mono font-bold ${textColor}`}>{score}/100</span>
      </div>

      <div className="w-full h-2 bg-navy-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${bgColor}`}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>

      {description && (
        <p className="text-[11px] text-slate-400">{description}</p>
      )}
    </div>
  );
};
