const mongoose = require('mongoose');

const postSchemas = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Please provide the content for your status'],
        minlength: 1,
    },
    owner : {
        required: true,
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    like: [
        {
            type:  mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }
    ],
    comments: [
        {
            type:  mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
            default: []
        }
    ]
}, {
    timestamps: true
})


const Post = mongoose.model('Post', postSchemas);

module.exports = { Post };