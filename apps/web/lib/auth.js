'use client';
import { create } from 'zustand';
import api from './api';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    loading: true,

    initialize: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            set({
                token,
                user: user ? JSON.parse(user) : null,
                loading: false,
            });
        }
    },

    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ token: data.token, user: data.user });
        return data;
    },

    register: async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ token: data.token, user: data.user });
        return data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null });
        window.location.href = '/login';
    },

    isAuthenticated: () => !!get().token,
    isTeacher: () => get().user?.role === 'teacher' || get().user?.role === 'admin',
    isAdmin: () => get().user?.role === 'admin',
}));

export default useAuthStore;
