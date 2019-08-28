const { Like } = require('../models/Like');
const { Post } = require('../models/Post');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');


exports.dislike = (req, res ,next)=>{
    req.dislike = true;
    next();
}

exports.handleLike = catchAsync(async (req,res,next)=>{
    const { postId } = req.params;

    if(postId && req.user._id){
        // find the post
        const post = await Post.findById(postId);
        if(post){
            if(req.dislike){
                await Like.findOneAndDelete({owner: req.user._id, post: postId});
                // descre the like property of this post
                post.like = post.like - 1 ;
            }else{
                await Like.create({
                    owner: req.user._id,
                    post: postId
                });
                // incre the like property of this post
                post.like = post.like + 1;
            }
            // save post
            await post.save({ validateBeforeSave: false });
            res.status(200).send({
                status: 'Success',
                message: `${req.dislike ? 'dislike' : 'like'} successfully`
            })
        }else{
            return next(new AppError('Your post doesnt exist', 404));
        }
    }else{
        return next(new AppError('Missing required field', 400));
    }
})
