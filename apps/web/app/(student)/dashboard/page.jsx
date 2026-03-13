'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useAuthStore from '@/lib/auth';
import api from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';
import { BookOpen, CheckCircle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
    const { user, initialize } = useAuthStore();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialize();
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const { data } = await api.get('/enrollments/my');
            setEnrollments(data);
        } catch (err) {
            console.error('Failed to fetch enrollments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name || 'Student'} 👋
                </h1>
                <p className="text-gray-500 mt-1">Continue your learning journey</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
                            <p className="text-sm text-gray-500">Enrolled Courses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {enrollments.filter(e => e.isCompleted).length}
                            </p>
                            <p className="text-sm text-gray-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {enrollments.length > 0
                                    ? Math.round(enrollments.reduce((acc, e) => acc + Math.min(100, e.progress || 0), 0) / enrollments.length)
                                    : 0}%
                            </p>
                            <p className="text-sm text-gray-500">Avg Progress</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Courses */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                <Link href="/courses" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                    Browse more →
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : enrollments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-500 mb-6">
                        <Sparkles size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No courses yet</h3>
                    <p className="text-gray-500 mt-2">Start your learning journey by enrolling in a course</p>
                    <Link href="/courses" className="inline-flex items-center gap-2 mt-6 px-6 py-3 gradient-primary text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity">
                        <BookOpen size={18} />
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="relative group">
                            <CourseCard course={enrollment.course} />
                            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-10 bg-gradient-to-t from-white via-white to-transparent pt-4 rounded-b-2xl">
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-indigo-600">Progress</span>
                                    <span className="text-gray-500">{enrollment.progress || 0}%</span>
                                </div>
                                <div className="bg-gray-100 rounded-full h-2 overflow-hidden ring-1 ring-gray-200/50">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, enrollment.progress || 0)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
