const { Comment } = require('../models/Comment');
const { Post } = require('../models/Post');
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
});

exports.getComment = catchAsync(async (req,res,next)=>{
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if(comment){
        res.status(200).send({
            status: 'Fail',
            data: {
                comment
            }
        })
    }else{
        res.status(400).send({
            status: 'Fail',
            message: 'Could not find that comment'
        })
    }
})

exports.createComment = catchAsync(async (req, res, next)=>{
    if(!req.body.postId) req.body.postId = req.params.postId;
    if(!req.body.owner) req.body.owner = req.user._id;
    
    const post = await Post.findById(req.body.postId);
    if(post){
        const comment = await Comment.create({
            owner: req.body.owner,
            content: req.body.content,
            post: req.body.postId
        }); // we can use like this , if property that doesnt be used by schemas will be ignored
    
        res.status(200).send({
            status: 'Success',
            data: {
                comment
            }
        })
    }else{
        return next(new AppError('This post doesnt exist', 404))
    }
    
})

exports.updateComment = catchAsync(async (req, res, next)=>{
    const { content } = req.body;
    if(!content || !req.params.id){
        return next( new AppError('Missing required field', 400))
    }else{
        console.log(req.user._id)
        const comment = await Comment.findOne({_id: req.params.id, owner: req.user._id});
        if(comment){
            comment.content = content;
            await comment.save();
            res.status(200).send({
                status: 'Success',
                message: 'Update successfully'
            })
        }else{
            return next( new AppError('Could not find your comment or you not own this comment', 400))
        }
    }
})

exports.deleteComment = catchAsync(async (req, res, next)=>{
    const { id } = req.params;

    if(id){
        await Comment.findOneAndDelete({_id: id, owner: req.user._id});
        res.status(200).send({
            status: 'Success',
            message: 'Delete comment successfully'
        })
    }else{
        return next( new AppError('Missing require field', 400))
    }
})