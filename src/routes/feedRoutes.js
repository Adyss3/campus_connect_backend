const express = require('express');
const { createPost, getAllPosts, toggleLike, addComment, deletePost } = require('../controllers/feedController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getAllPosts).post(createPost);
router.patch('/:id/like', toggleLike);
router.post('/:id/comment', addComment);
router.delete('/:id', deletePost);

module.exports = router;
