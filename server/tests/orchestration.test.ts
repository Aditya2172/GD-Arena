import { describe, it, expect } from 'vitest';
import { orchestrationService, AI_PERSONALITIES } from '../src/services/orchestrationService.js';
import { discussionMemoryService } from '../src/services/discussionMemoryService.js';
import { adaptiveEngine } from '../src/services/adaptiveEngine.js';
import { DiscussionMessage, DiscussionSession } from '../src/types/index.js';

describe('Multi-Agent Orchestration & Adaptive Engine', () => {
  it('should load all 6 configured personalities properly', () => {
    const allPersonalities = orchestrationService.getSessionPersonalities([
      'analytical', 
      'devils_advocate', 
      'collaborative', 
      'confident', 
      'practical', 
      'synthesizer'
    ]);
    expect(allPersonalities).toHaveLength(6);
    expect(allPersonalities.map(p => p.id)).toEqual([
      'analytical', 
      'devils_advocate', 
      'collaborative', 
      'confident', 
      'practical', 
      'synthesizer'
    ]);
  });

  it('should prevent consecutive turns by the same speaker', () => {
    const available = [
      AI_PERSONALITIES.analytical,
      AI_PERSONALITIES.devils_advocate,
      AI_PERSONALITIES.collaborative
    ];

    const messages: DiscussionMessage[] = [
      {
        id: '1',
        session_id: 's1',
        speaker_type: 'ai',
        speaker_name: 'Dr. Aarav Mehta', // analytical
        personality: 'analytical',
        message_text: 'Let us consider the economic impact.',
        sequence_number: 1,
        created_at: new Date().toISOString()
      }
    ];

    const nextSpeaker = orchestrationService.selectNextSpeaker(available, messages);
    expect(nextSpeaker.name).not.toBe('Dr. Aarav Mehta');
  });

  it('should balance participation across all active agents', () => {
    const available = [
      AI_PERSONALITIES.analytical,
      AI_PERSONALITIES.devils_advocate
    ];

    const messages: DiscussionMessage[] = [
      {
        id: '1',
        session_id: 's1',
        speaker_type: 'ai',
        speaker_name: 'Dr. Aarav Mehta',
        personality: 'analytical',
        message_text: 'First point.',
        sequence_number: 1,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        session_id: 's1',
        speaker_type: 'user',
        speaker_name: 'Candidate',
        message_text: 'I disagree with that stance.',
        sequence_number: 2,
        created_at: new Date().toISOString()
      }
    ];

    // Rohan Verma (devils_advocate) has 0 turns, Dr. Aarav has 1. Rohan should speak next.
    const nextSpeaker = orchestrationService.selectNextSpeaker(available, messages);
    expect(nextSpeaker.id).toBe('devils_advocate');
  });

  it('should adaptively select conversational move and speaker based on student contribution', () => {
    const session: DiscussionSession = {
      id: 'session-adaptive-test',
      user_id: 'user-1',
      topic: 'Should AI replace human workers?',
      difficulty: 'Intermediate',
      duration_minutes: 5,
      participant_count: 4,
      discussion_style: 'Placement preparation',
      language: 'English',
      selected_personalities: ['analytical', 'devils_advocate', 'practical', 'collaborative'],
      status: 'in_progress',
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const memory = discussionMemoryService.getOrCreateMemory(session);

    // Scenario 1: Student mentions jobs and data science opportunities
    const studentClaim = "AI will reduce some repetitive jobs, but it will create massive new opportunities in data science and machine learning.";
    const decision = adaptiveEngine.decideNextMove(
      studentClaim, 
      memory, 
      ['analytical', 'devils_advocate', 'practical', 'collaborative']
    );

    expect(decision.moveType).toBe('introduce_counterexample');
    expect(decision.speakerId).toBe('devils_advocate');
    expect(decision.targetConcept).toContain('non-technical workforce');

    // Scenario 2: Generate fallback response matching the context
    const adaptiveResponse = adaptiveEngine.generateAdaptiveTurnFallback(
      session,
      AI_PERSONALITIES[decision.speakerId],
      studentClaim,
      decision,
      memory
    );

    expect(adaptiveResponse).toContain('non-technical disciplines');
    expect(adaptiveResponse).not.toContain('While that sounds promising in theory');
  });

  it('should track and prevent repetitive questions in shared discussion memory', () => {
    const sessionId = 'test-session-anti-repetition';
    const question1 = "What about graduates from non-technical disciplines without a coding background?";
    const keywords = ['non-technical', 'graduates', 'coding'];

    discussionMemoryService.recordQuestion(
      sessionId,
      'Rohan Verma',
      question1,
      'introduce_counterexample',
      keywords,
      1
    );

    // Verbatim repetition check
    const isRepetitiveVerbatim = discussionMemoryService.isQuestionRepetitive(
      sessionId,
      question1,
      keywords
    );
    expect(isRepetitiveVerbatim).toBe(true);

    // Concept overlap check
    const similarQuestion = "How can non-technical graduates survive if they lack coding background?";
    const isRepetitiveConcept = discussionMemoryService.isQuestionRepetitive(
      sessionId,
      similarQuestion,
      ['non-technical', 'coding']
    );
    expect(isRepetitiveConcept).toBe(true);

    // Completely new question should not be flagged as repetitive
    const newQuestion = "Who should bear the fiscal burden of providing high-speed internet in rural universities?";
    const isNewRepetitive = discussionMemoryService.isQuestionRepetitive(
      sessionId,
      newQuestion,
      ['fiscal', 'internet', 'rural']
    );
    expect(isNewRepetitive).toBe(false);
  });
});
