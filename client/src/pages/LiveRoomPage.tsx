import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import { useAuth } from '../context/AuthContext';
import { 
  DiscussionSession, 
  DiscussionMessage, 
  AIPersonality 
} from '../types';
import { ParticipantCard } from '../components/discussion/ParticipantCard';
import { UserCard } from '../components/discussion/UserCard';
import { DiscussionTimer } from '../components/discussion/DiscussionTimer';
import { LiveTranscript } from '../components/discussion/LiveTranscript';
import { ControlsPanel } from '../components/discussion/ControlsPanel';

interface LiveRoomPageProps {
  sessionId: string;
  onFinishSession: (sessionId: string) => void;
  onExit: () => void;
}

export const LiveRoomPage: React.FC<LiveRoomPageProps> = ({
  sessionId,
  onFinishSession,
  onExit
}) => {
  const { user } = useAuth();
  
  const [session, setSession] = useState<DiscussionSession | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [participants, setParticipants] = useState<AIPersonality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [speakingParticipantId, setSpeakingParticipantId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [finalSpeech, setFinalSpeech] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Timer States
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [totalSeconds, setTotalSeconds] = useState<number>(300);

  // Voice Service Support
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);

  // 1. Initial Load: Fetch Session details and start opening remarks
  useEffect(() => {
    let isMounted = true;

    async function initRoom() {
      try {
        setLoading(true);
        const data = await api.getSession(sessionId);
        if (!isMounted) return;

        setSession(data.session);
        setMessages(data.messages);
        setParticipants(data.participants);

        const durationSec = (data.session.duration_minutes || 5) * 60;
        setSecondsRemaining(durationSec);
        setTotalSeconds(durationSec);

        setIsVoiceSupported(voiceService.isSupported);

        // If there is an opening AI message, speak it aloud to start the session!
        if (data.messages.length > 0 && data.messages[0].speaker_type === 'ai') {
          const first = data.messages[0];
          playAiSpeech(first.message_text, first.personality);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to enter discussion room.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initRoom();

    return () => {
      isMounted = false;
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, [sessionId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || !session) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndDiscussion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, session]);

  // Play AI response through SpeechSynthesis
  const playAiSpeech = (text: string, personalityId?: string) => {
    const participant = participants.find(p => p.id === personalityId);
    setSpeakingParticipantId(personalityId || null);
    setIsSpeakingAI(true);

    voiceService.speak(text, {
      rate: participant?.speechRate || 1.0,
      pitch: participant?.speechPitch || 1.0,
      onStart: () => setIsSpeakingAI(true),
      onEnd: () => {
        setIsSpeakingAI(false);
        setSpeakingParticipantId(null);
      },
      onError: () => {
        setIsSpeakingAI(false);
        setSpeakingParticipantId(null);
      }
    });
  };

  // 3. User Voice Controls
  const handleStartSpeaking = () => {
    if (isMuted) return;
    setMicError(null);
    setInterimSpeech('');
    setFinalSpeech('');

    // Stop ongoing AI audio immediately if user decides to speak
    voiceService.stopSpeaking();
    setIsSpeakingAI(false);
    setSpeakingParticipantId(null);

    voiceService.startListening(
      (finalText, interimText) => {
        setFinalSpeech(finalText);
        setInterimSpeech(interimText || finalText);
      },
      (err) => {
        setMicError(err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    setIsListening(true);
  };

  const handleStopSpeaking = async () => {
    voiceService.stopListening();
    setIsListening(false);

    const userText = (finalSpeech || interimSpeech).trim();
    setInterimSpeech('');
    setFinalSpeech('');

    if (!userText) {
      return;
    }

    // Submit user turn and get AI turn response
    await processConversationTurn(userText);
  };

  const handleSendTypedMessage = async (text: string) => {
    await processConversationTurn(text);
  };

  // Core Orchestration Dispatcher
  const processConversationTurn = async (userText: string) => {
    if (isAiGenerating || !userText.trim()) return;

    try {
      setIsAiGenerating(true);
      setError(null);

      // Optimistically push user message to transcript
      const optimisticUserMsg: DiscussionMessage = {
        id: 'temp-' + Date.now(),
        session_id: sessionId,
        speaker_type: 'user',
        speaker_name: user?.displayName || 'Candidate',
        message_text: userText.trim(),
        sequence_number: messages.length + 1,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticUserMsg]);

      // Request next turn from backend multi-agent orchestrator
      const response = await api.respondTurn(sessionId, userText.trim());

      // Append returned AI message
      setMessages(prev => {
        // filter out optimistic message if server persisted it
        const cleaned = prev.filter(m => m.id !== optimisticUserMsg.id);
        return [...cleaned, optimisticUserMsg, response.message];
      });

      // Speak response aloud
      playAiSpeech(response.message.message_text, response.speaker.id);

    } catch (err: any) {
      setError(err.message || 'Failed to generate AI response. Your contribution was preserved in the transcript.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleStopAudioPlayback = () => {
    voiceService.stopSpeaking();
    setIsSpeakingAI(false);
    setSpeakingParticipantId(null);
  };

  const handleRepeatLastAI = () => {
    const lastAiMsg = [...messages].reverse().find(m => m.speaker_type === 'ai');
    if (lastAiMsg) {
      playAiSpeech(lastAiMsg.message_text, lastAiMsg.personality);
    }
  };

  const handleEndDiscussion = async () => {
    voiceService.stopListening();
    voiceService.stopSpeaking();
    try {
      setLoading(true);
      await api.finishSession(sessionId);
      onFinishSession(sessionId);
    } catch (err: any) {
      setError(err.message || 'Could not conclude session.');
      setLoading(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
        <p className="text-sm font-semibold text-slate-300">
          Entering virtual discussion arena...
        </p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-navy-950 border border-navy-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Discussion Room Error</h3>
        <p className="text-xs text-slate-400">{error || 'Session not found.'}</p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 rounded-xl bg-accent-blue text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      
      {/* Room Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy-950/90 rounded-2xl border border-navy-800 p-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-accent-blue/10 text-accent-blue text-[11px] font-semibold border border-accent-blue/20">
              {session.discussion_style}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Level: {session.difficulty}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              messages.length <= 1 ? 'bg-accent-blue/15 text-accent-blue border-accent-blue/30' :
              messages.length <= 3 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
              messages.length <= 6 ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
              messages.length <= 9 ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
              'bg-accent-violet/15 text-accent-violet border-accent-violet/30'
            }`}>
              Stage: {
                messages.length <= 1 ? 'Topic Introduction' :
                messages.length <= 3 ? 'Initial Viewpoints' :
                messages.length <= 6 ? 'Argument Development' :
                messages.length <= 9 ? 'Counterarguments & Probing' :
                'Synthesis & Consensus'
              }
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
            {session.topic}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <DiscussionTimer 
            secondsRemaining={secondsRemaining} 
            totalSeconds={totalSeconds} 
          />
        </div>
      </div>

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-250px)] min-h-[560px]">
        
        {/* Left Column: Participants (AI + Candidate) */}
        <div className="lg:col-span-4 flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Users className="w-3.5 h-3.5 text-accent-violet" />
            Arena Participants ({participants.length + 1})
          </div>

          {/* User Card */}
          <UserCard
            displayName={user?.displayName || 'Candidate'}
            isListening={isListening}
            isMuted={isMuted}
          />

          {/* AI Participants List */}
          {participants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              isSpeaking={speakingParticipantId === participant.id && isSpeakingAI}
            />
          ))}
        </div>

        {/* Center / Right Column: Live Transcript Panel */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[400px]">
          <LiveTranscript
            messages={messages}
            participants={participants}
            interimUserSpeech={interimSpeech}
            isAiGenerating={isAiGenerating}
            onRepeatAudio={(text, personalityId) => playAiSpeech(text, personalityId)}
          />
        </div>

      </div>

      {/* Bottom Sticky Controls Panel */}
      <ControlsPanel
        isListening={isListening}
        isSpeakingAI={isSpeakingAI}
        isMuted={isMuted}
        isSupported={isVoiceSupported}
        permissionError={micError}
        onStartSpeaking={handleStartSpeaking}
        onStopSpeaking={handleStopSpeaking}
        onToggleMute={() => setIsMuted(!isMuted)}
        onStopAudioPlayback={handleStopAudioPlayback}
        onRepeatLastAI={handleRepeatLastAI}
        onEndDiscussion={handleEndDiscussion}
        onSendTypedMessage={handleSendTypedMessage}
        disabled={isAiGenerating}
      />

    </div>
  );
};
