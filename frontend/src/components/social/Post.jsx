import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger
} from '@/components/ui/hover-card';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RiDeleteBinLine } from 'react-icons/ri';
import axios from 'axios';

const Post = ({
    id,
    author,
    content,
    image,
    createdAt,
    likes,
    comments,
    setComments,
    onDelete
}) => {
    console.log('Post.jsx id : ', id);
    console.log('Post.jsx author : ', author);
    console.log('Post.jsx content : ', content);
    console.log('Post.jsx image : ', image);
    console.log('Post.jsx createdAt : ', createdAt);
    console.log('Post.jsx likes : ', likes);
    console.log('Post.jsx comments : ', comments);
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [likeCount, setLikeCount] = useState(likes.length);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const currentUserId = user?._id;

    const handleDeletePost = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(
                `http://localhost:5000/api/posts/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                console.log('Post deleted successfully');
                onDelete(id); // Call the parent function to update UI
            } else {
                console.error('Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleLike = async () => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.put(
                `http://localhost:5000/api/posts/${id}/like`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                const updatedPost = res.data.data;

                setIsLiked(updatedPost.likes.includes(currentUserId));
                setLikeCount(updatedPost.likes.length);
            } else {
                console.error('Failed to like/unlike the post');
            }
        } catch (error) {
            console.error('Error liking/unliking post:', error);
        }
    };

    // useEffect(() => {
    //     console.log('isLiked =========', isLiked);
    //     const fetchPost = async () => {
    //         try {
    //             const res = await axios.get(
    //                 `http://localhost:5000/api/posts/${id}/like`
    //             );
    //             if (res.data.success) {
    //                 const post = res.data.data;
    //                 // setIsLiked(post.likes.includes(currentUserId));
    //                 setIsLiked(!isLiked);
    //                 setLikeCount(post.likes.length);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching post:', error);
    //         }
    //     };

    //     fetchPost();
    // }, [id, currentUserId]);

    useEffect(() => {
        const isPostLiked = likes.some(like => like._id === currentUserId);
        setIsLiked(isPostLiked);
        setLikeCount(likes.length);
    }, [id, likes]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/posts/${id}/comment`,
                { text: commentText },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                const updatedPost = res.data.data;
                const newComment = updatedPost.comments[0]; // get the latest comment only

                // Insert the new comment at the beginning
                setComments(prevComments => [newComment, ...prevComments]);
                setCommentText('');
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const formattedDate = new Date(createdAt).toLocaleString();

    return (
        <Card className="p-4 mb-4">
            <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                    {author?.image ? (
                        <img
                            src={author?.image}
                            alt={author?.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {author?.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <span className="font-medium hover:underline cursor-pointer">
                                {author?.name}
                            </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-semibold">
                                        {author?.name}
                                    </h4>
                                    <p className="text-sm">
                                        View profile to see more information and
                                        follow this user.
                                    </p>
                                    <div className="flex items-center pt-2">
                                        <Button variant="outline" size="sm">
                                            View Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>

                    <div className="text-xs text-gray-500 mt-1">
                        {formattedDate}
                    </div>
                </div>
                <RiDeleteBinLine
                    className="hover:text-red-500 cursor-pointer"
                    onClick={handleDeletePost}
                />
            </div>

            <div className="mb-3">
                <p className="text-sm md:text-base">{content}</p>
                {image && (
                    <div className="mt-3 relative pt-[56.25%]">
                        <img
                            src={image}
                            alt="Post image"
                            className="absolute top-0 left-0 w-full h-full object-cover rounded-md"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between text-sm border-t border-b py-2">
                <button
                    className={`flex items-center space-x-1 ${
                        isLiked ? 'text-blue-600' : 'text-gray-500'
                    }`}
                    onClick={handleLike}
                >
                    <span>{isLiked ? '❤️' : '🤍'}</span>
                    <span>{likeCount} Likes</span>
                </button>

                <button
                    className="flex items-center space-x-1 text-gray-500"
                    onClick={() => setShowComments(!showComments)}
                >
                    <span>💬</span>
                    <span>{comments.length} Comments</span>
                </button>
            </div>

            {showComments && (
                <div className="mt-3 space-y-3">
                    {comments.map(comment => (
                        <div key={comment._id} className="flex space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-xs">
                                {comment.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-gray-100 p-2 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium">
                                        {comment.user?.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(
                                            comment.createdAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                        </div>
                    ))}

                    <form
                        onSubmit={handleAddComment}
                        className="flex items-center mt-2 space-x-2"
                    >
                        <Input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            className="text-sm flex-1"
                        />
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!commentText.trim()}
                        >
                            Post
                        </Button>
                    </form>
                </div>
            )}
        </Card>
    );
};

export default Post;
