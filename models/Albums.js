const mongoose = require('mongoose');


const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the name of your album']
    },
    images: [
        {
            type: String,
            default: []
        }
    ],
    owner: {
        required: true,
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Album = mongoose.model('Album', albumSchema);

module.exports = { Album };