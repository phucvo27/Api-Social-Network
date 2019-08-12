const mongoose = require('mongoose');
const validator = require('validator');

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
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide your password'],
        minlength: 8,
        select: false
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
        type: String
    },
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
    ]
});

// remove password when send back to client
userSchemas.methods.toJSON = function(){
    const user = this.toObject();
    
    delete user.password;
    delete user.chats;

    return user;
}

const User = mongoose.model('User', userSchemas);

module.exports = { User };