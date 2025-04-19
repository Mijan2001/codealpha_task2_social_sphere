import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from './ui/button';

const Navbar = ({ isAuthenticated }) => {
    return (
        <>
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl font-bold text-gray-900">
                            SocialSphere
                        </h1>
                        <div className="hidden md:block space-x-4">
                            <Link
                                to="/"
                                className="text-gray-900 hover:text-gray-700"
                            >
                                Home
                            </Link>
                            <Link
                                to="/profile"
                                className="text-gray-900 hover:text-gray-700"
                            >
                                Profile
                            </Link>
                            <Link
                                to="/friends"
                                className="text-gray-900 hover:text-gray-700"
                            >
                                Friends
                            </Link>
                            <Link
                                to="/posts"
                                className="text-gray-900 hover:text-gray-700"
                            >
                                Posts
                            </Link>
                        </div>
                        <div>
                            {isAuthenticated ? (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsAuthenticated(false);
                                        localStorage.removeItem('token');
                                    }}
                                >
                                    Sign Out
                                </Button>
                            ) : (
                                <div className="space-x-2">
                                    <Link to="/login">
                                        <Button variant="outline">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button>Register</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Navbar;
