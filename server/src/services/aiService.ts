import { config } from '../config/env.js';

export interface GenerateTextOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export const aiService = {
  /**
   * Generates text response using configured LLM provider or fallback.
   */
  async generateText({
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 800
  }: GenerateTextOptions): Promise<string> {
    // 1. Google Gemini Provider
    if (config.aiProvider === 'gemini' && config.geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens
              }
            })
          }
        );

        if (!response.ok) {
          const errBody = await response.text();
          throw new Error(`Gemini API error: ${response.status} - ${errBody}`);
        }

        const data = (await response.json()) as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } catch (err: any) {
        console.warn(`[AI Service] Gemini call failed (${err.message}). Falling back to internal engine.`);
      }
    }

    // 2. OpenAI / Groq Compatible Provider
    const isGroq = config.aiProvider === 'groq' && config.groqApiKey;
    const isOpenAI = config.aiProvider === 'openai' && config.openaiApiKey;

    if (isOpenAI || isGroq) {
      const apiKey = isGroq ? config.groqApiKey : config.openaiApiKey;
      const endpoint = isGroq 
        ? 'https://api.groq.com/openai/v1/chat/completions' 
        : 'https://api.openai.com/v1/chat/completions';
      const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature,
            max_tokens: maxTokens
          })
        });

        if (!response.ok) {
          throw new Error(`OpenAI/Groq API error: ${response.status}`);
        }

        const data = (await response.json()) as any;
        const text = data.choices?.[0]?.message?.content;
        if (text) return text.trim();
      } catch (err: any) {
        console.warn(`[AI Service] API call failed (${err.message}). Falling back to internal engine.`);
      }
    }

    // 3. Fallback Heuristic Generator (Ensures demo & local testing never crash!)
    return this.generateFallbackResponse(userPrompt, systemPrompt);
  },

  /**
   * Safe JSON completion generator for reports and structured assessments
   */
  async generateJSON<T>(options: GenerateTextOptions): Promise<T> {
    const raw = await this.generateText({
      ...options,
      systemPrompt: `${options.systemPrompt}\n\nIMPORTANT: Respond ONLY with valid, raw JSON matching the requested schema. No markdown code blocks, no backticks, no explanatory text.`
    });

    try {
      // Clean possible markdown code fences
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (e) {
      console.warn('[AI Service] Failed to parse AI JSON response, attempting regex extraction.');
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
      throw new Error('AI response could not be parsed into required JSON schema.');
    }
  },

  /**
   * Internal intelligent discussion generator used when external API keys are not supplied.
   */
  generateFallbackResponse(userPrompt: string, systemPrompt: string): string {
    const promptLower = userPrompt.toLowerCase();
    
    if (systemPrompt.includes('Devil\'s Advocate')) {
      if (promptLower.includes('agree') || promptLower.includes('benefit')) {
        return "While that sounds promising in theory, aren't we ignoring the socioeconomic divide here? How do you account for those without equitable access to these technologies?";
      }
      return "That's a popular viewpoint, but let's question the core premise. Does empirical evidence actually support that outcome, or are we confusing short-term correlation with long-term causation?";
    }

    if (systemPrompt.includes('Analytical Thinker')) {
      return "Looking at the structural trade-offs, we must balance efficiency with risk mitigation. If we break this down into short-term disruption versus long-term productivity, the net impact depends entirely on policy governance.";
    }

    if (systemPrompt.includes('Confident Speaker')) {
      return "I strongly believe proactive execution is what separates success from complacency here. If institutions fail to adapt decisively within the next two years, the competitive gap will be insurmountable.";
    }

    // Collaborative Communicator
    return "That's a very valid point you've raised. Bridging that with our earlier thought on sustainability, perhaps the most pragmatic path forward is a phased hybrid model. What are your thoughts on that compromise?";
  }
};
