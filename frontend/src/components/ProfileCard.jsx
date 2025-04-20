import { useState } from 'react';
import { Edit, User, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProfileEditModal from './ProfileEditModal';

const ProfileCard = ({
    isCurrentUser = true,
    userId,
    profileImage,
    name,
    designation = '',
    followers,
    following,
    onFollow,
    isFollowing = false
}) => {
    const { user } = useAuth();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt={name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                            <User className="w-12 h-12 text-blue-500" />
                        </div>
                    )}

                    {isCurrentUser ? (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                            aria-label="Edit profile"
                        >
                            <Edit className="w-5 h-5 text-gray-600" />
                        </button>
                    ) : (
                        <button
                            onClick={onFollow}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isFollowing
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>

                <h2 className="text-xl font-bold text-gray-800">{name}</h2>
                {designation && (
                    <p className="text-gray-600 mt-1">{designation}</p>
                )}

                <div className="flex mt-4 text-sm">
                    <div className="flex items-center mr-6">
                        <Users className="w-4 h-4 mr-1 text-gray-500" />
                        <span className="font-medium">{followers}</span>
                        <span className="text-gray-500 ml-1">Followers</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-500" />
                        <span className="font-medium">{following}</span>
                        <span className="text-gray-500 ml-1">Following</span>
                    </div>
                </div>
            </div>

            {isEditModalOpen && (
                <ProfileEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentUser={user}
                />
            )}
        </div>
    );
};

export default ProfileCard;
