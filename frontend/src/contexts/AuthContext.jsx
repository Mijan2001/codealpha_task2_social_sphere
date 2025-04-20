import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from './../../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${BASE_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            localStorage.removeItem('token');
            console.error('Authentication check failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const signin = async (email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/signin`, {
                email,
                password
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setIsAuthenticated(true);
            toast.success('Signed in successfully!');
        } catch (error) {
            toast.error('Sign in failed. Please check your credentials.');
            throw error;
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
                name,
                email,
                password
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setUser(user);
            setIsAuthenticated(true);
            toast.success('Account created successfully!');
        } catch (error) {
            toast.error('Sign up failed. Please try again.');
            throw error;
        }
    };

    const signout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        toast.info('Signed out successfully');
    };

    const updateUser = async userData => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await axios.put(
                `${BASE_URL}/api/users/update`,
                userData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setUser(prev => (prev ? { ...prev, ...response.data } : null));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                signin,
                signup,
                signout,
                checkAuth,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
