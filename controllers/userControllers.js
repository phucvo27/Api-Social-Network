const multer = require('multer');
const sharp = require('sharp');
const { User } = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError');
const { sendEmail } = require('../utils/sendEmail')
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

exports.requireUpdateEmail = catchAsync(async (req, res, next)=>{
        
    const currentUser = await User.findById(req.user._id);
    try{
        const secretCode = await currentUser.generateSecretCode();
        const message = `Your secret code for update email ${secretCode}. If not you , please ignore this email . This code will be expired in 10 minutes and your Account is safed`;
        const isSent = await sendEmail(currentUser.email, 'Secret Code for update email', message);
        if(isSent){
            res.status(200).send({
                status: 'Success',
                message: 'Generate Secret Code Success'
            })
        }else{
            return next(new AppError('Could not send Email', 500))
        }
    }catch(e){
        return next(new AppError(e.message, 400))
    }
})

exports.updateEmail = catchAsync(async (req, res, next)=>{
    const { email , secretCode } = req.body;
    if(email && secretCode){
        // Get current User
        const currentUser = await User.findById(req.user._id);
        if(currentUser){
            const isValid = currentUser.isSecretCodeValid(secretCode);
            if(isValid){
                currentUser.email = email;
                currentUser.secretCode = null;
                currentUser.secretCodeExpire = null;
                currentUser.tokens = []; // remove all token

                await currentUser.save({ validateBeforeSave: false });
                // make user log out

                res.cookie('jwt', 'logout');
                res.status(200).send({
                    status: 'Success',
                    message: 'Update Email Successfully'
                })
            }else{
                return next(new AppError('Your Secret Code is invalid', 400))
            }
        }else{
            return next(new AppError('Could not find user'))
        }
    }else{
        return next(new AppError('Missing required field', 400))
    }
})