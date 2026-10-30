import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award, 
  Target, 
  Lightbulb, 
  Loader2, 
  Brain, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import { TrendLineChart } from '../components/analytics/TrendLineChart';
import { ScoreRadarChart } from '../components/analytics/ScoreRadarChart';

interface AnalyticsPageProps {
  onStartNewDiscussion: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ 
  onStartNewDiscussion 
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setAnalytics(res.analytics);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
        <p className="text-xs text-slate-400">Computing longitudinal communication trends...</p>
      </div>
    );
  }

  const hasEnoughData = analytics && analytics.totalSessions > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-navy-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-blue uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5" /> Longitudinal Insights
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Progress & Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track your articulation, reasoning growth, and preparation readiness over time.
          </p>
        </div>

        <button
          onClick={onStartNewDiscussion}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white text-xs font-semibold shadow-md hover:scale-105 transition-all self-start sm:self-auto"
        >
          Practice New Topic
        </button>
      </div>

      {!hasEnoughData ? (
        <div className="p-10 rounded-3xl bg-navy-950 border border-navy-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-accent-blue mx-auto" />
          <h3 className="text-lg font-bold text-white">More Session Data Needed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            You need at least 1 completed discussion session with an evaluation report to generate meaningful longitudinal trends.
          </p>
          <button
            onClick={onStartNewDiscussion}
            className="px-6 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-semibold shadow-md"
          >
            Start Your First Session Now
          </button>
        </div>
      ) : (
        <>
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Total GDs</span>
              <div className="text-2xl font-extrabold text-white">{analytics.totalSessions}</div>
              <p className="text-[11px] text-slate-500">Completed sessions</p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Average Score</span>
              <div className="text-2xl font-extrabold text-emerald-400">{analytics.averageScore}/100</div>
              <p className="text-[11px] text-slate-500">Across 8 dimensions</p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Speaking Time</span>
              <div className="text-2xl font-extrabold text-accent-blue">{analytics.totalPracticeTimeMinutes} mins</div>
              <p className="text-[11px] text-slate-500">Live floor airtime</p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Top Competency</span>
              <div className="text-lg font-bold text-accent-violet truncate">{analytics.mostImprovedSkill}</div>
              <p className="text-[11px] text-slate-500">Consistently highest score</p>
            </div>

          </div>

          {/* Charts Row: Score Trend Line Chart & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Score Trend */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-850 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-blue" />
                  <h3 className="text-sm font-bold text-white">Score Trajectory Over Time</h3>
                </div>
                <span className="text-xs text-slate-400">Progression curve</span>
              </div>

              <TrendLineChart data={analytics.scoreTrend} />

              <p className="text-[11px] text-slate-400 text-center">
                Reflects overall placement readiness ratings recorded across each practice date.
              </p>
            </div>

            {/* Radar Rubric Aggregate */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-4">
              <div className="flex items-center justify-between border-b border-navy-850 pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent-violet" />
                  <h3 className="text-sm font-bold text-white">Cumulative Competency Balance</h3>
                </div>
              </div>

              <ScoreRadarChart data={analytics.radarScores} />

              <p className="text-[11px] text-slate-400 text-center">
                Aggregate balance across clarity, logical reasoning, and critical thinking.
              </p>
            </div>

          </div>

          {/* Frequently Practiced Topics & Actionable Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Frequent Topics */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-accent-cyan" />
                Frequently Practiced Topics
              </h3>

              <div className="space-y-2.5">
                {analytics.frequentTopics.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-navy-900 border border-navy-850 text-xs">
                    <span className="font-semibold text-slate-200 truncate max-w-xs">{item.topic}</span>
                    <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-bold">
                      {item.count} {item.count === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Placement Recommendations */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Recommended Next Steps for Placements
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-850 space-y-1">
                  <h4 className="font-bold text-white">1. Target Advanced Controversy</h4>
                  <p className="text-slate-400">
                    Challenge yourself with abstract economic or ethical topics to practice framing arguments when data is ambiguous.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-850 space-y-1">
                  <h4 className="font-bold text-white">2. Interruption & Floor Etiquette</h4>
                  <p className="text-slate-400">
                    Include "The Devil's Advocate" persona to condition your response when peers push back aggressively.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-850 space-y-1">
                  <h4 className="font-bold text-white">3. Master the Synthesis Role</h4>
                  <p className="text-slate-400">
                    Aim to provide a 30-second concluding summary in the final minute of each discussion to demonstrate leadership.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
