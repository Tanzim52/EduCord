const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const { generateCertificate } = require('../services/certificate.service');

// Get my certificates
router.get('/', protect, async (req, res) => {
    try {
        const certificates = await Certificate.find({ user: req.user._id })
            .populate('course', 'title thumbnail')
            .sort({ createdAt: -1 });
        res.json(certificates);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch certificates' });
    }
});

// Claim certificate (Finish course)
router.post('/claim/:courseId', protect, async (req, res) => {
    try {
        // Verify course completion logic here (e.g., all lessons viewed, assignments passed)
        // For now, we'll assume the frontend calls this only when valid

        const existing = await Certificate.findOne({ user: req.user._id, course: req.params.courseId });
        if (existing) return res.json(existing);

        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Strict Verification: Check if user is enrolled and has completed the course
        const Enrollment = require('../models/Enrollment');
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: req.params.courseId
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'You are not enrolled in this course.' });
        }

        if (!enrollment.isCompleted && enrollment.progress < 100) {
            return res.status(403).json({ message: 'You must complete all lessons to claim the certificate.' });
        }

        const certificate = await generateCertificate(req.user._id, course._id, req.user.name, course.title);
        res.status(201).json(certificate);
    } catch (err) {
        res.status(500).json({ message: 'Failed to claim certificate', error: err.message });
    }
});

module.exports = router;
