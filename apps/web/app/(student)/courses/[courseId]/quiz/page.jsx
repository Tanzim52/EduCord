'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import QuizPlayer from '@/components/quiz/QuizPlayer';
import toast from 'react-hot-toast';

export default function QuizPage() {
    const { courseId } = useParams();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, [courseId]);

    const fetchQuizzes = async () => {
        try {
            const { data } = await api.get(`/quiz/course/${courseId}`);
            setQuizzes(data);
        } catch (err) {
            toast.error('Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (selectedQuiz) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <button
                    onClick={() => setSelectedQuiz(null)}
                    className="mb-6 text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1"
                >
                    ← Back to quizzes
                </button>
                <QuizPlayer quiz={selectedQuiz} courseId={courseId} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">📝 Course Quizzes</h1>

            {quizzes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <span className="text-4xl">📝</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No quizzes available</h3>
                    <p className="text-gray-500 mt-1">Quizzes will appear here once your teacher creates them</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quizzes.map(quiz => (
                        <div key={quiz._id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{quiz.title || 'Quiz'}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span>{quiz.questions?.length || 0} questions</span>
                                        {quiz.timeLimit && <span>• {quiz.timeLimit} min</span>}
                                        <span>• Pass: {quiz.passingScore}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedQuiz(quiz)}
                                    className="px-5 py-2 gradient-primary text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                                >
                                    Start Quiz
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
