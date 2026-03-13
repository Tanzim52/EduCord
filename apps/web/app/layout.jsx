import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata = {
    title: 'EduCord - AI-Powered Learning Platform',
    description: 'A modern learning management system with AI-powered quizzes, assignments, chatbot, and content detection.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50">
                <link rel="icon" href="https://i.ibb.co.com/Kcgd41Cs/Screenshot-2026-02-18-035442.png" />
                <Navbar />
                <main>{children}</main>
                <Footer />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '14px',
                        },
                    }}
                />
            </body>
        </html>
    );
}
