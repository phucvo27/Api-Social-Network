const mongoose = require('mongoose');

const chatSchemas = new mongoose.Schema({
    room: String
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

chatSchemas.virtual('messages', {
    ref: 'Message',
    foreignField: 'chatID',
    localField: '_id'
})

const Chat = mongoose.model('Chat',chatSchemas);

module.exports = { Chat }