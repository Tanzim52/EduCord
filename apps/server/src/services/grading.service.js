const { chat, parseAIJson } = require('./ai.service');

async function gradeAssignment(assignment, submission, courseContext) {
    const systemPrompt = `You are an expert academic grader. Grade fairly and provide constructive feedback.
You MUST respond ONLY with valid JSON. No markdown, no extra text.`;

    const userPrompt = `Assignment: ${assignment.title || 'Assignment'}
Instructions: ${assignment.instructions || assignment.description || 'N/A'}
Max Score: ${assignment.maxScore || 100}

Course Context: ${courseContext?.substring(0, 1000) || 'N/A'}

Student Submission:
---
${submission}
---

Grade this submission. Return ONLY:
{
  "score": 75,
  "percentage": 75,
  "grade": "B",
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "detailedFeedback": "Detailed paragraph feedback",
  "suggestions": "How to improve"
}`;

    const response = await chat(systemPrompt, userPrompt, { temperature: 0.3 });

    try {
        const parsed = parseAIJson(response);
        return {
            score: parsed.score || 0,
            percentage: parsed.percentage || 0,
            grade: parsed.grade || 'N/A',
            strengths: parsed.strengths || [],
            improvements: parsed.improvements || [],
            detailedFeedback: parsed.detailedFeedback || 'Grading completed.',
            suggestions: parsed.suggestions || '',
        };
    } catch (err) {
        console.error('Grading parse error:', err.message);
        return {
            score: 0,
            percentage: 0,
            grade: 'N/A',
            detailedFeedback: 'Auto-grading failed. Manual review needed.',
            strengths: [],
            improvements: [],
            suggestions: '',
        };
    }
}

module.exports = { gradeAssignment };
