import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';
import { 
  DiscussionSession, 
  DiscussionMessage, 
  SessionReport, 
  AnalyticsSummary,
  Difficulty,
  SessionComparisonResult 
} from '../types/index.js';
import { PLACEMENT_RUBRIC_CONFIG } from './rubricConfig.js';

// In-memory data structures for standalone/demo execution
const memorySessions = new Map<string, DiscussionSession>();
const memoryMessages = new Map<string, DiscussionMessage[]>();
const memoryReports = new Map<string, SessionReport>();
const memoryCompletedExercises = new Set<string>();

let supabase: any = null;
if (config.isSupabaseConfigured) {
  supabase = createClient(
    config.supabaseUrl, 
    config.supabaseServiceRoleKey || config.supabaseAnonKey
  );
  console.log('[DB] Connected to Supabase PostgreSQL at:', config.supabaseUrl);
} else {
  console.log('[DB] Supabase credentials not set. Operating in high-speed In-Memory demo mode.');
}

export const dbService = {
  // --- SESSIONS ---
  async createSession(session: Omit<DiscussionSession, 'id' | 'created_at'>): Promise<DiscussionSession> {
    const id = crypto.randomUUID();
    const newSession: DiscussionSession = {
      ...session,
      id,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('discussion_sessions')
        .insert({
          id: newSession.id,
          user_id: newSession.user_id,
          topic: newSession.topic,
          difficulty: newSession.difficulty,
          duration_minutes: newSession.duration_minutes,
          participant_count: newSession.participant_count,
          discussion_style: newSession.discussion_style,
          language: newSession.language,
          selected_personalities: newSession.selected_personalities,
          status: newSession.status,
          started_at: newSession.started_at,
          created_at: newSession.created_at
        })
        .select()
        .single();

      if (error) throw new Error(`Supabase error creating session: ${error.message}`);
      return data;
    }

    memorySessions.set(id, newSession);
    memoryMessages.set(id, []);
    return newSession;
  },

  async getSessionById(sessionId: string, userId: string): Promise<DiscussionSession | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('discussion_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;
      return data;
    }

    const session = memorySessions.get(sessionId);
    if (!session || session.user_id !== userId) return null;
    return session;
  },

  async getUserSessions(userId: string): Promise<DiscussionSession[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('discussion_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Supabase error fetching sessions: ${error.message}`);
      return data || [];
    }

    return Array.from(memorySessions.values())
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateSessionStatus(sessionId: string, status: 'completed' | 'abandoned'): Promise<void> {
    const endedAt = new Date().toISOString();
    if (supabase) {
      await supabase
        .from('discussion_sessions')
        .update({ status, ended_at: endedAt })
        .eq('id', sessionId);
      return;
    }

    const session = memorySessions.get(sessionId);
    if (session) {
      session.status = status;
      session.ended_at = endedAt;
      memorySessions.set(sessionId, session);
    }
  },

  // --- MESSAGES ---
  async addMessage(message: Omit<DiscussionMessage, 'id' | 'created_at'>): Promise<DiscussionMessage> {
    const id = crypto.randomUUID();
    const newMessage: DiscussionMessage = {
      ...message,
      id,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('discussion_messages')
        .insert({
          id: newMessage.id,
          session_id: newMessage.session_id,
          speaker_type: newMessage.speaker_type,
          speaker_name: newMessage.speaker_name,
          personality: newMessage.personality || null,
          message_text: newMessage.message_text,
          sequence_number: newMessage.sequence_number,
          created_at: newMessage.created_at
        })
        .select()
        .single();

      if (error) throw new Error(`Supabase error saving message: ${error.message}`);
      return data;
    }

    const list = memoryMessages.get(newMessage.session_id) || [];
    list.push(newMessage);
    memoryMessages.set(newMessage.session_id, list);
    return newMessage;
  },

  async getSessionMessages(sessionId: string): Promise<DiscussionMessage[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('discussion_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('sequence_number', { ascending: true });

      if (error) throw new Error(`Supabase error fetching messages: ${error.message}`);
      return data || [];
    }

    return memoryMessages.get(sessionId) || [];
  },

  // --- REPORTS ---
  async saveReport(report: Omit<SessionReport, 'id' | 'created_at'>): Promise<SessionReport> {
    const id = crypto.randomUUID();
    const newReport: SessionReport = {
      ...report,
      id,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('session_reports')
        .insert({
          id: newReport.id,
          session_id: newReport.session_id,
          user_id: newReport.user_id,
          overall_score: newReport.overall_score,
          communication_clarity: newReport.scores.communication_clarity,
          topic_relevance: newReport.scores.topic_relevance,
          logical_reasoning: newReport.scores.logical_reasoning,
          vocabulary: newReport.scores.vocabulary,
          argument_structure: newReport.scores.argument_structure,
          critical_thinking: newReport.scores.critical_thinking,
          participation: newReport.scores.participation,
          confidence_indicators: newReport.scores.confidence_indicators,
          strengths: newReport.strengths,
          areas_for_improvement: newReport.areas_for_improvement,
          missed_opportunities: newReport.missed_opportunities,
          improved_argument_examples: newReport.improved_argument_examples,
          recommendations: newReport.recommendations,
          next_session_goals: newReport.next_session_goals,
          discussion_summary: newReport.discussion_summary,
          created_at: newReport.created_at
        })
        .select()
        .single();

      if (error) throw new Error(`Supabase error saving report: ${error.message}`);
      return {
        ...data,
        scores: {
          communication_clarity: data.communication_clarity,
          topic_relevance: data.topic_relevance,
          logical_reasoning: data.logical_reasoning,
          vocabulary: data.vocabulary,
          argument_structure: data.argument_structure,
          critical_thinking: data.critical_thinking,
          participation: data.participation,
          confidence_indicators: data.confidence_indicators
        }
      };
    }

    memoryReports.set(newReport.session_id, newReport);
    return newReport;
  },

  async getReportBySessionId(sessionId: string, userId: string): Promise<SessionReport | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('session_reports')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;
      return {
        ...data,
        scores: {
          communication_clarity: data.communication_clarity,
          topic_relevance: data.topic_relevance,
          logical_reasoning: data.logical_reasoning,
          vocabulary: data.vocabulary,
          argument_structure: data.argument_structure,
          critical_thinking: data.critical_thinking,
          participation: data.participation,
          confidence_indicators: data.confidence_indicators
        }
      };
    }

    const report = memoryReports.get(sessionId);
    if (!report || report.user_id !== userId) return null;
    return report;
  },

  // --- ANALYTICS ---
  async getUserAnalytics(userId: string): Promise<AnalyticsSummary> {
    const sessions = await this.getUserSessions(userId);
    const completedSessions = sessions.filter(s => s.status === 'completed');

    // Fetch reports for all completed sessions
    const reports: SessionReport[] = [];
    for (const session of completedSessions) {
      const report = await this.getReportBySessionId(session.id, userId);
      if (report) reports.push(report);
    }

    const totalSessions = sessions.length;
    const totalPracticeTimeMinutes = sessions.reduce((acc, s) => acc + (s.duration_minutes || 5), 0);
    
    const averageScore = reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.overall_score, 0) / reports.length)
      : 0;

    // Score trend by date
    const scoreTrend = reports.map(r => {
      const matchingSession = sessions.find(s => s.id === r.session_id);
      return {
        date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: r.overall_score,
        topic: matchingSession?.topic || 'Discussion'
      };
    }).reverse();

    // Radar averages across the 8 metrics
    const radarScores = [
      { metric: 'Clarity', score: averageMetric(reports, 'communication_clarity'), fullMark: 100 },
      { metric: 'Relevance', score: averageMetric(reports, 'topic_relevance'), fullMark: 100 },
      { metric: 'Logic', score: averageMetric(reports, 'logical_reasoning'), fullMark: 100 },
      { metric: 'Vocabulary', score: averageMetric(reports, 'vocabulary'), fullMark: 100 },
      { metric: 'Structure', score: averageMetric(reports, 'argument_structure'), fullMark: 100 },
      { metric: 'Critical Thinking', score: averageMetric(reports, 'critical_thinking'), fullMark: 100 },
      { metric: 'Participation', score: averageMetric(reports, 'participation'), fullMark: 100 },
      { metric: 'Confidence', score: averageMetric(reports, 'confidence_indicators'), fullMark: 100 },
    ];

    // Topic frequency
    const topicCountMap: { [topic: string]: number } = {};
    sessions.forEach(s => {
      topicCountMap[s.topic] = (topicCountMap[s.topic] || 0) + 1;
    });
    const frequentTopics = Object.entries(topicCountMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Identify most improved skill
    let mostImprovedSkill = 'Logical Reasoning';
    if (reports.length >= 2) {
      const first = reports[reports.length - 1].scores;
      const latest = reports[0].scores;
      let maxDiff = -100;
      const metricKeys: (keyof typeof first)[] = [
        'communication_clarity', 'topic_relevance', 'logical_reasoning',
        'vocabulary', 'argument_structure', 'critical_thinking', 'participation'
      ];
      for (const k of metricKeys) {
        const diff = (latest[k] || 0) - (first[k] || 0);
        if (diff > maxDiff) {
          maxDiff = diff;
          mostImprovedSkill = formatMetricName(k);
        }
      }
    }

    return {
      totalSessions,
      averageScore,
      totalPracticeTimeMinutes,
      scoreTrend,
      radarScores,
      frequentTopics,
      mostImprovedSkill,
      recentSessions: sessions.slice(0, 5)
    };
  },

  // --- COMPARISON ---
  async compareSessions(sessionAId: string, sessionBId: string, userId: string): Promise<SessionComparisonResult> {
    const reportA = await this.getReportBySessionId(sessionAId, userId);
    const reportB = await this.getReportBySessionId(sessionBId, userId);
    const sessionA = await this.getSessionById(sessionAId, userId);
    const sessionB = await this.getSessionById(sessionBId, userId);

    if (!reportA || !reportB || !sessionA || !sessionB) {
      throw new Error('Both sessions must have valid completed reports for comparison.');
    }

    const overallScoreDelta = reportB.overall_score - reportA.overall_score;

    // Compare each of the 8 dimensions
    const dimensionDeltas = PLACEMENT_RUBRIC_CONFIG.map(def => {
      const scoreA = (reportA.scores as any)[def.id] ?? 50;
      const scoreB = (reportB.scores as any)[def.id] ?? 50;
      const delta = scoreB - scoreA;
      let status: 'Improved' | 'Declined' | 'Maintained' = 'Maintained';
      if (delta > 2) status = 'Improved';
      else if (delta < -2) status = 'Declined';

      return {
        dimensionId: def.id,
        name: def.name,
        scoreA,
        scoreB,
        delta,
        status
      };
    });

    const wpmA = reportA.speech_clarity?.speakingRateWpm || 0;
    const wpmB = reportB.speech_clarity?.speakingRateWpm || 0;
    const fillersA = reportA.speech_clarity?.fillerWordsCount || 0;
    const fillersB = reportB.speech_clarity?.fillerWordsCount || 0;

    const speechDeltas = [
      {
        metric: 'Speaking Rate (WPM)',
        valA: `${wpmA} WPM`,
        valB: `${wpmB} WPM`,
        delta: `${wpmB - wpmA > 0 ? '+' : ''}${wpmB - wpmA} WPM`,
        interpretation: wpmB >= 105 && wpmB <= 155 ? 'Optimal placement pacing (105-155 WPM)' : 'Cadence outside target range'
      },
      {
        metric: 'Filler Words Count',
        valA: fillersA,
        valB: fillersB,
        delta: `${fillersB - fillersA > 0 ? '+' : ''}${fillersB - fillersA}`,
        interpretation: fillersB < fillersA ? 'Positive filler suppression' : fillersB > fillersA ? 'Increased verbal crutches' : 'Maintained'
      }
    ];

    const keyTakeaways: string[] = [];
    if (overallScoreDelta > 0) {
      keyTakeaways.push(`Overall performance gained +${overallScoreDelta} points.`);
    } else if (overallScoreDelta < 0) {
      keyTakeaways.push(`Overall performance dropped by ${overallScoreDelta} points.`);
    } else {
      keyTakeaways.push('Overall score remained consistent between rounds.');
    }

    const improvedDims = dimensionDeltas.filter(d => d.status === 'Improved').map(d => d.name);
    if (improvedDims.length > 0) {
      keyTakeaways.push(`Measurable gains demonstrated in: ${improvedDims.join(', ')}.`);
    }

    return {
      sessionA: {
        id: sessionA.id,
        topic: sessionA.topic,
        date: new Date(reportA.created_at).toLocaleDateString(),
        overallScore: reportA.overall_score,
        wpm: wpmA,
        fillerCount: fillersA,
        performanceLevel: reportA.performance_level || 'Competent'
      },
      sessionB: {
        id: sessionB.id,
        topic: sessionB.topic,
        date: new Date(reportB.created_at).toLocaleDateString(),
        overallScore: reportB.overall_score,
        wpm: wpmB,
        fillerCount: fillersB,
        performanceLevel: reportB.performance_level || 'Competent'
      },
      overallScoreDelta,
      dimensionDeltas,
      speechDeltas,
      keyTakeaways
    };
  },

  // --- EXERCISES ---
  async completeExercise(exerciseId: string, userId: string): Promise<{ success: boolean; exerciseId: string; completedAt: string }> {
    const key = `${userId}:${exerciseId}`;
    memoryCompletedExercises.add(key);
    return {
      success: true,
      exerciseId,
      completedAt: new Date().toISOString()
    };
  },

  async getCompletedExercises(userId: string): Promise<string[]> {
    const list: string[] = [];
    for (const item of memoryCompletedExercises) {
      if (item.startsWith(`${userId}:`)) {
        list.push(item.split(':')[1]);
      }
    }
    return list;
  }
};

function averageMetric(reports: SessionReport[], key: keyof SessionReport['scores']): number {
  if (reports.length === 0) return 0;
  const sum = reports.reduce((acc, r) => acc + (r.scores[key] || 0), 0);
  return Math.round(sum / reports.length);
}

function formatMetricName(key: string): string {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
