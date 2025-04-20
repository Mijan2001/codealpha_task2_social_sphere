import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
    const { isAuthenticated, loading, checkAuth } = useAuth();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto px-4 py-6">
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Home />
                            ) : (
                                <Navigate to="/signin" replace />
                            )
                        }
                    />
                    <Route
                        path="/signin"
                        element={
                            !isAuthenticated ? (
                                <SignIn />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            !isAuthenticated ? (
                                <SignUp />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    />
                    <Route
                        path="/profile/:id"
                        element={
                            isAuthenticated ? (
                                <Profile />
                            ) : (
                                <Navigate to="/signin" replace />
                            )
                        }
                    />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
