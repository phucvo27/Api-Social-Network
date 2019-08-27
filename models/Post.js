const mongoose = require('mongoose');
const { Comment } = require('./Comment');
const postSchemas = new mongoose.Schema({
    content: {
        type: String,
        minlength: 1,
    },
    image: {
        type: String,
        default: null
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

postSchemas.post('findOneAndDelete', async function(doc, next){
    await Comment.deleteMany({post: doc._id}); // remove all comment of this post
    next();
})

const Post = mongoose.model('Post', postSchemas);

module.exports = { Post };