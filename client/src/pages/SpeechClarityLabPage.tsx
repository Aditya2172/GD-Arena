import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  RotateCcw, 
  TrendingUp,
  Clock,
  Gauge
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { api } from '../services/api';
import { SessionReport } from '../types';

export const SpeechClarityLabPage: React.FC = () => {
  const [latestReport, setLatestReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Live Pacing Tester States
  const [isTesting, setIsTesting] = useState(false);
  const [testSpeech, setTestSpeech] = useState('');
  const [testSeconds, setTestSeconds] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testWpm, setTestWpm] = useState(0);
  const [testFillers, setTestFillers] = useState<string[]>([]);

  useEffect(() => {
    async function loadLatestMetrics() {
      try {
        setLoading(true);
        const res = await api.getSessions();
        if (res.sessions.length > 0) {
          const reportRes = await api.getReport(res.sessions[0].id).catch(() => null);
          if (reportRes) setLatestReport(reportRes.report);
        }
      } finally {
        setLoading(false);
      }
    }
    loadLatestMetrics();
  }, []);

  // Timer for pacing test
  useEffect(() => {
    let interval: any;
    if (isTesting) {
      interval = setInterval(() => {
        setTestSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTesting]);

  const startPacingTest = () => {
    setIsTesting(true);
    setTestSpeech('');
    setTestSeconds(0);
    setTestCompleted(false);
    setTestFillers([]);

    voiceService.startListening(
      (finalText, interimText) => {
        setTestSpeech(finalText || interimText);
      },
      (err) => {
        console.warn('Pacing test error:', err);
        stopPacingTest();
      },
      () => {
        setIsTesting(false);
      }
    );
  };

  const stopPacingTest = () => {
    voiceService.stopListening();
    setIsTesting(false);
    setTestCompleted(true);

    const words = testSpeech.trim().split(/\s+/).filter(Boolean);
    const minutes = Math.max(0.1, testSeconds / 60);
    const calculatedWpm = Math.round(words.length / minutes);
    setTestWpm(calculatedWpm);

    // Detect fillers
    const fillersFound: string[] = [];
    const lower = testSpeech.toLowerCase();
    ['um', 'uh', 'basically', 'actually', 'like', 'you know'].forEach(f => {
      const matches = lower.match(new RegExp(`\\b${f}\\b`, 'gi'));
      if (matches) {
        matches.forEach(() => fillersFound.push(f));
      }
    });
    setTestFillers(fillersFound);
  };

  const samplePrompt = "Explain why sustainable corporate governance matters for long-term stakeholder value in engineering firms.";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="border-b border-navy-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" /> Speech Science & Delivery Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Speech Clarity Lab
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Measure speaking pace (WPM), suppress verbal crutches, and practice cadence control.
          </p>
        </div>
      </div>

      {/* Target Placement Benchmark Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Optimal Speaking Pace</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            110 – 150 <span className="text-sm font-normal text-slate-400">WPM</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The ideal conversational pace for placement interviews: allows evaluators to absorb complex points without cognitive fatigue.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Filler Word Threshold</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            &lt; 2 <span className="text-sm font-normal text-slate-400">per 100 words</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Candidates who limit verbal fillers (um, basically, like) project decisive authority and structured mental discipline.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Pause Strategy</span>
            <Clock className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-3xl font-extrabold text-accent-blue font-mono">
            1.0 – 1.5 <span className="text-sm font-normal text-slate-400">sec</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A silent deliberate pause before answering or transitioning signals calm reflection rather than nervous hesitation.
          </p>
        </div>

      </div>

      {/* Interactive Live Pacing Tester */}
      <section className="rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 border border-navy-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-850 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 text-accent-blue border border-accent-blue/20 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Pacing Diagnostic
            </div>
            <h2 className="text-lg font-bold text-white">Live Microphone Delivery Tester</h2>
            <p className="text-xs text-slate-400">
              Read or respond to the sample prompt below for 30–60 seconds to measure your live speaking cadence.
            </p>
          </div>

          <div className="font-mono text-xl font-bold text-white bg-navy-900 px-4 py-2 rounded-xl border border-navy-750">
            ⏱️ {testSeconds}s
          </div>
        </div>

        {/* Practice Prompt Box */}
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan">Speaking Prompt:</span>
          <p className="italic">"{samplePrompt}"</p>
        </div>

        {/* Live speech output */}
        {testSpeech && (
          <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-blue">Live Transcribed Speech:</span>
            <p className="text-xs text-slate-300 italic">{testSpeech}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {!isTesting ? (
            <button
              onClick={startPacingTest}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-accent-blue/20 flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Mic className="w-4 h-4" /> Start Pacing Test
            </button>
          ) : (
            <button
              onClick={stopPacingTest}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2 animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" /> Finish & Measure Pacing
            </button>
          )}

          {testCompleted && (
            <button
              onClick={startPacingTest}
              className="px-4 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
        </div>

        {/* Test Result Cards */}
        {testCompleted && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-navy-850">
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Measured Pacing</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {testWpm} <span className="text-xs text-slate-500">WPM</span>
              </div>
              <span className={`text-xs font-semibold ${
                testWpm >= 110 && testWpm <= 150 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {testWpm >= 110 && testWpm <= 150 ? 'Optimal Pacing' : testWpm < 110 ? 'Slightly Slow' : 'Slightly Rushed'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Filler Words Detected</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {testFillers.length}
              </div>
              <span className="text-xs text-slate-400">
                {testFillers.length === 0 ? 'Clean verbal delivery!' : testFillers.join(', ')}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Recommendation</span>
              <p className="text-xs text-slate-300 mt-1">
                {testFillers.length > 2 
                  ? 'Focus on replacing filler words with deliberate silent pauses.' 
                  : testWpm < 110 
                    ? 'Increase forward momentum between connecting clauses.' 
                    : 'Pacing is crisp, measured, and well suited for recruitment rounds.'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Honest Technical Pronunciation Assessment Section */}
      <section className="p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <HelpCircle className="w-5 h-5 text-accent-blue" />
          Technical Standard: Pronunciation & Accent Assessment
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          GD Arena prioritizes <strong>effective communication, articulate reasoning, and structured thought</strong>. 
          We do not penalize acceptable regional variations or Indian English varieties. 
          True phoneme-level acoustic pronunciation scoring requires specialized acoustic machine learning models (such as Azure Speech Pronunciation Assessment or Whisper acoustic alignment). 
          Our platform will never fabricate arbitrary pronunciation marks from ordinary speech-to-text transcripts.
        </p>
      </section>

    </div>
  );
};
