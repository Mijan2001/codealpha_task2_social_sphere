import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import Post from '../models/Post.js';
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

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage');

        res.json(posts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/user/:id
// @desc    Get posts by user ID
// @access  Private
router.get('/user/:id', protect, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .populate('user', 'name profileImage')
            .populate('comments.user', 'name profileImage');

        res.json(posts);
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { text } = req.body;

        const newPost = new Post({
            text,
            user: req.user._id
        });

        // Handle image upload
        if (req.file) {
            const imageUrl = await uploadImage(req.file.path);
            newPost.imageUrl = imageUrl;

            // Delete temp file
            fs.unlinkSync(req.file.path);
        }

        await newPost.save();

        // Populate user data before sending response
        const populatedPost = await Post.findById(newPost._id).populate(
            'user',
            'name profileImage'
        );

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete image from Cloudinary if exists
        if (post.imageUrl) {
            await deleteImage(post.imageUrl);
        }

        await post.deleteOne();

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if post already liked by the user
        if (post.likes.includes(req.user._id)) {
            return res.status(400).json({ message: 'Post already liked' });
        }

        // Add user ID to likes array
        post.likes.push(req.user._id);
        await post.save();

        res.json({ likes: post.likes });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts/:id/unlike
// @desc    Unlike a post
// @access  Private
router.post('/:id/unlike', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if post not liked by the user
        if (!post.likes.includes(req.user._id)) {
            return res.status(400).json({ message: 'Post not liked yet' });
        }

        // Remove user ID from likes array
        post.likes = post.likes.filter(
            id => id.toString() !== req.user._id.toString()
        );
        await post.save();

        res.json({ likes: post.likes });
    } catch (error) {
        console.error('Unlike post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text.trim()) {
            return res
                .status(400)
                .json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Add comment to post
        post.comments.push({
            text,
            user: req.user._id
        });

        await post.save();

        // Populate user data for the new comment
        const populatedPost = await Post.findById(post._id).populate(
            'comments.user',
            'name profileImage'
        );

        res.json({ comments: populatedPost.comments });
    } catch (error) {
        console.error('Comment on post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
