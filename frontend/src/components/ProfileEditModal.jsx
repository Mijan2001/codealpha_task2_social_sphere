import { useState, useRef } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProfileEditModal = ({ isOpen, onClose, currentUser }) => {
    const { updateUser } = useAuth();
    const [name, setName] = useState(currentUser.name);
    const [designation, setDesignation] = useState(
        currentUser.designation || ''
    );
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(
        currentUser.profileImage || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageChange = e => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('designation', designation);
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            await updateUser(formData);
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    disabled={isSubmitting}
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Edit Profile
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Profile Picture
                            </label>
                            <div className="flex items-center">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Profile preview"
                                        className="w-16 h-16 rounded-full object-cover mr-4"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                        <Upload className="w-6 h-6 text-gray-500" />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                    disabled={isSubmitting}
                                >
                                    Choose Image
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden"
                                    accept="image/*"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="name"
                            >
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="mb-6">
                            <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="designation"
                            >
                                Designation
                            </label>
                            <input
                                id="designation"
                                type="text"
                                value={designation}
                                onChange={e => setDesignation(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                placeholder="e.g. Software Engineer"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-2 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditModal;
