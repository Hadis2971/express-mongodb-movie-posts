const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const postsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    postImage: {
        type: String
    },
    rating: {
        type: String
    },
    userId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Post = module.exports = mongoose.model("Post", postsSchema);