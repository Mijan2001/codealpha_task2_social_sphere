import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setProfile(response.data?.data || response.data || null);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        'An error occurred'
                );
            }
        };

        if (localStorage.getItem('token')) {
            fetchProfile();
        } else {
            setError('Authentication token is missing');
        }
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div
            style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px',
                fontFamily: 'Arial, sans-serif'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img
                    src={
                        profile.profilePhoto ||
                        'https://via.placeholder.com/150'
                    }
                    alt="Profile"
                    style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #ccc'
                    }}
                />
            </div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1
                    style={{
                        margin: '10px 0',
                        fontSize: '24px',
                        color: '#333'
                    }}
                >
                    {profile.name}
                </h1>
                <p style={{ fontSize: '16px', color: '#666' }}>
                    {profile.bio || 'No bio available'}
                </p>
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    marginTop: '20px'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h3
                        style={{
                            margin: '5px 0',
                            fontSize: '20px',
                            color: '#333'
                        }}
                    >
                        {profile.followersCount}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Followers</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h3
                        style={{
                            margin: '5px 0',
                            fontSize: '20px',
                            color: '#333'
                        }}
                    >
                        {profile.followingCount}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666' }}>Following</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
