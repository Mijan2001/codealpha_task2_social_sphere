const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { protect } = require('../middleware/auth');
const { cloudinary } = require('../utils/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'social_sphere_profiles',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

const upload = multer({ storage });

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get follower and following counts
        const followersCount = await Follow.countDocuments({
            following: user._id
        });
        const followingCount = await Follow.countDocuments({
            follower: user._id
        });

        const userData = {
            ...user.toObject(),
            followersCount,
            followingCount
        };

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get follower and following counts
        const followersCount = await Follow.countDocuments({
            following: user._id
        });
        const followingCount = await Follow.countDocuments({
            follower: user._id
        });

        // Check if current user follows this user
        const isFollowing = await Follow.exists({
            follower: req.user._id,
            following: user._id
        });

        const userData = {
            ...user.toObject(),
            followersCount,
            followingCount,
            isFollowing: !!isFollowing
        };

        res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, bio } = req.body;

        const updateFields = {};
        if (name) updateFields.name = name;
        if (bio !== undefined) updateFields.bio = bio;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/users/profile-picture
// @desc    Update profile picture
// @access  Private
router.put(
    '/profile-picture',
    protect,
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image'
                });
            }

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { $set: { profilePicture: req.file.path } },
                { new: true }
            ).select('-password');

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;
