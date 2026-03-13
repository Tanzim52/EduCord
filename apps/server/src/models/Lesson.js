const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: String,
    order: Number,
    contentType: { type: String, enum: ['video', 'pdf', 'doc', 'text'] },
    contentUrl: String, // Main content URL (e.g. PDF file)
    videoUrl: String, // Video link (YouTube/Vimeo)
    attachments: [{
        name: String,
        url: String,
        type: String // 'pdf', 'doc', 'code', etc.
    }],
    extractedText: String,
    duration: Number,
    isPreview: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
