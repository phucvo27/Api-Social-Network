const mongoose = require('mongoose');


const messageSchemas = new mongoose.Schema({
    chatID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    text: {
        type: String,
        required: [true, 'Message can not be empty']
    },
    image: {
        type: String,
        default: null
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    to : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// messageSchemas.pre(/^find/, function(next){
//     console.log('in pre find of message')
//     const message = this;
//     message
//         .populate({
//             path: 'from',
//             select: '_id username'
//         })
//         .populate({
//             path: 'to',
//             select: '_id username'
//         })
//     next()
// })

const Message = mongoose.model('Message', messageSchemas);

module.exports = { Message }
