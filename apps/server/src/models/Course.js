const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    price: { type: Number, default: 0 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: String,
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    learningObjectives: [String],
    targetAudience: [String],
    prerequisites: [String],
    courseFormat: String,
    duration: String,
    assessmentMethod: String,
    materials: String,
    technicalRequirements: String,
    certification: String,
    supportServices: String,
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublished: { type: Boolean, default: false },
    aiContext: { type: String },
    tags: [String],
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
