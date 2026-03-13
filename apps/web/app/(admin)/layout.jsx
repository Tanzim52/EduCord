
'use client';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '@/lib/auth';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const { logout } = useAuthStore();

    const links = [
        { href: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { href: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        EduCord Admin
                    </h1>
                </div>

                <nav className="px-4 space-y-1">
                    {links.map(link => (
                        <Link key={link.href} href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === link.href
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}>
                            {link.icon}
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
