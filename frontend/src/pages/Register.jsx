import RegisterForm from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md mb-4">
                <Link to="/">
                    <Button variant="outline" size="sm" className="mb-4">
                        ← Back to Home
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-center mb-6">
                    SocialSphere
                </h1>
                <RegisterForm />
            </div>
        </div>
    );
};

export default Register;
