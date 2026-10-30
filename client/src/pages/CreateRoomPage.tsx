import React, { useState } from 'react';
import { 
  Mic, 
  Settings2, 
  Users, 
  Clock, 
  BarChart, 
  Brain, 
  Flame, 
  Sparkles, 
  Check, 
  ArrowRight,
  MessageSquare,
  Briefcase,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { AIPersonalityId } from '../types';

interface CreateRoomPageProps {
  initialTopic?: string;
  onRoomCreated: (sessionId: string) => void;
  onCancel: () => void;
}

export const CreateRoomPage: React.FC<CreateRoomPageProps> = ({ 
  initialTopic = '', 
  onRoomCreated,
  onCancel 
}) => {
  const PRESET_TOPICS = [
    'AI and the Future of Jobs',
    'Social Media: Advantages and Disadvantages',
    'Should College Education Be Free?',
    'Climate Change and Sustainable Development',
    'Remote Work vs Office Work',
    'Technology in Education',
    'Data Privacy in the Digital Age'
  ];

  const [topicType, setTopicType] = useState<'preset' | 'custom'>(
    initialTopic && !PRESET_TOPICS.includes(initialTopic) ? 'custom' : 'preset'
  );
  const [selectedTopic, setSelectedTopic] = useState(
    initialTopic || PRESET_TOPICS[0]
  );
  const [customTopic, setCustomTopic] = useState(
    initialTopic && !PRESET_TOPICS.includes(initialTopic) ? initialTopic : ''
  );

  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [duration, setDuration] = useState<5 | 10 | 15>(5);
  const [participantCount, setParticipantCount] = useState<2 | 3 | 4>(3);
  const [discussionStyle, setDiscussionStyle] = useState<
    'Placement preparation' | 'College debate' | 'General awareness' | 'Professional communication'
  >('Placement preparation');

  const [selectedPersonalities, setSelectedPersonalities] = useState<AIPersonalityId[]>([
    'analytical',
    'devils_advocate',
    'collaborative'
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PERSONALITIES: { id: AIPersonalityId; name: string; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'analytical',
      name: 'Dr. Aarav Mehta',
      title: 'The Analytical Thinker',
      desc: 'Uses logical reasoning, structured frameworks, and empirical examples.',
      icon: Brain,
      color: 'text-accent-cyan'
    },
    {
      id: 'devils_advocate',
      name: 'Rohan Verma',
      title: "The Devil's Advocate",
      desc: 'Challenges assumptions, introduces counterarguments, and probes weak points.',
      icon: Flame,
      color: 'text-amber-400'
    },
    {
      id: 'collaborative',
      name: 'Ananya Sharma',
      title: 'Collaborative Communicator',
      desc: 'Builds upon previous arguments, synthesizes views, and encourages balance.',
      icon: Users,
      color: 'text-emerald-400'
    },
    {
      id: 'confident',
      name: 'Vikram Malhotra',
      title: 'The Confident Speaker',
      desc: 'Communicates assertively, presents decisive vision, and uses punchy rhetoric.',
      icon: Sparkles,
      color: 'text-accent-violet'
    },
    {
      id: 'practical',
      name: 'Neha Kulkarni',
      title: 'The Practical Thinker',
      desc: 'Evaluates implementation costs, execution feasibility, and resource constraints.',
      icon: Briefcase,
      color: 'text-orange-400'
    },
    {
      id: 'synthesizer',
      name: 'Kabir Sen',
      title: 'The Discussion Synthesizer',
      desc: 'Identifies common ground, resolves conflicts, and structures actionable takeaways.',
      icon: Layers,
      color: 'text-indigo-400'
    }
  ];

  const togglePersonality = (id: AIPersonalityId) => {
    if (selectedPersonalities.includes(id)) {
      if (selectedPersonalities.length <= 2) {
        setError('At least 2 AI participants are required for a group discussion.');
        return;
      }
      setSelectedPersonalities(selectedPersonalities.filter(p => p !== id));
      setParticipantCount(Math.max(2, selectedPersonalities.length - 1) as any);
    } else {
      if (selectedPersonalities.length >= 4) {
        setError('A maximum of 4 AI participants can be in one arena room.');
        return;
      }
      const updated = [...selectedPersonalities, id];
      setSelectedPersonalities(updated);
      setParticipantCount(updated.length as any);
    }
    setError(null);
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const activeTopic = topicType === 'preset' ? selectedTopic : customTopic.trim();
    if (!activeTopic) {
      setError('Please select or specify a discussion topic.');
      return;
    }

    if (selectedPersonalities.length < 2) {
      setError('Please choose at least 2 AI participant personalities.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createSession({
        topic: activeTopic,
        difficulty,
        duration_minutes: duration,
        participant_count: selectedPersonalities.length,
        discussion_style: discussionStyle,
        selected_personalities: selectedPersonalities
      });

      onRoomCreated(res.session.id);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize discussion arena room.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-navy-950/90 rounded-3xl border border-navy-800 p-6 sm:p-10 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="border-b border-navy-800 pb-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold mb-2">
              <Settings2 className="w-3.5 h-3.5" /> Room Configuration
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Create Your Discussion Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Customize the topic, session parameters, and AI participant personas before entering the voice room.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleStart} className="space-y-8">
          
          {/* 1. Topic Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent-blue" />
                1. Select Discussion Topic
              </label>
              <div className="flex rounded-lg bg-navy-900 p-1 border border-navy-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTopicType('preset')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    topicType === 'preset' ? 'bg-navy-800 text-accent-blue' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Curated Presets
                </button>
                <button
                  type="button"
                  onClick={() => setTopicType('custom')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    topicType === 'custom' ? 'bg-navy-800 text-accent-blue' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Custom Topic
                </button>
              </div>
            </div>

            {topicType === 'preset' ? (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white focus:outline-none focus:border-accent-blue"
              >
                {PRESET_TOPICS.map((topic, i) => (
                  <option key={i} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Enter your custom topic (e.g. Impact of Central Bank Digital Currencies)..."
                className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-navy-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
              />
            )}
          </div>

          {/* 2. Grid Parameters: Difficulty, Duration, Discussion Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5 text-accent-blue" /> Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-navy-900 p-1 rounded-xl border border-navy-800">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                      difficulty === lvl ? 'bg-accent-blue text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-violet" /> Session Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-navy-900 p-1 rounded-xl border border-navy-800">
                {([5, 10, 15] as const).map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                      duration === mins ? 'bg-accent-violet text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins} mins
                  </button>
                ))}
              </div>
            </div>

            {/* Discussion Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Discussion Style
              </label>
              <select
                value={discussionStyle}
                onChange={(e) => setDiscussionStyle(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-navy-800 text-xs text-white focus:outline-none focus:border-accent-blue"
              >
                <option value="Placement preparation">Placement preparation</option>
                <option value="College debate">College debate</option>
                <option value="General awareness">General awareness</option>
                <option value="Professional communication">Professional communication</option>
              </select>
            </div>

          </div>

          {/* 3. AI Personalities Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-violet" />
                2. Choose AI Participants ({selectedPersonalities.length} Selected)
              </label>
              <span className="text-xs text-slate-400">Select 2 to 4 personalities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PERSONALITIES.map(({ id, name, title, desc, icon: Icon, color }) => {
                const isSelected = selectedPersonalities.includes(id);

                return (
                  <div
                    key={id}
                    onClick={() => togglePersonality(id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-navy-900 border-accent-blue shadow-lg shadow-accent-blue/10'
                        : 'bg-navy-950/60 border-navy-850 hover:border-navy-750 opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-xl bg-navy-800 ${color} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{name}</h4>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                          isSelected ? 'bg-accent-blue border-accent-blue text-white' : 'border-navy-700'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <p className={`text-xs font-semibold ${color} mt-0.5`}>{title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-navy-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-850 text-slate-400 hover:text-white font-semibold text-sm transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet hover:opacity-95 text-white font-semibold text-sm shadow-xl shadow-accent-blue/20 flex items-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Mic className="w-4 h-4" />
              <span>{isSubmitting ? 'Initializing Room...' : 'Start Discussion Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
