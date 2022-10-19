import mongoose from "mongoose";

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
    createdAt: {
        type: Date,
        default: new Date()
    }
})


export default mongoose.model('posts', postSchema);
;
