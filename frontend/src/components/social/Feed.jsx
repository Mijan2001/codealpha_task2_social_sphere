import { useState, useEffect } from 'react';
import Post from './Post';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // Replace with your backend URL

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [comments, setComments] = useState([]); // assuming you want to manage comments here

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BASE_URL}/api/posts`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (res.data.success) {
                    setPosts(res?.data?.data); // assuming your backend returns data inside `data`
                } else {
                    console.error('Failed to fetch posts');
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching posts:', error.message);
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    const handleDeletePost = deletedPostId => {
        setPosts(prevPosts =>
            prevPosts.filter(post => post._id !== deletedPostId)
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <Post
                    key={post._id}
                    id={post._id}
                    author={post.user}
                    content={post?.text}
                    image={post.image}
                    createdAt={post.createdAt}
                    likes={post.likes}
                    comments={post.comments} // assuming post has these properties
                    setComments={setComments} // pass setComments to Post if needed
                    onDelete={handleDeletePost}
                />
            ))}

            {posts.length === 0 && (
                <div className="text-center py-10">
                    <h3 className="text-xl font-medium text-gray-500">
                        No posts yet
                    </h3>
                    <p className="text-gray-400 mt-2">
                        Follow users to see their posts in your feed.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Feed;
