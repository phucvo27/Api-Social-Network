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
        }
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
    user.passwordConfirm = undefined;
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

userSchemas.methods.generateToken = async function(){
    const user = this;

    // token will be expires in 12 hours
    const token =  jwt.sign({
        _id: user._id
    }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
    user.tokens.push({ token });
    await user.save();
    return token;
}

userSchemas.methods.isTokenStillValid = function(timeOfToken){
    const user = this;
    if(user.passwordChangedAt){
        const changedTime = parseInt(user.passwordChangedAt.getTime() / 1000); // timeOfToken is second -> need to convert passwordChangedAt to second
        return timeOfToken > changedTime;
        // that's mean :  token is generated after the password changed
    }else{
        // User does not change password before
        return true;
    }
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