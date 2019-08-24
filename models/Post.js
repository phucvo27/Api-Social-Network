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
    ]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
// if the post have no comment , comments field will be null in our result
postSchemas.virtual('comments', {
    ref: 'Comment',
    foreignField: 'post',
    localField: '_id'
})

const Post = mongoose.model('Post', postSchemas);

module.exports = { Post };