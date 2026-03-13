const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    fileUrl: String,
    score: Number,
    feedback: String,
    aiDetectionScore: Number,
    aiDetectionReport: String,
    gradedByAI: { type: Boolean, default: false },
    status: { type: String, enum: ['submitted', 'graded', 'returned'], default: 'submitted' },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
