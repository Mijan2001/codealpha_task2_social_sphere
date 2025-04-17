const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const { protect } = require('../middleware/auth');

// @route   POST /api/follows/:id
// @desc    Follow a user
// @access  Private
router.post('/:id', protect, async (req, res) => {
    try {
        // Check if user exists
        const userToFollow = await User.findById(req.params.id);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is trying to follow themselves
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        // Check if already following
        const existingFollow = await Follow.findOne({
            follower: req.user._id,
            following: req.params.id
        });

        if (existingFollow) {
            return res.status(400).json({
                success: false,
                message: 'You are already following this user'
            });
        }

        // Create new follow
        const newFollow = new Follow({
            follower: req.user._id,
            following: req.params.id
        });

        await newFollow.save();

        res.status(200).json({
            success: true,
            message: 'User followed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/follows/:id
// @desc    Unfollow a user
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        // Check if user exists
        const userToUnfollow = await User.findById(req.params.id);

        if (!userToUnfollow) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Find and delete the follow relationship
        const follow = await Follow.findOneAndDelete({
            follower: req.user._id,
            following: req.params.id
        });

        if (!follow) {
            return res.status(400).json({
                success: false,
                message: 'You are not following this user'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User unfollowed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/follows/followers
// @desc    Get users who follow the current user
// @access  Private
router.get('/followers', protect, async (req, res) => {
    try {
        const followers = await Follow.find({
            following: req.user._id
        }).populate('follower', 'name username profilePicture bio');

        res.status(200).json({
            success: true,
            count: followers.length,
            data: followers.map(follow => follow.follower)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/follows/following
// @desc    Get users that the current user follows
// @access  Private
router.get('/following', protect, async (req, res) => {
    try {
        const following = await Follow.find({
            follower: req.user._id
        }).populate('following', 'name username profilePicture bio');

        res.status(200).json({
            success: true,
            count: following.length,
            data: following.map(follow => follow.following)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
