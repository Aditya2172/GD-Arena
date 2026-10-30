import { 
  AIPersonality, 
  AIPersonalityId, 
  DiscussionMessage, 
  DiscussionSession, 
  ConversationalMoveType, 
  SharedDiscussionMemory 
} from '../types/index.js';
import { aiService } from './aiService.js';
import { discussionMemoryService } from './discussionMemoryService.js';

export interface AdaptiveMoveDecision {
  moveType: ConversationalMoveType;
  speakerId: AIPersonalityId;
  targetConcept: string;
  rationale: string;
}

export const adaptiveEngine = {
  /**
   * Analyzes candidate's contribution and chooses the optimal next conversational move
   */
  decideNextMove(
    candidateText: string, 
    memory: SharedDiscussionMemory, 
    availablePersonalities: AIPersonalityId[],
    lastAiSpeakerId?: AIPersonalityId
  ): AdaptiveMoveDecision {
    const textLower = candidateText.toLowerCase().trim();
    const wordCount = candidateText.trim().split(/\s+/).filter(Boolean).length;
    const nonRecent = availablePersonalities.filter(id => id !== lastAiSpeakerId);
    const pool = nonRecent.length > 0 ? nonRecent : availablePersonalities;

    // 1. If response is extremely brief or evasive -> Request Clarification
    if (wordCount < 10) {
      const speakerId = pool.includes('analytical') ? 'analytical' : pool[0];
      return {
        moveType: 'request_clarification',
        speakerId,
        targetConcept: candidateText.trim(),
        rationale: 'Candidate input was brief; requesting structured elaboration.'
      };
    }

    // 2. Check stage of discussion
    const stage = memory.currentStage;

    // If in Synthesis stage -> Move to Synthesis or Common Ground
    if (stage === 'synthesis_conclusion') {
      const synthSpeaker: AIPersonalityId = pool.includes('synthesizer') 
        ? 'synthesizer' 
        : pool.includes('collaborative') 
          ? 'collaborative' 
          : pool[0];

      return {
        moveType: 'move_to_synthesis',
        speakerId: synthSpeaker,
        targetConcept: this.extractKeyConcept(candidateText),
        rationale: 'Discussion is in final phase; synthesizing core arguments into conclusions.'
      };
    }

    // 3. Concept-driven contextual moves
    // If student mentions jobs/data science/automation/tech/replacement
    if (/\b(job|jobs|data science|ai|automation|replace|opportunity|opportunities|workers|career)\b/i.test(textLower)) {
      const speakerId: AIPersonalityId = pool.includes('devils_advocate')
        ? 'devils_advocate'
        : pool.includes('analytical')
          ? 'analytical'
          : pool[0];

      return {
        moveType: 'introduce_counterexample',
        speakerId,
        targetConcept: 'non-technical workforce and digital divide',
        rationale: 'Student focused on tech gains; probing the socioeconomic divide.'
      };
    }

    // If student mentions training/education/college/curriculum
    if (/\b(training|retraining|college|colleges|university|universities|education|curriculum|degree|syllabus)\b/i.test(textLower)) {
      const speakerId: AIPersonalityId = pool.includes('practical') 
        ? 'practical' 
        : pool.includes('devils_advocate') 
          ? 'devils_advocate' 
          : pool[0];

      return {
        moveType: 'explore_consequence',
        speakerId,
        targetConcept: 'institutional retraining feasibility and costs',
        rationale: 'Student proposed training/education; exploring execution friction and costs.'
      };
    }

    // If student mentions cost/money/government/policy/regulation
    if (/(cost|money|fund|government|policy|regulation|tax|law|enforce)/i.test(textLower)) {
      const speakerId: AIPersonalityId = pool.includes('analytical')
        ? 'analytical'
        : pool.includes('practical')
          ? 'practical'
          : pool[0];

      return {
        moveType: 'compare_alternatives',
        speakerId,
        targetConcept: 'public vs private sector responsibility',
        rationale: 'Policy point raised; challenging allocation of responsibility.'
      };
    }

    // If student makes a broad claim without empirical backing
    const hasDataCitation = /(percent|%|study|research|data|survey|instance|report)/i.test(textLower);
    if (!hasDataCitation) {
      const speakerId: AIPersonalityId = pool.includes('analytical')
        ? 'analytical'
        : pool.includes('practical')
          ? 'practical'
          : pool[0];

      return {
        moveType: 'ask_supporting_evidence',
        speakerId,
        targetConcept: this.extractKeyConcept(candidateText),
        rationale: 'Claim lacks supporting empirical evidence; prompting for validation.'
      };
    }

    // Default: Challenge assumption respectfully
    const defaultSpeaker: AIPersonalityId = pool.includes('devils_advocate')
      ? 'devils_advocate'
      : pool.includes('collaborative')
        ? 'collaborative'
        : pool[0];

    return {
      moveType: 'challenge_assumption',
      speakerId: defaultSpeaker,
      targetConcept: this.extractKeyConcept(candidateText),
      rationale: 'Deepening argument by challenging underlying premises.'
    };
  },

  /**
   * Extracts the most prominent noun-phrase or conceptual anchor from candidate statement
   */
  extractKeyConcept(text: string): string {
    const cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
    const words = cleaned.split(/\s+/).filter(w => w.length > 4 && !/^(about|their|there|which|would|could|should|these|those|because|between)$/i.test(w));
    if (words.length >= 2) {
      return `${words[words.length - 2]} ${words[words.length - 1]}`;
    }
    return words[0] || 'this point';
  },

  /**
   * Deterministic Adaptive Heuristic Generator (Ensures high quality even in demo / offline mode!)
   */
  generateAdaptiveTurnFallback(
    session: DiscussionSession,
    speaker: AIPersonality,
    candidateText: string,
    decision: AdaptiveMoveDecision,
    memory: SharedDiscussionMemory
  ): string {
    const textLower = candidateText.toLowerCase();
    const concept = decision.targetConcept || this.extractKeyConcept(candidateText);

    switch (speaker.id) {
      case 'devils_advocate':
        if (textLower.includes('data science') || textLower.includes('opportunity') || textLower.includes('tech')) {
          return `You mentioned new opportunities in ${concept}, but what about graduates from non-technical disciplines without a coding background? How realistically can they pivot into these roles before their livelihood is disrupted?`;
        }
        if (textLower.includes('government') || textLower.includes('policy') || textLower.includes('rule')) {
          return `Relying on state policy sounds ideal in theory, but regulatory frameworks consistently lag behind technological disruption by years. In the meantime, who protects displaced junior workers?`;
        }
        return `That is a common assumption, but doesn't this overlook the immediate socioeconomic friction? If organizations adopt this without guardrails, what prevents significant early-stage inequities?`;

      case 'analytical':
        if (textLower.includes('training') || textLower.includes('college') || textLower.includes('education')) {
          return `Looking at institutional capacity, curriculum restructuring in engineering and commerce universities requires several academic cycles. How do you propose closing that timeline deficit for the upcoming graduating batch?`;
        }
        return `Breaking down the cause-and-effect relationship regarding ${concept}, empirical metrics show that initial capital expenditure often crowds out other student initiatives. Do the projected efficiency gains outweigh that downside risk?`;

      case 'practical':
        return `From an operational perspective regarding ${concept}, who carries the primary financial and logistical burden—corporations, universities, or students themselves? The execution costs often derail well-intentioned proposals.`;

      case 'synthesizer':
        return `Connecting your insight on ${concept} with our earlier debate on industry preparedness, it seems we have consensus that proactive intervention is non-negotiable. Should our primary recommendation focus on public policy or private sector initiatives?`;

      case 'confident':
        return `I agree that decisive action regarding ${concept} is essential. The organizations and candidates that master this transition early will capture the market, while passive institutions will struggle to survive.`;

      case 'collaborative':
      default:
        return `You've articulated a crucial dimension regarding ${concept}. Building upon that perspective, how can we balance that innovation with safeguarding foundational employment standards for campus recruits?`;
    }
  }
};
