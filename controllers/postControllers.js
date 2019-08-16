const { Post } = require('../models/Post');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');


const sendResponse = (data, statusCode, res)=>{
    
    res.status(statusCode).send({
        status: statusCode === 200 ? 'Success': 'Fail',
        data: {
            data
        }
    })
}

exports.getAll = catchAsync( async(req, res, next)=>{
    const posts = await Post.find({owner: req.user._id}).sort({
        createdAt: -1
    });
    sendResponse(posts, 200, res);
})

exports.getPost = catchAsync(async (req, res, next)=>{
    //console.log(req.params.id);
    const post = await Post.findById(req.params.id).populate('comments');
    sendResponse(post, 200, res);
})


exports.createPost = catchAsync(async (req, res, next)=>{
    const { content } = req.body;
    const post = await Post.create({
        content,
        owner: req.user._id
    })

    sendResponse(post , 200, res);
});

exports.updatePost = catchAsync(async (req, res, next)=>{
    const { content, id } = req.body;
    if(!content || !id){
        return next(new AppError('Missing required field', 400));
    }else{
        const post = await Post.findById(id);
        if(post){
            post.content = content;
            await post.save(); // because we want run all validate 
            res.status(200).send({
                status: 'Success',
                message: 'Update successfully'
            })
        }else{
            return next(new AppError('Could not find the post', 400))
        }
    }
});

exports.deletePost = catchAsync(async (req, res, next)=>{
    const { id } = req.params;
    //const post = await Post.findByIdAndDelete(id);
    await Post.findByIdAndDelete(id);
    res.status(200).send({
        status: 'Success',
        message: 'Delete successfully'
    })
})