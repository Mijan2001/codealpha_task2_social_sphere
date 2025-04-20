import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.getProfile());
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current user is following this user
        const isFollowed = user.followers.includes(req.user._id);

        const userData = user.getProfile();
        userData.isFollowed = isFollowed;

        res.json(userData);
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/update
// @desc    Update user profile
// @access  Private
router.put(
    '/update',
    protect,
    upload.single('profileImage'),
    async (req, res) => {
        console.log('user.js image upload >==  ', uploadImage);
        try {
            const { name, designation } = req.body;
            const userId = req.user?._id;

            // Find user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            console.log('user.js image upload >==  ', user);
            // Update fields
            if (name) user.name = name;
            if (designation) user.designation = designation;

            // Handle profile image upload
            if (req.file) {
                // Delete old image from Cloudinary if exists
                if (user?.profileImage) {
                    await deleteImage(user?.profileImage);
                }

                // Upload new image to Cloudinary
                const imageUrl = await uploadImage(req?.file?.path);
                user.profileImage = imageUrl;

                // Delete temp file
                fs.unlinkSync(req.file.path);
            }

            // Save user
            await user.save();

            res.json(user.getProfile());
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

// @route   POST /api/users/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', protect, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ message: 'You cannot follow yourself' });
        }

        // Find user to follow
        const userToFollow = await User.findById(req.params.id);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find current user
        const currentUser = await User.findById(req.user._id);

        // Check if already following
        if (userToFollow.followers.includes(req.user._id)) {
            return res
                .status(400)
                .json({ message: 'Already following this user' });
        }

        // Add current user to userToFollow's followers
        userToFollow.followers.push(req.user._id);
        await userToFollow.save();

        // Add userToFollow to current user's following
        currentUser.following.push(req.params.id);
        await currentUser.save();

        res.json({
            message: 'User followed successfully',
            followers: userToFollow.followers.length,
            following: currentUser.following.length
        });
    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.post('/:id/unfollow', protect, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res
                .status(400)
                .json({ message: 'You cannot unfollow yourself' });
        }

        // Find user to unfollow
        const userToUnfollow = await User.findById(req.params.id);
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find current user
        const currentUser = await User.findById(req.user._id);

        // Check if not following
        if (!userToUnfollow.followers.includes(req.user._id)) {
            return res
                .status(400)
                .json({ message: 'You are not following this user' });
        }

        // Remove current user from userToUnfollow's followers
        userToUnfollow.followers = userToUnfollow.followers.filter(
            id => id.toString() !== req.user._id.toString()
        );
        await userToUnfollow.save();

        // Remove userToUnfollow from current user's following
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== req.params.id
        );
        await currentUser.save();

        res.json({
            message: 'User unfollowed successfully',
            followers: userToUnfollow.followers.length,
            following: currentUser.following.length
        });
    } catch (error) {
        console.error('Unfollow user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
