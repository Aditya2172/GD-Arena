import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface ScoreRadarChartProps {
  data: {
    metric: string;
    score: number;
    fullMark: number;
  }[];
}

export const ScoreRadarChart: React.FC<ScoreRadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1E294A" />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            stroke="#334155" 
            tick={{ fill: '#64748B', fontSize: 9 }}
          />
          <Radar
            name="Candidate"
            dataKey="score"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="#3B82F6"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
