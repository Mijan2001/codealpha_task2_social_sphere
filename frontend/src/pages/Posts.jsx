import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const BASE_URL = 'http://localhost:5000'; // Change to your backend URL

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [following, setFollowing] = useState({}); // Track follow/unfollow state

    const fetchPosts = async (page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${BASE_URL}/api/posts/all?page=${page}`
            );
            setPosts(res.data.data);
            setTotalPages(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
        setLoading(false);
    };

    const toggleFollow = async userId => {
        try {
            const isFollowing = following[userId];
            await axios.post(
                `${BASE_URL}/api/users/${userId}/${
                    isFollowing ? 'unfollow' : 'follow'
                }`
            );
            setFollowing(prev => ({ ...prev, [userId]: !isFollowing }));
        } catch (err) {
            console.error('Follow/Unfollow error:', err);
        }
    };

    useEffect(() => {
        fetchPosts(page);
    }, [page]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">All Posts</h2>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
                </div>
            ) : (
                posts.map(post => (
                    <Card key={post._id} className="mb-6 shadow-xl">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage
                                            src={post.user?.profilePicture}
                                            alt={post.user?.name}
                                        />
                                        <AvatarFallback>
                                            {post.user?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">
                                            {post.user?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            @{post.user?.username}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleFollow(post.user._id)}
                                >
                                    {following[post.user._id]
                                        ? 'Unfollow'
                                        : 'Follow'}
                                </Button>
                            </div>

                            <p className="text-gray-800 whitespace-pre-wrap mb-4">
                                {post.content}
                            </p>

                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="Post"
                                    className="w-full h-64 object-cover rounded-lg shadow-sm mb-2"
                                />
                            )}
                        </CardContent>
                    </Card>
                ))
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1 || loading}
                >
                    Previous
                </Button>
                <p className="text-gray-600 text-sm">
                    Page {page} of {totalPages}
                </p>
                <Button
                    variant="outline"
                    onClick={() =>
                        setPage(prev => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages || loading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};

export default Posts;
