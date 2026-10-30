import { AIPersonality, AIPersonalityId, DiscussionMessage, DiscussionSession } from '../types/index.js';
import { aiService } from './aiService.js';
import { discussionMemoryService } from './discussionMemoryService.js';
import { adaptiveEngine } from './adaptiveEngine.js';

export const AI_PERSONALITIES: Record<AIPersonalityId, AIPersonality> = {
  analytical: {
    id: 'analytical',
    name: 'Dr. Aarav Mehta',
    roleTitle: 'The Analytical Thinker',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    description: 'Uses logical reasoning, structured frameworks, and empirical examples.',
    speechRate: 0.95,
    speechPitch: 1.0,
    promptInstructions: `You are Dr. Aarav Mehta, 'The Analytical Thinker' in a formal group discussion.
- Communication style: Structured, analytical, logical, and evidence-oriented.
- Highlight metrics, cause-and-effect relationships, and trade-offs.
- Avoid emotional appeals; focus on pragmatic reality.
- Speak in 2 to 3 concise spoken sentences. Never speak in lists or bullet points.`
  },

  devils_advocate: {
    id: 'devils_advocate',
    name: 'Rohan Verma',
    roleTitle: "The Devil's Advocate",
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    description: 'Challenges assumptions, introduces counterarguments, and probes hidden weaknesses.',
    speechRate: 1.05,
    speechPitch: 0.95,
    promptInstructions: `You are Rohan Verma, 'The Devil's Advocate' in a formal group discussion.
- Communication style: Skeptical, sharp, inquisitive, challenging common assumptions.
- Respectfully challenge the user or previous speaker's claims with a tough counter-question.
- Probe unintended consequences, cost overruns, or edge cases.
- Speak in 2 to 3 punchy, conversational sentences. Never use bullet points.`
  },

  collaborative: {
    id: 'collaborative',
    name: 'Ananya Sharma',
    roleTitle: 'The Collaborative Communicator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    description: 'Builds upon previous arguments, synthesizes divergent opinions, and fosters consensus.',
    speechRate: 1.0,
    speechPitch: 1.1,
    promptInstructions: `You are Ananya Sharma, 'The Collaborative Communicator' in a formal group discussion.
- Communication style: Empathetic, diplomatic, constructive, and unifying.
- Acknowledge the user's viewpoint positively, bridge differing perspectives, and suggest balanced compromises.
- Encourage a collaborative spirit without being passive.
- Speak in 2 to 3 natural, conversational sentences. Never use bullet points.`
  },

  confident: {
    id: 'confident',
    name: 'Vikram Malhotra',
    roleTitle: 'The Confident Speaker',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    description: 'Speaks assertively, delivers decisive stances, and uses compelling rhetoric.',
    speechRate: 1.1,
    speechPitch: 0.9,
    promptInstructions: `You are Vikram Malhotra, 'The Confident Speaker' in a formal group discussion.
- Communication style: Assertive, forward-looking, decisive, and persuasive.
- Take a clear, definitive stance. Emphasize vision, execution capability, and industry urgency.
- Speak with conviction and clarity.
- Speak in 2 to 3 powerful spoken sentences. Never use bullet points.`
  },

  practical: {
    id: 'practical',
    name: 'Neha Kulkarni',
    roleTitle: 'The Practical Thinker',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    description: 'Evaluates implementation costs, fiscal responsibility, resource limits, and execution feasibility.',
    speechRate: 1.0,
    speechPitch: 1.05,
    promptInstructions: `You are Neha Kulkarni, 'The Practical Thinker' in a formal group discussion.
- Communication style: Grounded, operational, budget-conscious, and implementation-focused.
- Question who pays, how long execution takes, and what practical hurdles stand in the way.
- Speak in 2 to 3 concise spoken sentences. Never use bullet points.`
  },

  synthesizer: {
    id: 'synthesizer',
    name: 'Kabir Sen',
    roleTitle: 'The Discussion Synthesizer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    description: 'Identifies common ground, resolves conflicts, and structures actionable takeaways.',
    speechRate: 0.98,
    speechPitch: 0.98,
    promptInstructions: `You are Kabir Sen, 'The Discussion Synthesizer' in a formal group discussion.
- Communication style: Balanced, high-level, integrative, and consensus-building.
- Summarize divergent viewpoints, highlight emerging agreements, and guide the group toward a cohesive conclusion.
- Speak in 2 to 3 polished, conversational sentences. Never use bullet points.`
  }
};

