'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { uploadToImgBB } from '@/lib/imgbb';

export default function CreateCoursePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        price: 0,
        tags: '',
        thumbnail: '',
        learningObjectives: '',
        targetAudience: '',
        prerequisites: '',
        courseFormat: '',
        duration: '',
        assessmentMethod: '',
        materials: '',
        technicalRequirements: '',
        certification: '',
        supportServices: ''
    });
    const [previewUrl, setPreviewUrl] = useState(null);

    const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Math', 'Language', 'Other'];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const url = await uploadToImgBB(file);
                setForm({ ...form, thumbnail: url });
                setPreviewUrl(url);
                toast.success('Image uploaded!');
            } catch (error) {
                toast.error('Failed to upload image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = {
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                learningObjectives: form.learningObjectives.split('\n').map(l => l.trim()).filter(Boolean),
                targetAudience: form.targetAudience.split('\n').map(a => a.trim()).filter(Boolean),
                prerequisites: form.prerequisites.split('\n').map(p => p.trim()).filter(Boolean),
                price: Number(form.price) || 0
            };
            const { data } = await api.post('/courses', submitData);
            toast.success('Course created!');
            router.push(`/teacher/courses/${data._id}/manage`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Course</h1>
            <p className="text-gray-500 mb-8">Fill in the details to create your course</p>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                    <input name="title" value={form.title} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                        placeholder="e.g. Introduction to Machine Learning"
                        required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                    <div className="flex items-center gap-4">
                        {previewUrl && (
                            <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        )}
                        <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                            <span className="text-sm text-gray-600">Upload Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm h-32 resize-none"
                        placeholder="Describe what students will learn..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select name="category" value={form.category} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white">
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <select name="level" value={form.level} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm bg-white">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" name="price" value={form.price} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                            min="0" step="0.01" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                        <input name="tags" value={form.tags} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                            placeholder="python, AI, ML" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Learning Objectives (One per line)</label>
                        <textarea name="learningObjectives" value={form.learningObjectives} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" placeholder="What will students learn?" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience (One per line)</label>
                        <textarea name="targetAudience" value={form.targetAudience} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" placeholder="Who is this course for?" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prerequisites (One per line)</label>
                        <textarea name="prerequisites" value={form.prerequisites} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24 resize-none" placeholder="Requirements..." />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course Format</label>
                            <input name="courseFormat" value={form.courseFormat} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. Online, In-person" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <input name="duration" value={form.duration} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="e.g. 10 weeks" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Method</label>
                        <textarea name="assessmentMethod" value={form.assessmentMethod} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Quizzes, assignments..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Materials & Resources</label>
                        <textarea name="materials" value={form.materials} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Textbooks, links..." />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technical Requirements</label>
                        <textarea name="technicalRequirements" value={form.technicalRequirements} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Software, hardware..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
                        <textarea name="certification" value={form.certification} onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Certificate info..." />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Services</label>
                    <textarea name="supportServices" value={form.supportServices} onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-20 resize-none" placeholder="Mentorship, Slack..." />
                </div>

                <button type="submit" disabled={loading}
                    className="w-full py-3 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {loading ? 'Creating...' : 'Create Course'}
                </button>
            </form>
        </div>
    );
}
