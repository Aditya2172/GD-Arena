import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowRight, 
  Calendar, 
  Award, 
  Activity, 
  Zap, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { DiscussionSession, SessionComparisonResult } from '../types';

interface CompareSessionsPageProps {
  onViewReport: (sessionId: string) => void;
  onStartNew: () => void;
}

export const CompareSessionsPage: React.FC<CompareSessionsPageProps> = ({ 
  onViewReport, 
  onStartNew 
}) => {
  const [sessions, setSessions] = useState<DiscussionSession[]>([]);
  const [sessionAId, setSessionAId] = useState<string>('');
  const [sessionBId, setSessionBId] = useState<string>('');
  const [comparison, setComparison] = useState<SessionComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        const res = await api.getSessions();
        const list = res.sessions || [];
        setSessions(list);

        if (list.length >= 2) {
          // Default baseline to second latest, comparison to latest
          setSessionAId(list[1].id);
          setSessionBId(list[0].id);
          // Auto compare
          runComparison(list[1].id, list[0].id);
        } else if (list.length === 1) {
          setSessionAId(list[0].id);
          setSessionBId(list[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const runComparison = async (idA: string, idB: string) => {
    if (!idA || !idB) return;
    try {
      setComparing(true);
      setError(null);
      const res = await api.compareSessions(idA, idB);
      setComparison(res.comparison);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to compare sessions. Please verify both sessions have completed reports.');
    } finally {
      setComparing(false);
    }
  };

  const handleManualCompare = (e: React.FormEvent) => {
    e.preventDefault();
    runComparison(sessionAId, sessionBId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold">
              <GitCompare className="w-3.5 h-3.5" /> Longitudinal Candidate Progression
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Session Progression Comparison
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Track candidate growth over time. Compare two discussion sessions side-by-side across the 8-dimension placement rubric, speech cadence, and verbal filler counts.
            </p>
          </div>

          <button
            onClick={onStartNew}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-accent-blue/20 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Start New Discussion
          </button>
        </div>
      </div>

      {/* Session Selection Form */}
      <form onSubmit={handleManualCompare} className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-navy-850 pb-4">
          <GitCompare className="w-4 h-4 text-accent-blue" /> Select Sessions to Compare
        </div>

        {sessions.length < 2 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You need at least two completed discussion sessions to see longitudinal progress. You currently have {sessions.length} session(s).</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Session A */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Baseline Session (Earlier)
            </label>
            <select
              value={sessionAId}
              onChange={(e) => setSessionAId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-750 text-slate-200 text-sm focus:outline-none focus:border-accent-blue"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.created_at).toLocaleDateString()} — {s.topic} ({s.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Comparison Session B */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-accent-cyan">
              Comparison Session (Target / Recent)
            </label>
            <select
              value={sessionBId}
              onChange={(e) => setSessionBId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-750 text-slate-200 text-sm focus:outline-none focus:border-accent-cyan"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.created_at).toLocaleDateString()} — {s.topic} ({s.difficulty})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={comparing || !sessionAId || !sessionBId || sessionAId === sessionBId}
            className="px-6 py-3 rounded-xl bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-accent-blue/20 flex items-center gap-2 transition-all"
          >
            <GitCompare className="w-4 h-4" />
            <span>{comparing ? 'Analyzing Progress...' : 'Compare Sessions'}</span>
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Top Headline Delta Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-850 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Overall Performance Delta</span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>Progress Summary</span>
                  <span className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full font-bold ${
                    comparison.overallScoreDelta > 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : comparison.overallScoreDelta < 0 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-navy-800 text-slate-300'
                  }`}>
                    {comparison.overallScoreDelta > 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4" /> +{comparison.overallScoreDelta} Points
                      </>
                    ) : comparison.overallScoreDelta < 0 ? (
                      <>
                        <TrendingDown className="w-4 h-4" /> {comparison.overallScoreDelta} Points
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4" /> No Change
                      </>
                    )}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onViewReport(comparison.sessionA.id)}
                  className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-300 border border-navy-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Baseline Report
                </button>
                <button
                  onClick={() => onViewReport(comparison.sessionB.id)}
                  className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-850 text-accent-blue border border-navy-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Target Report
                </button>
              </div>
            </div>

            {/* Side-by-side session overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Session A */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-navy-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Baseline Session</span>
                  <span>{new Date(comparison.sessionA.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">{comparison.sessionA.topic}</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-mono">{comparison.sessionA.overallScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="text-xs text-slate-400">
                  Level: <span className="text-slate-200 font-semibold">{comparison.sessionA.performanceLevel}</span>
                </div>
                <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Pace: {comparison.sessionA.wpm} WPM</span>
                  <span>Fillers: {comparison.sessionA.fillerCount}</span>
                </div>
              </div>

              {/* Session B */}
              <div className="p-5 rounded-2xl bg-navy-900/60 border border-accent-blue/30 space-y-3">
                <div className="flex items-center justify-between text-xs text-accent-blue">
                  <span className="font-semibold uppercase tracking-wider">Comparison Session</span>
                  <span>{new Date(comparison.sessionB.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{comparison.sessionB.topic}</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-accent-blue font-mono">{comparison.sessionB.overallScore}</span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="text-xs text-slate-400">
                  Level: <span className="text-accent-cyan font-semibold">{comparison.sessionB.performanceLevel}</span>
                </div>
                <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Pace: {comparison.sessionB.wpm} WPM</span>
                  <span>Fillers: {comparison.sessionB.fillerCount}</span>
                </div>
              </div>

            </div>
          </div>

          {/* 8-Dimension Comparative Matrix */}
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">8-Dimension Rubric Evolution</h3>
                <p className="text-xs text-slate-400">Comparative breakdown across all recruitment evaluation criteria</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-900 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-navy-800">
                  <tr>
                    <th className="py-3 px-4">Rubric Dimension</th>
                    <th className="py-3 px-4 text-center">Baseline Score</th>
                    <th className="py-3 px-4 text-center">Target Score</th>
                    <th className="py-3 px-4 text-center">Progression Delta</th>
                    <th className="py-3 px-4 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-850">
                  {comparison.dimensionDeltas.map((d) => (
                    <tr key={d.dimensionId} className="hover:bg-navy-900/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {d.name}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {d.scoreA}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {d.scoreB}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          d.delta > 0 
                            ? 'text-emerald-400' 
                            : d.delta < 0 
                              ? 'text-rose-400' 
                              : 'text-slate-400'
                        }`}>
                          {d.delta > 0 ? `+${d.delta}` : d.delta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'Improved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : d.status === 'Declined'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-navy-800 text-slate-400'
                        }`}>
                          {d.status === 'Improved' && <TrendingUp className="w-3 h-3" />}
                          {d.status === 'Declined' && <TrendingDown className="w-3 h-3" />}
                          {d.status === 'Maintained' && <Minus className="w-3 h-3" />}
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Speech Clarity & Cadence Deltas */}
          {comparison.speechDeltas && comparison.speechDeltas.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <Activity className="w-4 h-4 text-accent-cyan" />
                Speech Delivery & Pacing Comparison
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {comparison.speechDeltas.map((s, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{s.metric}</span>
                      <span className="font-mono font-bold text-accent-blue">{s.delta}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Baseline: {s.valA}</span>
                      <span>Target: {s.valB}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-navy-850">
                      {s.interpretation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Strategic Takeaways */}
          {comparison.keyTakeaways && comparison.keyTakeaways.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <Zap className="w-4 h-4 text-amber-400" />
                Progression Analysis & Panel Takeaways
              </div>

              <div className="space-y-2.5">
                {comparison.keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-navy-900/60 border border-navy-850 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