export const orchestrationService = {
  /**
   * Retrieves active personality profiles configured for a session
   */
  getSessionPersonalities(personalityIds: AIPersonalityId[]): AIPersonality[] {
    return personalityIds.map(id => AI_PERSONALITIES[id]).filter(Boolean);
  },

  /**
   * Intelligent Turn Selector: Picks the next AI speaker based on:
   * 1. The conversational move required
   * 2. Participation balance (who has spoken least)
   * 3. Turn continuity (never the same AI in consecutive AI turns)
   */
  selectNextSpeaker(
    availablePersonalities: AIPersonality[], 
    recentMessages: DiscussionMessage[],
    recommendedSpeakerId?: AIPersonalityId
  ): AIPersonality {
    if (availablePersonalities.length === 1) return availablePersonalities[0];

    // Find the last AI speaker who spoke
    const lastAiMessage = [...recentMessages].reverse().find(m => m.speaker_type === 'ai');
    const lastAiSpeakerId = lastAiMessage?.personality;

    // Filter out whoever just spoke as AI to ensure dynamic multi-party interaction
    const candidates = availablePersonalities.filter(p => p.id !== lastAiSpeakerId);
    const pool = candidates.length > 0 ? candidates : availablePersonalities;

    // Count appearances of each AI participant in recent turns
    const countMap: Record<string, number> = {};
    availablePersonalities.forEach(p => countMap[p.id] = 0);
    
    recentMessages.forEach(m => {
      if (m.speaker_type === 'ai' && m.personality) {
        countMap[m.personality] = (countMap[m.personality] || 0) + 1;
      }
    });

    let lowestCount = Infinity;
    for (const p of pool) {
      const count = countMap[p.id] || 0;
      if (count < lowestCount) {
        lowestCount = count;
      }
    }

    // If recommended speaker from adaptive engine is in the pool and not dominating, prioritize them
    if (recommendedSpeakerId && recommendedSpeakerId !== lastAiSpeakerId) {
      const match = pool.find(p => p.id === recommendedSpeakerId);
      if (match && (countMap[match.id] || 0) <= lowestCount + 1) {
        return match;
      }
    }

    // Otherwise, select the one with lowest participation count
    let selected = pool[0];
    let minTurns = Infinity;

    for (const p of pool) {
      const count = countMap[p.id] || 0;
      if (count < minTurns) {
        minTurns = count;
        selected = p;
      }
    }

    return selected;
  },

  /**
   * Generates opening remarks for the discussion room to set the stage
   */
  async generateDiscussionStarter(session: DiscussionSession): Promise<{ speaker: AIPersonality; text: string }> {
    const activePersonalities = this.getSessionPersonalities(session.selected_personalities);
    const initiator = activePersonalities.find(p => p.id === 'analytical') 
      || activePersonalities.find(p => p.id === 'confident') 
      || activePersonalities[0];

    const systemPrompt = `You are opening a formal campus recruitment group discussion on the topic: "${session.topic}".
Format: Style is ${session.discussion_style}, difficulty level: ${session.difficulty}.
You are speaking as ${initiator.name} (${initiator.roleTitle}).
${initiator.promptInstructions}

Task: State a crisp 2-sentence opening observation to frame the topic, and invite the candidates to share their perspective.
Speak conversationally as if addressing a room. Do not exceed 50 words.`;

    const starterText = await aiService.generateText({
      systemPrompt,
      userPrompt: `Begin the group discussion on "${session.topic}".`
    });

    // Record opening stage in memory
    discussionMemoryService.getOrCreateMemory(session);

    return {
      speaker: initiator,
      text: starterText
    };
  },

  /**
   * Generates a context-aware AI response during active discussion
   */
  async generateNextTurn(
    session: DiscussionSession,
    messages: DiscussionMessage[]
  ): Promise<{ speaker: AIPersonality; text: string }> {
    // 1. Update shared discussion memory
    const memory = discussionMemoryService.updateMemory(session, messages);
    const activePersonalities = this.getSessionPersonalities(session.selected_personalities);

    // 2. Extract last candidate message and last AI speaker
    const lastUserMessage = [...messages].reverse().find(m => m.speaker_type === 'user');
    const candidateText = lastUserMessage?.message_text || '';
    const lastAiMessage = [...messages].reverse().find(m => m.speaker_type === 'ai');
    const lastAiSpeakerId = lastAiMessage?.personality;

    // 3. Adaptive move decision
    const activeIds = activePersonalities.map(p => p.id);
    const decision = adaptiveEngine.decideNextMove(candidateText, memory, activeIds, lastAiSpeakerId);

    // 4. Select speaker
    const nextSpeaker = this.selectNextSpeaker(activePersonalities, messages, decision.speakerId);

    // 5. Format transcript context
    const recentTranscript = messages.slice(-6).map(m => {
      const roleTag = m.speaker_type === 'user' ? 'Candidate (User)' : `${m.speaker_name}`;
      return `${roleTag}: "${m.message_text}"`;
    }).join('\n');

    const previouslyAskedQuestions = memory.askedQuestions.map(q => `"${q.question}"`).slice(-4).join(', ');

    const systemPrompt = `You are a participant in a formal group discussion.
Topic: "${session.topic}"
Difficulty: ${session.difficulty}
Current Discussion Stage: ${memory.currentStage.toUpperCase()}
Your Assigned Conversational Move: ${decision.moveType.toUpperCase()} (Target: ${decision.targetConcept})

You are: ${nextSpeaker.name} (${nextSpeaker.roleTitle}).
${nextSpeaker.promptInstructions}

CRITICAL ADAPTIVE RULES:
1. Speak in a natural voice-friendly conversational cadence (2 to 3 sentences, 40-65 words).
2. Directly build on, challenge, or advance the Candidate's point: "${candidateText}".
3. ANTI-REPETITION: Do NOT repeat previously asked questions: [${previouslyAskedQuestions || 'None yet'}].
4. BANNED: Never ask generic questions like "Can you explain more?", "What do you think?", or "Can you elaborate?".
5. Always tie follow-ups specifically to candidate's words or stated logic.
6. DO NOT use emojis, bullet points, headers, or quotes.
7. Never state 'As an AI'; you are a student candidate participating in this discussion room.`;

    const userPrompt = `Here is the recent transcript of our discussion:\n${recentTranscript}\n\nCandidate just said: "${candidateText}"\nExecute your move (${decision.moveType}) targeting "${decision.targetConcept}". What is your spoken response?`;

    let responseText = await aiService.generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.75,
      maxTokens: 160
    });

    // If external LLM is not configured or returned generic fallback, use our high-fidelity adaptive fallback
    if (!responseText || responseText.includes('While that sounds promising in theory') || responseText.includes('Looking at the structural trade-offs')) {
      responseText = adaptiveEngine.generateAdaptiveTurnFallback(
        session,
        nextSpeaker,
        candidateText,
        decision,
        memory
      );
    }

    // Record question to ensure anti-repetition across subsequent turns
    discussionMemoryService.recordQuestion(
      session.id,
      nextSpeaker.name,
      responseText,
      decision.moveType,
      [decision.targetConcept],
      messages.length + 1
    );

    return {
      speaker: nextSpeaker,
      text: responseText
    };
  }
};
