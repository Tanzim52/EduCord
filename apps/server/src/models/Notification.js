const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['enrollment', 'quiz', 'assignment', 'grade', 'course_update', 'submission', 'general'],
        default: 'general',
    },
    title: { type: String, required: true },
    message: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    link: String,
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
