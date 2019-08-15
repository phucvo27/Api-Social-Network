const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchemas = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provive your user name'],
        unique: true
    },
    email: {
        type: String,
        validate: {
            validator: function(val){
                return validator.isEmail(val)
            },
            message: 'Your email is invalid'
        },
        required: [true, 'Please provide your email']
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 8,
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (val){
                return val === this.password
            },
            message: 'Make sure your confirm is same as your password '
        },
        required: [true, 'Please confirm your password']
    },
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
    },
    avatar: {
        type: String,
        default: ''
    },
    tokens: [
        {
            token: String
        }
    ],
    chats: [
        {
            user:  mongoose.Schema.Types.ObjectId,
            messages: {
                type: [
                    {
                        from:  mongoose.Schema.Types.ObjectId,
                        body: String,
                        createdAt: Date
                    }
                ],
                default: [],
            }
        }
    ],
    passwordChangedAt: {
        type: Date,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetTokenExpire: {
        type: Date,
        default: null
    }
});

// hash password before saving

userSchemas.pre('save', async function(next){
    const user = this;

    if(!user.isModified('password')){
        return next();
    }
    // hash password 
    user.password = await bcrypt.hash(user.password, 12);
    //user.passwordConfirm = undefined;
    next();
})

// Find credential of user

userSchemas.statics.findByCredential = async function(email, password){
    const User = this;

    // Find the user based on email
    const user = await User.findOne({email});
    // User.findOne({email}).select("+password")
    if(user){
        // Checking password
        const isPasswordCorrectly = await bcrypt.compare(password, user.password);
        if(isPasswordCorrectly){
            return user;
        }else{
            throw new Error('Your password is invalid')
        }
    }else{
        // will be handle by catchAsync
        throw new Error('Your email is invalid')
    }
}

//  Instance Method

userSchemas.methods.generateToken = async function(){
    const user = this;

    try{
        // token will be expires in 12 hours
        const token =  jwt.sign({
            _id: user._id
        }, process.env.SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        user.tokens.push({ token });
        await user.save({ validateBeforeSave: false});
        return token;
    }catch(e){
        throw new Error(e.message)
    }
    
}

userSchemas.methods.removeToken = async function(token){
    try{
        const user = this;
        user.tokens = await user.tokens.filter(item => item.token !== token);
        user.save({ validateBeforeSave: false});
        return;
    }catch(e){
        throw new Error('Could not remove token !!')
    }

}

userSchemas.methods.isTokenStillValid = function(timeOfToken, currentToken){
    const user = this;
    if(user.passwordChangedAt){
        const changedTime = parseInt(user.passwordChangedAt.getTime() / 1000); // timeOfToken is second -> need to convert passwordChangedAt to second
        const isStillExistInDB = user.tokens.find(token => token.token === currentToken);
        console.log(isStillExistInDB)
        return timeOfToken > changedTime && isStillExistInDB;
        // that's mean :  token is generated after the password changed
    }else{
        // User does not change password before
        return true;
    }
}

userSchemas.methods.generatePasswordToken = async function(){
    const user = this;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpire = Date.now() + 10*60*1000; // expire in 10 minute;
    await user.save({ validateBeforeSave: false});

    return resetToken;
}



// remove password when send back to client
userSchemas.methods.toJSON = function(){
    const user = this.toObject();
    
    delete user.password;
    delete user.role;
    delete user.chats;

    return user;
}

const User = mongoose.model('User', userSchemas);

module.exports = { User };