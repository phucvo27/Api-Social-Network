const utils = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError')
const { sendEmail } = require('../utils/sendEmail');
const verifyToken = utils.promisify(jwt.verify)

const sendTokenResponse = async (user , statusCode, res)=>{

    try{
        const token = await user.generateToken();

        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 12*60*60*1000)
        }
        if(process.env.NODE_ENV === "production") cookieOptions.secure = true;
        res.cookie('jwt', token, cookieOptions);
        res.status(statusCode).send({
            status: 'Success',
            token,
            data: {
                user
                
            }
        })
    }catch(e){
        res.status(400).send({
            status: 'Fail',
            message: e.message
        })
    }
    
}

exports.protect = catchAsync( async (req, res, next)=>{
    // get token from cookies
    const token = req.cookies.jwt;
    if(token){
        try{
            const decoded = await verifyToken(token, process.env.SECRET_KEY);
            const user = await User.findById(decoded._id);
            //console.log(user)
            if(user){
                const isValid = await user.isTokenStillValid(decoded.iat, token);

                if(isValid){
                    req.user = user;
                    next();
                }else{
                    return next(new AppError('Your token is invalid', 400))
                }
            }else{
                return next(new AppError('Your id is not valid', 400))
            }
        }catch(e){
            return next(new AppError('Your token is not valid', 400))
        }
    }else{
        return next(new AppError('You are not sign in , please sign in', 400))
    }
})

exports.updatePassword = catchAsync(async ( req, res, next)=>{
    // because , user must logged in to changed password
    const user = await User.findById(req.user._id);
    const { password, passwordConfirm } = req.body;

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordChangedAt = new Date();
    await user.save();
    res.status(200).send({
        status: 'Success',
        message: 'Changed password successfully'
    })
})
exports.signUp = catchAsync(async (req, res, next)=>{
    const { username, email, password, passwordConfirm } = req.body;
    const user = await User.create({
        username,
        email,
        password,
        passwordConfirm
    })
    sendTokenResponse(user, 200, res)
})

exports.signIn = catchAsync(async (req, res, next)=>{
    const { email , password } = req.body;
    const user = await User.findByCredential(email, password);
    
    sendTokenResponse(user, 200, res)

})

exports.signOut = catchAsync(async(req, res, next)=>{
    const token = req.cookies.jwt;
    if(token){
        const user = await User.findById(req.user._id);
        await user.removeToken(token);
        res.cookie('jwt', 'logout');
        res.status(200).send({
            status: 'Success',
            message: 'Log Out successfully'
        })
    }else{
        return next(new AppError('Your Token is invalid', 400))
    }
})

exports.forgotPassword = catchAsync( async (req, res, next)=>{
    const { email } = req.body;

    // 1. find that email in database
    const user = await User.findOne({email});
    if(user){
        // create the password token and assign expired for that passwordToken
        const resetToken = await user.generatePasswordToken();
        console.log(resetToken)
        // send url with resetToken to user's email
        const urlResetPassword = `For updating the password , please go to : ${req.protocol}://${req.hostname}/api/user/reset-password/${resetToken}`
        const isSent = await sendEmail(email,'Reset Password', urlResetPassword)
        if(isSent){
            res.status(200).send({
                status: 'Success',
                message: 'Email has been sent, please check your email'
            })
        }else{
            res.status(400).send({
                status: 'Fail',
                message: 'Something went wrong ! Please try again later'
            })
        }

    }else{
        return next(new AppError('Your email is invalid', 400));
    }
})

exports.resetPassword = catchAsync(async (req, res, next)=>{
    // Get token from url
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
    // find user based on token
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ passwordResetToken });
    if(user){
        // check passwordResetToken is still valid
        if( user.passwordResetTokenExpire.getTime() > Date.now()){
            user.password = password;
            user.passwordConfirm = passwordConfirm;
            user.passwordChangedAt = new Date();
            user.passwordResetToken = null;
            user.passwordResetTokenExpire = null;
            await user.save();
            res.status(200).send({
                status: 'Success',
                message: 'Reset Password successfully'
            })
        }else{
            res.status(400).send({
                status: 'Fail',
                message: 'Your token is expired'
            })
        }
    }else{
        res.status(400).send({
            status: 'Fail',
            message: 'Your token is not valid'
        })
    }
})
//module.exports = { signUp,signIn }