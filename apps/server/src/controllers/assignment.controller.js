const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');

exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId }).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
    }
};

exports.getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(assignment);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch assignment', error: err.message });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.create({
            ...req.body,
            course: req.params.courseId,
        });
        res.status(201).json(assignment);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create assignment', error: err.message });
    }
};

exports.submitAssignment = async (req, res) => {
    try {
        const { content } = req.body;

        // Check for existing submission
        const existing = await Submission.findOne({
            assignment: req.params.id,
            student: req.user._id,
        });
        if (existing) {
            return res.status(400).json({ message: 'You have already submitted this assignment' });
        }

        const submission = await Submission.create({
            assignment: req.params.id,
            student: req.user._id,
            content,
            fileUrl: req.file ? `/uploads/${req.file.filename}` : (req.body.url || null),
        });

        // Notify the teacher
        const assignment = await Assignment.findById(req.params.id).populate({
            path: 'course',
            select: 'teacher title',
        });
        if (assignment?.course?.teacher) {
            await Notification.create({
                user: assignment.course.teacher,
                type: 'submission',
                title: 'New Submission',
                message: `${req.user.name} submitted "${assignment.title}" in ${assignment.course.title}`,
                course: assignment.course._id,
                link: `/teacher/courses/${assignment.course._id}/submissions`,
            });
        }

        res.status(201).json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit assignment', error: err.message });
    }
};

exports.getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email avatar')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: err.message });
    }
};

exports.getMySubmission = async (req, res) => {
    try {
        const submission = await Submission.findOne({
            assignment: req.params.id,
            student: req.user._id,
        });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch submission', error: err.message });
    }
};

// Manual teacher grading
exports.gradeSubmission = async (req, res) => {
    try {
        const { score, feedback } = req.body;
        const submission = await Submission.findById(req.params.submissionId);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        submission.score = score;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedByAI = false;
        await submission.save();

        // Notify the student
        const assignment = await Assignment.findById(submission.assignment).populate('course', 'title');
        await Notification.create({
            user: submission.student,
            type: 'grade',
            title: 'Assignment Graded',
            message: `Your submission for "${assignment?.title}" has been graded. Score: ${score}`,
            course: assignment?.course?._id,
            link: `/courses/${assignment?.course?._id}/assignment`,
        });

        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: 'Grading failed', error: err.message });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        await Submission.deleteMany({ assignment: req.params.id });
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete assignment', error: err.message });
    }
};
