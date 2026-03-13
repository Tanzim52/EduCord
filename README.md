# 🎓 EduCord - AI-Powered Learning Platform

EduCord is a modern, full-stack Learning Management System (LMS) enhanced with Artificial Intelligence. It provides a seamless experience for students to learn with AI tutors and for teachers to automate grading and content generation.

## 🚀 Key Features

- **🤖 AI Quiz Generation**: Instantly generate challenging quizzes from course videos or text content.
- **📝 Smart Assignments**: Tailored assignments that adapt to the student's learning pace.
- **💬 AI Tutor Chatbot**: Course-aware AI assistant available 24/7 to answer student questions.
- **🛡️ AI Content Detection**: Advanced detection to ensure academic integrity in student submissions.
- **📊 Modern Dashboard**: Comprehensive command center for students, teachers, and admins.
- **🏆 Certification**: Automated certificate generation upon course completion.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Communication**: Axios, EmailJS (Notifications)

### Backend
- **Framework**: Node.js / Express
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Groq API (Cloud) / Ollama (Local Fallback)
- **Authentication**: JWT & BcryptJS
- **File Handling**: Multer (Uploads)

## 📁 Project Structure

This project is organized as a monorepo using NPM workspaces:

```text
.
├── apps/
│   ├── web/        # Next.js Frontend
│   └── server/     # Express Backend
├── packages/       # Shared utilities (if any)
└── package.json    # Root configuration & scripts
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- [Ollama](https://ollama.com/) (Optional, for local AI) or a [Groq API Key](https://console.groq.com/)

### 2. Installation
From the root directory:
```bash
npm run install:all
```

### 3. Environment Variables
Check `.env.example` in the root directory. You will need to set up:
- `.env` in `apps/server/`
- `.env.local` in `apps/web/`

### 4. Running Locally
```bash
npm run dev
```
This runs both the frontend (localhost:3000) and backend (localhost:5000) concurrently.

## ☁️ Deployment

This project is prepared for deployment on **Vercel**. 

- **Frontend**: Deploy `apps/web` as a Next.js project.
- **Backend**: Deploy `apps/server` using the provided `vercel.json` configuration.

See the `apps/web/.env.local` and `apps/server/.env` for a list of environment variables you must configure in the Vercel dashboard.

---
Built with ❤️ by [Tanzim](https://github.com/Tanzim52)
