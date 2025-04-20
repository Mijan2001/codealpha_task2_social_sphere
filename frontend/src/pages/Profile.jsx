import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';
import { PostProvider } from '../contexts/PostContext';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';
import axios from 'axios';

const Profile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const { fetchUserPosts } = usePost();
    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token');

                // Fetch user profile
                const userResponse = await axios.get(`/api/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileUser(userResponse.data);

                // Check if current user follows this user
                setIsFollowing(!!userResponse.data.isFollowed);

                // Fetch user posts
                const posts = await fetchUserPosts(id);
                setUserPosts(posts);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        }
    }, [id, fetchUserPosts]);

    const handleFollow = async () => {
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
                    followers: response.data.followers
                };
            });

            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
                <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    User not found
                </h2>
                <p className="text-gray-600">
                    The user you're looking for doesn't exist or has been
                    removed.
                </p>
            </div>
        );
    }

    const isCurrentUser = profileUser?._id === currentUser?._id;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <ProfileCard
                        isCurrentUser={isCurrentUser}
                        userId={profileUser._id}
                        name={profileUser.name}
                        profileImage={profileUser.profileImage}
                        designation={profileUser.designation}
                        followers={profileUser.followers}
                        following={profileUser.following}
                        isFollowing={isFollowing}
                        onFollow={!isCurrentUser ? handleFollow : undefined}
                    />
                </div>

                <div className="border-b border-gray-300 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 pb-2">
                        Posts
                    </h2>
                </div>

                {userPosts.length > 0 ? (
                    userPosts.map(post => (
                        <PostCard
                            key={post._id}
                            postId={post._id}
                            user={post.user}
                            createdAt={post.createdAt}
                            text={post.text}
                            imageUrl={post.imageUrl}
                            likes={post.likes}
                            comments={post.comments}
                            isFollowing={isFollowing}
                            onFollow={!isCurrentUser ? handleFollow : undefined}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            No posts yet
                        </h3>
                        <p className="text-gray-600">
                            {isCurrentUser
                                ? "You haven't created any posts yet. Start sharing with your network!"
                                : "This user hasn't created any posts yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileWithProvider = () => (
    <PostProvider>
        <Profile />
    </PostProvider>
);

export default ProfileWithProvider;
