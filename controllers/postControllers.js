const sharp = require('sharp')
const { Post } = require('../models/Post');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');
const { handleImage } = require('../utils/handleImageUpload');

const handleImageWithPromise = handleImage('photo');

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
// Handle single image
exports.handleImageInPost = catchAsync(async (req, res, next)=>{
    // handleImage(req, res, function(err){
    //     if(err){
    //         return next(new AppError('Something went wrong when processing image', 400))
    //     }
    // })
    try{
        await handleImageWithPromise(req, res);
        next();
        
    }catch(e){
        return next(new AppError('Something went wrong when processing image', 400))
    }
})
exports.resizeImageInPost = catchAsync(async(req, res, next)=>{
    if(!req.file){
        return next();
    }
    req.file.filename = `post-${req.user._id}-${Date.now()}`;
    await sharp(req.file.buffer)
            .resize(800 ,600)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/posts/${req.file.filename}.jpeg`);
    next();
})
exports.getPost = catchAsync(async (req, res, next)=>{
    //console.log(req.params.id);
    const post = await Post.findById(req.params.id).populate('comments');
    sendResponse(post, 200, res);
})

exports.getListLiked = catchAsync(async(req, res, next)=>{
    const post = await Post.findById(req.params.id).populate('likes', {lean: true}).lean();
    sendResponse(post, 200, res);
})

exports.createPost = catchAsync(async (req, res, next)=>{
    const { content } = req.body;
    const image = req.file ? `img/posts/${req.file.filename}.jpeg` : null;
    if(!content && !req.file){
        res.status(400).send({
            status: 'Fail',
            message: 'The status can not be empty'
        })
    }else{
        const post = await Post.create({
            content,
            owner: req.user._id,
            image
        })
    
        sendResponse(post , 200, res);
    }
    
});

exports.updatePost = catchAsync(async (req, res, next)=>{
    const { content } = req.body;
    const image = req.file ? `img/posts/${req.file.filename}.jpeg` : null;
    if(!content || !req.params.id){
        return next(new AppError('Missing required field', 400));
    }else{
        const post = await Post.findOne({_id: req.params.id, owner: req.user._id});
        if(post){
            post.content = content;
            post.image = image;
            await post.save(); // because we want run all validate 
            res.status(200).send({
                status: 'Success',
                message: 'Update successfully'
            })
        }else{
            return next(new AppError('Could not find the post or you not own this post', 400))
        }
    }
});

exports.deletePost = catchAsync(async (req, res, next)=>{
    const { id } = req.params;
    //const post = await Post.findByIdAndDelete(id);
    const isSuccess = await Post.deleteOne({_id: id, owner: req.user._id});
    if(isSuccess.deletedCount === 1){
        res.status(200).send({
            status: 'Success',
            message: 'Delete successfully'
        })
    }else{
        return next(new AppError('Could not delete or you are not own this post', 400))
    }
})