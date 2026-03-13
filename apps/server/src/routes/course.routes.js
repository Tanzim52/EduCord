const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');
const {
    createCourse, getAllCourses, getCourse, updateCourse,
    deleteCourse, publishCourse, getTeacherCourses,
} = require('../controllers/course.controller');

router.get('/', getAllCourses);
router.get('/teacher', protect, restrictTo('teacher', 'admin'), getTeacherCourses);
router.get('/:id', getCourse);
router.post('/', protect, restrictTo('teacher', 'admin'), uploadSingle('thumbnail'), createCourse);
router.put('/:id', protect, restrictTo('teacher', 'admin'), uploadSingle('thumbnail'), updateCourse);
router.delete('/:id', protect, restrictTo('teacher', 'admin'), deleteCourse);
router.patch('/:id/publish', protect, restrictTo('teacher', 'admin'), publishCourse);

module.exports = router;
