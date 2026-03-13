'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SubmissionsPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState(null);
    const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
    const [aiGrading, setAiGrading] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const { data } = await api.get(`/assignments/course/${courseId}`);
            setAssignments(data);
            if (data.length > 0) {
                setSelectedAssignment(data[0]);
                fetchSubmissions(data[0]._id);
            }
        } catch (err) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (assignmentId) => {
        try {
            const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
            setSubmissions(data);
        } catch (err) {
            toast.error('Failed to load submissions');
        }
    };

    const handleSelectAssignment = (assignment) => {
        setSelectedAssignment(assignment);
        setSubmissions([]);
        setGradingId(null);
        fetchSubmissions(assignment._id);
    };

    const handleGrade = async (submissionId) => {
        if (!gradeForm.score) return toast.error('Score is required');
        try {
            await api.put(`/assignments/submissions/${submissionId}/grade`, {
                score: Number(gradeForm.score),
                feedback: gradeForm.feedback,
            });
            toast.success('Submission graded!');
            setGradingId(null);
            setGradeForm({ score: '', feedback: '' });
            fetchSubmissions(selectedAssignment._id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Grading failed');
        }
    };

    const handleAIGrade = async (submissionId) => {
        setAiGrading(true);
        try {
            const { data } = await api.post(`/ai/grade-submission/${submissionId}`);
            toast.success(`AI graded: ${data.grading.score}/${selectedAssignment.maxScore || 100}`);
            fetchSubmissions(selectedAssignment._id);
        } catch (err) {
            toast.error('AI grading failed');
        } finally {
            setAiGrading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Submissions & Grading</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and grade student submissions</p>
                    </div>
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                </div>

                {assignments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <p className="text-gray-500 mb-4">No assignments created yet</p>
                        <button onClick={() => router.push(`/teacher/courses/${courseId}/assignment-creator`)}
                            className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium">
                            Create First Assignment
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Assignment Sidebar */}
                        <div className="lg:col-span-1 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Assignments</h3>
                            {assignments.map((a) => (
                                <button key={a._id} onClick={() => handleSelectAssignment(a)}
                                    className={`w-full text-left p-3 rounded-xl transition-all text-sm ${selectedAssignment?._id === a._id
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                                        }`}>
                                    <p className="font-medium line-clamp-1">{a.title}</p>
                                    <p className={`text-xs mt-1 ${selectedAssignment?._id === a._id ? 'text-indigo-200' : 'text-gray-400'
                                        }`}>
                                        Max: {a.maxScore || 100} pts
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Submissions */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100">
                                    <h2 className="font-semibold text-gray-900">{selectedAssignment?.title}</h2>
                                    <p className="text-xs text-gray-500 mt-1">{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</p>
                                </div>

                                {submissions.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400 text-sm">
                                        No submissions yet for this assignment
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {submissions.map((sub) => (
                                            <div key={sub._id} className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                                                            <span className="text-white text-xs font-semibold">
                                                                {sub.student?.name?.charAt(0).toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{sub.student?.name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-400">{sub.student?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${sub.status === 'graded' ? 'bg-green-100 text-green-700' :
                                                                sub.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                        {sub.score !== undefined && sub.score !== null && (
                                                            <span className="text-sm font-semibold text-indigo-600">
                                                                {sub.score}/{selectedAssignment?.maxScore || 100}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Submission content preview */}
                                                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-700 max-h-32 overflow-y-auto">
                                                    {sub.content || <span className="text-gray-400 italic">File submission{sub.fileUrl ? ` — ${sub.fileUrl}` : ''}</span>}
                                                </div>

                                                {/* Feedback display */}
                                                {sub.feedback && (
                                                    <div className="mt-2 p-3 bg-indigo-50 rounded-xl text-sm text-indigo-800">
                                                        <p className="font-medium text-xs text-indigo-600 mb-1">Feedback:</p>
                                                        {sub.feedback}
                                                    </div>
                                                )}

                                                {/* AI Detection */}
                                                {sub.aiDetectionScore >= 0 && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                        <span>AI Detection Score: <strong>{sub.aiDetectionScore}%</strong></span>
                                                        {sub.gradedByAI && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">AI Graded</span>}
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="mt-3 flex gap-2">
                                                    {gradingId === sub._id ? (
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex gap-2">
                                                                <input type="number" placeholder="Score" value={gradeForm.score}
                                                                    onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                                                                    min={0} max={selectedAssignment?.maxScore || 100}
                                                                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                                <input type="text" placeholder="Feedback..." value={gradeForm.feedback}
                                                                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button onClick={() => handleGrade(sub._id)}
                                                                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                                                                    Save Grade
                                                                </button>
                                                                <button onClick={() => setGradingId(null)}
                                                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300">
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button onClick={() => { setGradingId(sub._id); setGradeForm({ score: sub.score || '', feedback: sub.feedback || '' }); }}
                                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                                                                {sub.status === 'graded' ? 'Re-grade' : 'Grade'} Manually
                                                            </button>
                                                            <button onClick={() => handleAIGrade(sub._id)} disabled={aiGrading}
                                                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50">
                                                                {aiGrading ? 'AI Grading...' : '🤖 AI Grade'}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
