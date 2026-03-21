import React, { createContext, useState, useEffect } from 'react';
import api from './utils/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // FIX 1: Initialize user from localStorage so there's no UI flicker on refresh
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // FIX 2: Attach token to headers globally on app load
        const token = localStorage.getItem('accessToken');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    setUser(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    delete api.defaults.headers.common['Authorization'];
                }
                return Promise.reject(error);
            }
        );

        const fetchUser = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data?.data) {
                    setUser(response.data.data);
                    localStorage.setItem('user', JSON.stringify(response.data.data));
                }
            } catch (error) {
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();

        return () => api.interceptors.response.eject(interceptor);
    }, []);

    const sendOtp = async (phoneNumber, isLogin = false) => {
        try {
            const endpoint = isLogin ? '/users/send-login-otp' : '/users/send-otp';
            await api.post(endpoint, { phoneNumber });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP',
            };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, accessToken } = response.data.data;
            
            // FIX 3: Save session data directly to the browser
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };

    const loginWithOtpReq = async (phoneNumber, otpCode) => {
        try {
            const response = await api.post('/users/login-otp', { phoneNumber, otpCode });
            const { user, accessToken } = response.data.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'OTP verification failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/users/register', userData);

            if (userData.email) {
                return await login(userData.email, userData.password);
            }

            if (response.data?.data?.user) {
                setUser(response.data.data.user);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error logging out', error);
        } finally {
            // FIX 4: Ensure local data is wiped regardless of server response
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, login, loginWithOtpReq, register, logout, sendOtp, loading }}
        >
            {children}
        </AuthContext.Provider>
    );
};