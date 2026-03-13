'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [form, setForm] = useState({ token, newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (form.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token: form.token,
                newPassword: form.newPassword,
            });
            toast.success('Password reset! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">E</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
                    <p className="text-gray-500 mt-1">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5">
                    {!token && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                            <input
                                type="text" value={form.token}
                                onChange={(e) => setForm({ ...form, token: e.target.value })}
                                placeholder="Paste your reset token"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password" value={form.newPassword}
                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                            type="password" value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">← Back to Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
