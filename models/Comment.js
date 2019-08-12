const mongoose = require('mongoose');

const commentSchemas = new mongoose.Schema({
    content: {
        type: String

    },
    owner: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    post: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchemas);

module.exports = { Comment }