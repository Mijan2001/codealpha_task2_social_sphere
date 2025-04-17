import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const EditProfile = ({
    open,
    setOpen,
    name,
    setName,
    bio,
    setBio,
    handleUpdateProfile
}) => {
    // Fetch current user data
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    'http://localhost:5000/api/users/profile',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (res.data.success) {
                    setName(res.data.data.name || '');
                    setBio(res.data.data.bio || '');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        if (open) fetchUserProfile();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={() => setOpen(prev => !prev)}>
            <DialogTrigger asChild>
                <Button variant="outline" className="outline-none border-none">
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Your Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdateProfile}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfile;
