const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    title: String,
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
    }],
    timeLimit: Number,
    passingScore: { type: Number, default: 70 },
    generatedByAI: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
