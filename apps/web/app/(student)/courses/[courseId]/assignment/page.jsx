'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AssignmentPage() {
    const { courseId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submission, setSubmission] = useState('');
    const [submissionUrl, setSubmissionUrl] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const { data } = await api.get(`/assignments/course/${courseId}`);
            setAssignments(data);
        } catch (err) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const selectAssignment = async (assignment) => {
        setSelectedAssignment(assignment);
        setSubmission('');
        setSubmissionUrl('');
        setSubmissionFile(null);
        try {
            const { data } = await api.get(`/assignments/${assignment._id}/my-submission`);
            setMySubmission(data);
        } catch (err) { }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submission && !submissionUrl && !submissionFile) {
            return toast.error('Please add some content to submit');
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            if (submission) formData.append('content', submission); // text content
            if (submissionUrl) formData.append('url', submissionUrl);
            if (submissionFile) formData.append('file', submissionFile);

            // Note: backend expects 'content' for text, 'file' for file. 
            // We need to ensure backend handles 'files' or 'file'. 
            // My previous edit to assignment controller used req.file or req.files? 
            // Let's check: assignment controller used `const attachments = req.files ? ...`
            // So if I send a file, I should use the field name that multer expects.
            // Usually `uploadSingle('file')` or `upload.array('files')`.
            // I haven't updated the assignment submission route to handle files yet!
            // I need to update the backend route for this too. 
            // For now, I'll send it as 'file' and ensure backend route uses `uploadSingle('file')`.

            const { data } = await api.post(`/assignments/${selectedAssignment._id}/submit`, formData);
            setMySubmission(data);
            toast.success('Assignment submitted!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (selectedAssignment) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <button
                    onClick={() => { setSelectedAssignment(null); setMySubmission(null); setSubmission(''); }}
                    className="mb-6 text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
                >
                    ← Back to assignments
                </button>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h1>
                    <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
                    {selectedAssignment.instructions && (
                        <div className="bg-indigo-50 p-4 rounded-xl">
                            <h3 className="font-semibold text-indigo-900 mb-2">Instructions</h3>
                            <p className="text-sm text-indigo-800 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                        </div>
                    )}
                    <div className="flex gap-4 mt-4 text-sm text-gray-500">
                        {selectedAssignment.dueDate && (
                            <span>📅 Due: {new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                        )}
                        <span>📊 Max Score: {selectedAssignment.maxScore}</span>
                    </div>
                </div>

                {mySubmission?.status === 'graded' ? (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Results</h2>
                        <div className="flex items-center gap-6 mb-6">
                            <div className={`text-4xl font-bold ${mySubmission.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                                {mySubmission.score}/{selectedAssignment.maxScore}
                            </div>
                            {mySubmission.aiDetectionScore >= 0 && (
                                <div className="text-sm">
                                    <p className="text-gray-500">AI Detection Score</p>
                                    <p className={`font-semibold ${mySubmission.aiDetectionScore > 70 ? 'text-red-500' : 'text-green-500'}`}>
                                        {mySubmission.aiDetectionScore}%
                                    </p>
                                </div>
                            )}
                        </div>
                        {mySubmission.feedback && (
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-2">Feedback</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{mySubmission.feedback}</p>
                            </div>
                        )}
                    </div>
                ) : mySubmission ? (
                    <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                        <h3 className="font-semibold text-yellow-800">Submitted ✓</h3>
                        <p className="text-sm text-yellow-700 mt-1">Your assignment has been submitted and is awaiting grading.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Your Submission</h2>

                        {/* Allowed Types Pills */}
                        <div className="flex gap-2 mb-4">
                            {['text', 'file', 'url'].map(type => (
                                <span key={type} className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedAssignment.allowedSubmissionTypes?.includes(type)
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 opacity-50'
                                    }`}>
                                    {type.toUpperCase()} ALLOWED
                                </span>
                            ))}
                        </div>

                        {selectedAssignment.allowedSubmissionTypes?.includes('text') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Answer</label>
                                <textarea
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                    className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                                    placeholder="Write your answer here..."
                                />
                            </div>
                        )}

                        {selectedAssignment.allowedSubmissionTypes?.includes('url') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                                <input
                                    type="url"
                                    onChange={(e) => setSubmissionUrl(e.target.value)} // Need state for this
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="https://docs.google.com/..."
                                />
                            </div>
                        )}

                        {selectedAssignment.allowedSubmissionTypes?.includes('file') && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setSubmissionFile(e.target.files[0])} // Need state for this
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full px-6 py-3 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity shadow-md"
                        >
                            {submitting ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📋 Course Assignments</h1>

            {assignments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <span className="text-4xl">📋</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No assignments yet</h3>
                    <p className="text-gray-500 mt-1">Assignments will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map(a => (
                        <div key={a._id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                        {a.dueDate && <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                                        <span>Max: {a.maxScore} pts</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => selectAssignment(a)}
                                    className="px-5 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
