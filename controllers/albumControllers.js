const sharp = require('sharp');
const { Album } = require('../models/Albums');
const { handleMultipleImages } = require('../utils/handleImageUpload');
const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/AppError')


exports.getAll = catchAsync(async (req, res ,next)=>{
    const albums = await Album.find({owner: req.user._id}).populate('owner');
    res.status(200).send({
        status: 'Success',
        length: albums.length,
        data: {
            albums
        }
    })
});

exports.getAlbum = catchAsync(async (req, res ,next)=>{
    const album = await Album.findById(req.params.id);
    if(album){
        res.status(200).send({
            status: 'Success',
            data: {
                album
            }
        })
    }else{
        res.status(400).send({
            status: 'Fail',
            message: 'This album is not exist or has been removed'
        })
    }
});


// Get albums when current user want to see the album of other user

exports.getAlbums = catchAsync(async (req, res ,next)=>{
    const { userId } = req.params
    const albums = await Album.find({owner: userId}).populate('owner');
    res.status(200).send({
        status: 'Success',
        length: albums.length,
        data: {
            albums
        }
    })
});

// Handle Multiple Image ( create Albums )
exports.handleImageAlbums = catchAsync(async (req, res, next)=>{
    try{
        await handleMultipleImages(req, res);
        next()
    }catch(e){
        return next(new AppError('Error when proccessing albums', 400))
    }
})

exports.resizeMultipleImage = catchAsync(async(req, res, next)=>{
    if(req.files && req.body.name){
        req.body.albums = []; // for saving into db
        await Promise.all(
            req.files.albums.map(async (img , index)=>{
                const imageFileName = `albums-${req.body.name}-img-${index}-${Date.now()}`;
                await sharp(img.buffer)
                            .resize(800, 600)
                            .toFormat('jpeg')
                            .jpeg({quality: 90})
                            .toFile(`public/img/albums/${imageFileName}.jpeg`);
            
        req.body.albums.push(`img/albums/${imageFileName}.jpeg`);
        }))
        next();
    }else{
        return next(new AppError('Missing required field', 400));
    }
})

exports.createAlbum = catchAsync(async( req, res, next)=>{
    const album = await Album.create({
        name: req.body.name,
        images: req.body.albums,
        owner: req.user._id
    })
    res.status(200).send({
        status: 'Success',
        data: {
            message: 'Create album successfully',
            album
        }
    })
})

exports.updateAlbum = catchAsync(async (req, res, next)=>{
    // this route only using for update the album's name
    const { id } = req.params;
    const { name } = req.body;
    // find album;
    const album = await Album.findOne({_id: id, owner: req.user._id});
    if(album){
        if(name){
            album.name = name;
            await album.save();
            res.status(200).send({
                status: 'Success',
                message: 'Update the name of album successfully'
            })
        }else{
            return next(new AppError('Missing required field', 400))
        }
    }else{
        return next(new AppError('Could not find the album', 400))
    }
})

exports.deleteAlbum = catchAsync(async(req, res, next)=>{
    const { id } = req.params;
    if(id){
        const deleted = await Album.deleteOne({_id: id, owner: req.user._id});
        console.log(deleted);
        if(deleted.deletedCount === 1){
            res.status(200).send({
                status: 'Success',
                message: 'Album has been removed successfully'
            })
        }else{
            return next(new AppError('Could not delete or you are not own this post', 400))
        }
    }else{
        return next(new AppError('Missing required field', 400))
    }
    
})

exports.addImages = catchAsync(async (req, res, next)=>{
    const { albums } = req.body;
    const { id } = req.params;
    await Album.addImageToAlbum(id, albums, req.user._id);
    res.status(200).send({
        status: 'Success',
        message: 'Adding new images successfully'
    })

})

exports.removeMultipleImage = catchAsync(async(req, res, next)=>{
    const { listImages } = req.body;
    console.log(listImages)
    // find the album
    const album = await Album.findOne({_id: req.params.id, owner: req.user._id});
    if(album){
        try{
            const isDeleteSuccess = await album.deleteMultiple(listImages);
            if(isDeleteSuccess){
                res.status(200).send({
                    status: 'Success',
                    message: 'Delete successfully'
                })
            }else{
                res.status(500).send({
                    status: 'Fail',
                    message: 'Something went wrong :('
                })
            }
        }catch(e){
            return next(new AppError('Error when deleting', 500));
        }
        
    }else{
        return next(new AppError('Could not find album', 400))
    }
})