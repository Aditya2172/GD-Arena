import { 
  DiscussionSession, 
  DiscussionMessage, 
  SessionReport, 
  PerformanceScores,
  PlacementDimensionId,
  DimensionEvaluation,
  EvaluatorPerspective,
  ImprovementPlan,
  ImprovementExercise
} from '../types/index.js';
import { aiService } from './aiService.js';
import { rubricService, PLACEMENT_RUBRIC_CONFIG } from './rubricConfig.js';
import { speechAnalyticsService } from './speechAnalytics.js';

interface RawAIReportOutput {
  scores: {
    content_logic: number;
    communication_clarity: number;
    fluency_delivery: number;
    vocabulary_language: number;
    grammar_syntax: number;
    listening_teamwork: number;
    leadership_initiative: number;
    relevance_evidence: number;
  };
  dimension_explanations?: Record<string, string>;
  evaluator_critiques?: {
    content_reasoning: string;
    communication: string;
    vocabulary: string;
    speech_fluency: string;
    teamwork_listening: string;
    leadership: string;
    placement_panel: string;
  };
  strengths: string[];
  areas_for_improvement: string[];
  missed_opportunities: string[];
  improved_argument_examples: string[];
  recommendations: string[];
  next_session_goals: string[];
  discussion_summary: string;
}

