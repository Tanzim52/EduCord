'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import useAuthStore from '@/lib/auth';
import { BookOpen, CheckCircle, FileEdit, Users, Plus, ArrowRight } from 'lucide-react';

export default function TeacherDashboard() {
    const { user, initialize } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initialize();
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses/teacher');
            setCourses(data);
        } catch (err) {
            console.error('Failed to fetch teacher courses');
        } finally {
            setLoading(false);
        }
    };

    const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);
    const publishedCount = courses.filter(c => c.isPublished).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard 👨‍🏫</h1>
                    <p className="text-gray-500 mt-1">Manage your courses and students</p>
                </div>
                <Link href="/teacher/courses/create"
                    className="px-5 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                    + Create Course
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { icon: <BookOpen size={24} />, value: courses.length, label: 'Total Courses', color: 'bg-indigo-50 text-indigo-600' },
                    { icon: <CheckCircle size={24} />, value: publishedCount, label: 'Published', color: 'bg-green-50 text-green-600' },
                    { icon: <FileEdit size={24} />, value: courses.length - publishedCount, label: 'Drafts', color: 'bg-yellow-50 text-yellow-600' },
                    { icon: <Users size={24} />, value: totalStudents, label: 'Total Students', color: 'bg-purple-50 text-purple-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Courses List */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Courses</h2>
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-500 mb-6">
                        <BookOpen size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No courses yet</h3>
                    <p className="text-gray-500 mt-2">Create your first course to get started</p>
                    <Link href="/teacher/courses/create"
                        className="inline-flex items-center gap-2 mt-6 px-6 py-3 gradient-primary text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:opacity-90 transition-opacity">
                        <Plus size={18} />
                        Create Course
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map(course => (
                        <div key={course._id} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                                        {course.thumbnail ? (
                                            <img
                                                src={course.thumbnail.startsWith('http') ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${course.thumbnail}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <BookOpen size={28} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><BookOpen size={14} /> {course.lessons?.length || 0} lessons</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {course.enrolledStudents?.length || 0} students</span>
                                            <span className={`font-medium flex items-center gap-1.5 ${course.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                                                <span className={`w-2 h-2 rounded-full ${course.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/teacher/courses/${course._id}/manage`}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                    Manage <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
