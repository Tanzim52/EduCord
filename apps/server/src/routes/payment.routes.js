const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Create checkout / enroll (free — no Stripe needed)
router.post('/create-checkout', protect, async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findById(courseId);

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if already enrolled
        const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
        if (existing) return res.status(400).json({ message: 'Already enrolled' });

        // For free courses (or all courses since no paid API)
        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: courseId,
        });

        await Course.findByIdAndUpdate(courseId, {
            $push: { enrolledStudents: req.user._id }
        });

        await User.findByIdAndUpdate(req.user._id, {
            $push: { enrolledCourses: courseId }
        });

        res.json({ enrolled: true, enrollment });
    } catch (err) {
        res.status(500).json({ message: 'Enrollment failed', error: err.message });
    }
});

module.exports = router;
