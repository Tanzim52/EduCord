const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const {
    getAssignmentsByCourse, getAssignment, createAssignment,
    submitAssignment, getSubmissions, getMySubmission,
    gradeSubmission, deleteAssignment,
} = require('../controllers/assignment.controller');

router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/:id', protect, getAssignment);
router.post('/course/:courseId', protect, restrictTo('teacher', 'admin'), createAssignment);
router.post('/:id/submit', protect, uploadSingle('file'), submitAssignment);
router.get('/:id/submissions', protect, restrictTo('teacher', 'admin'), getSubmissions);
router.get('/:id/my-submission', protect, getMySubmission);
router.put('/submissions/:submissionId/grade', protect, restrictTo('teacher', 'admin'), gradeSubmission);
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteAssignment);

module.exports = router;
