const multer = require('multer');
const sharp = require('sharp');
const { User } = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file ,cb)=>{
    // only accept image file
    if(file.mimetype.startsWith('image/')){
        
        cb(null, true);
    }else{
        cb(new AppError('This is not image, please upload image', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.getUser = catchAsync(async(req, res, next)=>{
    // 1. get current user base on _id
    const currentUser = await User.findById(req.user._id);
    if(currentUser){
        res.status(200).send({
            status: 'Success',
            data: {
                currentUser
            }
        })
    }else{
        return next(new AppError('Could not find user', 400));
    }
})

exports.handleAvatar = upload.single('avatar');

exports.resizeUserAvatar = catchAsync(async (req, res, next)=>{
    if(req.file){
        req.file.filename = `user-${req.user._id}-${Date.now()}`;
        await sharp(req.file.buffer)
                .resize(300, 300)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/users/${req.file.filename}.jpeg`);
        next();
    }else{
        return next();
    }
})
exports.uploadAvatar = catchAsync(async(req, res, next)=>{
    req.user.avatar = `img/users/${req.file.filename}.jpeg`;
    await req.user.save({ validateBeforeSave: false });
    res.status(200).send({
        status: 'Success',
        message: 'Upload Avatar successfully'
    })
})
exports.updateUser = catchAsync(async (req, res, next)=>{
    // Only update username
    const { username } = req.body;
    if(username){
        // Find current user
        const currentUser = await User.findById(req.user._id);
        if(currentUser){
            currentUser.username = username;
            await currentUser.save({
                validateBeforeSave: false
            });
            res.status(200).send({
                status: 'Success',
                message: 'Update successfully'
            })
        }else{
            return next(new AppError('User is not exist', 400));
        }
    }else{
        return next(new AppError('Missing required field', 400))
    }
})
