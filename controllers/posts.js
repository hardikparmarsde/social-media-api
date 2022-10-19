import multer from "multer";
import Posts from "../models/post.js"

export const getPosts = async (req, res) => {
    try {
        const posts = await Posts.find();
        posts.reverse();
        res.status(200).json(posts);
    } catch (error) {
        res.status(404).json({ message: error.message})
    }
}

export const createPost = async (req, res) => {
    const url = req.protocol + '://' + req.get('host');

    const newPost = new Posts({
        creator: req.userId,
        name:req.body.name,
        message: req.body.message,
        selectedFile: req.file == null ? '' : url + '/public/' + req.file.filename,
        tags: req.body.tags,
        createdAt: new Date().toISOString()
    });

    try {
        await newPost.save();
        res.status(201).json(newPost);
    } catch(error) {
        if(error instanceof multer.MulterError)
            console.log('multer error')
        res.status(404).json({ message: error.message});
    }
}

export const updatePost = async (req, res) => {
    const url = req.protocol + '://' + req.get('host');
    const post = Posts.findOne({_id: req.params.postId})
    const updatedPost = {
        message: req.body.message,
        tags: req.body.tags,
        selectedFile: req.file == null ? post.selectedFile : url + '/public/' + req.file.filename,
    };

    try {
        const updated = await Posts.findByIdAndUpdate({_id: req.params.postId}, updatedPost, { new: true});
        res.status(200).json(updated);
    } catch (err) {
        res.status(404).json(err);
    }   
}

export const deletePost = async (req, res) => {
        await Posts.findByIdAndDelete({_id: req.params.postId}).then(
            (success) =>  res.status(200).json('deleted successfully'),
            (err) => res.status(404).json('no post with that id found')
        );
}

export const deleteAllPosts = async (req, res) => {
    try {
        await Posts.deleteMany({});
        res.status(200).json('done')
    } catch (error) {
        res.status(404).json({ message: error.message});
    }
}


export const likePost = async (req, res) => {

        if(!req.userId) return res.json({message: 'Unauthenticated'})
        
        const { postId } = req.params;
        const post = await Posts.findById(postId);

        if(!post) return res.status(404).json('No post with given id exists.');

        const index = post.likes.findIndex((id) => id ===String(req.userId));

        if (index === -1) {
          post.likes.push(req.userId);
        } else {
          post.likes = post.likes.filter((id) => id !== String(req.userId));
        }
        
        const up = await Posts.findByIdAndUpdate(postId, post, { new: true });
        res.status(200).json(up);
}


