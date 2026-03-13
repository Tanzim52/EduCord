const { chat } = require('../services/ai.service');
const { generateQuiz, generateAssignment } = require('../services/quiz.service');
const { gradeAssignment } = require('../services/grading.service');
const { detectAIContent } = require('../services/aidetect.service');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

exports.studentChat = async (req, res) => {
    try {
        const { message, courseId } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const Enrollment = require('../models/Enrollment');
        const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
        if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const systemPrompt = `You are a helpful tutor for the course: "${course.title}".
STRICT RULE: Only answer questions related to this course's content.
Course topics: ${course.aiContext || course.description || course.title}

If asked anything outside this course scope, politely decline and redirect to course topics.
Be encouraging, clear, and educational.`;

        const response = await chat(systemPrompt, message);
        res.json({ reply: response });
    } catch (err) {
        console.error('Student chat error:', err.message);
        res.status(500).json({ message: 'Chat failed', error: err.message });
    }
};

exports.teacherChat = async (req, res) => {
    try {
        const { message, courseCategory } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const systemPrompt = `You are an expert course creation assistant for educators.
Help teachers with:
- Course structure and curriculum design
- Learning objectives
- Content organization
- Assignment ideas
- Best practices for online teaching
${courseCategory ? `Focus area: ${courseCategory}` : ''}

Be professional, practical, and specific.`;

        const response = await chat(systemPrompt, message);
        res.json({ reply: response });
    } catch (err) {
        console.error('Teacher chat error:', err.message);
        res.status(500).json({ message: 'Chat failed', error: err.message });
    }
};

exports.generateQuizForCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Fetch lessons separately (more reliable than populate)
        const lessons = await Lesson.find({ course: course._id });

        // Build content from lessons or fall back to course info
        let content = '';
        if (lessons.length > 0) {
            content = lessons.map(l => l.extractedText || l.description || l.title).join('\n\n');
        }
        if (!content || content.trim().length < 20) {
            content = `Course: ${course.title}\nDescription: ${course.description || 'No description'}\nCategory: ${course.category || 'General'}`;
        }

        const { numQuestions = 10, difficulty = 'medium' } = req.body;
        const quiz = await generateQuiz(content, numQuestions, difficulty);
        res.json(quiz);
    } catch (err) {
        console.error('Quiz generation error:', err.message);
        res.status(500).json({ message: 'Quiz generation failed', error: err.message });
    }
};

exports.generateAssignmentForCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Fetch lessons separately
        const lessons = await Lesson.find({ course: course._id });

        let content = '';
        if (lessons.length > 0) {
            content = lessons.map(l => l.extractedText || l.description || l.title).join('\n\n');
        }
        if (!content || content.trim().length < 20) {
            content = `Course: ${course.title}\nDescription: ${course.description || 'No description'}\nCategory: ${course.category || 'General'}`;
        }

        const assignment = await generateAssignment(content, course.title);
        res.json(assignment);
    } catch (err) {
        console.error('Assignment generation error:', err.message);
        res.status(500).json({ message: 'Assignment generation failed', error: err.message });
    }
};

exports.gradeSubmission = async (req, res) => {
    try {
        const Submission = require('../models/Submission');
        const Assignment = require('../models/Assignment');

        const submission = await Submission.findById(req.params.submissionId).populate('assignment');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const course = await Course.findById(submission.assignment.course);

        const aiDetection = await detectAIContent(submission.content);
        const grading = await gradeAssignment(
            submission.assignment,
            submission.content,
            course?.aiContext
        );

        submission.score = grading.score;
        submission.feedback = grading.detailedFeedback;
        submission.aiDetectionScore = aiDetection.aiScore;
        submission.aiDetectionReport = JSON.stringify(aiDetection);
        submission.gradedByAI = true;
        submission.status = 'graded';
        await submission.save();

        res.json({ grading, aiDetection });
    } catch (err) {
        console.error('Grading error:', err.message);
        res.status(500).json({ message: 'Grading failed', error: err.message });
    }
};
