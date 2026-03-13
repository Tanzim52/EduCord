import Link from 'next/link';
import { BookOpen, Star, User } from 'lucide-react';

export default function CourseCard({ course }) {
    return (
        <Link href={`/courses/${course._id}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail.startsWith('http') ? course.thumbnail : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${course.thumbnail}`}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                            <BookOpen size={48} />
                        </div>
                    )}
                    {course.price === 0 && (
                        <span className="absolute top-3 right-3 bg-green-500/90 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Free
                        </span>
                    )}
                    {course.level && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full text-gray-700 capitalize shadow-sm">
                            {course.level}
                        </span>
                    )}
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        {course.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                                {course.category}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={14} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">{course.teacher?.name || 'Instructor'}</span>
                        </div>
                        {course.price > 0 && (
                            <span className="font-bold text-lg text-indigo-600">${course.price}</span>
                        )}
                    </div>
                    {course.rating > 0 && (
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                            <Star size={14} className="text-yellow-400 fill-current" />
                            <span className="text-sm font-bold text-gray-700">{course.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-400">({course.totalRatings})</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
