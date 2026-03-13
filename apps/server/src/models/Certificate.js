const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    issueDate: { type: Date, default: Date.now },
    certificateId: { type: String, unique: true, required: true }, // Unique ID for verification
    grade: String, // Optional: 'A', 'Password', '95%', etc.
    pdfUrl: String, // URL to generated PDF
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
