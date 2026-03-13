const axios = require('axios');

const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.AI_MODEL || 'llama3.2';

/**
 * Core AI chat - uses Groq free tier first, falls back to Ollama local
 */
async function chat(systemPrompt, userMessage, options = {}) {
    // Try Groq free tier first
    if (process.env.GROQ_API_KEY) {
        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: options.model || 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2048,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            return response.data.choices[0].message.content;
        } catch (err) {
            console.error('Groq error:', err.response?.data?.error?.message || err.message);
            console.error('Falling back to Ollama...');
        }
    }

    // Ollama local fallback
    try {
        const response = await axios.post(`${OLLAMA_BASE}/api/chat`, {
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            stream: false,
            options: {
                temperature: options.temperature || 0.7,
                num_predict: options.maxTokens || 2048,
            }
        }, { timeout: 60000 });
        return response.data.message.content;
    } catch (err) {
        console.error('Ollama error:', err.message);
        throw new Error('AI service unavailable. Make sure Ollama is running locally OR set a valid GROQ_API_KEY in .env');
    }
}

/**
 * Safely parse JSON from AI response - handles markdown code blocks and partial JSON
 */
function parseAIJson(response) {
    // Strip markdown code fences if present
    let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    // Try to find a JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON');
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        // Try fixing common issues: trailing commas, single quotes
        let fixed = jsonMatch[0]
            .replace(/,\s*([}\]])/g, '$1')      // remove trailing commas
            .replace(/'/g, '"')                  // single to double quotes
            .replace(/(\w+)\s*:/g, '"$1":');     // unquoted keys
        return JSON.parse(fixed);
    }
}

module.exports = { chat, parseAIJson };
