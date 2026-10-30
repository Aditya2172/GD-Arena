import { 
  DiscussionMessage, 
  SpeechClarityMetrics, 
  LanguageRecommendation,
  EvidenceFinding 
} from '../types/index.js';

const FILLER_WORDS = [
  'um', 'uh', 'basically', 'actually', 'like', 'you know', 
  'sort of', 'kind of', 'literally', 'i mean', 'so yeah'
];

export const speechAnalyticsService = {
  /**
   * Computes Speech Clarity Lab metrics from candidate utterances.
   */
  computeSpeechMetrics(
    userMessages: DiscussionMessage[], 
    sessionDurationMinutes: number = 5
  ): SpeechClarityMetrics {
    if (userMessages.length === 0) {
      return {
        speakingDurationMinutes: 0,
        totalWordsSpoken: 0,
        speakingRateWpm: 0,
        rateStatus: 'Estimated',
        fillerWordsCount: 0,
        fillerWordsBreakdown: [],
        fillerWordsFrequencyPer100Words: 0,
        repeatedPhrasesCount: 0,
        pauseHesitationNote: 'No candidate speech recorded in session.',
        pronunciationStatus: 'Browser Transcript Only (Pronunciation ML requires dedicated acoustic model)',
        pronunciationNote: 'Browser SpeechRecognition does not provide phoneme-level acoustic audio tensors. Pronunciation grading is honest: not fabricated from text.'
      };
    }

    const fullText = userMessages.map(m => m.message_text).join(' ');
    const words = fullText.trim().split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Estimate candidate speaking duration based on turns (average ~18-30s per turn or scaled to session)
    // Avoid assuming candidate spoke for the entire 5/10/15 minutes!
    const estimatedMinutes = Math.max(0.5, Math.min(sessionDurationMinutes, (userMessages.length * 25) / 60));
    const rawWpm = Math.round(totalWords / estimatedMinutes);
    const speakingRateWpm = Math.max(40, Math.min(220, rawWpm));

    let rateStatus: SpeechClarityMetrics['rateStatus'] = 'Optimal';
    if (speakingRateWpm < 105) rateStatus = 'Slow';
    else if (speakingRateWpm > 155) rateStatus = 'Fast';

    // Filler word frequency
    const lowerText = fullText.toLowerCase();
    const fillerBreakdown: { word: string; count: number }[] = [];
    let totalFillers = 0;

    for (const filler of FILLER_WORDS) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches && matches.length > 0) {
        fillerBreakdown.push({ word: filler, count: matches.length });
        totalFillers += matches.length;
      }
    }

    fillerBreakdown.sort((a, b) => b.count - a.count);

    const frequencyPer100 = totalWords > 0 
      ? Math.round((totalFillers / totalWords) * 100 * 10) / 10 
      : 0;

    // Repeated phrases detection (2-gram repetition >= 2)
    const repeatedCount = this.detectRepeatedPhrasesCount(words);

    let pauseNote = 'Pacing is steady with balanced pauses between complete sentences.';
    if (totalFillers > 6) {
      pauseNote = 'Frequent verbal fillers observed. Replace conversational fillers with silent, deliberate pauses.';
    } else if (rateStatus === 'Fast') {
      pauseNote = 'Rapid delivery detected. Slow down transitions between points to give recruiters time to absorb your argument.';
    } else if (rateStatus === 'Slow') {
      pauseNote = 'Hesitant cadence noted. Practice delivering opening points with more continuous flow.';
    }

    return {
      speakingDurationMinutes: Math.round(estimatedMinutes * 10) / 10,
      totalWordsSpoken: totalWords,
      speakingRateWpm,
      rateStatus,
      fillerWordsCount: totalFillers,
      fillerWordsBreakdown: fillerBreakdown.slice(0, 5),
      fillerWordsFrequencyPer100Words: frequencyPer100,
      repeatedPhrasesCount: repeatedCount,
      pauseHesitationNote: pauseNote,
      pronunciationStatus: 'Browser Transcript Only (Pronunciation ML requires dedicated acoustic model)',
      pronunciationNote: 'Transcripts are processed via browser Web Speech API. Phoneme-level acoustic grading requires an external speech ML model (e.g. Azure Speech / Whisper timestamps). GD Arena does not fabricate fake pronunciation scores.'
    };
  },

  detectRepeatedPhrasesCount(words: string[]): number {
    if (words.length < 6) return 0;
    const ngrams = new Map<string, number>();
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i].toLowerCase()} ${words[i + 1].toLowerCase()}`;
      if (phrase.length > 4 && !FILLER_WORDS.includes(words[i].toLowerCase())) {
        ngrams.set(phrase, (ngrams.get(phrase) || 0) + 1);
      }
    }
    let count = 0;
    for (const freq of ngrams.values()) {
      if (freq >= 2) count++;
    }
    return count;
  },

  /**
   * Extracts Evidence-Based Findings directly referencing actual transcript sentences.
   */
  extractEvidenceFindings(userMessages: DiscussionMessage[], topic: string): EvidenceFinding[] {
    const findings: EvidenceFinding[] = [];

    if (userMessages.length === 0) {
      return [{
        id: 'ev-empty',
        category: 'Active Participation',
        transcriptExcerpt: '[No speech recorded]',
        observation: 'Candidate did not speak during this discussion.',
        whyItMatters: 'In placement GDs, silence during the first 2 minutes leads to immediate elimination in round 1.',
        suggestedImprovement: 'Enter the discussion early by defining the topic prompt or introducing a foundational statistic.',
        confidence: 'High',
        limitationNote: 'No audio was recorded.'
      }];
    }

    // Finding 1: Opening turn analysis
    const firstMsg = userMessages[0];
    if (firstMsg) {
      const words = firstMsg.message_text.split(/\s+/).length;
      if (words < 12) {
        findings.push({
          id: 'ev-1',
          category: 'Argument Development',
          transcriptExcerpt: `"${firstMsg.message_text}"`,
          turnSequence: firstMsg.sequence_number,
          observation: 'Opening statement was brief and lacked an anchoring premise or supporting reason.',
          whyItMatters: 'Recruiters assess whether candidates can substantiate claims or simply state agreeable opinions.',
          suggestedImprovement: 'Anchor your claim using PREP: Point, Reason, Example, and Point restatement.',
          confidence: 'High'
        });
      } else {
        findings.push({
          id: 'ev-1',
          category: 'Content and Reasoning',
          transcriptExcerpt: `"${firstMsg.message_text.slice(0, 100)}${firstMsg.message_text.length > 100 ? '...' : ''}"`,
          turnSequence: firstMsg.sequence_number,
          observation: 'Contributed an organized argument framing the topic positively.',
          whyItMatters: 'Strong initial framing demonstrates structured thinking and composure under placement pressure.',
          suggestedImprovement: 'Pair this claim with a specific corporate or industry case study to maximize credibility.',
          confidence: 'High'
        });
      }
    }

    // Finding 2: Filler / Clarity observation
    const allText = userMessages.map(m => m.message_text).join(' ');
    const hasFillers = /\b(um|uh|basically|actually|like)\b/i.test(allText);
    if (hasFillers) {
      const match = allText.match(/[^.!?]*\b(basically|actually|like|um|uh)\b[^.!?]*/i);
      const excerpt = match ? match[0].trim() : userMessages[0].message_text;
      findings.push({
        id: 'ev-2',
        category: 'Fluency and Delivery',
        transcriptExcerpt: `"${excerpt.slice(0, 110)}..."`,
        turnSequence: userMessages[0]?.sequence_number,
        observation: 'Use of verbal fillers observed during thought transitions.',
        whyItMatters: 'Excessive filler words diminish authority and give evaluators an impression of uncertainty.',
        suggestedImprovement: 'Embrace a 1-second deliberate pause before transitioning to your next supporting point.',
        confidence: 'High'
      });
    }

    // Finding 3: Teamwork & Listening
    if (userMessages.length >= 2) {
      const secondMsg = userMessages[1];
      const hasAgreement = /\b(agree|point|building on|perspective|disagree|however)\b/i.test(secondMsg.message_text);
      if (hasAgreement) {
        findings.push({
          id: 'ev-3',
          category: 'Listening and Teamwork',
          transcriptExcerpt: `"${secondMsg.message_text.slice(0, 110)}..."`,
          turnSequence: secondMsg.sequence_number,
          observation: 'Directly acknowledged peer points before introducing own thesis.',
          whyItMatters: 'Teamwork in recruitment GDs is proven by synthesizing peer ideas rather than giving isolated speeches.',
          suggestedImprovement: 'Maintain this practice and challenge opposing assumptions with respectful counter-questions.',
          confidence: 'High'
        });
      } else {
        findings.push({
          id: 'ev-3',
          category: 'Listening and Teamwork',
          transcriptExcerpt: `"${secondMsg.message_text.slice(0, 110)}..."`,
          turnSequence: secondMsg.sequence_number,
          observation: 'Point was introduced in isolation without referencing previous speaker arguments.',
          whyItMatters: 'Independent speeches can signal poor listening skills or an inability to engage in dialogue.',
          suggestedImprovement: 'Bridge from the previous speaker: "Building on the point regarding cost, another crucial dimension is..."',
          confidence: 'Medium'
        });
      }
    }

    return findings;
  },

  /**
   * Generates Vocabulary & Language Coach recommendations from transcript.
   */
  generateLanguageCoach(userMessages: DiscussionMessage[]): LanguageRecommendation[] {
    if (userMessages.length === 0) return [];

    const fullText = userMessages.map(m => m.message_text).join(' ');
    const recommendations: LanguageRecommendation[] = [];

    if (/\bbasically\b/i.test(fullText)) {
      recommendations.push({
        id: 'lang-1',
        type: 'repeated_expression',
        originalExpression: 'Basically, this means that companies must adapt.',
        suggestedAlternative: 'Fundamentally, or At its core, companies must adapt.',
        whyItHelps: 'Elevates casual conversational phrasing to formal corporate placement standards.',
        example: 'At its core, this shift requires firms to realign their capital expenditure.'
      });
    }

    if (/\bi think\b/i.test(fullText)) {
      recommendations.push({
        id: 'lang-2',
        type: 'weak_transition',
        originalExpression: 'I think that automation has a lot of problems.',
        suggestedAlternative: 'Evidence suggests that automation presents several operational challenges.',
        whyItHelps: 'Replaces subjective opinions with objective, evidence-driven phrasing.',
        example: 'Empirical data indicates that automation creates a transitional skill gap.'
      });
    }

    if (/\ba lot of\b/i.test(fullText) || /\bvery big\b/i.test(fullText)) {
      recommendations.push({
        id: 'lang-3',
        type: 'vague_wording',
        originalExpression: 'There are a lot of good things about this.',
        suggestedAlternative: 'There are substantial strategic advantages to this approach.',
        whyItHelps: 'Provides precision and replaces colloquial quantification with professional vocabulary.',
        example: 'Adopting this framework yields substantial strategic advantages in latency.'
      });
    }

    // Default high-yield placement coaching recommendation if none matched
    if (recommendations.length < 2) {
      recommendations.push({
        id: 'lang-default-1',
        type: 'awkward_phrasing',
        originalExpression: 'In my personal opinion, we should do this.',
        suggestedAlternative: 'From a pragmatic standpoint, our optimal course of action is...',
        whyItHelps: 'Eliminates redundant qualifiers and projects strategic leadership.',
        example: 'From a pragmatic standpoint, a phased deployment minimizes downtime risks.'
      });
      recommendations.push({
        id: 'lang-default-2',
        type: 'weak_transition',
        originalExpression: 'Also, another thing is...',
        suggestedAlternative: 'Furthermore, a pivotal secondary consideration is...',
        whyItHelps: 'Creates fluid logical transitions between distinct points in placement discussions.',
        example: 'Furthermore, a pivotal secondary consideration is regulatory compliance.'
      });
    }

    return recommendations.slice(0, 4);
  }
};
