const utils = require('util');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/AppError')

const verifyToken = utils.promisify(jwt.verify)

const sendTokenResponse = async (user , statusCode, res)=>{

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
}

exports.protect = catchAsync( async (req, res, next)=>{
    // get token from cookies
    const token = req.cookies.jwt;
    if(token){
        try{
            const decoded = verifyToken(token, process.env.SECRET_KEY);
            const user = await User.findById(decoded._id);
            if(user){
                const isValid = await user.isTokenStillValid(decoded.iat);

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
    const user = req.user;
    const { password, passwordConfirm } = req.body;

    user.password = password;
    user.passwordConfirm = passwordConfirm;
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
//module.exports = { signUp,signIn }