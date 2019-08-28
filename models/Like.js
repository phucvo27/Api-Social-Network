const mongoose = require('mongoose');

const likeSchemas = new mongoose.Schema({
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
});

likeSchemas.pre(/^find/, function(next){
    this.populate({
        path: 'owner',
        select: '_id username avatar'
    })
    next();
})

const Like = mongoose.model('Like', likeSchemas);

module.exports = { Like };