const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { protect } = require('../middleware/auth');
// const { cloudinary } = require('../utils/cloudinary');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const dotenv = require('dotenv');
dotenv.config();

// Configure Cloudinary storage
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET_KEY
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'social_sphere_posts',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

// ✅ Now create multer instance
const upload = multer({ storage });

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required'
            });
        }

        const newPost = new Post({
            user: req.user._id,
            text,
            image: req.file ? req.file.path : ''
        });

        const post = await newPost.save();

        // Populate user details
        await post.populate('user', 'name username profilePicture');

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/posts
// @desc    Get all posts for feed (posts from users the current user follows + own posts)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Get IDs of users the current user follows
        const following = await Follow.find({ follower: req.user._id }).select(
            'following'
        );
        const followingIds = following.map(follow => follow.following);

        // Add current user ID to get their posts too
        followingIds.push(req.user._id);

        // Get posts from followed users and current user
        const posts = await Post.find({ user: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .populate('user', 'name username profilePicture')
            .populate('comments.user', 'name username profilePicture');

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/posts/user/:userId
// @desc    Get all posts by a specific user
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .populate('user', 'name username profilePicture')
            .populate('comments.user', 'name username profilePicture');

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/posts/:id
// @desc    Get a single post
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'name username profilePicture')
            .populate('comments.user', 'name username profilePicture');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        // Delete the post
        await post.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if the post has already been liked by this user
        const isLiked = post.likes.some(
            like => like.toString() === req.user._id.toString()
        );

        if (isLiked) {
            // Unlike the post
            post.likes = post.likes.filter(
                like => like.toString() !== req.user._id.toString()
            );
        } else {
            // Like the post
            post.likes.push(req.user._id);
        }

        await post.save();

        // Populate user details
        await post.populate('user', 'name username profilePicture');
        await post.populate('comments.user', 'name username profilePicture');

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Add comment
        post.comments.unshift({
            user: req.user._id,
            text,
            createdAt: Date.now()
        });

        await post.save();

        // Populate user details
        await post.populate('user', 'name username profilePicture');
        await post.populate('comments.user', 'name username profilePicture');

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/posts/:id/comment/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comment/:commentId', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Find the comment
        const comment = post.comments.find(
            comment => comment._id.toString() === req.params.commentId
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is the owner of the comment or the post
        if (
            comment.user.toString() !== req.user._id.toString() &&
            post.user.toString() !== req.user._id.toString()
        ) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Remove the comment
        post.comments = post.comments.filter(
            comment => comment._id.toString() !== req.params.commentId
        );

        await post.save();

        // Populate user details
        await post.populate('user', 'name username profilePicture');
        await post.populate('comments.user', 'name username profilePicture');

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
