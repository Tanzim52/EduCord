import Link from 'next/link';
import { Sparkles, ArrowRight, Shield, Zap, GraduationCap, Layout, BookOpen, Users, BarChart } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0a0a] to-[#0a0a0a]" />
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-300">The Future of AI Learning</span>
                    </div>

                    <h1 className="text-5xl lg:text-8xl font-black mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                        Supercharge <br className="hidden lg:block" />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            Your Intelligence
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                        Master any subject with our AI-powered platform. Personalized quizzes, smart assignments, and real-time tutoring—all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                        <Link href="/register"
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition-all flex items-center gap-2">
                            Start Learning Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-white/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link href="/courses"
                            className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold text-lg hover:bg-white/10 transition-all hover:scale-105">
                            Browse Courses
                        </Link>
                    </div>

                    {/* Video Embed */}
                    <div className="mt-20 relative animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-700">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none" />
                        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 shadow-2xl max-w-5xl mx-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20" />
                            <div className="relative rounded-xl bg-[#0F0F0F] overflow-hidden aspect-video border border-white/5">
                                <iframe
                                    src="https://www.youtube.com/embed/B7k5rOgmOGY?si=lWHiMS1-kCEjySIN"
                                    title="EduCord Platform Demo"
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 border-y border-white/5 bg-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Active Students', value: '10k+' },
                            { label: 'AI Quizzes Taken', value: '500k+' },
                            { label: 'Expert Instructors', value: '150+' },
                            { label: 'Completion Rate', value: '94%' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">Features</h2>
                        <h3 className="text-3xl md:text-5xl font-bold mb-6">Built for the <span className="text-white">Future of Education</span></h3>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg pt-4">This isn't just an LMS. It's a comprehensive learning ecosystem powered by next-gen AI.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 text-yellow-400" />,
                                title: 'AI Quiz Generation',
                                desc: 'Instantly generate quizzes from any course content. Our AI analyzes videos and texts to create challenging assessments.',
                                color: 'from-yellow-400/20 to-orange-400/5'
                            },
                            {
                                icon: <BookOpen className="w-6 h-6 text-blue-400" />,
                                title: 'Smart Assignments',
                                desc: 'Get tailored assignments that adapt to your learning pace. AI evaluates your submissions with detailed feedback.',
                                color: 'from-blue-400/20 to-cyan-400/5'
                            },
                            {
                                icon: <Sparkles className="w-6 h-6 text-purple-400" />,
                                title: 'AI Tutor Chatbot',
                                desc: 'Stuck on a concept? Ask the course-aware AI tutor. It understands the context of your specific lesson.',
                                color: 'from-purple-400/20 to-pink-400/5'
                            },
                            {
                                icon: <Shield className="w-6 h-6 text-green-400" />,
                                title: 'AI Content Detection',
                                desc: 'Maintain academic integrity with our advanced AI usage detection for student submissions.',
                                color: 'from-green-400/20 to-emerald-400/5'
                            },
                            {
                                icon: <BarChart className="w-6 h-6 text-red-400" />,
                                title: 'Auto Grading',
                                desc: 'Teachers save hours with instant, accurate AI grading that provides constructive criticism to students.',
                                color: 'from-red-400/20 to-rose-400/5'
                            },
                            {
                                icon: <Layout className="w-6 h-6 text-indigo-400" />,
                                title: 'Modern Dashboard',
                                desc: 'Track progress, view analytics, and manage courses from a beautifully designed, intuitive command center.',
                                color: 'from-indigo-400/20 to-violet-400/5'
                            },
                        ].map((f, i) => (
                            <div key={i} className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} />
                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {f.icon}
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300">
                                        {f.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
                <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready to start your journey?</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of students and instructors already using EduCord to revolutionize their education.
                    </p>
                    <Link href="/register"
                        className="inline-block px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-indigo-500/20">
                        Get Started for Free
                    </Link>
                </div>
            </section>
        </div>
    );
}
