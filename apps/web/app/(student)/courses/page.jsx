'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [level, setLevel] = useState('');

    const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Math', 'Language', 'Other'];

    useEffect(() => {
        fetchCourses();
    }, [category, level]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            if (level) params.level = level;
            const { data } = await api.get('/courses', { params });
            setCourses(data.courses || []);
        } catch (err) {
            console.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
                <p className="text-gray-500 mt-1">Find the perfect course for your learning goals</p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                    />
                    <button type="submit" className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                        Search
                    </button>
                </form>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setCategory('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!category ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 mt-3">
                    {['', 'beginner', 'intermediate', 'advanced'].map(l => (
                        <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${level === l ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {l || 'All Levels'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20">
                    <span className="text-4xl">🔍</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No courses found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}
