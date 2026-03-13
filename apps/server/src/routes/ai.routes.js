const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
    studentChat, teacherChat, generateQuizForCourse,
    generateAssignmentForCourse, gradeSubmission,
} = require('../controllers/ai.controller');

// Student Chatbot
router.post('/chat/student', protect, studentChat);

// Teacher Chatbot
router.post('/chat/teacher', protect, restrictTo('teacher', 'admin'), teacherChat);

// Generate Quiz from course content
router.post('/generate-quiz/:courseId', protect, restrictTo('teacher', 'admin'), generateQuizForCourse);

// Generate Assignment
router.post('/generate-assignment/:courseId', protect, restrictTo('teacher', 'admin'), generateAssignmentForCourse);

// Grade submission
router.post('/grade-submission/:submissionId', protect, restrictTo('teacher', 'admin'), gradeSubmission);

module.exports = router;
