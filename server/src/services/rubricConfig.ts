import { PlacementDimensionId, PerformanceLevel, DimensionEvaluation } from '../types/index.js';

export interface RubricDimensionDefinition {
  id: PlacementDimensionId;
  name: string;
  weight: number; // Decimal (0.20 = 20%)
  description: string;
  criteria: string[];
}

export const PLACEMENT_RUBRIC_CONFIG: RubricDimensionDefinition[] = [
  {
    id: 'content_logic',
    name: 'Content and Logical Reasoning',
    weight: 0.20, // 20%
    description: 'Depth of analysis, logical frameworks, cause-and-effect clarity, and avoiding fallacies.',
    criteria: [
      'Logical progression of premises to conclusions',
      'Depth of domain knowledge and analytical frameworks',
      'Absence of circular logic or unexamined contradictions',
      'Structural problem-solving rather than surface opinions'
    ]
  },
  {
    id: 'communication_clarity',
    name: 'Communication and Clarity',
    weight: 0.15, // 15%
    description: 'Crisp delivery, coherent sequencing, ease of understanding, and message conciseness.',
    criteria: [
      'Ease of comprehension without requiring re-explanation',
      'Effective transitions between supporting thoughts',
      'Conciseness without unnecessary verbal bloat',
      'Audible conviction and professional cadence'
    ]
  },
  {
    id: 'fluency_delivery',
    name: 'Fluency and Speech Delivery',
    weight: 0.15, // 15%
    description: 'Speaking rhythm, filler-word suppression, pause control, and steady delivery pace.',
    criteria: [
      'Optimal speaking rate (110–150 words per minute)',
      'Low frequency of verbal crutches (um, uh, basically, like)',
      'Purposeful, controlled pauses instead of hesitations',
      'Unbroken verbal continuity across complete thoughts'
    ]
  },
  {
    id: 'vocabulary_language',
    name: 'Vocabulary and Language',
    weight: 0.10, // 10%
    description: 'Precision of terms, professional vocabulary, contextual appropriateness, and variety.',
    criteria: [
      'Precision of industry and academic terminology',
      'Avoidance of excessive repetition of identical phrasing',
      'Natural, professional word choice over unnecessary jargon',
      'Clarity of expression tailored to audience'
    ]
  },
  {
    id: 'grammar_syntax',
    name: 'Grammar and Sentence Construction',
    weight: 0.10, // 10%
    description: 'Syntactical accuracy, subject-verb agreement, sentence variety, and phrase structure.',
    criteria: [
      'Grammatical accuracy in spoken delivery',
      'Use of varied sentence structures (simple, compound, complex)',
      'Avoidance of run-on or trailing incomplete clauses',
      'Consistent tense and subject-verb harmony'
    ]
  },
  {
    id: 'listening_teamwork',
    name: 'Listening and Teamwork',
    weight: 0.10, // 10%
    description: 'Responsiveness to peers, respectful disagreement, active listening, and building on points.',
    criteria: [
      'Direct acknowledgement and integration of peer contributions',
      'Diplomatic, professional disagreement without confrontation',
      'Avoidance of interrupting or monopolizing floor time',
      'Encouraging collaborative consensus across diverse views'
    ]
  },
  {
    id: 'leadership_initiative',
    name: 'Leadership and Initiative',
    weight: 0.10, // 10%
    description: 'Framing discussions, steering focus, time consciousness, and summarizing consensus.',
    criteria: [
      'Constructive initiative in defining scope or refocusing tangents',
      'Synthesis of divergent viewpoints into actionable takeaways',
      'Time awareness during round progression',
      'Facilitating constructive balance rather than domination'
    ]
  },
  {
    id: 'relevance_evidence',
    name: 'Relevance, Examples and Supporting Evidence',
    weight: 0.10, // 10%
    description: 'Grounding arguments in empirical facts, case studies, statistics, and concrete analogies.',
    criteria: [
      'Direct relevance to the assigned placement topic prompt',
      'Concrete real-world case studies and industry analogies',
      'Measurable or empirical evidence cited to validate claims',
      'Moving beyond generic theoretical statements'
    ]
  }
];

export const rubricService = {
  /**
   * Validates that rubric weights sum to 1.0 (100%) and that all weights are valid.
   */
  validateWeights(weights: RubricDimensionDefinition[] = PLACEMENT_RUBRIC_CONFIG): boolean {
    if (!weights || weights.length !== 8) {
      throw new Error(`Invalid rubric: expected exactly 8 dimensions, received ${weights?.length || 0}.`);
    }

    const totalWeight = weights.reduce((acc, d) => acc + d.weight, 0);
    const rounded = Math.round(totalWeight * 100) / 100;

    if (rounded !== 1.0) {
      throw new Error(`Rubric weights must sum to 100% (1.0). Current sum: ${(totalWeight * 100).toFixed(1)}%.`);
    }

    for (const d of weights) {
      if (d.weight <= 0 || d.weight > 1.0) {
        throw new Error(`Dimension '${d.id}' has invalid weight: ${d.weight}. Must be > 0 and <= 1.0.`);
      }
    }

    return true;
  },

  /**
   * Maps a numeric score (0-100) to its standardized placement performance tier.
   */
  getPerformanceLevel(score: number): PerformanceLevel {
    if (score >= 80) return 'Strong';
    if (score >= 65) return 'Competent';
    if (score >= 50) return 'Developing';
    return 'Needs Improvement';
  },

  /**
   * Programmatically computes the final weighted score:
   * Final Score = Sum of (Dimension Score * Dimension Weight)
   */
  calculateFinalScore(
    scores: Record<PlacementDimensionId, number>,
    definitions: RubricDimensionDefinition[] = PLACEMENT_RUBRIC_CONFIG
  ): {
    overallScore: number;
    performanceLevel: PerformanceLevel;
    dimensionEvaluations: Partial<DimensionEvaluation>[];
  } {
    this.validateWeights(definitions);

    let totalWeightedScore = 0;
    const dimensionEvaluations: Partial<DimensionEvaluation>[] = [];

    for (const def of definitions) {
      const rawScore = Math.max(0, Math.min(100, Math.round(scores[def.id] ?? 50)));
      const weightedContrib = Math.round(rawScore * def.weight * 10) / 10;
      totalWeightedScore += rawScore * def.weight;

      dimensionEvaluations.push({
        id: def.id,
        name: def.name,
        weight: def.weight,
        score: rawScore,
        weightedContribution: weightedContrib,
        performanceLevel: this.getPerformanceLevel(rawScore)
      });
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(totalWeightedScore)));

    return {
      overallScore: finalScore,
      performanceLevel: this.getPerformanceLevel(finalScore),
      dimensionEvaluations
    };
  }
};
