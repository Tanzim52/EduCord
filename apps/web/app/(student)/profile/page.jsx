'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Shield, Award, Globe, Linkedin, Github, Twitter, Camera, Lock, Save, Download } from 'lucide-react';

export default function ProfilePage() {
    const { user, initialize } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [form, setForm] = useState({
        name: '', bio: '', headline: '', phone: '',
        website: '', linkedin: '', github: '', twitter: '',
    });

    const [passForm, setPassForm] = useState({
        currentPassword: '', newPassword: '', confirmPassword: '',
    });

    useEffect(() => {
        initialize();
        fetchProfile();
        fetchCertificates();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setProfile(data);
            setForm({
                name: data.name || '',
                bio: data.bio || '',
                headline: data.headline || '',
                phone: data.phone || '',
                website: data.socialLinks?.website || '',
                linkedin: data.socialLinks?.linkedin || '',
                github: data.socialLinks?.github || '',
                twitter: data.socialLinks?.twitter || '',
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchCertificates = async () => {
        try {
            const { data } = await api.get('/certificates');
            setCertificates(data);
        } catch (err) {
            // calculated silently or handle error if needed
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put('/auth/profile', {
                name: form.name,
                bio: form.bio,
                headline: form.headline,
                phone: form.phone,
                socialLinks: {
                    website: form.website,
                    linkedin: form.linkedin,
                    github: form.github,
                    twitter: form.twitter,
                },
            });
            setProfile(data);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (passForm.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        try {
            await api.put('/auth/change-password', {
                currentPassword: passForm.currentPassword,
                newPassword: passForm.newPassword,
            });
            toast.success('Password changed!');
            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password change failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                    <div className="h-32 gradient-primary" />
                    <div className="px-6 pb-6 -mt-12">
                        <div className="flex items-end gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                                {profile?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="pb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                                <p className="text-sm text-gray-500">{profile?.headline || profile?.role}</p>
                                <p className="text-xs text-gray-400">{profile?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
                    {['profile', 'security', 'certificates'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab === 'profile' ? <User size={16} /> : tab === 'security' ? <Shield size={16} /> : <Award size={16} />}
                            <span className="capitalize">{tab}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'profile' ? (
                    <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                                <input type="text" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })}
                                    placeholder="e.g. Computer Science Student"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                rows={3} placeholder="Tell us about yourself..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>

                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                                        <Globe size={16} />
                                    </div>
                                    <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                                        placeholder="https://yourwebsite.com"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Linkedin size={16} />
                                    </div>
                                    <input type="url" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                                        placeholder="LinkedIn URL"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                                        <Github size={16} />
                                    </div>
                                    <input type="url" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })}
                                        placeholder="GitHub URL"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                                        <Twitter size={16} />
                                    </div>
                                    <input type="url" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                                        placeholder="Twitter URL"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button type="submit" disabled={saving}
                                className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                ) : activeTab === 'certificates' ? (
                    <div className="space-y-4">
                        {certificates.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-500 mb-4">
                                    <Award size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No certificates yet</h3>
                                <p className="text-gray-500 mt-1">Complete courses to earn certificates!</p>
                            </div>
                        ) : (
                            certificates.map(cert => (
                                <div key={cert._id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Award size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{cert.course.title}</h3>
                                            <p className="text-sm text-gray-500">Issued on {new Date(cert.issueDate).toLocaleDateString()}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-1">ID: {cert.certificateId}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${cert.pdfUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-5 py-2.5 border border-indigo-100 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors"
                                    >
                                        Download PDF <Download size={16} />
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleChangePassword} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5 max-w-md">
                        <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input type="password" value={passForm.currentPassword}
                                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input type="password" value={passForm.newPassword}
                                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required minLength={6} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input type="password" value={passForm.confirmPassword}
                                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required minLength={6} />
                        </div>
                        <button type="submit"
                            className="px-6 py-2.5 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                            Change Password
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
