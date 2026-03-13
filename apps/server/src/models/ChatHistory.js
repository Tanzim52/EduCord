const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    }],
    chatType: { type: String, enum: ['student', 'teacher'], default: 'student' },
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
