import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { BASE_URL } from './../../utils/api';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchPosts();
        }
    }, [user]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await axios.get(`${BASE_URL}/api/posts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPosts = async userId => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await axios.get(
                `${BASE_URL}/api/posts/user/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching user posts:', error);
            toast.error('Failed to load user posts');
            return [];
        }
    };

    const createPost = async (text, image) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const formData = new FormData();
            formData.append('text', text);
            if (image) {
                formData.append('image', image);
            }

            const response = await axios.post(
                `${BASE_URL}/api/posts`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setPosts(prevPosts => [response.data, ...prevPosts]);
            toast.success('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            toast.error('Failed to create post');
            throw error;
        }
    };

    const deletePost = async postId => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPosts(prevPosts =>
                prevPosts.filter(post => post._id !== postId)
            );
            toast.success('Post deleted successfully!');
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Failed to delete post');
            throw error;
        }
    };

    const likePost = async postId => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await axios.post(
                `${BASE_URL}/api/posts/${postId}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, likes: response.data.likes }
                        : post
                )
            );
        } catch (error) {
            console.error('Error liking post:', error);
            toast.error('Failed to like post');
            throw error;
        }
    };

    const unlikePost = async postId => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await axios.post(
                `${BASE_URL}/api/posts/${postId}/unlike`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, likes: response.data.likes }
                        : post
                )
            );
        } catch (error) {
            console.error('Error unliking post:', error);
            toast.error('Failed to unlike post');
            throw error;
        }
    };

    const addComment = async (postId, text) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            const response = await axios.post(
                `${BASE_URL}/api/posts/${postId}/comment`,
                { text },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: response.data.comments }
                        : post
                )
            );
            toast.success('Comment added!');
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
            throw error;
        }
    };

    return (
        <PostContext.Provider
            value={{
                posts,
                loading,
                createPost,
                deletePost,
                likePost,
                unlikePost,
                addComment,
                fetchPosts,
                fetchUserPosts
            }}
        >
            {children}
        </PostContext.Provider>
    );
};

export const usePost = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error('usePost must be used within a PostProvider');
    }
    return context;
};
