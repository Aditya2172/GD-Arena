export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type DiscussionStyle = 
  | 'Placement preparation'
  | 'College debate'
  | 'General awareness'
  | 'Professional communication';

export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';

export type AIPersonalityId = 
  | 'analytical'
  | 'devils_advocate'
  | 'collaborative'
  | 'confident'
  | 'practical'
  | 'synthesizer';

// Discussion Flow Stages
export type DiscussionStage =
  | 'topic_intro'
  | 'initial_viewpoints'
  | 'argument_development'
  | 'counterarguments'
  | 'evidence_deepening'
  | 'synthesis_conclusion';

// Conversational Moves for Adaptive Follow-Ups
export type ConversationalMoveType =
  | 'request_clarification'
  | 'challenge_assumption'
  | 'ask_supporting_evidence'
  | 'introduce_counterexample'
  | 'explore_consequence'
  | 'ask_practical_example'
  | 'compare_alternatives'
  | 'invite_another_viewpoint'
  | 'connect_earlier_arguments'
  | 'identify_common_ground'
  | 'move_to_synthesis';

export interface TrackedArgument {
  id: string;
  speaker: string;
  speakerType: SpeakerType;
  claim: string;
  reasoning?: string;
  example?: string;
  needsEvidence: boolean;
  turnSequence: number;
}

export interface TrackedQuestion {
  id: string;
  speaker: string;
  target: string;
  question: string;
  intent: ConversationalMoveType;
  conceptKeywords: string[];
  turnSequence: number;
  answered: boolean;
}

export interface SharedDiscussionMemory {
  sessionId: string;
  topic: string;
  objective: string;
  currentStage: DiscussionStage;
  stageProgress: number; // 0 to 100 percentage
  arguments: TrackedArgument[];
  agreements: string[];
  disagreements: string[];
  unresolvedQuestions: string[];
  askedQuestions: TrackedQuestion[];
  conclusions: string[];
  candidateWeaknesses: string[];
  candidateKeyClaims: string[];
  rollingSummary: string;
  lastTurnEvaluated?: number;
}

export interface AIPersonality {
  id: AIPersonalityId;
  name: string;
  roleTitle: string;
  avatar: string;
  description: string;
  speechRate: number; // For TTS customization
  speechPitch: number;
  promptInstructions: string;
}

