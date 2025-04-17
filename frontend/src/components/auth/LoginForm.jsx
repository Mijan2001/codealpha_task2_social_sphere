import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { NavLink, useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { BASE_URL } from '../../../utils/api';

const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);

        console.log('email : ', email);
        console.log('password : ', password);

        try {
            const { data } = await axios.post(`${BASE_URL}/api/auth/login`, {
                email,
                password
            });

            console.log('data : ', data);

            if (data.success) {
                localStorage.setItem('token', data?.data?.token);
                toast.success('Login successful!');

                navigate('/');
            }
            toast.success('Login successful!');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(
                error.response?.data?.message ||
                    'Failed to log in. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Login to SocialSphere
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            </form>
            <p className="text-center mt-4 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline">
                    Register
                </Link>
            </p>
        </Card>
    );
};

export default LoginForm;
