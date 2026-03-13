const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const { generateQuiz } = require('../services/quiz.service');

exports.getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course: req.params.courseId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch quizzes', error: err.message });
    }
};

exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch quiz', error: err.message });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.create({
            ...req.body,
            course: req.params.courseId,
        });
        res.status(201).json(quiz);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create quiz', error: err.message });
    }
};

exports.submitQuiz = async (req, res) => {
    try {
        const { answers, score } = req.body;
        const Enrollment = require('../models/Enrollment');

        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: (await Quiz.findById(req.params.id)).course,
        });

        if (enrollment) {
            enrollment.quizScores.push({
                quiz: req.params.id,
                score,
                completedAt: new Date(),
            });
            await enrollment.save();
        }

        res.json({ score, message: score >= 70 ? 'Passed!' : 'Try again' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit quiz', error: err.message });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete quiz', error: err.message });
    }
};
