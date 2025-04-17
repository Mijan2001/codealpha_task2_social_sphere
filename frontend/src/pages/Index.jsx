import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Feed from '@/components/social/Feed';
import axios from 'axios';
import EditProfile from '@/components/porfile/EditProfile';

const BASE_URL = 'http://localhost:5000';

const Index = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [postContent, setPostContent] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token'); // assume JWT is stored in localStorage
    const [postImage, setPostImage] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch current user profile
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
    }, [isAuthenticated, isEditing]);

    // Handle post creation
    const handleCreatePost = async e => {
        e.preventDefault();

        if (!postContent.trim()) {
            alert('Post content cannot be empty.');
            return;
        }

        const formData = new FormData();
        formData.append('text', postContent);
        if (postImage) {
            formData.append('image', postImage);
        }

        try {
            const res = await axios.post(`${BASE_URL}/api/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                alert('Post created successfully!');
                setPostContent('');
                setPostImage(null); // reset image
            }
        } catch (err) {
            console.error('Failed to create post:', err);
            alert('Failed to create post. Please try again.');
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                'http://localhost:5000/api/users/profile',
                { name, bio },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                alert('Profile updated successfully!');
                setOpen(false);
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Something went wrong.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* PROFILE CARD */}
                    <div className="md:col-span-1">
                        <Card className="p-4">
                            <h2 className="text-lg font-semibold mb-4">
                                Profile
                            </h2>

                            <div className="flex flex-col items-center space-y-3">
                                {user?.profilePicture ? (
                                    <img
                                        src={user?.profilePicture}
                                        alt="profile"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-300"></div>
                                )}
                                <h3 className="font-medium">
                                    {user?.name || 'Guest User'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {user?.bio || 'Welcome to SocialSphere'}
                                </p>
                                {isAuthenticated ? (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setOpen(true);
                                        }}
                                    >
                                        {/* Call the edit profile function here */}
                                        {isEditing ? (
                                            <EditProfile
                                                open={open}
                                                setOpen={setOpen}
                                                name={name}
                                                setName={setName}
                                                bio={bio}
                                                setBio={setBio}
                                                handleUpdateProfile={
                                                    handleUpdateProfile
                                                }
                                            />
                                        ) : (
                                            'Edit Profile'
                                        )}
                                    </Button>
                                ) : (
                                    <Link to="/login" className="w-full">
                                        <Button className="w-full">
                                            Sign In to Continue
                                        </Button>
                                    </Link>
                                )}
                                {user && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        Followers: {user.followersCount} |
                                        Following: {user.followingCount}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* CREATE POST + FEED */}
                    <div className="md:col-span-2">
                        {isAuthenticated && (
                            <Card className="p-4 mb-6">
                                <h2 className="text-lg font-semibold mb-2">
                                    Create Post
                                </h2>
                                <form onSubmit={handleCreatePost}>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 mb-2"
                                        placeholder="What's on your mind?"
                                        rows={3}
                                        value={postContent}
                                        onChange={e =>
                                            setPostContent(e.target.value)
                                        }
                                    ></textarea>

                                    {postImage && (
                                        <div className="mb-2 text-sm text-gray-600">
                                            Selected Image: {postImage.name}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={e => {
                                            if (
                                                e.target.files &&
                                                e.target.files[0]
                                            ) {
                                                setPostImage(e.target.files[0]);
                                            }
                                        }}
                                    />

                                    <div className="flex justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                fileInputRef.current.click()
                                            }
                                        >
                                            Add Image
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={!postContent.trim()}
                                        >
                                            Post
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}
                        <Feed />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Index;
