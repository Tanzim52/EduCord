const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Enroll in a course (free courses)
router.post('/:courseId', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const existing = await Enrollment.findOne({
            student: req.user._id,
            course: req.params.courseId,
        });
        if (existing) return res.status(400).json({ message: 'Already enrolled' });

        const enrollment = await Enrollment.create({
            student: req.user._id,
            course: req.params.courseId,
        });

        // Update course enrolled students
        await Course.findByIdAndUpdate(req.params.courseId, {
            $push: { enrolledStudents: req.user._id }
        });

        // Update user enrolled courses
        await User.findByIdAndUpdate(req.user._id, {
            $push: { enrolledCourses: req.params.courseId }
        });

        res.status(201).json(enrollment);
    } catch (err) {
        res.status(500).json({ message: 'Enrollment failed', error: err.message });
    }
});

// Get my enrollments
router.get('/my', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                populate: { path: 'teacher', select: 'name avatar' }
            });
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch enrollments', error: err.message });
    }
});

// Get enrollment status for a course
router.get('/status/:courseId', protect, async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: req.params.courseId,
        });
        res.json({ enrolled: !!enrollment, enrollment });
    } catch (err) {
        res.status(500).json({ message: 'Failed to check enrollment', error: err.message });
    }
});

// Update lesson progress
router.post('/progress/:courseId', protect, async (req, res) => {
    try {
        const { lessonId } = req.body;
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: req.params.courseId,
        });

        if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });

        if (!enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);
        }

        const course = await Course.findById(req.params.courseId);

        // Ensure we only count lessons that still exist in the course
        const validCompletedLessons = enrollment.completedLessons.filter(id =>
            course.lessons.includes(id)
        );

        enrollment.progress = Math.min(100, Math.round(
            (validCompletedLessons.length / course.lessons.length) * 100
        ));

        // Update completed status
        if (enrollment.progress >= 100) {
            enrollment.isCompleted = true;
        } else {
            enrollment.isCompleted = false;
        }

        await enrollment.save();
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update progress', error: err.message });
    }
});

module.exports = router;
