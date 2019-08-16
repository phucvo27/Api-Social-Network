const mongoose = require('mongoose');

const commentSchemas = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment can not be empty']
    },
    owner: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to someone']
    },
    post: {
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Comment must belong to a post']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


commentSchemas.pre(/^find/, function(next){
    
    const comment = this;
    comment
        .populate({
            path: 'owner',
            select: 'name avatar'
        })
        .populate({
            path: 'post',
            select: '_id'
        })
    
    next();
})


const Comment = mongoose.model('Comment', commentSchemas);

module.exports = { Comment }