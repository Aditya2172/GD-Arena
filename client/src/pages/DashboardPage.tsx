import React, { useEffect, useState } from 'react';
import { 
  Mic, 
  Award, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  PlusCircle, 
  History, 
  Brain, 
  Calendar, 
  Sparkles,
  CheckCircle2,
  Activity,
  Target,
  GitCompare,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DiscussionSession, AnalyticsSummary } from '../types';

interface DashboardPageProps {
  onStartNew: (topic?: string) => void;
  onViewHistory: () => void;
  onViewReport: (sessionId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onStartNew, 
  onViewHistory,
  onViewReport,
  onNavigateTab
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [sessions, setSessions] = useState<DiscussionSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [analyticsRes, sessionsRes] = await Promise.all([
          api.getAnalytics().catch(() => null),
          api.getSessions().catch(() => ({ sessions: [] }))
        ]);

        if (analyticsRes) setAnalytics(analyticsRes.analytics);
        if (sessionsRes) setSessions(sessionsRes.sessions);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const recommendedTopics = [
    {
      title: 'AI and the Future of Jobs',
      difficulty: 'Intermediate',
      category: 'Placement Hot Topic',
      duration: '5 min'
    },
    {
      title: 'Should College Education Be Free for All?',
      difficulty: 'Beginner',
      category: 'Socio-Economic Debate',
      duration: '5 min'
    },
    {
      title: 'Remote Work vs In-Office Work Culture',
      difficulty: 'Intermediate',
      category: 'Corporate Readiness',
      duration: '10 min'
    },
    {
      title: 'Data Privacy & Ethics in the Age of Large Language Models',
      difficulty: 'Advanced',
      category: 'Technology & Policy',
      duration: '10 min'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Campus Recruitment Prep
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.displayName || 'Candidate'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Sharpen your logical clarity and turn-taking in live simulated voice discussions. Step into the arena to build interview confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartNew()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-lg shadow-accent-blue/20 flex items-center gap-2 hover:scale-105 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Start New Discussion</span>
            </button>
            <button
              onClick={onViewHistory}
              className="px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>Past Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed GDs</span>
            <Mic className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loading ? '...' : analytics?.totalSessions || 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {analytics?.totalSessions ? 'Recorded practice sessions' : 'Start your first session today'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loading ? '...' : analytics?.averageScore ? `${analytics.averageScore}/100` : '--'}
          </div>
          <p className="text-[11px] text-slate-400">
            {analytics?.averageScore ? 'Based on 8 placement metrics' : 'Pending completed sessions'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Practice Time</span>
            <Clock className="w-4 h-4 text-accent-violet" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {loading ? '...' : `${analytics?.totalPracticeTimeMinutes || 0}m`}
          </div>
          <p className="text-[11px] text-slate-400">Total discussion airtime</p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Strength</span>
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-lg sm:text-xl font-bold text-white truncate">
            {loading ? '...' : analytics?.mostImprovedSkill || 'Topic Relevance'}
          </div>
          <p className="text-[11px] text-slate-400">Highest rubric dimension</p>
        </div>

      </div>

      {/* Placement Readiness Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg font-bold text-white">Campus Placement Readiness Hub</h2>
          </div>
          <span className="text-xs text-slate-400">Targeted tools to master communication assessments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Speech Clarity Lab */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('speech-lab')}
            className="p-6 rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border border-navy-800 hover:border-accent-cyan/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-lg hover:shadow-accent-cyan/10"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-accent-cyan transition-colors">
                  Speech Clarity Lab
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Analyze speaking cadence (110–150 WPM benchmark), suppress verbal fillers (um, like), and test your microphone delivery live.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-850 flex items-center justify-between text-xs text-accent-cyan font-semibold">
              <span>Open Speech Lab</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Placement Micro-Drills */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('drills')}
            className="p-6 rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border border-navy-800 hover:border-accent-blue/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-lg hover:shadow-accent-blue/10"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-accent-blue transition-colors">
                  Placement Micro-Drills
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Interactive timed drills: 20-second opening hook, PREP argument structure, 1-minute silent pause control, and diplomatic rebuttal.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-850 flex items-center justify-between text-xs text-accent-blue font-semibold">
              <span>Practice Drills</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Session Progression Comparison */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('compare')}
            className="p-6 rounded-2xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border border-navy-800 hover:border-accent-violet/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-lg hover:shadow-accent-violet/10"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet flex items-center justify-center">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-accent-violet transition-colors">
                  Progress Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Compare two discussion sessions side-by-side across the 8-dimension placement rubric, score deltas, and cadence trends.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-850 flex items-center justify-between text-xs text-accent-violet font-semibold">
              <span>Compare Sessions</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* Main Split: Recommended Topics vs Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Topics (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-accent-blue" />
              <h2 className="text-lg font-bold text-white">Recommended Discussion Topics</h2>
            </div>
            <span className="text-xs text-slate-400">Campus placement favorites</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedTopics.map((topic, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-navy-950 border border-navy-800 hover:border-accent-blue/40 transition-all space-y-3 group cursor-pointer flex flex-col justify-between"
                onClick={() => onStartNew(topic.title)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-semibold">
                      {topic.category}
                    </span>
                    <span className="text-slate-400">{topic.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-accent-blue transition-colors">
                    {topic.title}
                  </h3>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-navy-900">
                  <span>Level: {topic.difficulty}</span>
                  <span className="text-accent-blue font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Practice <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Practice History (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-accent-violet" />
              <h2 className="text-lg font-bold text-white">Recent Sessions</h2>
            </div>
            <button 
              onClick={onViewHistory}
              className="text-xs text-accent-blue hover:underline font-semibold"
            >
              View all
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-800 text-slate-400 flex items-center justify-center mx-auto">
                <Mic className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">No sessions completed yet</h4>
              <p className="text-xs text-slate-400">
                Your completed discussions, transcripts, and 8-metric reports will appear here.
              </p>
              <button
                onClick={() => onStartNew()}
                className="px-4 py-2 rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 text-xs font-semibold hover:bg-accent-blue/20 transition-colors"
              >
                Start First Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 4).map((session) => (
                <div 
                  key={session.id}
                  onClick={() => onViewReport(session.id)}
                  className="p-4 rounded-xl bg-navy-950 border border-navy-800 hover:border-navy-700 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-accent-blue transition-colors">
                      {session.topic}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{session.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-accent-blue font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
