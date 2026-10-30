import React from 'react';
import { Mic, ShieldCheck, Sparkles, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">GD ARENA</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              "Speak Confidently. Think Critically. Lead Discussions."
              Empowering college students and job seekers with voice-first AI simulations for campus placements.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-accent-blue" /> Speech Privacy Protected</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-accent-violet" /> Multi-Agent AI Personas</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-400" /> Rubric-Based Scoring</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Key Features</h4>
            <ul className="space-y-2 text-xs">
              <li>Voice-First Discussion Rooms</li>
              <li>Multi-Agent Personalities</li>
              <li>Live Turn-Taking Engine</li>
              <li>8-Metric Placement Rubric</li>
              <li>Downloadable PDF Reports</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Practice Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>Placement Preparation</li>
              <li>Technology & Future of Work</li>
              <li>Socio-Economic Debates</li>
              <li>Business Ethics & Leadership</li>
            </ul>
          </div>

        </div>

        <div className="border-t border-navy-850 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GD Arena. Built for campus recruitment readiness.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span>Client-side Web Speech</span>
            <span>•</span>
            <span>Server-side Context Orchestrator</span>
            <span>•</span>
            <span>PostgreSQL Persistence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
