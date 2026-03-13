'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useAuthStore from '@/lib/auth';
import NotificationBell from './NotificationBell';
import { Menu, X, LayoutDashboard, BookOpen, User, LogOut, ArrowRight, Sparkles, Shield } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout, initialize } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        initialize();
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isAuth = pathname?.startsWith('/login') || pathname?.startsWith('/register')
        || pathname?.startsWith('/forgot-password') || pathname?.startsWith('/reset-password');
    if (isAuth) return null;

    const isHomePage = pathname === '/';
    const navClass = isHomePage
        ? `fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
            ? "bg-black/20 backdrop-blur-xl border-white/10 py-0"
            : "bg-transparent border-transparent py-2"
        }`
        : "sticky top-0 z-50 glass border-b border-gray-200/50";

    const textClass = isHomePage ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-indigo-600";
    const activeClass = isHomePage ? "text-white" : "text-indigo-600";
    const iconClass = isHomePage ? "text-gray-400" : "text-gray-600";

    return (
        <nav className={navClass}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="https://i.ibb.co.com/KjRq5WhF/Screenshot-2026-02-18-035421.png"
                            alt="EduCord Logo"
                            className="h-10 w-auto object-contain rounded-lg"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                            EduCord
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/courses" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${pathname?.startsWith('/courses') ? activeClass : textClass
                            }`}>
                            <span>Courses</span>
                        </Link>

                        {user ? (
                            <>
                                <Link href="/dashboard" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${pathname === '/dashboard' ? activeClass : textClass
                                    }`}>
                                    <LayoutDashboard size={16} />
                                    <span>Dashboard</span>
                                </Link>

                                {(user.role === 'teacher' || user.role === 'admin') && (
                                    <Link href="/teacher/dashboard" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${pathname?.startsWith('/teacher') ? activeClass : textClass
                                        }`}>
                                        <BookOpen size={16} />
                                        <span>Teaching</span>
                                    </Link>
                                )}

                                {user.role === 'admin' && (
                                    <Link href="/admin/dashboard" className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${pathname?.startsWith('/admin') ? activeClass : textClass
                                        }`}>
                                        <Shield size={16} />
                                        <span>Admin</span>
                                    </Link>
                                )}

                                <NotificationBell />

                                <div className={`flex items-center gap-3 ml-2 pl-4 border-l ${isHomePage ? 'border-white/10' : 'border-gray-200'}`}>
                                    <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-purple-500/20">
                                            <span className="text-white text-xs font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className={`p-2 rounded-lg transition-all ${isHomePage ? 'text-gray-400 hover:text-red-400 hover:bg-white/5' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/login" className={`text-sm font-medium transition-colors ${textClass}`}>
                                    Log in
                                </Link>
                                <Link href="/register" className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-all shadow-lg shadow-white/5">
                                    <span>Sign up</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className={`md:hidden p-2 ${iconClass}`}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className={`md:hidden py-4 space-y-2 border-t animate-in slide-in-from-top-2 duration-200 ${isHomePage ? 'border-white/10 bg-black/90' : 'border-gray-100 bg-white'}`}>
                        <Link href="/courses" className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${isHomePage ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <BookOpen size={18} /> Courses
                        </Link>
                        {user ? (
                            <>
                                <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${isHomePage ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>
                                <Link href="/profile" className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${isHomePage ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    <User size={18} /> Profile
                                </Link>
                                {(user.role === 'teacher' || user.role === 'admin') && (
                                    <Link href="/teacher/dashboard" className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg ${isHomePage ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <BookOpen size={18} /> Teaching
                                    </Link>
                                )}
                                <button onClick={logout} className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm rounded-lg ${isHomePage ? 'text-red-400 hover:bg-white/10' : 'text-red-500 hover:bg-red-50'}`}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className={`block px-3 py-2 text-sm rounded-lg ${isHomePage ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600'}`}>Log in</Link>
                                <Link href="/register" className="block px-3 py-2 text-sm bg-white text-black rounded-lg text-center font-medium">Sign up</Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
