'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import useAuthStore from '@/lib/auth';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const router = useRouter();
    const { user, initialize } = useAuthStore();
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialize();
        fetchCourse();
        checkEnrollment();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/courses/${courseId}`);
            setCourse(data);
        } catch (err) {
            toast.error('Course not found');
        } finally {
            setLoading(false);
        }
    };

    const checkEnrollment = async () => {
        try {
            const { data } = await api.get(`/enrollments/status/${courseId}`);
            setEnrolled(data.enrolled);
        } catch (err) { }
    };

    const handleEnroll = async () => {
        if (!user) {
            router.push('/login');
            return;
        }
        try {
            await api.post(`/enrollments/${courseId}`);
            setEnrolled(true);
            toast.success('Enrolled successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Enrollment failed');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) return <div className="text-center py-20">Course not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="relative bg-gray-900 text-white py-12 overflow-hidden">
                {course.thumbnail && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${course.thumbnail}`}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                    </div>
                )}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                {course.category && (
                                    <span className="bg-white/20 text-xs font-medium px-3 py-1 rounded-full">
                                        {course.category}
                                    </span>
                                )}
                                {course.level && (
                                    <span className="bg-white/20 text-xs font-medium px-3 py-1 rounded-full capitalize">
                                        {course.level}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-white/70 mb-6">{course.description}</p>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <span className="text-sm font-semibold">{course.teacher?.name?.charAt(0)}</span>
                                    </div>
                                    <span className="text-sm text-white/80">{course.teacher?.name}</span>
                                </div>
                                <span className="text-white/50">•</span>
                                <span className="text-sm text-white/80">{course.lessons?.length || 0} lessons</span>
                                {course.rating > 0 && (
                                    <>
                                        <span className="text-white/50">•</span>
                                        <span className="text-sm text-white/80">⭐ {course.rating.toFixed(1)}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Course Image & Price Card */}
                        <div className="flex flex-col gap-6">
                            {course.thumbnail && (
                                <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video relative group">
                                    <img
                                        src={course.thumbnail.startsWith('http') ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${course.thumbnail}`}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <div className="text-3xl font-bold mb-4">
                                    {course.price === 0 ? 'Free' : `$${course.price}`}
                                </div>
                                {enrolled ? (
                                    <Link
                                        href={`/courses/${courseId}/learn`}
                                        className="block w-full py-3 text-center gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        Continue Learning →
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full py-3 gradient-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                    >
                                        {course.price === 0 ? 'Enroll for Free' : `Enroll - $${course.price}`}
                                    </button>
                                )}
                                {enrolled && (
                                    <div className="flex gap-2 mt-3">
                                        <Link href={`/courses/${courseId}/quiz`}
                                            className="flex-1 py-2 text-center text-sm bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                                            📝 Quizzes
                                        </Link>
                                        <Link href={`/courses/${courseId}/assignment`}
                                            className="flex-1 py-2 text-center text-sm bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                                            📋 Assignments
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Information Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-12">
                    {/* What you'll learn */}
                    {(course.learningObjectives?.length > 0) && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                                {course.learningObjectives.map((obj, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-gray-700">
                                        <div className="mt-1 flex-shrink-0 text-green-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Course Overview */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
                        {course.lessons?.length > 0 ? (
                            <div className="space-y-3">
                                {course.lessons.map((lesson, i) => (
                                    <div key={lesson._id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-sm font-semibold text-indigo-600">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <span className="capitalize">{lesson.contentType}</span>
                                                {lesson.duration && <span>• {Math.round(lesson.duration / 60)} min</span>}
                                                {lesson.isPreview && <span className="text-green-600 font-medium">Preview</span>}
                                            </div>
                                        </div>
                                        {lesson.isPreview && !enrolled && (
                                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">Free Preview</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                                <p className="text-gray-500">No lessons added yet</p>
                            </div>
                        )}
                    </section>

                    {/* Materials & Resources */}
                    {course.materials && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Materials & Resources</h2>
                            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl text-sm text-amber-900 leading-relaxed">
                                {course.materials}
                            </div>
                        </section>
                    )}

                    {/* Requirements & Info */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {course.prerequisites?.length > 0 && (
                            <section>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Requirements</h3>
                                <ul className="space-y-2">
                                    {course.prerequisites.map((req, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-600">
                                            <span className="text-indigo-500">•</span>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                        {course.targetAudience?.length > 0 && (
                            <section>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Who is this course for?</h3>
                                <ul className="space-y-2">
                                    {course.targetAudience.map((aud, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-600">
                                            <span className="text-indigo-500">•</span>
                                            {aud}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    {/* About the Instructor */}
                    <section className="pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Instructor</h2>
                        <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex-shrink-0">
                                {course.teacher?.avatar ? (
                                    <img src={course.teacher.avatar} alt={course.teacher.name} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {course.teacher?.name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{course.teacher?.name}</h3>
                                {course.teacher?.headline && (
                                    <p className="text-indigo-600 font-medium text-sm mb-4">{course.teacher.headline}</p>
                                )}
                                {course.teacher?.bio && (
                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                        "{course.teacher.bio}"
                                    </p>
                                )}
                                <div className="mt-6 flex gap-4">
                                    <div className="text-xs text-gray-400">
                                        <span className="font-bold text-gray-700">1,240</span> Students
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        <span className="font-bold text-gray-700">12</span> Courses
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        <span className="font-bold text-gray-700">4.8</span> ★ Rating
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Info Grid */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="font-bold text-gray-900">Course Details</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Format', value: course.courseFormat, icon: '🌐' },
                                { label: 'Duration', value: course.duration, icon: '⏱️' },
                                { label: 'Assessment', value: course.assessmentMethod, icon: '📝' },
                                { label: 'Certifications', value: course.certification, icon: '📜' },
                            ].map((item, i) => item.value && (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{item.label}</p>
                                        <p className="text-sm font-medium text-gray-700">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {course.technicalRequirements && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3">Technical Requirements</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{course.technicalRequirements}</p>
                        </div>
                    )}

                    {course.supportServices && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-3">Support Services</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{course.supportServices}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
