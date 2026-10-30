import { describe, it, expect } from 'vitest';
import { reportService } from '../src/services/reportService.js';
import { rubricService, PLACEMENT_RUBRIC_CONFIG } from '../src/services/rubricConfig.js';
import { speechAnalyticsService } from '../src/services/speechAnalytics.js';
import { DiscussionSession, DiscussionMessage } from '../src/types/index.js';

describe('Report Assessment & Rubric Engine', () => {
  const mockSession: DiscussionSession = {
    id: 'test-session-1',
    user_id: 'test-user-1',
    topic: 'Remote Work vs Office Work',
    difficulty: 'Intermediate',
    duration_minutes: 10,
    participant_count: 3,
    discussion_style: 'Placement preparation',
    language: 'English',
    selected_personalities: ['analytical', 'devils_advocate', 'collaborative'],
    status: 'in_progress',
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  it('should validate that the 8 placement dimensions sum to exactly 100%', () => {
    expect(() => rubricService.validateWeights(PLACEMENT_RUBRIC_CONFIG)).not.toThrow();
    const sum = PLACEMENT_RUBRIC_CONFIG.reduce((acc, d) => acc + d.weight, 0);
    expect(Math.round(sum * 100) / 100).toBe(1.0);
    expect(PLACEMENT_RUBRIC_CONFIG).toHaveLength(8);
  });

  it('should reject invalid rubric configurations where weights do not equal 1.0', () => {
    const invalidConfig = PLACEMENT_RUBRIC_CONFIG.map(d => ({ ...d, weight: 0.10 })); // sums to 80%
    expect(() => rubricService.validateWeights(invalidConfig)).toThrow(/must sum to 100%/);
  });

  it('should accurately calculate the programmatic weighted score', () => {
    // Test known score calculation:
    // All 80s: 80 * 1.0 = 80
    const perfectScores = {
      content_logic: 80,
      communication_clarity: 80,
      fluency_delivery: 80,
      vocabulary_language: 80,
      grammar_syntax: 80,
      listening_teamwork: 80,
      leadership_initiative: 80,
      relevance_evidence: 80
    };
    const result = rubricService.calculateFinalScore(perfectScores);
    expect(result.overallScore).toBe(80);
    expect(result.performanceLevel).toBe('Strong');

    // Test mixed score calculation:
    // content_logic (20%): 100 => 20
    // communication_clarity (15%): 60 => 9
    // fluency_delivery (15%): 60 => 9
    // others (5 * 10% = 50%): 60 => 30
    // Total = 20 + 9 + 9 + 30 = 68
    const mixedScores = {
      content_logic: 100,
      communication_clarity: 60,
      fluency_delivery: 60,
      vocabulary_language: 60,
      grammar_syntax: 60,
      listening_teamwork: 60,
      leadership_initiative: 60,
      relevance_evidence: 60
    };
    const mixedResult = rubricService.calculateFinalScore(mixedScores);
    expect(mixedResult.overallScore).toBe(68);
    expect(mixedResult.performanceLevel).toBe('Competent');
  });

  it('should detect filler words and calculate speaking rate in speechAnalytics', () => {
    const messages: DiscussionMessage[] = [
      {
        id: 'msg-1',
        session_id: 'test-session-1',
        speaker_type: 'user',
        speaker_name: 'Candidate',
        message_text: 'Basically, um, I think remote work is actually very efficient, like you know, for engineering teams.',
        sequence_number: 1,
        created_at: new Date().toISOString()
      }
    ];

    const metrics = speechAnalyticsService.computeSpeechMetrics(messages, 5);
    expect(metrics.totalWordsSpoken).toBeGreaterThan(10);
    expect(metrics.fillerWordsCount).toBeGreaterThanOrEqual(3); // basically, um, actually, like, you know
    expect(metrics.speakingRateWpm).toBeGreaterThan(0);
    expect(metrics.pronunciationStatus).toContain('Browser Transcript Only');
  });

  it('should generate an insufficient data report if candidate spoke too little', async () => {
    const messages: DiscussionMessage[] = [
      {
        id: 'm1',
        session_id: 'test-session-1',
        speaker_type: 'ai',
        speaker_name: 'Dr. Aarav Mehta',
        message_text: 'Welcome everyone, let us begin.',
        sequence_number: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'm2',
        session_id: 'test-session-1',
        speaker_type: 'user',
        speaker_name: 'Candidate',
        message_text: 'Yes.', // Single word, insufficient
        sequence_number: 2,
        created_at: new Date().toISOString()
      }
    ];

    const report = await reportService.generateReport(mockSession, messages, 'test-user-1');
    expect(report.overall_score).toBeLessThan(50);
    expect(report.discussion_summary).toContain('insufficient');
    expect(report.performance_level).toBe('Needs Improvement');
  });

  it('should validate all 8 dimensions and 7 evaluator perspectives', async () => {
    const messages: DiscussionMessage[] = [
      {
        id: 'm1',
        session_id: 'test-session-1',
        speaker_type: 'user',
        speaker_name: 'Candidate',
        message_text: 'Remote work enhances productivity when companies provide asynchronous communication tools, but team alignment can degrade without clear weekly milestones.',
        sequence_number: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'm2',
        session_id: 'test-session-1',
        speaker_type: 'user',
        speaker_name: 'Candidate',
        message_text: 'Furthermore, junior developers miss serendipitous mentorship when fully isolated, so a structured hybrid cadence is optimal.',
        sequence_number: 2,
        created_at: new Date().toISOString()
      }
    ];

    const report = await reportService.generateReport(mockSession, messages, 'test-user-1');
    expect(report.overall_score).toBeGreaterThanOrEqual(0);
    expect(report.overall_score).toBeLessThanOrEqual(100);

    // 8 Dimension evaluations present
    expect(report.dimension_evaluations).toHaveLength(8);
    report.dimension_evaluations.forEach(dim => {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
      expect(dim.weight).toBeGreaterThan(0);
      expect(dim.weightedContribution).toBeDefined();
    });

    // 7 Evaluator perspectives present
    expect(report.evaluator_perspectives).toHaveLength(7);
    const evaluatorIds = report.evaluator_perspectives.map(e => e.id);
    expect(evaluatorIds).toContain('content_reasoning');
    expect(evaluatorIds).toContain('communication');
    expect(evaluatorIds).toContain('vocabulary');
    expect(evaluatorIds).toContain('speech_fluency');
    expect(evaluatorIds).toContain('teamwork_listening');
    expect(evaluatorIds).toContain('leadership');
    expect(evaluatorIds).toContain('placement_panel');

    // Evidence findings & speech clarity present
    expect(report.evidence_findings.length).toBeGreaterThan(0);
    expect(report.speech_clarity.speakingRateWpm).toBeGreaterThan(0);
    expect(report.improvement_plan.recommendedExercises.length).toBeGreaterThan(0);
  });
});
