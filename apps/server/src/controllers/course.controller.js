const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { extractTextFromFile } = require('../services/fileprocessing.service');

exports.createCourse = async (req, res) => {
    try {
        const {
            title, description, category, level, price, tags,
            learningObjectives, targetAudience, prerequisites,
            courseFormat, duration, assessmentMethod, materials,
            technicalRequirements, certification, supportServices,
            thumbnail
        } = req.body;

        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.split('\n').filter(Boolean).map(s => s.trim());
            return [];
        };

        const course = await Course.create({
            title,
            description,
            category,
            level,
            price: Number(price) || 0,
            tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
            learningObjectives: parseArray(learningObjectives),
            targetAudience: parseArray(targetAudience),
            prerequisites: parseArray(prerequisites),
            courseFormat,
            duration,
            assessmentMethod,
            materials,
            technicalRequirements,
            certification,
            supportServices,
            teacher: req.user._id,
            thumbnail: thumbnail || (req.file ? `/uploads/${req.file.filename}` : null),
        });

        await require('../models/User').findByIdAndUpdate(req.user._id, {
            $push: { createdCourses: course._id }
        });

        res.status(201).json(course);
    } catch (err) {
        console.error('Create Course Error:', err);
        res.status(500).json({ message: 'Failed to create course', error: err.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const { category, level, search, page = 1, limit = 12 } = req.query;
        const query = { isPublished: true };

        if (category) query.category = category;
        if (level) query.level = level;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        const courses = await Course.find(query)
            .populate('teacher', 'name avatar')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Course.countDocuments(query);
        res.json({ courses, total, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
    }
};

exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'name avatar bio headline')
            .populate('lessons');
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch course', error: err.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacher.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const data = req.body;
        const updates = { ...data };

        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.split('\n').filter(Boolean).map(s => s.trim());
            return [];
        };

        if (data.tags && typeof data.tags === 'string') {
            updates.tags = data.tags.split(',').map(t => t.trim());
        }

        if (data.learningObjectives) updates.learningObjectives = parseArray(data.learningObjectives);
        if (data.targetAudience) updates.targetAudience = parseArray(data.targetAudience);
        if (data.prerequisites) updates.prerequisites = parseArray(data.prerequisites);
        if (data.price !== undefined) updates.price = Number(data.price) || 0;

        if (req.file) updates.thumbnail = `/uploads/${req.file.filename}`;
        else if (data.thumbnail) updates.thumbnail = data.thumbnail;

        const updated = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json(updated);
    } catch (err) {
        console.error('Update Course Error:', err);
        res.status(500).json({ message: 'Failed to update course', error: err.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Lesson.deleteMany({ course: course._id });
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete course', error: err.message });
    }
};

exports.publishCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.teacher.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        course.isPublished = !course.isPublished;
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update publish status', error: err.message });
    }
};

exports.getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user._id })
            .populate('lessons')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch courses', error: err.message });
    }
};
