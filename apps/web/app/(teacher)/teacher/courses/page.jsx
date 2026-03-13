'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function TeacherCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses/teacher');
            setCourses(data);
        } catch (err) { } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (courseId) => {
        try {
            await api.patch(`/courses/${courseId}/publish`);
            fetchCourses();
        } catch (err) { }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                <Link href="/teacher/courses/create"
                    className="px-5 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm">
                    + New Course
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl">
                                📚
                            </div>
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <span>{course.lessons?.length || 0} lessons</span>
                                    <span>• {course.enrolledStudents?.length || 0} students</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/teacher/courses/${course._id}/manage`}
                                        className="flex-1 py-2 text-center border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                                        Manage
                                    </Link>
                                    <button onClick={() => togglePublish(course._id)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium ${course.isPublished
                                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}>
                                        {course.isPublished ? 'Unpublish' : 'Publish'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
