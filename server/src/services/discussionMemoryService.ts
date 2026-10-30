import { 
  SharedDiscussionMemory, 
  DiscussionSession, 
  DiscussionMessage, 
  DiscussionStage, 
  TrackedArgument, 
  TrackedQuestion, 
  ConversationalMoveType 
} from '../types/index.js';

class DiscussionMemoryService {
  // Session memory store isolated by session ID
  private memoryStore: Map<string, SharedDiscussionMemory> = new Map();

  /**
   * Retrieves or initializes the structured discussion memory for a session
   */
  getOrCreateMemory(session: DiscussionSession): SharedDiscussionMemory {
    let memory = this.memoryStore.get(session.id);
    if (!memory) {
      memory = {
        sessionId: session.id,
        topic: session.topic,
        objective: session.discussion_style || 'Placement preparation',
        currentStage: 'topic_intro',
        stageProgress: 10,
        arguments: [],
        agreements: [],
        disagreements: [],
        unresolvedQuestions: [],
        askedQuestions: [],
        conclusions: [],
        candidateWeaknesses: [],
        candidateKeyClaims: [],
        rollingSummary: `Discussion opened on the topic: "${session.topic}".`
      };
      this.memoryStore.set(session.id, memory);
    }
    return memory;
  }

  /**
   * Updates memory based on new messages and session progress
   */
  updateMemory(session: DiscussionSession, messages: DiscussionMessage[]): SharedDiscussionMemory {
    const memory = this.getOrCreateMemory(session);
    const turnCount = messages.length;

    // 1. Determine dynamic discussion stage
    memory.currentStage = this.determineStage(turnCount, session.duration_minutes);
    memory.stageProgress = Math.min(100, Math.round((turnCount / 12) * 100));

    // 2. Parse candidate arguments from user messages
    const userMessages = messages.filter(m => m.speaker_type === 'user');
    userMessages.forEach(um => {
      const existing = memory.candidateKeyClaims.some(c => c.toLowerCase() === um.message_text.toLowerCase());
      if (!existing && um.message_text.trim().length > 10) {
        memory.candidateKeyClaims.push(um.message_text.trim());
        
        // Register argument
        const arg: TrackedArgument = {
          id: `arg-${um.id || Date.now()}`,
          speaker: um.speaker_name,
          speakerType: 'user',
          claim: um.message_text.trim(),
          needsEvidence: !/(data|study|survey|percent|example|instance|according|research)/i.test(um.message_text),
          turnSequence: um.sequence_number
        };
        if (!memory.arguments.some(a => a.claim === arg.claim)) {
          memory.arguments.push(arg);
        }
      }
    });

    // 3. Update rolling summary of the discussion
    if (turnCount > 1) {
      const recent = messages.slice(-4);
      const points = recent.map(m => `${m.speaker_name}: "${m.message_text.slice(0, 80)}..."`).join(' | ');
      memory.rollingSummary = `Stage: ${memory.currentStage}. Active points: ${points}`;
    }

    return memory;
  }

  /**
   * Automatically computes the discussion progression stage
   */
  private determineStage(turnCount: number, durationMinutes: number = 5): DiscussionStage {
    if (turnCount <= 1) return 'topic_intro';
    if (turnCount <= 3) return 'initial_viewpoints';
    if (turnCount <= 6) return 'argument_development';
    if (turnCount <= 8) return 'counterarguments';
    if (turnCount <= 10) return 'evidence_deepening';
    return 'synthesis_conclusion';
  }

  /**
   * Records an asked question to guarantee anti-repetition
   */
  recordQuestion(
    sessionId: string, 
    speaker: string, 
    question: string, 
    intent: ConversationalMoveType,
    conceptKeywords: string[],
    turnSequence: number
  ): void {
    let memory = this.memoryStore.get(sessionId);
    if (!memory) {
      memory = {
        sessionId,
        topic: 'Discussion',
        objective: 'Placement preparation',
        currentStage: 'argument_development',
        stageProgress: 30,
        arguments: [],
        agreements: [],
        disagreements: [],
        unresolvedQuestions: [],
        askedQuestions: [],
        conclusions: [],
        candidateWeaknesses: [],
        candidateKeyClaims: [],
        rollingSummary: ''
      };
      this.memoryStore.set(sessionId, memory);
    }

    memory.askedQuestions.push({
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      speaker,
      target: 'Candidate',
      question: question.trim(),
      intent,
      conceptKeywords,
      turnSequence,
      answered: false
    });
  }

  /**
   * Checks whether a question or its underlying intent has already been asked
   */
  isQuestionRepetitive(sessionId: string, newQuestion: string, keywords: string[]): boolean {
    const memory = this.memoryStore.get(sessionId);
    if (!memory || memory.askedQuestions.length === 0) return false;

    const lowerNew = newQuestion.toLowerCase();

    for (const asked of memory.askedQuestions) {
      const lowerAsked = asked.question.toLowerCase();

      // Check verbatim overlap
      if (lowerNew === lowerAsked) return true;

      // Check keyword overlap
      const sharedKeywords = keywords.filter(kw => 
        lowerAsked.includes(kw.toLowerCase()) || asked.conceptKeywords.some(akw => akw.toLowerCase() === kw.toLowerCase())
      );

      // If more than 2 specific concepts and intent match, flag as repetitive
      if (sharedKeywords.length >= 2 && asked.intent) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clears memory when session finishes or for isolation
   */
  clearMemory(sessionId: string): void {
    this.memoryStore.delete(sessionId);
  }
}

export const discussionMemoryService = new DiscussionMemoryService();
