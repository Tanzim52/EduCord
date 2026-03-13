const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    title: String,
    description: String,
    instructions: String,
    dueDate: Date,
    maxScore: { type: Number, default: 100 },
    generatedByAI: { type: Boolean, default: true },
    allowedSubmissionTypes: {
        type: [String],
        enum: ['text', 'file', 'url'],
        default: ['text']
    },
    attachments: [{
        name: String,
        url: String,
        type: String // 'pdf', 'doc', 'image', etc.
    }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
