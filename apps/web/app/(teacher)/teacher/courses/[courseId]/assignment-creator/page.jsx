'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AssignmentCreatorPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        instructions: '',
        maxScore: 100,
        dueDate: '',
        allowedSubmissionTypes: ['text'],
    });
    const [files, setFiles] = useState([]);

    const toggleSubmissionType = (type) => {
        const types = new Set(form.allowedSubmissionTypes);
        if (types.has(type)) types.delete(type);
        else types.add(type);
        setForm({ ...form, allowedSubmissionTypes: Array.from(types) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');
        if (!form.instructions.trim()) return toast.error('Instructions are required');
        if (form.allowedSubmissionTypes.length === 0) return toast.error('Select at least one submission type');

        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => {
                if (key === 'allowedSubmissionTypes') formData.append(key, JSON.stringify(form[key]));
                else formData.append(key, form[key]);
            });
            files.forEach(file => formData.append('files', file));

            await api.post(`/assignments/course/${courseId}`, formData);
            toast.success('Assignment created!');
            router.push(`/teacher/courses/${courseId}/manage`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create assignment');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
                        <p className="text-sm text-gray-500 mt-1">Manually create an assignment for your students</p>
                    </div>
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
                        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Build a REST API"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief overview of the assignment..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Instructions</label>
                        <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                            placeholder="Step-by-step instructions for students..."
                            rows={6}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Score</label>
                            <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                                min={1} max={1000}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
                            <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Submission Types</label>
                        <div className="flex gap-4">
                            {['text', 'file', 'url'].map(type => (
                                <label key={type} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox"
                                        checked={form.allowedSubmissionTypes.includes(type)}
                                        onChange={() => toggleSubmissionType(type)}
                                        className="w-4 h-4 text-indigo-600 rounded" />
                                    <span className="capitalize text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attach Files (PDF, Images, etc.)</label>
                        <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => router.back()}
                            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                            {saving ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
