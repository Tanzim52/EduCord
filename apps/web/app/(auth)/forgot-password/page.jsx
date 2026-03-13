'use client';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { sendPasswordResetEmail } from '@/lib/email';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email });

            // If token returned, send email via EmailJS
            if (data.resetToken) {
                try {
                    await sendPasswordResetEmail(data.userName, data.userEmail, data.resetToken);
                } catch (emailErr) {
                    console.warn('EmailJS not configured');
                }
            }

            setSent(true);
            toast.success('Reset instructions sent!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
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
                    <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
                    <p className="text-gray-500 mt-1">Enter your email and we&apos;ll send you a reset link</p>
                </div>

                {sent ? (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✉️</span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            If an account with <strong>{email}</strong> exists, we&apos;ve sent password reset instructions.
                        </p>
                        <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            ← Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                type="email" value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Remember your password?{' '}
                            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Log in</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
