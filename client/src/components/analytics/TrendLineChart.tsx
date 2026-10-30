import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface TrendLineChartProps {
  data: {
    date: string;
    score: number;
    topic: string;
  }[];
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        No completed discussion sessions yet.
      </div>
    );
  }

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E294A" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748B" 
            tick={{ fill: '#94A3B8', fontSize: 11 }} 
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#64748B" 
            tick={{ fill: '#94A3B8', fontSize: 11 }} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-navy-950 border border-navy-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                    <p className="font-semibold text-white">{item.topic}</p>
                    <p className="text-accent-blue font-bold">Overall Score: {item.score}/100</p>
                    <p className="text-slate-400">{item.date}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#8B5CF6" 
            strokeWidth={3} 
            dot={{ fill: '#8B5CF6', r: 4 }}
            activeDot={{ r: 6, fill: '#3B82F6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
