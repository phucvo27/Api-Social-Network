const sharp = require('sharp');
const { Album } = require('../models/Albums');
const { handleMultipleImages } = require('../utils/handleImageUpload');
const { catchAsync } = require('../utils/catchAsync')
const { AppError } = require('../utils/AppError')

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
    if(req.files && req.body.albumName){
        req.body.albums = []; // for saving into db
        await Promise.all(
            req.files.albums.map(async (img , index)=>{
                const imageFileName = `albums-${req.body.albumName}-img-${index}-${Date.now()}`;
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
        name: req.body.albumName,
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