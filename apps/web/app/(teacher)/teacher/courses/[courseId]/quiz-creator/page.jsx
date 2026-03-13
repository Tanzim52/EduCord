'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function QuizCreatorPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const [quiz, setQuiz] = useState({
        title: '',
        description: '',
        timeLimit: 30,
        questions: [
            {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: '',
            },
        ],
    });

    const addQuestion = () => {
        setQuiz({
            ...quiz,
            questions: [
                ...quiz.questions,
                { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' },
            ],
        });
    };

    const removeQuestion = (index) => {
        if (quiz.questions.length <= 1) return toast.error('At least one question is required');
        const updated = quiz.questions.filter((_, i) => i !== index);
        setQuiz({ ...quiz, questions: updated });
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...quiz.questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuiz({ ...quiz, questions: updated });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updated = [...quiz.questions];
        const newOptions = [...updated[qIndex].options];
        newOptions[oIndex] = value;
        updated[qIndex] = { ...updated[qIndex], options: newOptions };
        setQuiz({ ...quiz, questions: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            if (!q.question.trim()) return toast.error(`Question ${i + 1} is empty`);
            if (q.options.some(o => !o.trim())) return toast.error(`All options in Question ${i + 1} must be filled`);
        }

        setSaving(true);
        try {
            await api.post(`/quiz/course/${courseId}`, quiz);
            toast.success('Quiz created!');
            router.push(`/teacher/courses/${courseId}/manage`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create quiz');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Quiz</h1>
                        <p className="text-sm text-gray-500 mt-1">Manually create a quiz for your course</p>
                    </div>
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quiz Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                            <input type="text" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                placeholder="e.g. Chapter 1 Review Quiz"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input type="text" value={quiz.description} onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                    placeholder="Optional description"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                                <input type="number" value={quiz.timeLimit} onChange={(e) => setQuiz({ ...quiz, timeLimit: Number(e.target.value) })}
                                    min={1} max={180}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    {quiz.questions.map((q, qi) => (
                        <div key={qi} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Question {qi + 1}</h3>
                                <button type="button" onClick={() => removeQuestion(qi)}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <input type="text" value={q.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                                    placeholder="Enter your question"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                        <input
                                            type="radio" name={`correct-${qi}`}
                                            checked={q.correctAnswer === oi}
                                            onChange={() => updateQuestion(qi, 'correctAnswer', oi)}
                                            className="w-4 h-4 text-indigo-600"
                                        />
                                        <input type="text" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
                                <input type="text" value={q.explanation} onChange={(e) => updateQuestion(qi, 'explanation', e.target.value)}
                                    placeholder="Why this answer is correct"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-between">
                        <button type="button" onClick={addQuestion}
                            className="px-4 py-2.5 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors">
                            + Add Question
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                            {saving ? 'Creating...' : `Create Quiz (${quiz.questions.length} questions)`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
