
'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalCourses: 0,
        publishedCourses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading stats...</div>;

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: 'bg-blue-50 text-blue-600' },
        { label: 'Students', value: stats.totalStudents, icon: <Users size={24} />, color: 'bg-green-50 text-green-600' },
        { label: 'Teachers', value: stats.totalTeachers, icon: <CheckCircle size={24} />, color: 'bg-purple-50 text-purple-600' },
        { label: 'Total Courses', value: stats.totalCourses, icon: <BookOpen size={24} />, color: 'bg-orange-50 text-orange-600' },
        { label: 'Published Courses', value: stats.publishedCourses, icon: <CheckCircle size={24} />, color: 'bg-indigo-50 text-indigo-600' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
