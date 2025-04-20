import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, signout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full">
                                <span className="font-bold text-xl">S</span>
                            </div>
                            <span className="ml-2 text-xl font-bold text-gray-800">
                                SocialSphere
                            </span>
                        </Link>
                    </div>

                    {/* Center Navigation - Home */}
                    <div className="hidden md:flex items-center">
                        <Link
                            to="/"
                            className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-500 transition-colors"
                        >
                            <Home className="w-5 h-5 mr-1" />
                            <span>Home</span>
                        </Link>
                    </div>

                    {/* Authentication Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to={`/profile/${user?._id}`}
                                    className="flex items-center text-gray-700 hover:text-blue-500 transition-colors"
                                >
                                    {user?.profileImage ? (
                                        <img
                                            src={user.profileImage}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-500" />
                                        </div>
                                    )}
                                </Link>
                                <button
                                    onClick={signout}
                                    className="flex items-center px-4 py-2 text-gray-700 hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 mr-1" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/signin"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-500 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-700 hover:text-blue-500 focus:outline-none"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg py-2 px-4">
                    <Link
                        to="/"
                        className="block py-2 text-gray-700 hover:text-blue-500 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to={`/profile/${user?._id}`}
                                className="block py-2 text-gray-700 hover:text-blue-500 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Profile
                            </Link>
                            <button
                                onClick={() => {
                                    signout();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="block w-full text-left py-2 text-gray-700 hover:text-red-500 transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/signin"
                                className="block py-2 text-gray-700 hover:text-blue-500 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/signup"
                                className="block py-2 text-gray-700 hover:text-blue-500 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
