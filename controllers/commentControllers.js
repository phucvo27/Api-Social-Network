const { Comment } = require('../models/Comment');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');
// Get all comment of specific Post
exports.getAllComments = catchAsync(async (req, res, next)=>{
    if(!req.body.postId) req.body.postId = req.params.postId;

    const comments = await Comment.find({ post: req.body.postId});
    res.status(200).send({
        status: 'Success',
        data: {
            comments
        }
    })
})

exports.createComment = catchAsync(async (req, res, next)=>{
    if(!req.body.postId) req.body.postId = req.params.postId;
    if(!req.body.owner) req.body.owner = req.user._id;
    
    const comment = await Comment.create(req.body); // we can use like this , if property that doesnt be used by schemas will be ignored

    res.status(200).send({
        status: 'Success',
        data: {
            comment
        }
    })
})

exports.updateComment = catchAsync(async (req, res, next)=>{
    const { content , id} = req.body;

    if(!content || !id){
        return next( new AppError('Missing required field', 400))
    }else{
        const comment = await Comment.findById(id);
        if(comment){
            comment.content = content;
            await comment.save();
            res.status(200).send({
                status: 'Success',
                message: 'Update successfully'
            })
        }else{
            return next( new AppError('Could not find your comment', 400))
        }
    }
})

exports.deleteComment = catchAsync(async (req, res, next)=>{
    const { id } = req.params;

    if(id){
        await Comment.findByIdAndDelete(id);
        res.status(200).send({
            status: 'Success',
            message: 'Delete comment successfully'
        })
    }else{
        return next( new AppError('Missing require field', 400))
    }
})