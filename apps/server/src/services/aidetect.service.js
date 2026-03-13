const { chat, parseAIJson } = require('./ai.service');

/**
 * Detects if submitted text was AI-generated.
 */
async function detectAIContent(submissionText) {
    if (!submissionText || submissionText.trim().length < 20) {
        return { aiScore: 0, verdict: 'too_short', summary: 'Text too short for analysis' };
    }

    const systemPrompt = `You are an academic integrity AI. 
Analyze text and determine if it was written by AI or a human student.
You MUST respond ONLY with valid JSON. No markdown, no extra text.`;

    const userPrompt = `Analyze this student submission for AI generation:
---
${submissionText.substring(0, 2000)}
---

Consider: perplexity, burstiness, vocabulary patterns, structural patterns, generic phrases.

Return ONLY:
{
  "aiScore": 35,
  "confidence": "medium",
  "indicators": ["indicator1", "indicator2"],
  "humanIndicators": ["indicator1"],
  "verdict": "likely_human",
  "summary": "One sentence explanation"
}`;

    try {
        const response = await chat(systemPrompt, userPrompt, { temperature: 0.2 });
        const parsed = parseAIJson(response);
        return {
            aiScore: parsed.aiScore ?? -1,
            confidence: parsed.confidence || 'low',
            indicators: parsed.indicators || [],
            humanIndicators: parsed.humanIndicators || [],
            verdict: parsed.verdict || 'uncertain',
            summary: parsed.summary || 'Analysis completed.',
        };
    } catch (err) {
        console.error('AI detection error:', err.message);
        return { aiScore: -1, verdict: 'error', summary: 'Detection unavailable' };
    }
}

module.exports = { detectAIContent };
