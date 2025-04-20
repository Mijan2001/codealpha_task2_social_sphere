import { useEffect, useState } from 'react';
import ProfileCard from '../components/ProfileCard';
import CreatePostCard from '../components/CreatePostCard';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import { PostProvider } from '../contexts/PostContext';
import axios from 'axios';

const Home = () => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const { posts, loading, fetchPosts } = usePost();
    const [profileUser, setProfileUser] = useState(null);
    const isCurrentUser = profileUser?._id === user?._id;
    useEffect(() => {
        console.log('user home.js==>', user?.profileImage);
        console.log('user id===========>', posts);
        fetchPosts();
    }, [isCurrentUser]);

    const handleFollow = async id => {
        console.log('clicked============', id);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await axios.post(
                `/api/users/${id}/${endpoint}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setProfileUser(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    followers: response?.data?.followers
                };
            });

            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - User Profile */}
                <div className="md:w-1/3">
                    <div className="sticky top-24">
                        <ProfileCard
                            name={user?.name}
                            profileImage={user?.profileImage}
                            designation={user?.designation}
                            followers={user?.followers || 0}
                            following={user?.following || 0}
                        />
                    </div>
                </div>

                {/* Right Column - Posts */}
                <div className="md:w-2/3">
                    <CreatePostCard />

                    {loading ? (
                        <div className="flex flex-col space-y-4">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="bg-white rounded-lg shadow-md p-4 animate-pulse"
                                >
                                    <div className="flex items-center mb-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                    <div className="h-64 bg-gray-200 rounded mb-4"></div>
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        posts?.map(post => (
                            <PostCard
                                key={post._id}
                                postId={post._id}
                                user={post.user}
                                createdAt={post.createdAt}
                                text={post.text}
                                imageUrl={post.imageUrl}
                                likes={post.likes}
                                comments={post.comments}
                                isFollowing={false} // Update this based on real following status
                                onFollow={handleFollow}
                                setIsFollowing={setIsFollowing}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                No posts yet
                            </h3>
                            <p className="text-gray-600">
                                Create your first post or follow other users to
                                see their posts here!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HomeWithProvider = () => (
    <PostProvider>
        <Home />
    </PostProvider>
);

export default HomeWithProvider;
