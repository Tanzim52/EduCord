const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
    getQuizzesByCourse, getQuiz, createQuiz, submitQuiz, deleteQuiz,
} = require('../controllers/quiz.controller');

router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/:id', protect, getQuiz);
router.post('/course/:courseId', protect, restrictTo('teacher', 'admin'), createQuiz);
router.post('/:id/submit', protect, submitQuiz);
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteQuiz);

module.exports = router;
