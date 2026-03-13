'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Chatbot from '@/components/chatbot/Chatbot';
import toast from 'react-hot-toast';
import { uploadToImgBB } from '@/lib/imgbb';

export default function ManageCoursePage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', contentType: 'text', order: 0 });
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [generatingAssignment, setGeneratingAssignment] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, lessonsRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/lessons/course/${courseId}`),
            ]);
            setCourse(courseRes.data);
            setEditForm(courseRes.data);
            setLessons(lessonsRes.data);
        } catch (err) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const toastId = toast.loading('Uploading image...');
            try {
                const url = await uploadToImgBB(file);
                setEditForm({ ...editForm, thumbnail: url });
                toast.success('Image uploaded!', { id: toastId });
            } catch (error) {
                toast.error('Failed to upload image', { id: toastId });
            }
        }
    };

    const saveCourseDetails = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put(`/courses/${courseId}`, {
                title: editForm.title,
                description: editForm.description,
                thumbnail: editForm.thumbnail,
                category: editForm.category,
                level: editForm.level,
                price: editForm.price,
                tags: typeof editForm.tags === 'string' ? editForm.tags : editForm.tags.join(', '),
                learningObjectives: typeof editForm.learningObjectives === 'string' ? editForm.learningObjectives.split('\n').filter(Boolean) : editForm.learningObjectives,
                targetAudience: typeof editForm.targetAudience === 'string' ? editForm.targetAudience.split('\n').filter(Boolean) : editForm.targetAudience,
                prerequisites: typeof editForm.prerequisites === 'string' ? editForm.prerequisites.split('\n').filter(Boolean) : editForm.prerequisites,
                courseFormat: editForm.courseFormat,
                duration: editForm.duration,
                assessmentMethod: editForm.assessmentMethod,
                materials: editForm.materials,
                technicalRequirements: editForm.technicalRequirements,
                certification: editForm.certification,
                supportServices: editForm.supportServices,
            });
            setCourse(data);
            setEditing(false);
            toast.success('Course updated!');
        } catch (err) {
            toast.error('Failed to update course');
        } finally {
            setSaving(false);
        }
    };

    const addLesson = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', lessonForm.title);
            formData.append('description', lessonForm.description);
            formData.append('contentType', lessonForm.contentType);
            formData.append('order', lessons.length);
            if (lessonForm.videoUrl) formData.append('videoUrl', lessonForm.videoUrl);
            if (lessonForm.file) formData.append('content', lessonForm.file);

            await api.post(`/lessons/course/${courseId}`, formData);
            toast.success('Lesson added!');
            setShowAddLesson(false);
            setLessonForm({ title: '', description: '', contentType: 'text', order: lessons.length });
            fetchData();
        } catch (err) {
            toast.error('Failed to add lesson');
        }
    };

    const deleteLesson = async (lessonId) => {
        if (!confirm('Delete this lesson?')) return;
        try {
            await api.delete(`/lessons/${lessonId}`);
            toast.success('Lesson deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete lesson');
        }
    };

    const togglePublish = async () => {
        try {
            const { data } = await api.patch(`/courses/${courseId}/publish`);
            setCourse(data);
            toast.success(data.isPublished ? 'Course published!' : 'Course unpublished');
        } catch (err) {
            toast.error('Failed to update publish status');
        }
    };

    const generateQuiz = async () => {
        setGeneratingQuiz(true);
        try {
            const { data } = await api.post(`/ai/generate-quiz/${courseId}`, { numQuestions: 10, difficulty: 'medium' });
            await api.post(`/quiz/course/${courseId}`, {
                title: `AI-Generated Quiz`,
                questions: data.questions,
                passingScore: 70,
                generatedByAI: true,
            });
            toast.success('Quiz generated and saved!');
        } catch (err) {
            toast.error('Quiz generation failed. Make sure AI service is running.');
        } finally {
            setGeneratingQuiz(false);
        }
    };

    const generateAssignment = async () => {
        setGeneratingAssignment(true);
        try {
            const { data } = await api.post(`/ai/generate-assignment/${courseId}`);
            await api.post(`/assignments/course/${courseId}`, {
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                maxScore: 100,
                generatedByAI: true,
            });
            toast.success('Assignment generated and saved!');
        } catch (err) {
            toast.error('Assignment generation failed. Make sure AI service is running.');
        } finally {
            setGeneratingAssignment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
                    <span className={`text-sm font-medium ${course?.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                        {course?.isPublished ? '● Published' : '● Draft'}
                    </span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setEditing(!editing)}
                        className="px-5 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                        {editing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                    <button onClick={togglePublish}
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${course?.isPublished
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                            : 'gradient-primary text-white hover:opacity-90'
                            }`}>
                        {course?.isPublished ? 'Unpublish' : 'Publish Course'}
                    </button>
                </div>
            </div>

            {editing && (
                <form onSubmit={saveCourseDetails} className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input name="title" value={editForm.title || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" value={editForm.category || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                                {['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Math', 'Language', 'Other'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={editForm.description || ''} onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                        <div className="flex items-center gap-4">
                            {editForm.thumbnail && (
                                <img src={editForm.thumbnail.startsWith('http') ? editForm.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${editForm.thumbnail}`}
                                    alt="Thumbnail" className="w-16 h-16 object-cover rounded-lg" />
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                            <select name="level" value={editForm.level || 'beginner'} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input type="number" name="price" value={editForm.price || 0} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" min="0" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input name="tags" value={editForm.tags || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="comma separated" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives (One per line)</label>
                            <textarea name="learningObjectives" value={Array.isArray(editForm.learningObjectives) ? editForm.learningObjectives.join('\n') : editForm.learningObjectives || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" placeholder="What will students learn?" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience (One per line)</label>
                            <textarea name="targetAudience" value={Array.isArray(editForm.targetAudience) ? editForm.targetAudience.join('\n') : editForm.targetAudience || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" placeholder="Who is this course for?" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites (One per line)</label>
                            <textarea name="prerequisites" value={Array.isArray(editForm.prerequisites) ? editForm.prerequisites.join('\n') : editForm.prerequisites || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" placeholder="What should they know before starting?" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Format</label>
                                <input name="courseFormat" value={editForm.courseFormat || ''} onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. Online, In-person, Hybrid" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                                <input name="duration" value={editForm.duration || ''} onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. 10 weeks, 40 hours" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Method</label>
                            <textarea name="assessmentMethod" value={editForm.assessmentMethod || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Quizzes, assignments, exams..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Materials & Resources</label>
                            <textarea name="materials" value={editForm.materials || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Textbooks, software, links..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Technical Requirements</label>
                            <textarea name="technicalRequirements" value={editForm.technicalRequirements || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="PC, Internet, Software..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                            <textarea name="certification" value={editForm.certification || ''} onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Info about certificates or credits..." />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Support Services</label>
                        <textarea name="supportServices" value={editForm.supportServices || ''} onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Mentorship, Slack channel, etc." />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving}
                            className="px-6 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link href={`/teacher/courses/${courseId}/quiz-creator`}
                    className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-lg">📝</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Create Quiz</h3>
                    <p className="text-xs text-gray-500 mt-1">Manually create a quiz with custom questions</p>
                </Link>

                <Link href={`/teacher/courses/${courseId}/assignment-creator`}
                    className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-lg">📋</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Create Assignment</h3>
                    <p className="text-xs text-gray-500 mt-1">Create an assignment with instructions and grading criteria</p>
                </Link>

                <Link href={`/teacher/courses/${courseId}/submissions`}
                    className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-lg">📊</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">View Submissions</h3>
                    <p className="text-xs text-gray-500 mt-1">Review and grade student submissions</p>
                </Link>
            </div>

            {/* AI Tools */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-8">
                <h2 className="font-semibold text-gray-900 mb-3">🤖 AI Tools</h2>
                <div className="flex flex-wrap gap-3">
                    <button onClick={generateQuiz} disabled={generatingQuiz}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all">
                        {generatingQuiz ? 'Generating...' : '🧠 AI Generate Quiz'}
                    </button>
                    <button onClick={generateAssignment} disabled={generatingAssignment}
                        className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-all">
                        {generatingAssignment ? 'Generating...' : '🧠 AI Generate Assignment'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">AI generates content based on your lesson materials. Groq or Ollama must be configured.</p>
            </div>

            {/* Lessons */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Lessons ({lessons.length})</h2>
                <button onClick={() => setShowAddLesson(!showAddLesson)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                    {showAddLesson ? 'Cancel' : '+ Add Lesson'}
                </button>
            </div>

            {showAddLesson && (
                <form onSubmit={addLesson} className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 space-y-4">
                    <input
                        value={lessonForm.title}
                        onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        placeholder="Lesson title"
                        required
                    />
                    <textarea
                        value={lessonForm.description}
                        onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none"
                        placeholder="Lesson description"
                    />

                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            value={lessonForm.contentType}
                            onChange={e => setLessonForm({ ...lessonForm, contentType: e.target.value })}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-w-[150px]">
                            <option value="text">Text</option>
                            <option value="video">Video</option>
                            <option value="pdf">PDF</option>
                            <option value="doc">Document</option>
                        </select>

                        {lessonForm.contentType === 'video' ? (
                            <input
                                value={lessonForm.videoUrl || ''}
                                onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                placeholder="Video URL (YouTube, Vimeo...)"
                                required={lessonForm.contentType === 'video'}
                            />
                        ) : lessonForm.contentType !== 'text' ? (
                            <input
                                type="file"
                                onChange={e => setLessonForm({ ...lessonForm, file: e.target.files[0] })}
                                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                required
                            />
                        ) : null}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowAddLesson(false)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 gradient-primary text-white rounded-xl text-sm font-medium">
                            Add Lesson
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {lessons.map((lesson, i) => (
                    <div key={lesson._id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-semibold text-indigo-600 flex-shrink-0">
                            {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm">{lesson.title}</h3>
                            <p className="text-xs text-gray-500 capitalize">{lesson.contentType}</p>
                        </div>
                        <button onClick={() => deleteLesson(lesson._id)}
                            className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50">
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* Teacher Chatbot */}
            <Chatbot courseId={courseId} userRole="teacher" />
        </div>
    );
}
