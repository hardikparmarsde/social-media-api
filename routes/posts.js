import express from 'express';
import { upload } from '../controllers/image.js';
import { getPosts, searchPosts, getTrendingPosts, createPost, deletePost, deleteAllPosts, updatePost, likePost, addComment, deleteComment } from '../controllers/posts.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/getPosts', getPosts);
router.get('/search', searchPosts);
router.get('/trending', getTrendingPosts);
router.post('/createPost', upload.single('selectedFile'), auth, createPost);
router.delete('/deletePost/:postId', auth, deletePost);
router.delete('/deletePosts/', deleteAllPosts);
router.patch('/updatePost/:postId', upload.single('selectedFile'), auth,  updatePost);
router.patch('/likePost/:postId', auth,  likePost);
router.post('/:postId/comments', auth, addComment);
router.delete('/:postId/comments/:commentId', auth, deleteComment);

export default router;