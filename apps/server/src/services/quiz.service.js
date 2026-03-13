const { chat, parseAIJson } = require('./ai.service');

async function generateQuiz(courseContent, numQuestions = 10, difficulty = 'medium') {
  if (!courseContent || courseContent.trim().length < 10) {
    // Generate a generic quiz if no content available
    courseContent = 'General knowledge course';
  }

  const systemPrompt = `You are an expert educator. Generate quiz questions based on provided content.
You MUST respond with VALID JSON only. No markdown, no explanation, no extra text.`;

  const userPrompt = `Based on this course content:
---
${courseContent.substring(0, 4000)}
---

Generate ${numQuestions} multiple choice questions at ${difficulty} difficulty.

Return ONLY this exact JSON structure:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ]
}`;

  const response = await chat(systemPrompt, userPrompt, { temperature: 0.6, maxTokens: 3000 });

  try {
    const parsed = parseAIJson(response);
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid quiz structure');
    }
    // Validate each question
    parsed.questions = parsed.questions.map(q => ({
      question: q.question || 'Question',
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || '',
    }));
    return parsed;
  } catch (err) {
    console.error('Quiz JSON parse error:', err.message);
    throw new Error('Failed to parse AI quiz response. Please try again.');
  }
}

async function generateAssignment(courseContent, courseTitle) {
  if (!courseContent || courseContent.trim().length < 10) {
    courseContent = courseTitle || 'General course';
  }

  const systemPrompt = `You are an expert educator. Create assignments that test deep understanding.
You MUST respond with VALID JSON only. No markdown, no explanation.`;

  const userPrompt = `Course: ${courseTitle || 'Course'}
Content Summary: ${courseContent.substring(0, 3000)}

Create a comprehensive assignment. Return ONLY this exact JSON:
{
  "title": "Assignment title",
  "description": "Brief description of the assignment",
  "instructions": "Detailed step-by-step instructions for students",
  "evaluationCriteria": ["criterion 1", "criterion 2"],
  "estimatedTime": "2 hours"
}`;

  const response = await chat(systemPrompt, userPrompt, { temperature: 0.7, maxTokens: 2000 });

  try {
    const parsed = parseAIJson(response);
    return {
      title: parsed.title || 'AI Generated Assignment',
      description: parsed.description || 'Complete the following assignment.',
      instructions: parsed.instructions || parsed.description || 'Follow the instructions below.',
      evaluationCriteria: parsed.evaluationCriteria || [],
      estimatedTime: parsed.estimatedTime || 'N/A',
    };
  } catch (err) {
    console.error('Assignment JSON parse error:', err.message);
    throw new Error('Failed to parse AI assignment response. Please try again.');
  }
}

module.exports = { generateQuiz, generateAssignment };
