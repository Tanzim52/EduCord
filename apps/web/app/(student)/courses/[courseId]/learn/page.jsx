'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import VideoPlayer from '@/components/video/VideoPlayer';
import Chatbot from '@/components/chatbot/Chatbot';
import toast from 'react-hot-toast';

export default function LearnPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, lessonsRes, enrollmentRes] = await Promise.all([
                api.get(`/courses/${courseId}`),
                api.get(`/lessons/course/${courseId}`),
                api.get(`/enrollments/status/${courseId}`),
            ]);
            setCourse(courseRes.data);
            setLessons(lessonsRes.data);
            setEnrollment(enrollmentRes.data.enrollment);
            if (lessonsRes.data.length > 0) setCurrentLesson(lessonsRes.data[0]);
        } catch (err) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async (lessonId) => {
        try {
            const { data } = await api.post(`/enrollments/progress/${courseId}`, { lessonId });
            setEnrollment(data);
            toast.success('Lesson completed!');
        } catch (err) { }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

    return (
        <div className="flex h-[calc(100vh-64px)]">
            {/* Sidebar - Lessons list */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-sm">{course?.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{lessons.length} lessons</p>
                </div>
                <div className="p-2">
                    {lessons.map((lesson, i) => (
                        <button
                            key={lesson._id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${currentLesson?._id === lesson._id
                                ? 'bg-indigo-50 border border-indigo-200'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${currentLesson?._id === lesson._id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${currentLesson?._id === lesson._id ? 'text-indigo-600' : 'text-gray-700'
                                        }`}>
                                        {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-400 capitalize">{lesson.contentType}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {currentLesson ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
                            <button
                                onClick={() => markComplete(currentLesson._id)}
                                className="px-5 py-2 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition-colors shadow-sm"
                            >
                                ✓ Mark Complete
                            </button>
                        </div>

                        {/* Video Player */}
                        {(() => {
                            const videoUrl = currentLesson.videoUrl;
                            const contentUrl = currentLesson.contentUrl ? `${apiBase}${currentLesson.contentUrl}` : null;
                            const playerUrl = videoUrl || contentUrl;
                            const shouldShowPlayer = currentLesson.contentType === 'video' || (videoUrl && videoUrl.trim() !== '');

                            if (shouldShowPlayer && playerUrl) {
                                return (
                                    <div className="mb-8">
                                        <VideoPlayer
                                            url={playerUrl}
                                            onEnded={() => markComplete(currentLesson._id)}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* PDF/Doc Viewer/Download */}
                        {currentLesson.contentType !== 'video' && currentLesson.contentUrl && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8 shadow-sm">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                                    {currentLesson.contentType === 'pdf' ? '📄' : '📎'}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">Lesson Material</h3>
                                <p className="text-gray-500 mb-6">Download or view the lesson content</p>
                                <a
                                    href={`${apiBase}${currentLesson.contentUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:scale-105 transition-transform"
                                >
                                    <span>Download / View {currentLesson.contentType.toUpperCase()}</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </a>
                            </div>
                        )}

                        {/* Attachments */}
                        {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span>📎</span> Attachments
                                </h3>
                                <div className="grid gap-3">
                                    {currentLesson.attachments.map((att, i) => (
                                        <a
                                            key={i}
                                            href={`${apiBase}${att.url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                📄
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{att.name}</p>
                                                <p className="text-xs text-gray-500 uppercase">{att.type}</p>
                                            </div>
                                            <div className="text-gray-400 group-hover:text-indigo-600">
                                                ⬇️
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {currentLesson.description && (
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8">
                                <h3 className="font-semibold text-gray-900 mb-2">About this lesson</h3>
                                <p className="text-gray-600 leading-relaxed">{currentLesson.description}</p>
                            </div>
                        )}

                        {/* Course Completion / Certificate */}
                        {enrollment && (enrollment.isCompleted || (enrollment.progress >= 100)) && (
                            <div className="mt-12 p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl text-white text-center animate-in slide-in-from-bottom-5">
                                <h2 className="text-2xl font-bold mb-2">🎉 Course Completed!</h2>
                                <p className="text-indigo-100 mb-6">Congratulations on finishing the course. You can now claim your certificate.</p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { data } = await api.post(`/certificates/claim/${courseId}`);
                                            toast.success('Certificate claimed! Check your profile.');
                                            // Redirect or show certificate modal
                                        } catch (err) {
                                            toast.error(err.response?.data?.message || 'Failed to claim certificate');
                                        }
                                    }}
                                    className="px-8 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                                >
                                    <span>🏆</span> Claim Certificate
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-5xl mb-6">
                            🎓
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Welcome to the Classroom</h2>
                        <p className="text-gray-500 mt-2 max-w-md">Select a lesson from the sidebar to start your learning journey.</p>
                    </div>
                )}
            </div>

            {/* Chatbot */}
            <Chatbot courseId={courseId} userRole="student" />
        </div>
    );
}