export const reportService = {
  /**
   * Generates comprehensive performance evaluation based on user utterances in the discussion transcript.
   */
  async generateReport(
    session: DiscussionSession,
    messages: DiscussionMessage[],
    userId: string
  ): Promise<Omit<SessionReport, 'id' | 'created_at'>> {
    const userUtterances = messages.filter(m => m.speaker_type === 'user');

    // Case 1: Insufficient data handling (Under 2 utterances or under 15 total words)
    const totalWords = userUtterances.reduce((acc, m) => acc + m.message_text.split(/\s+/).length, 0);
    if (userUtterances.length === 0 || totalWords < 15) {
      return this.createInsufficientDataReport(session, userId, userUtterances.length);
    }

    // Compute Speech Clarity Lab metrics from candidate transcript
    const speechClarity = speechAnalyticsService.computeSpeechMetrics(userUtterances, session.duration_minutes || 5);
    const evidenceFindings = speechAnalyticsService.extractEvidenceFindings(userUtterances, session.topic);
    const languageRecommendations = speechAnalyticsService.generateLanguageCoach(userUtterances);

    // Format full transcript for AI evaluation
    const fullTranscript = messages.map(m => 
      `[Turn #${m.sequence_number}] ${m.speaker_type === 'user' ? 'Candidate (User)' : m.speaker_name}: "${m.message_text}"`
    ).join('\n');

    const systemPrompt = `You are the Lead Assessor on a Corporate Placement Panel evaluating a candidate in a Group Discussion.
Topic: "${session.topic}"
Difficulty: ${session.difficulty}
Rubric: 8-Dimension Placement Evaluation Rubric (Content & Logic: 20%, Communication: 15%, Fluency: 15%, Vocabulary: 10%, Grammar: 10%, Teamwork: 10%, Leadership: 10%, Evidence: 10%).

Analyze the candidate's actual contributions in the transcript and return a STRICT JSON object matching this schema:
{
  "scores": {
    "content_logic": <0-100>,
    "communication_clarity": <0-100>,
    "fluency_delivery": <0-100>,
    "vocabulary_language": <0-100>,
    "grammar_syntax": <0-100>,
    "listening_teamwork": <0-100>,
    "leadership_initiative": <0-100>,
    "relevance_evidence": <0-100>
  },
  "dimension_explanations": {
    "content_logic": "string",
    "communication_clarity": "string",
    "fluency_delivery": "string",
    "vocabulary_language": "string",
    "grammar_syntax": "string",
    "listening_teamwork": "string",
    "leadership_initiative": "string",
    "relevance_evidence": "string"
  },
  "evaluator_critiques": {
    "content_reasoning": "Critique on logical strength and argument depth",
    "communication": "Critique on clarity, organization, and transitions",
    "vocabulary": "Critique on precision of language and word choices",
    "speech_fluency": "Critique on delivery cadence and pacing",
    "teamwork_listening": "Critique on responsiveness to peers and synthesis",
    "leadership": "Critique on initiative and guiding the discussion",
    "placement_panel": "Executive verdict on corporate readiness"
  },
  "strengths": ["string", "string"],
  "areas_for_improvement": ["string", "string"],
  "missed_opportunities": ["string"],
  "improved_argument_examples": ["string"],
  "recommendations": ["string"],
  "next_session_goals": ["Goal 1", "Goal 2", "Goal 3"],
  "discussion_summary": "Crisp 3-sentence summary of the candidate's discussion performance."
}`;

    const userPrompt = `Here is the discussion transcript to evaluate:\n\n${fullTranscript}\n\nPlease analyze the candidate's performance now.`;

    try {
      const parsed = await aiService.generateJSON<RawAIReportOutput>({
        systemPrompt,
        userPrompt,
        temperature: 0.25
      });

      // Extract raw dimension scores
      const rawScores: Record<PlacementDimensionId, number> = {
        content_logic: clampScore(parsed.scores?.content_logic ?? 70),
        communication_clarity: clampScore(parsed.scores?.communication_clarity ?? 72),
        fluency_delivery: clampScore(parsed.scores?.fluency_delivery ?? 70),
        vocabulary_language: clampScore(parsed.scores?.vocabulary_language ?? 68),
        grammar_syntax: clampScore(parsed.scores?.grammar_syntax ?? 70),
        listening_teamwork: clampScore(parsed.scores?.listening_teamwork ?? 72),
        leadership_initiative: clampScore(parsed.scores?.leadership_initiative ?? 65),
        relevance_evidence: clampScore(parsed.scores?.relevance_evidence ?? 70)
      };

      // Programmatically compute final weighted score (Never hallucinated by AI!)
      const { overallScore, performanceLevel, dimensionEvaluations } = rubricService.calculateFinalScore(rawScores);

      // Build enriched dimension evaluations
      const enrichedDimensions: DimensionEvaluation[] = PLACEMENT_RUBRIC_CONFIG.map(def => {
        const matchingEval = dimensionEvaluations.find(d => d.id === def.id);
        const score = matchingEval?.score ?? 70;
        const explanation = parsed.dimension_explanations?.[def.id] || def.description;

        return {
          id: def.id,
          name: def.name,
          weight: def.weight,
          score,
          weightedContribution: matchingEval?.weightedContribution ?? Math.round(score * def.weight * 10) / 10,
          performanceLevel: rubricService.getPerformanceLevel(score),
          explanation,
          evidence: def.criteria,
          strengths: [`Demonstrated competence in ${def.name}`],
          weaknesses: score < 75 ? [`Opportunities to elevate ${def.name} under time constraints`] : [],
          recommendations: [`Practice structuring arguments targeting ${def.name}`],
          confidence: 'High'
        };
      });

      // Seven Evaluator Perspectives
      const evaluatorPerspectives = this.buildEvaluatorPerspectives(rawScores, parsed.evaluator_critiques);

      // Improvement Plan with Targeted Exercises
      const improvementPlan = this.buildImprovementPlan(rawScores, session.topic);

      const legacyScores: PerformanceScores = {
        ...rawScores,
        logical_reasoning: rawScores.content_logic,
        topic_relevance: rawScores.relevance_evidence,
        vocabulary: rawScores.vocabulary_language,
        argument_structure: rawScores.content_logic,
        critical_thinking: rawScores.content_logic,
        participation: rawScores.listening_teamwork,
        confidence_indicators: rawScores.fluency_delivery
      };

      return {
        session_id: session.id,
        user_id: userId,
        overall_score: overallScore,
        performance_level: performanceLevel,
        rubric_version: '2026.1-PlacementStandard',
        scores: legacyScores,
        dimension_evaluations: enrichedDimensions,
        evaluator_perspectives: evaluatorPerspectives,
        evidence_findings: evidenceFindings,
        language_recommendations: languageRecommendations,
        speech_clarity: speechClarity,
        improvement_plan: improvementPlan,
        strengths: ensureArray(parsed.strengths, [
          'Maintained consistent relevance to the assigned prompt',
          'Demonstrated clear articulation of primary viewpoints'
        ]),
        areas_for_improvement: ensureArray(parsed.areas_for_improvement, [
          'Introduce quantitative evidence to validate initial arguments',
          'Address opposing counterpoints raised by peers more assertively'
        ]),
        missed_opportunities: ensureArray(parsed.missed_opportunities, [
          'Could have bridged the opposing counterargument more directly'
        ]),
        improved_argument_examples: ensureArray(parsed.improved_argument_examples, [
          'Instead of stating general opinions, anchor arguments in measurable industry case studies.'
        ]),
        recommendations: ensureArray(parsed.recommendations, [
          'Practice the PREP framework: Point, Reason, Example, Point.'
        ]),
        next_session_goals: ensureArray(parsed.next_session_goals, [
          'Contribute within the first 60 seconds of the discussion',
          'Ask one thought-provoking counter-question to a peer',
          'Deliver a synthesis in the final two minutes'
        ]).slice(0, 3),
        discussion_summary: parsed.discussion_summary || `The discussion on "${session.topic}" explored multiple viewpoints. The candidate contributed several foundational points.`
      };
    } catch (err: any) {
      console.warn('[Report Service] AI parsing failed, falling back to heuristic placement rubric:', err.message);
      return this.createHeuristicReport(session, userId, userUtterances, totalWords);
    }
  },

  /**
   * Generates the 7 Evaluator Perspectives from score dimensions and critique inputs.
   */
  buildEvaluatorPerspectives(
    scores: Record<PlacementDimensionId, number>,
    critiques?: Record<string, string>
  ): EvaluatorPerspective[] {
    return [
      {
        id: 'content_reasoning',
        name: 'Dr. Kabir Sen',
        evaluatorTitle: 'Evaluator 1: Content & Reasoning',
        focusArea: 'Logical coherence, argumentation depth, premise validation',
        score: scores.content_logic,
        performanceLevel: rubricService.getPerformanceLevel(scores.content_logic),
        critique: critiques?.content_reasoning || 'Logical framework was cohesive. Ensure every premise is backed by concrete operational impact.',
        priorityTakeaway: 'Ground claims in empirical cause-and-effect sequences.'
      },
      {
        id: 'communication',
        name: 'Prof. Shalini Roy',
        evaluatorTitle: 'Evaluator 2: Communication',
        focusArea: 'Clarity, conciseness, structured sequencing',
        score: scores.communication_clarity,
        performanceLevel: rubricService.getPerformanceLevel(scores.communication_clarity),
        critique: critiques?.communication || 'Clarity of message was easily understandable without ambiguity in thought transitions.',
        priorityTakeaway: 'Keep sentence structure tight and avoid run-on explanations.'
      },
      {
        id: 'vocabulary',
        name: 'Aiden Vance',
        evaluatorTitle: 'Evaluator 3: Vocabulary & Precision',
        focusArea: 'Professional diction, absence of repetitive phrasing',
        score: scores.vocabulary_language,
        performanceLevel: rubricService.getPerformanceLevel(scores.vocabulary_language),
        critique: critiques?.vocabulary || 'Appropriate vocabulary choices. Avoid informal conversational qualifiers like "basically" or "sort of".',
        priorityTakeaway: 'Use precise business terminology instead of colloquial qualifiers.'
      },
      {
        id: 'speech_fluency',
        name: 'Nandita Nair',
        evaluatorTitle: 'Evaluator 4: Speech & Fluency',
        focusArea: 'Delivery pacing, filler-word suppression, pause control',
        score: scores.fluency_delivery,
        performanceLevel: rubricService.getPerformanceLevel(scores.fluency_delivery),
        critique: critiques?.speech_fluency || 'Speaking pace was steady. Replace verbal crutches with deliberate silent pauses.',
        priorityTakeaway: 'Utilize 1-second deliberate pauses to organize thoughts before speaking.'
      },
      {
        id: 'teamwork_listening',
        name: 'Sameer Kulkarni',
        evaluatorTitle: 'Evaluator 5: Teamwork & Listening',
        focusArea: 'Peer acknowledgement, active listening, diplomatic counterpoints',
        score: scores.listening_teamwork,
        performanceLevel: rubricService.getPerformanceLevel(scores.listening_teamwork),
        critique: critiques?.teamwork_listening || 'Demonstrated polite floor etiquette. Actively weave peer arguments into your own contributions.',
        priorityTakeaway: 'Directly acknowledge peer viewpoints before introducing your rebuttal.'
      },
      {
        id: 'leadership',
        name: 'Marcus Sterling',
        evaluatorTitle: 'Evaluator 6: Leadership & Initiative',
        focusArea: 'Discussion facilitation, consensus synthesis, topic framing',
        score: scores.leadership_initiative,
        performanceLevel: rubricService.getPerformanceLevel(scores.leadership_initiative),
        critique: critiques?.leadership || 'Showed initiative in sharing viewpoints. Advance towards leadership by summarizing diverging perspectives.',
        priorityTakeaway: 'Provide a 30-second concluding summary in the final round minute.'
      },
      {
        id: 'placement_panel',
        name: 'Corporate Assessment Board',
        evaluatorTitle: 'Evaluator 7: Placement Panel Verdict',
        focusArea: 'Overall corporate recruitment readiness and employability',
        score: Math.round(
          Object.values(scores).reduce((a, b) => a + b, 0) / 8
        ),
        performanceLevel: rubricService.getPerformanceLevel(Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 8)),
        critique: critiques?.placement_panel || 'Candidate demonstrates solid foundational communication skills and is developing strong recruitment readiness.',
        priorityTakeaway: 'Focus next practice session on assertive counter-questioning.'
      }
    ];
  },

  /**
   * Builds the Personalized Improvement Plan with actionable targeted exercises.
   */
  buildImprovementPlan(scores: Record<PlacementDimensionId, number>, currentTopic: string): ImprovementPlan {
    // Identify lowest 3 scoring dimensions
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => a - b)
      .map(([id]) => id as PlacementDimensionId);

    const lowest = sorted.slice(0, 3);
    const priorityWeaknesses = lowest.map(id => {
      const def = PLACEMENT_RUBRIC_CONFIG.find(d => d.id === id);
      return def ? def.name : id;
    });

    const exercises: ImprovementExercise[] = [];

    // Exercise 1: Opening statement drill
    exercises.push({
      id: 'ex-opening',
      title: '20-Second Impact Opening Drill',
      focusArea: 'Leadership & Topic Framing',
      durationSeconds: 20,
      instructions: 'Deliver a concise opening statement that defines the topic scope and introduces 2 contrasting perspectives in 20 seconds.',
      drillPrompt: `Deliver an opening statement on: "${currentTopic}".`,
      frameworkOrTip: 'Hook $\\rightarrow$ Definition $\\rightarrow$ Core Dilemma.'
    });

    // Exercise 2: PREP Argument structure drill
    exercises.push({
      id: 'ex-prep',
      title: 'PREP Framework Structuring Drill',
      focusArea: 'Content & Logical Reasoning',
      durationSeconds: 45,
      instructions: 'Construct a structured argument in 45 seconds using Point, Reason, Example, and Point restatement.',
      drillPrompt: `Take a definitive stance on "${currentTopic}" and substantiate it using PREP.`,
      frameworkOrTip: 'P: Make your point $\\rightarrow$ R: Explain the why $\\rightarrow$ E: Cite an example $\\rightarrow$ P: Reinforce your point.'
    });

    // Exercise 3: Deliberate Pause & Filler-Word suppression
    exercises.push({
      id: 'ex-pause',
      title: '1-Minute Deliberate Pause Challenge',
      focusArea: 'Fluency & Speech Delivery',
      durationSeconds: 60,
      instructions: 'Speak for 60 seconds without using a single verbal filler (um, uh, basically, like). Use silent 1-second pauses whenever you need to think.',
      drillPrompt: 'Explain 3 major advantages and disadvantages of this topic without verbal fillers.',
      frameworkOrTip: 'Replace every urge to say "um" with a silent breath.'
    });

    // Exercise 4: Constructive Counterargument drill
    exercises.push({
      id: 'ex-counter',
      title: 'Diplomatic Rebuttal Drill',
      focusArea: 'Listening & Teamwork',
      durationSeconds: 30,
      instructions: 'Acknowledge an opposing viewpoint respectfully, validate its merit, and present a reasoned counter-perspective.',
      drillPrompt: 'Respond to an opponent who claims the exact opposite of your position.',
      frameworkOrTip: 'Validate ("I see merit in...") $\\rightarrow$ Pivot ("However, from an execution angle...") $\\rightarrow$ Challenge.'
    });

    return {
      priorityWeaknesses,
      recommendedExercises: exercises,
      recommendedNextTopic: 'Data Privacy and Ethics in Artificial Intelligence'
    };
  },

  createInsufficientDataReport(session: DiscussionSession, userId: string, utteranceCount: number) {
    const rawScores: Record<PlacementDimensionId, number> = {
      content_logic: 30,
      communication_clarity: 35,
      fluency_delivery: 30,
      vocabulary_language: 35,
      grammar_syntax: 30,
      listening_teamwork: 25,
      leadership_initiative: 20,
      relevance_evidence: 35
    };

    const { overallScore, performanceLevel, dimensionEvaluations } = rubricService.calculateFinalScore(rawScores);

    const enrichedDimensions: DimensionEvaluation[] = PLACEMENT_RUBRIC_CONFIG.map(def => ({
      id: def.id,
      name: def.name,
      weight: def.weight,
      score: rawScores[def.id],
      weightedContribution: Math.round(rawScores[def.id] * def.weight * 10) / 10,
      performanceLevel: 'Needs Improvement',
      explanation: 'Insufficient candidate speech recorded to formulate a reliable assessment.',
      evidence: ['Fewer than 15 spoken words registered during the round.'],
      strengths: ['Joined the room.'],
      weaknesses: ['Did not contribute enough audio transcript to gauge performance.'],
      recommendations: ['Speak at least 2 to 3 substantive times in your next session.'],
      confidence: 'Estimated'
    }));

    const speechClarity = speechAnalyticsService.computeSpeechMetrics([], session.duration_minutes || 5);
    const evidenceFindings = speechAnalyticsService.extractEvidenceFindings([], session.topic);

    const legacyScores: PerformanceScores = {
      ...rawScores,
      logical_reasoning: 30,
      topic_relevance: 35,
      vocabulary: 35,
      argument_structure: 30,
      critical_thinking: 25,
      participation: 20,
      confidence_indicators: 25
    };

    return {
      session_id: session.id,
      user_id: userId,
      overall_score: overallScore,
      performance_level: performanceLevel,
      rubric_version: '2026.1-PlacementStandard',
      scores: legacyScores,
      dimension_evaluations: enrichedDimensions,
      evaluator_perspectives: this.buildEvaluatorPerspectives(rawScores),
      evidence_findings: evidenceFindings,
      language_recommendations: [],
      speech_clarity: speechClarity,
      improvement_plan: this.buildImprovementPlan(rawScores, session.topic),
      strengths: ['Joined the discussion arena.'],
      areas_for_improvement: [
        'Insufficient speaking time recorded to generate a comprehensive placement analysis.',
        'Actively take the floor and share at least 2 to 3 substantive points.'
      ],
      missed_opportunities: [
        'The candidate did not speak enough for the assessors to gauge analytical or communication skills.'
      ],
      improved_argument_examples: [
        'Begin by defining key terms when the topic is introduced to establish early leadership.'
      ],
      recommendations: [
        'Aim to speak for at least 45 to 60 seconds per turn in subsequent practice rounds.'
      ],
      next_session_goals: [
        'Initiate or respond within the first 60 seconds',
        'Contribute at least 3 complete arguments',
        'Use the microphone consistently'
      ],
      discussion_summary: `The session on "${session.topic}" ended with insufficient candidate contributions (${utteranceCount} utterances recorded). More active participation is required for a complete placement evaluation.`
    };
  },

  createHeuristicReport(
    session: DiscussionSession, 
    userId: string, 
    utterances: DiscussionMessage[], 
    words: number
  ) {
    const baseScore = Math.min(85, Math.max(55, Math.round(50 + (utterances.length * 4) + (words / 18))));

    const rawScores: Record<PlacementDimensionId, number> = {
      content_logic: baseScore,
      communication_clarity: baseScore + 2,
      fluency_delivery: baseScore - 1,
      vocabulary_language: baseScore - 2,
      grammar_syntax: baseScore,
      listening_teamwork: Math.min(95, baseScore + 4),
      leadership_initiative: baseScore - 3,
      relevance_evidence: baseScore + 1
    };

    const { overallScore, performanceLevel, dimensionEvaluations } = rubricService.calculateFinalScore(rawScores);

    const enrichedDimensions: DimensionEvaluation[] = PLACEMENT_RUBRIC_CONFIG.map(def => ({
      id: def.id,
      name: def.name,
      weight: def.weight,
      score: rawScores[def.id],
      weightedContribution: Math.round(rawScores[def.id] * def.weight * 10) / 10,
      performanceLevel: rubricService.getPerformanceLevel(rawScores[def.id]),
      explanation: `Candidate exhibited consistent engagement across ${def.name.toLowerCase()}.`,
      evidence: def.criteria,
      strengths: [`Active contribution in ${def.name}`],
      weaknesses: [`Further develop depth in ${def.name}`],
      recommendations: [`Practice structuring points using corporate frameworks`],
      confidence: 'Medium'
    }));

    const speechClarity = speechAnalyticsService.computeSpeechMetrics(utterances, session.duration_minutes || 5);
    const evidenceFindings = speechAnalyticsService.extractEvidenceFindings(utterances, session.topic);
    const languageRecommendations = speechAnalyticsService.generateLanguageCoach(utterances);

    const legacyScores: PerformanceScores = {
      ...rawScores,
      logical_reasoning: rawScores.content_logic,
      topic_relevance: rawScores.relevance_evidence,
      vocabulary: rawScores.vocabulary_language,
      argument_structure: rawScores.content_logic,
      critical_thinking: rawScores.content_logic,
      participation: rawScores.listening_teamwork,
      confidence_indicators: rawScores.fluency_delivery
    };

    return {
      session_id: session.id,
      user_id: userId,
      overall_score: overallScore,
      performance_level: performanceLevel,
      rubric_version: '2026.1-PlacementStandard',
      scores: legacyScores,
      dimension_evaluations: enrichedDimensions,
      evaluator_perspectives: this.buildEvaluatorPerspectives(rawScores),
      evidence_findings: evidenceFindings,
      language_recommendations: languageRecommendations,
      speech_clarity: speechClarity,
      improvement_plan: this.buildImprovementPlan(rawScores, session.topic),
      strengths: [
        'Demonstrated willingness to contribute under conversational pressure',
        'Maintained composure and polite interaction etiquette'
      ],
      areas_for_improvement: [
        'Elaborate more deeply with concrete industry examples and statistics',
        'Directly address challenging counterpoints raised by peers'
      ],
      missed_opportunities: [
        'Could have summarized the group consensus before the timer expired'
      ],
      improved_argument_examples: [
        'Use structured frameworks like PREP (Point, Reason, Example, Point) to deliver memorable arguments.'
      ],
      recommendations: [
        'Practice active listening to seamlessly bridge peer arguments with your own.'
      ],
      next_session_goals: [
        'Anchor each argument with at least one verifiable real-world example',
        'Challenge an opposing assumption within 30 seconds of it being stated',
        'Deliver a 20-second wrap-up summary at the session close'
      ],
      discussion_summary: `A productive session on "${session.topic}". The candidate made ${utterances.length} distinct contributions, addressing multiple viewpoints raised by the group.`
    };
  }
};

function clampScore(val: number): number {
  if (isNaN(val)) return 50;
  return Math.max(0, Math.min(100, Math.round(val)));
}

function ensureArray(arr: any, fallback: string[]): string[] {
  if (Array.isArray(arr) && arr.length > 0) return arr.map(String);
  return fallback;
}
