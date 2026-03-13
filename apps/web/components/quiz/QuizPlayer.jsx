'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function QuizPlayer({ quiz, courseId }) {
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);

    const handleAnswer = (questionIdx, optionIdx) => {
        setAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
    };

    const submitQuiz = async () => {
        let correct = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswer) correct++;
        });
        const score = Math.round((correct / quiz.questions.length) * 100);
        setResults({ score, correct, total: quiz.questions.length });
        setSubmitted(true);

        try {
            await api.post(`/quiz/${quiz._id}/submit`, { answers, score });
        } catch (err) {
            console.error('Failed to save quiz results');
        }
    };

    if (submitted && results) {
        return (
            <div className="max-w-lg mx-auto text-center p-8">
                <div className={`text-7xl font-bold mb-4 ${results.score >= quiz.passingScore ? 'text-green-500' : 'text-red-500'}`}>
                    {results.score}%
                </div>
                <p className="text-xl mb-2 text-gray-700">{results.correct}/{results.total} correct</p>
                <div className={`text-lg font-semibold mb-6 ${results.score >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                    {results.score >= quiz.passingScore ? '🎉 Congratulations! You passed!' : '❌ Keep studying and try again'}
                </div>

                <div className="space-y-4 text-left mt-8">
                    <h3 className="font-semibold text-lg text-gray-800">Review Answers</h3>
                    {quiz.questions.map((q, i) => (
                        <div key={i} className={`p-4 rounded-xl border-2 ${answers[i] === q.correctAnswer ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}>
                            <p className="font-medium text-sm mb-2">{i + 1}. {q.question}</p>
                            <p className="text-sm text-green-700">✓ Correct: {q.options[q.correctAnswer]}</p>
                            {answers[i] !== q.correctAnswer && (
                                <p className="text-sm text-red-700">✗ Your answer: {q.options[answers[i]] || 'Not answered'}</p>
                            )}
                            {q.explanation && <p className="text-xs text-gray-600 mt-1 italic">{q.explanation}</p>}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const q = quiz.questions[current];
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Question {current + 1} of {quiz.questions.length}</span>
                <span>{Object.keys(answers).length} answered</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
            </div>

            <h3 className="text-lg font-semibold mb-6 text-gray-800">{q.question}</h3>
            <div className="space-y-3">
                {q.options.map((opt, i) => (
                    <button key={i} onClick={() => handleAnswer(current, i)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${answers[current] === i
                                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                            }`}>
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full mr-3 text-sm font-semibold ${answers[current] === i ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {['A', 'B', 'C', 'D'][i]}
                        </span>
                        {opt}
                    </button>
                ))}
            </div>

            <div className="flex justify-between mt-8">
                <button onClick={() => setCurrent(c => Math.max(0, c - 1))}
                    disabled={current === 0}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-colors font-medium text-sm">
                    ← Previous
                </button>

                {current < quiz.questions.length - 1 ? (
                    <button onClick={() => setCurrent(c => c + 1)}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm">
                        Next →
                    </button>
                ) : (
                    <button onClick={submitQuiz}
                        disabled={Object.keys(answers).length < quiz.questions.length}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm">
                        Submit Quiz ✓
                    </button>
                )}
            </div>
        </div>
    );
}
