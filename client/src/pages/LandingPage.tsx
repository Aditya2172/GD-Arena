import React from 'react';
import { 
  Mic, 
  Sparkles, 
  Brain, 
  Flame, 
  Users, 
  Volume2, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Shield 
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="space-y-24 py-8">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8 pt-10">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-accent-violet/10 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-850 border border-navy-750 text-xs font-semibold text-slate-300 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          <span>Next-Gen Placement Preparation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
          <span className="text-accent-violet">Voice-First Multi-Agent AI</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Speak Confidently. Think Critically.{' '}
          <span className="bg-gradient-to-r from-accent-blue via-accent-cyan to-accent-violet bg-clip-text text-transparent">
            Lead Discussions.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The voice-first AI platform built for college students preparing for campus recruitment, group discussions, and high-stakes communication rounds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-base shadow-xl shadow-accent-blue/25 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Mic className="w-5 h-5" />
            <span>Start Practising Now</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-750 font-semibold text-base transition-colors"
          >
            Student Sign In
          </button>
        </div>

        {/* Value pills */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Practice Rooms
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Speech-to-Speech Flow
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 8-Metric Placement Rubric
          </span>
        </div>

      </section>

      {/* Interactive Room Preview Visual */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-navy-950/80 rounded-3xl border border-navy-800 p-6 sm:p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-6">
            <div>
              <span className="text-xs uppercase font-semibold text-accent-blue tracking-wider">Live Simulation Preview</span>
              <h3 className="text-lg font-bold text-white">Topic: AI and the Future of Engineering Jobs</h3>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Discussion
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Persona 1 */}
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
              <div className="flex items-center gap-2.5 mb-2">
                <Brain className="w-4 h-4 text-accent-cyan" />
                <span className="text-xs font-bold text-white">Dr. Aarav Mehta</span>
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                "Empirical studies indicate AI automates repetitive syntax generation, but architectural problem-solving remains fundamentally human."
              </p>
            </div>

            {/* Persona 2 */}
            <div className="p-4 rounded-xl bg-navy-850 border border-accent-violet shadow-lg shadow-accent-violet/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Rohan Verma</span>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-accent-violet animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Isn't that overly optimistic? If entry-level code generation is automated, how do junior developers build the foundational intuition to become architects?"
              </p>
            </div>

            {/* Candidate */}
            <div className="p-4 rounded-xl bg-navy-900 border border-accent-blue/40">
              <div className="flex items-center gap-2.5 mb-2">
                <Mic className="w-4 h-4 text-accent-blue" />
                <span className="text-xs font-bold text-accent-blue">Candidate (You)</span>
              </div>
              <p className="text-xs text-slate-400 italic leading-relaxed">
                "I agree that the entry barrier is shifting. Rather than syntax, universities must train engineers on system validation and security audits."
              </p>
            </div>
          </div>

          <div className="bg-navy-900/60 p-4 rounded-xl border border-navy-850 flex items-center justify-between text-xs text-slate-400">
            <span>Dynamic Multi-Agent Turn Engine</span>
            <span className="text-accent-blue font-semibold">Real-time Speech Synthesis & Recognition</span>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent-blue">Structured Workflow</h2>
          <h3 className="text-3xl font-extrabold text-white">How GD Arena Prepares You</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 space-y-4 relative">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 text-accent-blue border border-accent-blue/20 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="text-lg font-bold text-white">Configure Your Arena</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Choose from placement-curated topics (or define your own), set difficulty, and select 2 to 4 AI participants with distinct debate personalities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 space-y-4 relative">
            <div className="w-10 h-10 rounded-xl bg-accent-violet/10 text-accent-violet border border-accent-violet/20 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="text-lg font-bold text-white">Speak Naturally by Voice</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Click Start Speaking, share your points through your microphone, listen to AI agents counter and build upon your arguments in real-time.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 space-y-4 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="text-lg font-bold text-white">Get Placement Rubric Reports</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Receive instant scores across 8 communication metrics, actionable argument rewrites, missed opportunities, and downloadable PDF reports.
            </p>
          </div>

        </div>
      </section>

      {/* 4 Distinct AI Personas Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent-violet">Realistic Diversity</h2>
          <h3 className="text-3xl font-extrabold text-white">Meet Your AI Discussion Peers</h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Simulate real recruitment GDs with participants who challenge, structure, or synthesize thoughts just like real candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-3 hover:border-navy-700 transition-colors">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80" 
                alt="Dr. Aarav Mehta" 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Dr. Aarav Mehta</h4>
                <span className="text-[11px] text-accent-cyan font-medium">The Analytical Thinker</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Relies on empirical frameworks, cause-and-effect reasoning, and structured trade-offs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-3 hover:border-navy-700 transition-colors">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80" 
                alt="Rohan Verma" 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Rohan Verma</h4>
                <span className="text-[11px] text-amber-400 font-medium">The Devil's Advocate</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Challenges consensus, probes hidden assumptions, and asks provocative counter-questions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-3 hover:border-navy-700 transition-colors">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&q=80" 
                alt="Ananya Sharma" 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Ananya Sharma</h4>
                <span className="text-[11px] text-emerald-400 font-medium">Collaborative Communicator</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes diverging arguments, seeks win-win compromises, and encourages balanced floor time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-3 hover:border-navy-700 transition-colors">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80" 
                alt="Vikram Malhotra" 
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="text-sm font-bold text-white">Vikram Malhotra</h4>
                <span className="text-[11px] text-accent-violet font-medium">The Confident Speaker</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delivers decisive, high-energy statements, establishes clear stances, and speaks with punchy conviction.
            </p>
          </div>

        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center bg-gradient-to-br from-navy-950 to-navy-900 border border-navy-800 p-10 rounded-3xl space-y-6">
        <h3 className="text-3xl font-extrabold text-white">
          Ready to Ace Your Next Campus Placement GD?
        </h3>
        <p className="text-slate-300 text-sm max-w-lg mx-auto">
          Start a 5-minute simulated discussion right now. No awkward scheduling with friends needed.
        </p>
        <button
          onClick={onStart}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white font-semibold text-base shadow-xl shadow-accent-blue/30 hover:scale-105 transition-all"
        >
          Enter GD Arena
        </button>
      </section>

    </div>
  );
};
