const Post = require('../models/Post');

/**
 * @desc    Create a new feed post
 * @route   POST /api/feed
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { content, type, image } = req.body;

    const post = await Post.create({
      userId: req.user._id,
      content,
      type: type || 'update',
      image: image || null,
    });

    await post.populate('userId', 'firstName lastName role');

    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all feed posts (newest first, paginated)
 * @route   GET /api/feed
 * @access  Private
 */
const getAllPosts = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const query = type ? { type } : {};
    const skip = (page - 1) * limit;

    const posts = await Post.find(query)
      .populate('userId', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Like or unlike a post (toggle)
 * @route   PATCH /api/feed/:id/like
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: { liked: !alreadyLiked, likeCount: post.likes.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/feed/:id/comment
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Comment content is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    post.comments.push({
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      content,
    });

    await post.save();

    res.status(201).json({
      success: true,
      data: { comments: post.comments },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a post (owner only)
 * @route   DELETE /api/feed/:id
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPost, getAllPosts, toggleLike, addComment, deletePost };
