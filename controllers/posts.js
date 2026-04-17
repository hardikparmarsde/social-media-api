import multer from "multer";
import Posts from "../models/post.js"

const parseTags = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        // allow comma-separated fallback
        return trimmed.split(',').map((t) => t.trim()).filter(Boolean);
    }
};

export const getPosts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '6', 10)));
        const skip = (page - 1) * limit;

        const totalItems = await Posts.countDocuments({});
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));

        const posts = await Posts.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            data: posts,
            currentPage: page,
            totalPages,
            totalItems,
        });
    } catch (error) {
        res.status(404).json({ message: error.message})
    }
}

export const searchPosts = async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        const tag = String(req.query.tag || '').trim();

        if (!q && !tag) {
            return res.status(200).json([]);
        }

        const filter = {};

        if (q) {
            const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ message: rx }, { name: rx }];
        }

        if (tag) {
            filter.tags = tag;
        }

        const posts = await Posts.find(filter).sort({ createdAt: -1 }).limit(60);
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTrendingPosts = async (req, res) => {
    try {
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '30', 10)));
        const windowHours = Math.min(720, Math.max(1, parseInt(req.query.windowHours || '72', 10)));

        const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

        const posts = await Posts.find({ createdAt: { $gte: since } });

        const scored = posts
            .map((p) => {
                const likes = Array.isArray(p.likes) ? p.likes.length : 0;
                const comments = Array.isArray(p.comments) ? p.comments.length : 0;
                const ageHours = Math.max(1, (Date.now() - new Date(p.createdAt).getTime()) / 36e5);
                const score = (likes * 2 + comments * 3) / Math.pow(ageHours, 0.9);
                return { p, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((x) => x.p);

        res.status(200).json(scored);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createPost = async (req, res) => {
    const newPost = new Posts({
        creator: req.userId,
        name:req.body.name,
        message: req.body.message,
        // Store a relative path so we never persist an incorrect host (e.g. localhost behind proxies).
        selectedFile: req.file == null ? '' : `/public/${req.file.filename}`,
        tags: parseTags(req.body.tags),
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
    const existing = await Posts.findById(req.params.postId);
    if (!existing) return res.status(404).json('No post with given id exists.');

    const updatedPost = {
        message: req.body.message,
        tags: parseTags(req.body.tags),
        selectedFile: req.file == null ? existing.selectedFile : `/public/${req.file.filename}`,
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

export const addComment = async (req, res) => {
    try {
        if (!req.userId) return res.status(401).json({ message: 'Unauthenticated' });

        const { postId } = req.params;
        const text = String(req.body?.text || '').trim();
        const name = String(req.body?.name || '').trim();
        const parentIdRaw = req.body?.parentId;
        const parentId = parentIdRaw === null || parentIdRaw === undefined || parentIdRaw === '' ? null : String(parentIdRaw);

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Posts.findById(postId);
        if (!post) return res.status(404).json({ message: 'No post with given id exists.' });

        if (parentId) {
            const parentExists = post.comments?.some((c) => String(c._id) === parentId);
            if (!parentExists) return res.status(400).json({ message: 'Parent comment not found' });
        }

        post.comments.push({
            userId: String(req.userId),
            parentId,
            name,
            text,
            createdAt: new Date(),
        });

        const updated = await Posts.findByIdAndUpdate(postId, post, { new: true });
        res.status(201).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        if (!req.userId) return res.status(401).json({ message: 'Unauthenticated' });

        const { postId, commentId } = req.params;
        const post = await Posts.findById(postId);
        if (!post) return res.status(404).json({ message: 'No post with given id exists.' });

        const comment = post.comments?.find((c) => String(c._id) === String(commentId));
        if (!comment) return res.status(404).json({ message: 'No comment with given id exists.' });

        const isPostOwner = String(post.creator) === String(req.userId);
        const isCommentOwner = String(comment.userId) === String(req.userId);
        if (!isPostOwner && !isCommentOwner) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Cascade delete: remove the target comment and all its descendants
        const toDelete = new Set([String(commentId)]);
        let changed = true;
        while (changed) {
            changed = false;
            for (const c of post.comments || []) {
                const pid = c.parentId === null || c.parentId === undefined ? null : String(c.parentId);
                if (pid && toDelete.has(pid) && !toDelete.has(String(c._id))) {
                    toDelete.add(String(c._id));
                    changed = true;
                }
            }
        }

        post.comments = (post.comments || []).filter((c) => !toDelete.has(String(c._id)));
        const updated = await Posts.findByIdAndUpdate(postId, post, { new: true });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


