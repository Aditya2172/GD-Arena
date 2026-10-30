import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Mic, 
  Square, 
  CheckCircle2, 
  RotateCcw, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Lightbulb,
  Award,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { api } from '../services/api';
import { ImprovementExercise, SessionReport } from '../types';

interface ImprovementPlanPageProps {
  onStartDiscussion?: (topic?: string) => void;
}

const DEFAULT_DRILLS: ImprovementExercise[] = [
  {
    id: 'drill-opening-statement',
    title: '20-Second High-Impact Opening Hook',
    focusArea: 'Leadership Initiative & Content Clarity',
    durationSeconds: 20,
    instructions: 'Open the GD decisively. Hook the room with a definition or striking statistic, state your thesis, and outline two pillars in exactly 20 seconds.',
    drillPrompt: 'Topic: "The Gig Economy: Freedom of enterprise or digital exploitation of young workers?"',
    frameworkOrTip: 'Hook (5s) -> Clear Thesis (5s) -> 2 Pillars / Scope (10s). Avoid: "Hello everyone, my name is..."'
  },
  {
    id: 'drill-prep-framework',
    title: 'PREP Framework Intervention Drill',
    focusArea: 'Logical Reasoning & Argument Structure',
    durationSeconds: 45,
    instructions: 'Deliver a structured 45-second placement intervention using Point, Reason, Example, Point.',
    drillPrompt: 'Topic: "Should tech companies mandate 5-day return-to-office policies?"',
    frameworkOrTip: 'P (Point): State your direct stance -> R (Reason): The underlying economic or human rationale -> E (Example): Real-world precedent or data -> P (Point): Reaffirm your conclusion.'
  },
  {
    id: 'drill-pause-control',
    title: '1-Minute Deliberate Pause Challenge',
    focusArea: 'Fluency & Verbal Filler Elimination',
    durationSeconds: 60,
    instructions: 'Speak continuously for 60 seconds without saying "um", "uh", "basically", "actually", or "like". Replace hesitation sounds with 1-second deliberate silent pauses.',
    drillPrompt: 'Topic: "Explain how artificial intelligence will transform Indian public healthcare infrastructure."',
    frameworkOrTip: 'When searching for your next clause, close your lips and take a breath. Evaluators perceive silent pauses as composure, while fillers project nervous anxiety.'
  },
  {
    id: 'drill-constructive-rebuttal',
    title: 'The Diplomatic Rebuttal Drill',
    focusArea: 'Listening, Teamwork & Leadership',
    durationSeconds: 30,
    instructions: 'Counter an aggressive or opposing argument gracefully without sounding combative. Acknowledge their perspective, introduce counter-evidence, and reframe the topic.',
    drillPrompt: 'Opposing Argument: "Remote work makes young engineers lazy and eliminates team collaboration completely."',
    frameworkOrTip: 'Acknowledge ("While collaborative friction is a valid concern...") -> Transition ("However, productivity telemetry shows...") -> Reframe ("A hybrid structure preserves mentoring while enabling deep focus.")'
  }
];

