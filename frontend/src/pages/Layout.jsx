import Navbar from '@/components/Navbar';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const BASE_URL = 'http://localhost:5000'; // Change to your backend URL

const Layout = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const token = localStorage.getItem('token'); // assume JWT is stored in
    // Fetch current user profile
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(res.data.data);
            } catch (err) {
                console.error('Failed to fetch user:', err);
                setIsAuthenticated(false);
            }
        };

        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);
    return (
        <>
            <Navbar isAuthenticated={isAuthenticated} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;
