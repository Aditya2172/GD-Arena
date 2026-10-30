import React, { useEffect, useState } from 'react';
import { 
  Award, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Sparkles, 
  FileText, 
  RefreshCw,
  Loader2,
  Calendar,
  Layers,
  HelpCircle,
  Mic,
  MessageSquare,
  Users,
  Brain,
  Quote,
  ShieldCheck,
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';
import { api } from '../services/api';
import { SessionReport, DiscussionSession, DimensionEvaluation, EvaluatorPerspective } from '../types';
import { ScoreRadarChart } from '../components/analytics/ScoreRadarChart';

interface ReportPageProps {
  sessionId: string;
  onBackToDashboard: () => void;
  onStartNewDiscussion: () => void;
  onLaunchExercise?: (exerciseId: string) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  sessionId,
  onBackToDashboard,
  onStartNewDiscussion,
  onLaunchExercise
}) => {
  const [report, setReport] = useState<SessionReport | null>(null);
  const [session, setSession] = useState<DiscussionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>('placement_panel');

  useEffect(() => {
    async function fetchReport() {
      try {
        setLoading(true);
        const sessionRes = await api.getSession(sessionId);
        setSession(sessionRes.session);

        const reportRes = await api.generateReport(sessionId);
        setReport(reportRes.report);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve performance assessment report.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [sessionId]);

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
        <p className="text-sm font-semibold text-slate-300">
          Generating Placement Panel 8-Dimension Evaluation...
        </p>
        <p className="text-xs text-slate-500">
          Executing multi-evaluator reasoning passes and evidence-backed extraction
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-navy-950 border border-navy-800 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Report Generation Issue</h3>
        <p className="text-xs text-slate-400">{error || 'No report found.'}</p>
        <button
          onClick={onBackToDashboard}
          className="px-6 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // 8 Dimension Radar Data
  const radarData = report.dimension_evaluations && report.dimension_evaluations.length > 0
    ? report.dimension_evaluations.map(d => ({
        metric: d.name.split(' ')[0],
        score: d.score,
        fullMark: 100
      }))
    : [
        { metric: 'Content', score: report.scores.content_logic || 70, fullMark: 100 },
        { metric: 'Clarity', score: report.scores.communication_clarity || 70, fullMark: 100 },
        { metric: 'Fluency', score: report.scores.fluency_delivery || 70, fullMark: 100 },
        { metric: 'Vocabulary', score: report.scores.vocabulary_language || 70, fullMark: 100 },
        { metric: 'Grammar', score: report.scores.grammar_syntax || 70, fullMark: 100 },
        { metric: 'Teamwork', score: report.scores.listening_teamwork || 70, fullMark: 100 },
        { metric: 'Leadership', score: report.scores.leadership_initiative || 70, fullMark: 100 },
        { metric: 'Evidence', score: report.scores.relevance_evidence || 70, fullMark: 100 }
      ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Strong':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Competent':
        return 'bg-accent-blue/20 text-accent-blue border-accent-blue/30';
      case 'Developing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  const isLowParticipation = report.overall_score < 40;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 print:p-0 print:max-w-full">
      
      {/* Top Action Nav */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-200 text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF Report
          </button>
          <button
            onClick={onStartNewDiscussion}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white text-xs font-semibold shadow-md transition-transform hover:scale-105"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Practice Another Topic
          </button>
        </div>
      </div>

      {/* Insufficient data notification banner */}
      {isLowParticipation && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold">Limited Transcript Detected</h4>
            <p className="text-slate-300">
              Only a minimal number of candidate utterances were recorded during this session. To generate higher-precision scores, aim to speak at least 2 to 3 substantive times in your next session.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION A — OVERALL EVALUATION */}
      {/* ============================================================== */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 border border-navy-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-navy-800/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-accent-blue/10 text-accent-blue font-semibold border border-accent-blue/20">
                Placement Panel Assessment
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-navy-800 text-slate-300 font-mono text-[11px] border border-navy-700">
                Rubric: {report.rubric_version || '2026.1-PlacementStandard'}
              </span>
              <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3" /> {new Date(report.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {session?.topic || 'Discussion Session'}
            </h1>
            <p className="text-xs text-slate-400">
              Assessed across 8 corporate placement dimensions with evidence-backed transcript verification.
            </p>
          </div>

          {/* Overall Score Circle */}
          <div className="flex items-center gap-4 bg-navy-900/90 border border-navy-750 p-4 rounded-2xl shadow-inner">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Final Weighted Score</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {report.overall_score}<span className="text-sm text-slate-500">/100</span>
              </div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadge(report.performance_level || 'Competent')}`}>
                {report.performance_level || 'Competent'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 flex items-center justify-center font-bold text-lg">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-850 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-accent-blue" />
            Executive Panel Summary
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {report.discussion_summary}
          </p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION B — EIGHT-DIMENSION EVALUATION RUBRIC */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-accent-blue" />
              Section B — Placement Panel Eight-Dimension Rubric
            </h2>
            <p className="text-xs text-slate-400">
              Final score calculated programmatically: Sum of (Dimension Score × Dimension Weight)
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Total Weight: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Table / Cards of 8 Dimensions */}
          <div className="lg:col-span-8 space-y-3">
            {report.dimension_evaluations && report.dimension_evaluations.length > 0 ? (
              report.dimension_evaluations.map((dim) => (
                <div 
                  key={dim.id}
                  className="p-4 rounded-2xl bg-navy-950 border border-navy-800 hover:border-navy-700 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{dim.name}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Weight: {Math.round(dim.weight * 100)}% • Contributed: +{dim.weightedContribution} pts
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadge(dim.performanceLevel)}`}>
                        {dim.performanceLevel}
                      </span>
                      <span className="font-mono text-base font-extrabold text-white">
                        {dim.score}<span className="text-xs text-slate-500">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-navy-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-violet transition-all duration-700"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {dim.explanation}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-400">Loading dimensions...</div>
            )}
          </div>

          {/* Radar Visualization */}
          <div className="lg:col-span-4 p-5 rounded-3xl bg-navy-950 border border-navy-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Competency Balance Radar</h3>
              <p className="text-xs text-slate-400">Visual balance across all 8 evaluation criteria</p>
            </div>
            
            <ScoreRadarChart data={radarData} />

            <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-navy-850">
              Balanced radar coverage reflects high campus placement readiness.
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION C — EVIDENCE-BASED MARKING (THE CORE DIFFERENTIATOR) */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="border-b border-navy-800 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 text-accent-violet text-xs font-semibold mb-1">
            <Quote className="w-3.5 h-3.5" /> Core Product Differentiator
          </div>
          <h2 className="text-lg font-bold text-white">
            Section C — Evidence-Based Marking
          </h2>
          <p className="text-xs text-slate-400">
            Every score is anchored in actual verbatim statements spoken by the candidate in the transcript.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.evidence_findings && report.evidence_findings.length > 0 ? (
            report.evidence_findings.map((finding) => (
              <div 
                key={finding.id}
                className="p-5 rounded-2xl bg-navy-950 border border-navy-800 hover:border-accent-violet/30 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-navy-850 text-accent-blue border border-navy-750 font-semibold text-[10px]">
                      {finding.category}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Confidence: {finding.confidence}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-900 border border-navy-850 italic text-xs text-slate-300">
                    <p className="text-slate-400 text-[10px] not-italic mb-1 font-semibold uppercase tracking-wider">
                      Observed Candidate Statement {finding.turnSequence ? `(Turn #${finding.turnSequence})` : ''}:
                    </p>
                    {finding.transcriptExcerpt}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-white font-medium">
                      <span className="text-amber-400 font-semibold">Observation: </span>
                      {finding.observation}
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      <span className="text-slate-300 font-semibold">Why It Matters in GD: </span>
                      {finding.whyItMatters}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-navy-900 text-xs text-accent-cyan font-medium flex items-start gap-1.5">
                  <span className="text-accent-cyan font-bold">Actionable Fix:</span>
                  <span>{finding.suggestedImprovement}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-xs text-slate-400">No specific evidence findings recorded.</div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION D — SPEECH & LANGUAGE (COACH & CLARITY LAB) */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="border-b border-navy-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-accent-cyan" />
            Section D — Speech Clarity & Language Coach
          </h2>
          <p className="text-xs text-slate-400">
            Measurable speaking rate, verbal filler detection, and professional sentence rewrites.
          </p>
        </div>

        {/* Speech Clarity Meter Cards */}
        {report.speech_clarity && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Speaking Rate</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {report.speech_clarity.speakingRateWpm} <span className="text-xs text-slate-500">WPM</span>
              </div>
              <span className="text-[11px] text-accent-blue font-semibold">
                Status: {report.speech_clarity.rateStatus} (Target: 110–150 WPM)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Filler Words</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {report.speech_clarity.fillerWordsCount}
              </div>
              <span className="text-[11px] text-slate-400">
                {report.speech_clarity.fillerWordsFrequencyPer100Words} per 100 spoken words
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Total Words</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {report.speech_clarity.totalWordsSpoken}
              </div>
              <span className="text-[11px] text-slate-400">
                Across {report.speech_clarity.speakingDurationMinutes}m speaking airtime
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Pacing Diagnosis</span>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                {report.speech_clarity.pauseHesitationNote}
              </p>
            </div>

          </div>
        )}

        {/* Honest Pronunciation Disclosure Box */}
        {report.speech_clarity?.pronunciationNote && (
          <div className="p-4 rounded-2xl bg-navy-900/60 border border-navy-850 flex items-start gap-3 text-xs text-slate-400">
            <HelpCircle className="w-4 h-4 text-accent-blue flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Technical Note on Pronunciation: </span>
              {report.speech_clarity.pronunciationNote}
            </div>
          </div>
        )}

        {/* Vocabulary & Language Coach Before/After Rewrites */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-blue" />
            Vocabulary & Language Coach — Recommended Rewrites
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.language_recommendations && report.language_recommendations.length > 0 ? (
              report.language_recommendations.map((rec) => (
                <div 
                  key={rec.id}
                  className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                      Original Expression
                    </span>
                    <span className="text-slate-500 uppercase font-semibold text-[10px]">
                      {rec.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic line-through decoration-rose-500/50">
                    "{rec.originalExpression}"
                  </p>

                  <div className="pt-2 border-t border-navy-850 space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                      Suggested Placement Alternative
                    </span>
                    <p className="text-xs font-semibold text-white">
                      "{rec.suggestedAlternative}"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      <span className="text-accent-blue font-medium">Why it helps: </span>
                      {rec.whyItHelps}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-400">Language recommendations generated based on transcript analysis.</div>
            )}
          </div>
        </div>

      </section>

      {/* ============================================================== */}
      {/* SECTION E — SEVEN EVALUATOR PERSPECTIVES */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="border-b border-navy-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-violet" />
            Section E — Seven Independent Evaluator Perspectives
          </h2>
          <p className="text-xs text-slate-400">
            Simulated independent feedback from each specialist evaluator on the placement panel.
          </p>
        </div>

        {report.evaluator_perspectives && report.evaluator_perspectives.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left selector */}
            <div className="md:col-span-4 space-y-2">
              {report.evaluator_perspectives.map((evaluator) => (
                <button
                  key={evaluator.id}
                  onClick={() => setSelectedEvaluator(evaluator.id)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedEvaluator === evaluator.id 
                      ? 'bg-navy-850 border-accent-blue text-white shadow-md' 
                      : 'bg-navy-950 border-navy-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold truncate">{evaluator.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{evaluator.evaluatorTitle}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadge(evaluator.performanceLevel)}`}>
                    {evaluator.score}
                  </span>
                </button>
              ))}
            </div>

            {/* Right detailed critique */}
            <div className="md:col-span-8 p-6 rounded-2xl bg-navy-950 border border-navy-800 space-y-4">
              {(() => {
                const active = report.evaluator_perspectives.find(e => e.id === selectedEvaluator) || report.evaluator_perspectives[0];
                return (
                  <>
                    <div className="flex items-center justify-between border-b border-navy-850 pb-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{active.name}</h4>
                        <p className="text-xs text-accent-blue font-medium">{active.evaluatorTitle}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getLevelBadge(active.performanceLevel)}`}>
                        Rating: {active.score}/100 • {active.performanceLevel}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Focus Area:</span>
                      <p className="text-slate-300">{active.focusArea}</p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Evaluator Critique:</span>
                      <p className="text-sm text-slate-200 leading-relaxed bg-navy-900 p-3.5 rounded-xl border border-navy-850">
                        "{active.critique}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-navy-850 flex items-center gap-2 text-xs">
                      <span className="text-accent-cyan font-bold">Priority Takeaway:</span>
                      <span className="text-slate-300">{active.priorityTakeaway}</span>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* SECTION F — PERSONALIZED IMPROVEMENT PLAN */}
      {/* ============================================================== */}
      <section className="space-y-6">
        <div className="border-b border-navy-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            Section F — Personalized Improvement Plan & Micro-Drills
          </h2>
          <p className="text-xs text-slate-400">
            Targeted drills recommended based on your lowest scoring rubric dimensions.
          </p>
        </div>

        {/* Priority Weaknesses */}
        {report.improvement_plan && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              3 Highest-Priority Placement Weaknesses Identified:
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.improvement_plan.priorityWeaknesses.map((weakness, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 rounded-lg bg-navy-950 border border-amber-500/30 text-xs font-semibold text-white"
                >
                  #{i + 1} {weakness}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Micro-Drills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.improvement_plan?.recommendedExercises.map((drill) => (
            <div 
              key={drill.id}
              className="p-5 rounded-2xl bg-navy-950 border border-navy-800 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                    {drill.focusArea}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    ⏱️ {drill.durationSeconds}s drill
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{drill.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{drill.instructions}</p>
                
                <div className="p-3 rounded-xl bg-navy-900 border border-navy-850 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Prompt: </span>
                  {drill.drillPrompt}
                </div>
              </div>

              <div className="pt-2 border-t border-navy-900 flex items-center justify-between">
                <span className="text-[11px] text-accent-blue font-mono">{drill.frameworkOrTip}</span>
                {onLaunchExercise && (
                  <button
                    onClick={() => onLaunchExercise(drill.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Start Drill <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3 Goals for next session */}
        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-accent-blue">
            3 Actionable Commitments for Your Next Practice Discussion:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.next_session_goals.map((goal, idx) => (
              <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-navy-900 border border-navy-850 text-xs">
                <div className="w-6 h-6 rounded-lg bg-accent-blue/20 text-accent-blue font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <span className="text-slate-200 font-medium">{goal}</span>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};
