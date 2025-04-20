import { useState, useRef } from 'react';
import { Image, X, Loader } from 'lucide-react';
import { usePost } from '../contexts/PostContext';
import { useAuth } from '../contexts/AuthContext';

const CreatePostCard = () => {
    const { createPost } = usePost();
    const { user } = useAuth();
    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageChange = e => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPostImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setPreviewUrl(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPostImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!postText.trim() && !postImage) return;

        setIsSubmitting(true);
        try {
            await createPost(postText, postImage || undefined);
            setPostText('');
            setPostImage(null);
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 transition-all hover:shadow-lg">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start mb-4">
                    {user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-500 font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <textarea
                        value={postText}
                        onChange={e => setPostText(e.target.value)}
                        placeholder="What's on your mind?"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[80px] resize-none"
                        disabled={isSubmitting}
                    />
                </div>

                {previewUrl && (
                    <div className="relative mb-4">
                        <img
                            src={previewUrl}
                            alt="Post preview"
                            className="w-full h-auto rounded-lg max-h-80 object-contain bg-gray-100"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                            disabled={isSubmitting}
                        >
                            <X className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
                        disabled={isSubmitting}
                    >
                        <Image className="w-5 h-5 mr-1" />
                        <span>Add Image</span>
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                        disabled={isSubmitting}
                    />

                    <button
                        type="submit"
                        className={`px-4 py-2 rounded-md text-white ${
                            isSubmitting || (!postText.trim() && !postImage)
                                ? 'bg-blue-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                        } transition-colors flex items-center`}
                        disabled={
                            isSubmitting || (!postText.trim() && !postImage)
                        }
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            'Post'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePostCard;
