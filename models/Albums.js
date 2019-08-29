const mongoose = require('mongoose');


const albumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the name of your album'],
        unique: true
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

albumSchema.statics.addImageToAlbum = async function(albumName, listImages, owner){
    const Album = this;
    const album = await Album.findOne({name: albumName});
    if(album){
        album.images = album.images.concat(listImages);
        await album.save();
    }else{
        throw new Error('Could not find current Album');
    }
}

albumSchema.methods.deleteMultiple = async function(listImage){
    const album = this;
    try{
        await album.updateOne({$pull: {images: {$in: listImage}}});
        return true;
    }catch(e){
        console.log(e.message)
        throw new Error('Could not delete');
    }
    
}

const Album = mongoose.model('Album', albumSchema);

module.exports = { Album };