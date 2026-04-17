import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
    {
        userId: { type: String, required: true },
        parentId: { type: String, default: null },
        name: { type: String, default: '' },
        text: { type: String, required: true, trim: true, maxlength: 500 },
        createdAt: { type: Date, default: new Date() },
    },
    { _id: true }
);

const postSchema = mongoose.Schema({
    creator: {
        type: String
    },
    message: {
        type: String,
    },
    name: {
        type: String
    },
    tags: {
        type: [String],
    },
    selectedFile: {
        type: String
    },
    likes: { 
        type: [String],
        default: []
    },
    comments: {
        type: [commentSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
})


export default mongoose.model('posts', postSchema);
;