export const ImprovementPlanPage: React.FC<ImprovementPlanPageProps> = ({ onStartDiscussion }) => {
  const [exercises, setExercises] = useState<ImprovementExercise[]>(DEFAULT_DRILLS);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [priorityWeaknesses, setPriorityWeaknesses] = useState<string[]>([]);
  const [recommendedNextTopic, setRecommendedNextTopic] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Active Drill Run State
  const [isRecording, setIsRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(DEFAULT_DRILLS[0].durationSeconds);
  const [recordedSpeech, setRecordedSpeech] = useState<string>('');
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [detectedFillers, setDetectedFillers] = useState<string[]>([]);
  const [savingCompletion, setSavingCompletion] = useState(false);

  const activeExercise = exercises[activeExerciseIndex] || DEFAULT_DRILLS[0];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load completed exercises
        const completedRes = await api.getCompletedExercises().catch(() => ({ completed: [] }));
        setCompletedIds(new Set(completedRes.completed || []));

        // Load latest session report to get dynamic personalized recommendations
        const sessionsRes = await api.getSessions().catch(() => ({ sessions: [] }));
        if (sessionsRes.sessions && sessionsRes.sessions.length > 0) {
          const latestId = sessionsRes.sessions[0].id;
          const reportRes = await api.getReport(latestId).catch(() => null);
          if (reportRes && reportRes.report) {
            const r: SessionReport = reportRes.report;
            if (r.improvement_plan) {
              if (r.improvement_plan.priorityWeaknesses?.length) {
                setPriorityWeaknesses(r.improvement_plan.priorityWeaknesses);
              }
              if (r.improvement_plan.recommendedNextTopic) {
                setRecommendedNextTopic(r.improvement_plan.recommendedNextTopic);
              }
              if (r.improvement_plan.recommendedExercises?.length) {
                // Merge with default drills to ensure variety
                const merged = [...DEFAULT_DRILLS];
                r.improvement_plan.recommendedExercises.forEach(rec => {
                  if (!merged.some(m => m.id === rec.id)) {
                    merged.push(rec);
                  }
                });
                setExercises(merged);
              }
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update secondsLeft when changing active exercise
  useEffect(() => {
    setSecondsLeft(activeExercise.durationSeconds);
    setRecordedSpeech('');
    setDrillCompleted(false);
    setDetectedFillers([]);
    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
    }
  }, [activeExerciseIndex]);

  // Countdown timer while recording
  useEffect(() => {
    let interval: any;
    if (isRecording && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            finishDrill();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, secondsLeft]);

  const startDrill = () => {
    setIsRecording(true);
    setRecordedSpeech('');
    setDrillCompleted(false);
    setDetectedFillers([]);
    setSecondsLeft(activeExercise.durationSeconds);

    voiceService.startListening(
      (finalText, interimText) => {
        setRecordedSpeech(finalText || interimText);
      },
      (err) => {
        console.warn('Drill speech recognition warning:', err);
        finishDrill();
      },
      () => {
        setIsRecording(false);
      }
    );
  };

  const finishDrill = () => {
    voiceService.stopListening();
    setIsRecording(false);
    setDrillCompleted(true);

    // Analyze fillers in recorded text
    const fillers: string[] = [];
    const lower = recordedSpeech.toLowerCase();
    ['um', 'uh', 'basically', 'actually', 'like', 'you know'].forEach(f => {
      const regex = new RegExp(`\\b${f}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        matches.forEach(() => fillers.push(f));
      }
    });
    setDetectedFillers(fillers);
  };

  const handleMarkComplete = async () => {
    try {
      setSavingCompletion(true);
      await api.completeExercise(activeExercise.id);
      setCompletedIds(prev => new Set([...prev, activeExercise.id]));
    } catch (err) {
      console.error('Failed to mark exercise complete:', err);
    } finally {
      setSavingCompletion(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" /> High-Intensity Skill Micro-Drills
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Placement Improvement Lab & Drills
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Targeted micro-drills designed to address evaluator rubrics: master 20-second opening hooks, PREP structured interventions, pause cadence, and diplomatic rebuttals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-navy-900 border border-navy-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-blue/20 text-accent-blue flex items-center justify-center font-bold">
                {completedIds.size}/{exercises.length}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-white block">Drills Mastered</span>
                <span className="text-slate-400">Target: 4 placement drills</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weakness Banner (if populated from report) */}
      {priorityWeaknesses.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
            <Target className="w-4 h-4" /> Evaluator-Identified Priority Focus Areas
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {priorityWeaknesses.map((w, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-navy-950/80 border border-amber-500/30 text-xs text-amber-200 font-medium">
                • {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Drill Selector on Left, Interactive Runner on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Drill Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-navy-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent-blue" />
              Practice Modules
            </h2>
            <span className="text-xs text-slate-400">{exercises.length} available</span>
          </div>

          <div className="space-y-3">
            {exercises.map((drill, idx) => {
              const isSelected = idx === activeExerciseIndex;
              const isDone = completedIds.has(drill.id);

              return (
                <div
                  key={drill.id}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected 
                      ? 'bg-navy-850 border-accent-blue shadow-lg shadow-accent-blue/10' 
                      : 'bg-navy-950 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-900 text-accent-blue border border-navy-800">
                          {drill.focusArea}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {drill.durationSeconds}s
                        </span>
                      </div>
                      <h3 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {drill.title}
                      </h3>
                    </div>

                    {isDone ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">0/{drill.durationSeconds}s</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {drill.instructions}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Drill Runner (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 space-y-6 shadow-xl">
            
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 border-b border-navy-850 pb-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-cyan">
                  {activeExercise.focusArea}
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  {activeExercise.title}
                </h2>
              </div>

              {/* Countdown circle */}
              <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-mono font-bold border transition-colors ${
                isRecording 
                  ? secondsLeft <= 5 
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse' 
                    : 'bg-accent-blue/10 border-accent-blue text-accent-blue' 
                  : 'bg-navy-900 border-navy-800 text-white'
              }`}>
                <span className="text-xl">{secondsLeft}s</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">Timer</span>
              </div>
            </div>

            {/* Drill Prompt */}
            <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Drill Prompt
              </span>
              <p className="text-sm font-semibold text-slate-100">
                {activeExercise.drillPrompt}
              </p>
            </div>

            {/* Framework & Guidelines */}
            <div className="p-4 rounded-2xl bg-navy-900/40 border border-navy-850 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Evaluator Recommended Structure
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeExercise.frameworkOrTip}
              </p>
            </div>

            {/* Live Audio Transcript Box */}
            {recordedSpeech && (
              <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Recorded Speech Transcript:
                </span>
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{recordedSpeech}"
                </p>
              </div>
            )}

            {/* Recording Controls */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {!isRecording ? (
                <button
                  onClick={startDrill}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-accent-blue/20 flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Mic className="w-4 h-4" /> Start Drill ({activeExercise.durationSeconds}s)
                </button>
              ) : (
                <button
                  onClick={finishDrill}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" /> Finish Speaking
                </button>
              )}

              {drillCompleted && (
                <button
                  onClick={startDrill}
                  className="px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-try Drill
                </button>
              )}

              <button
                onClick={handleMarkComplete}
                disabled={savingCompletion || completedIds.has(activeExercise.id)}
                className={`ml-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  completedIds.has(activeExercise.id)
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                    : 'bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-750 hover:border-emerald-500/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{completedIds.has(activeExercise.id) ? 'Mastered & Verified' : 'Mark as Mastered'}</span>
              </button>
            </div>

            {/* Drill Results / Feedback */}
            {drillCompleted && (
              <div className="pt-4 border-t border-navy-850 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Verbal Fillers Detected</span>
                  <div className="text-xl font-bold font-mono text-amber-400">
                    {detectedFillers.length}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {detectedFillers.length === 0 ? 'Flawless cadence without filler sounds.' : detectedFillers.join(', ')}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Intervention Assessment</span>
                  <p className="text-xs text-slate-300 mt-1">
                    {recordedSpeech.length > 50 
                      ? 'Solid substantive intervention. Review your opening hook and ensure you finished within the target window.' 
                      : 'Intervention was brief. Focus on sustaining momentum through the full target time.'}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Next Recommended GD Banner */}
          {recommendedNextTopic && onStartDiscussion && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-blue/10 to-accent-violet/10 border border-accent-blue/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                  Next Recommended Practice Discussion
                </span>
                <h4 className="text-sm font-bold text-white">
                  "{recommendedNextTopic}"
                </h4>
                <p className="text-xs text-slate-300">
                  Put your newly drilled frameworks into action with live AI participants.
                </p>
              </div>

              <button
                onClick={() => onStartDiscussion(recommendedNextTopic)}
                className="px-4 py-2.5 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold text-xs flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-accent-blue/20"
              >
                <span>Launch GD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
