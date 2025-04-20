import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Heart,
    MessageCircle,
    Trash2,
    Send,
    MoreVertical,
    User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { usePost } from '../contexts/PostContext';

const PostCard = ({
    postId,
    user,
    createdAt,
    text,
    imageUrl,
    likes,
    comments,
    onFollow,
    isFollowing = false,
    setIsFollowing
}) => {
    const { user: currentUser } = useAuth();
    const { likePost, unlikePost, addComment, deletePost } = usePost();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const isLiked = likes.includes(currentUser?._id || '');
    const isOwnPost = user?._id === currentUser?._id;

    const handleLikeToggle = async () => {
        try {
            if (isLiked) {
                await unlikePost(postId);
            } else {
                await likePost(postId);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleAddComment = async e => {
        e.preventDefault();
        if (!commentText.trim()) return;

        setIsSubmitting(true);
        try {
            await addComment(postId, commentText);
            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(postId);
            } catch (error) {
                console.error('Error deleting post:', error);
            } finally {
                setShowMenu(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 transition-all hover:shadow-lg">
            {/* Post Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <Link
                        to={`/profile/${user?._id}`}
                        className="flex items-center"
                    >
                        {user?.profileImage ? (
                            <img
                                src={user?.profileImage}
                                alt={user?.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <User className="w-5 h-5 text-blue-500" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-medium text-gray-800">
                                {user?.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(createdAt), {
                                    addSuffix: true
                                })}
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center">
                        {!isOwnPost && (
                            <button
                                onClick={() => {
                                    onFollow(user?._id);
                                    if (setIsFollowing) {
                                        setIsFollowing(!isFollowing);
                                    }
                                }}
                                className={`text-sm mr-3 px-3 py-1 rounded-full transition-colors ${
                                    isFollowing
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}

                        {isOwnPost && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                        <button
                                            onClick={handleDeletePost}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Post
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
                <p className="text-gray-800 mb-4">{text}</p>
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Post content"
                        className="w-full h-auto rounded-lg max-h-96 object-contain bg-gray-100"
                    />
                )}
            </div>

            {/* Post Actions */}
            <div className="px-4 py-3 border-t border-b flex items-center justify-between">
                <button
                    onClick={handleLikeToggle}
                    className={`flex items-center ${
                        isLiked
                            ? 'text-red-500'
                            : 'text-gray-600 hover:text-red-500'
                    } transition-colors`}
                >
                    <Heart
                        className={`w-5 h-5 mr-1 ${
                            isLiked ? 'fill-current' : ''
                        }`}
                    />
                    <span>{likes.length}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    <span>{comments.length}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="p-4 bg-gray-50">
                    {comments.length > 0 ? (
                        <div className="mb-4 max-h-64 overflow-y-auto">
                            {comments.map(comment => (
                                <div
                                    key={comment._id}
                                    className="mb-3 last:mb-0"
                                >
                                    <div className="flex items-start">
                                        {comment.user.profileImage ? (
                                            <img
                                                src={comment.user.profileImage}
                                                alt={comment.user.name}
                                                className="w-8 h-8 rounded-full object-cover mr-2"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                                <User className="w-4 h-4 text-blue-500" />
                                            </div>
                                        )}
                                        <div className="bg-white rounded-lg px-3 py-2 shadow-sm flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-medium text-sm text-gray-800">
                                                    {comment.user.name}
                                                </h4>
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            comment.createdAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm mb-4">
                            No comments yet. Be the first to comment!
                        </p>
                    )}

                    <form
                        onSubmit={handleAddComment}
                        className="flex items-center"
                    >
                        <input
                            type="text"
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            className={`p-2 ${
                                !commentText.trim() || isSubmitting
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            } text-white rounded-r-lg transition-colors`}
                            disabled={!commentText.trim() || isSubmitting}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
