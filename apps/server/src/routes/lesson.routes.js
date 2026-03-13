const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { extractTextFromFile } = require('../services/fileprocessing.service');

// Get all lessons for a course
router.get('/course/:courseId', async (req, res) => {
    try {
        const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch lessons', error: err.message });
    }
});

// Get single lesson
router.get('/:id', protect, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch lesson', error: err.message });
    }
});

// Create lesson
router.post('/course/:courseId', protect, restrictTo('teacher', 'admin'), uploadSingle('content'), async (req, res) => {
    try {
        const { title, description, order, contentType, isPreview, videoUrl } = req.body;
        const lessonData = {
            course: req.params.courseId,
            title,
            description,
            order: order || 0,
            contentType,
            isPreview: isPreview === 'true',
            videoUrl,
        };

        if (req.file) {
            lessonData.contentUrl = `/uploads/${req.file.filename}`;
            lessonData.attachments = [{
                name: req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                type: req.file.mimetype.split('/')[1]
            }];

            // Extract text for AI features
            const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
            if (extractedText) {
                lessonData.extractedText = extractedText;
            }
        }

        const lesson = await Lesson.create(lessonData);

        // Add lesson to course
        await Course.findByIdAndUpdate(req.params.courseId, {
            $push: { lessons: lesson._id }
        });

        // Update course AI context
        const course = await Course.findById(req.params.courseId).populate('lessons');
        if (course) {
            const aiContext = course.lessons
                .map(l => l.extractedText || l.title)
                .filter(Boolean)
                .join('\n');

            await Course.findByIdAndUpdate(req.params.courseId, {
                aiContext: aiContext.substring(0, 5000)
            });
        }

        res.status(201).json(lesson);
    } catch (err) {
        console.error('Create Lesson Error:', err);
        res.status(500).json({ message: 'Failed to create lesson', error: err.message });
    }
});

// Update lesson
router.put('/:id', protect, restrictTo('teacher', 'admin'), uploadSingle('content'), async (req, res) => {
    try {
        const updates = req.body;
        if (req.file) {
            updates.contentUrl = `/uploads/${req.file.filename}`;
            const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
            if (extractedText) updates.extractedText = extractedText;
        }

        const lesson = await Lesson.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update lesson', error: err.message });
    }
});

// Delete lesson
router.delete('/:id', protect, restrictTo('teacher', 'admin'), async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

        await Course.findByIdAndUpdate(lesson.course, {
            $pull: { lessons: lesson._id }
        });
        await Lesson.findByIdAndDelete(req.params.id);

        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete lesson', error: err.message });
    }
});

module.exports = router;
