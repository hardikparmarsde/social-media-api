import express from 'express';
import { upload } from '../controllers/image.js';
import { getPosts, createPost, deletePost, deleteAllPosts, updatePost, likePost } from '../controllers/posts.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/getPosts', getPosts);
router.post('/createPost', upload.single('selectedFile'), auth, createPost);
router.delete('/deletePost/:postId', auth, deletePost);
router.delete('/deletePosts/', deleteAllPosts);
router.patch('/updatePost/:postId', upload.single('selectedFile'), auth,  updatePost);
router.patch('/likePost/:postId', auth,  likePost);

export default router;