export interface DiscussionSession {
  id: string;
  user_id: string;
  topic: string;
  difficulty: Difficulty;
  duration_minutes: number;
  participant_count: number;
  discussion_style: DiscussionStyle;
  language: string;
  selected_personalities: AIPersonalityId[];
  status: SessionStatus;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export type SpeakerType = 'user' | 'ai' | 'system';

export interface DiscussionMessage {
  id: string;
  session_id: string;
  speaker_type: SpeakerType;
  speaker_name: string;
  personality?: AIPersonalityId;
  message_text: string;
  sequence_number: number;
  created_at: string;
}

// Performance Level Scale for Placement Rubric
export type PerformanceLevel = 'Needs Improvement' | 'Developing' | 'Competent' | 'Strong';

// Placement Dimension Identifiers
export type PlacementDimensionId =
  | 'content_logic'
  | 'communication_clarity'
  | 'fluency_delivery'
  | 'vocabulary_language'
  | 'grammar_syntax'
  | 'listening_teamwork'
  | 'leadership_initiative'
  | 'relevance_evidence';

export interface DimensionEvaluation {
  id: PlacementDimensionId;
  name: string;
  weight: number; // Decimal (e.g. 0.20 = 20%)
  score: number; // 0 - 100
  weightedContribution: number; // (score * weight)
  performanceLevel: PerformanceLevel;
  explanation: string;
  evidence: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  confidence: 'High' | 'Medium' | 'Low' | 'Estimated';
}

// Seven Evaluator Perspectives
export interface EvaluatorPerspective {
  id: 'content_reasoning' | 'communication' | 'vocabulary' | 'speech_fluency' | 'teamwork_listening' | 'leadership' | 'placement_panel';
  name: string;
  evaluatorTitle: string;
  focusArea: string;
  score: number; // 0-100
  performanceLevel: PerformanceLevel;
  critique: string;
  evidenceQuote?: string;
  priorityTakeaway: string;
}

// Evidence-Based Marking Item
export interface EvidenceFinding {
  id: string;
  category: string;
  transcriptExcerpt: string;
  turnSequence?: number;
  timestamp?: string;
  observation: string;
  whyItMatters: string;
  suggestedImprovement: string;
  confidence: 'High' | 'Medium' | 'Estimated';
  limitationNote?: string;
}

// Vocabulary & Language Coach Recommendation
export interface LanguageRecommendation {
  id: string;
  type: 'repeated_expression' | 'vague_wording' | 'grammar_syntax' | 'awkward_phrasing' | 'weak_transition';
  originalExpression: string;
  suggestedAlternative: string;
  whyItHelps: string;
  example: string;
}

// Speech Clarity Lab Metrics
export interface SpeechClarityMetrics {
  speakingDurationMinutes: number;
  totalWordsSpoken: number;
  speakingRateWpm: number;
  rateStatus: 'Slow' | 'Optimal' | 'Fast' | 'Estimated';
  fillerWordsCount: number;
  fillerWordsBreakdown: { word: string; count: number }[];
  fillerWordsFrequencyPer100Words: number;
  repeatedPhrasesCount: number;
  pauseHesitationNote: string;
  pronunciationStatus: 'Browser Transcript Only (Pronunciation ML requires dedicated acoustic model)' | 'Supported';
  pronunciationNote: string;
}

// Improvement Exercise
export interface ImprovementExercise {
  id: string;
  title: string;
  focusArea: string;
  durationSeconds: number;
  instructions: string;
  drillPrompt: string;
  frameworkOrTip: string;
  completed?: boolean;
  completedAt?: string;
}

// Personalized Improvement Plan
export interface ImprovementPlan {
  priorityWeaknesses: string[];
  recommendedExercises: ImprovementExercise[];
  recommendedNextTopic: string;
}

// Backwards-compatible map of the 8 scores
export interface PerformanceScores {
  content_logic: number;
  communication_clarity: number;
  fluency_delivery: number;
  vocabulary_language: number;
  grammar_syntax: number;
  listening_teamwork: number;
  leadership_initiative: number;
  relevance_evidence: number;
  // Legacy aliases
  logical_reasoning?: number;
  topic_relevance?: number;
  vocabulary?: number;
  argument_structure?: number;
  critical_thinking?: number;
  participation?: number;
  confidence_indicators?: number;
}

export interface SessionReport {
  id: string;
  session_id: string;
  user_id: string;
  overall_score: number; // Mathematically calculated weighted sum
  performance_level: PerformanceLevel;
  rubric_version: string;
  scores: PerformanceScores;
  dimension_evaluations: DimensionEvaluation[];
  evaluator_perspectives: EvaluatorPerspective[];
  evidence_findings: EvidenceFinding[];
  language_recommendations: LanguageRecommendation[];
  speech_clarity: SpeechClarityMetrics;
  improvement_plan: ImprovementPlan;
  strengths: string[];
  areas_for_improvement: string[];
  missed_opportunities: string[];
  improved_argument_examples: string[];
  recommendations: string[];
  next_session_goals: string[];
  discussion_summary: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
}

export interface AnalyticsSummary {
  totalSessions: number;
  averageScore: number;
  totalPracticeTimeMinutes: number;
  scoreTrend: { date: string; score: number; topic: string }[];
  radarScores: { metric: string; score: number; fullMark: number }[];
  frequentTopics: { topic: string; count: number }[];
  mostImprovedSkill: string;
  recentSessions: DiscussionSession[];
}

export interface SessionComparisonResult {
  sessionA: {
    id: string;
    topic: string;
    date: string;
    overallScore: number;
    wpm: number;
    fillerCount: number;
    performanceLevel: PerformanceLevel;
  };
  sessionB: {
    id: string;
    topic: string;
    date: string;
    overallScore: number;
    wpm: number;
    fillerCount: number;
    performanceLevel: PerformanceLevel;
  };
  overallScoreDelta: number;
  dimensionDeltas: {
    dimensionId: PlacementDimensionId;
    name: string;
    scoreA: number;
    scoreB: number;
    delta: number;
    status: 'Improved' | 'Declined' | 'Maintained';
  }[];
  speechDeltas: {
    metric: string;
    valA: string | number;
    valB: string | number;
    delta: string;
    interpretation: string;
  }[];
  keyTakeaways: string[];
}
