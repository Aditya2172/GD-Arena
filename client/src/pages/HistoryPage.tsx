import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Clock, 
  Award, 
  ArrowRight, 
  FileText, 
  X, 
  Loader2,
  Mic,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { DiscussionSession, DiscussionMessage } from '../types';

interface HistoryPageProps {
  onViewReport: (sessionId: string) => void;
  onStartNew: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ 
  onViewReport, 
  onStartNew 
}) => {
  const [sessions, setSessions] = useState<DiscussionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Transcript Modal state
  const [activeTranscriptSession, setActiveTranscriptSession] = useState<DiscussionSession | null>(null);
  const [modalMessages, setModalMessages] = useState<DiscussionMessage[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.getSessions();
        setSessions(res.sessions);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const openTranscript = async (session: DiscussionSession) => {
    setActiveTranscriptSession(session);
    setModalLoading(true);
    try {
      const data = await api.getSession(session.id);
      setModalMessages(data.messages);
    } catch {
      setModalMessages([]);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.difficulty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-blue uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" /> Practice Records
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Discussion History
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Review past group discussion sessions, audio transcripts, and performance reports.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics or difficulty..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin" />
          <p className="text-xs text-slate-400">Loading historical discussion records...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-navy-950 border border-navy-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-center mx-auto text-slate-400">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No discussion sessions found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? 'No practice records matched your search query.' 
              : 'You have not participated in any discussion arena sessions yet.'}
          </p>
          <button
            onClick={onStartNew}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white text-xs font-semibold shadow-md"
          >
            Start Your First Practice Session
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="p-5 rounded-2xl bg-navy-950 border border-navy-800 hover:border-navy-750 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                    {session.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-850 text-slate-400 border border-navy-800">
                    {session.discussion_style}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white truncate">
                  {session.topic}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent-violet" />
                    {session.duration_minutes} mins duration
                  </span>
                  <span>•</span>
                  <span>{session.participant_count} AI Participants</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-navy-850">
                <button
                  onClick={() => openTranscript(session)}
                  className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-800 text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Transcript</span>
                </button>

                <button
                  onClick={() => onViewReport(session.id)}
                  className="px-4 py-2 rounded-xl bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>View Report</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transcript Review Modal */}
      {activeTranscriptSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-navy-950 rounded-3xl border border-navy-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-navy-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-accent-blue uppercase tracking-wider">Session Transcript</span>
                <h3 className="text-sm font-bold text-white truncate max-w-md">
                  {activeTranscriptSession.topic}
                </h3>
              </div>
              <button
                onClick={() => setActiveTranscriptSession(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
              {modalLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading transcript messages...</div>
              ) : modalMessages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No recorded messages for this session.</div>
              ) : (
                modalMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                      msg.speaker_type === 'user' 
                        ? 'bg-accent-blue/10 border-accent-blue/30 text-white ml-8' 
                        : 'bg-navy-900 border-navy-800 text-slate-300 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className={msg.speaker_type === 'user' ? 'text-accent-blue' : 'text-accent-violet'}>
                        {msg.speaker_name}
                      </span>
                      <span className="text-[10px] text-slate-500">#{msg.sequence_number}</span>
                    </div>
                    <p>{msg.message_text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-navy-800 flex justify-end">
              <button
                onClick={() => setActiveTranscriptSession(null)}
                className="px-4 py-2 rounded-xl bg-navy-900 text-slate-300 text-xs font-semibold hover:bg-navy-850"
              >
                Close Transcript
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
