const albumRouter = require('express').Router();
const authControllers = require('../controllers/authControllers');
const albumControllers = require('../controllers/albumControllers');

albumRouter.use(authControllers.protect)
albumRouter
    .route('/')
    .get(albumControllers.getAll)
    .post(
        albumControllers.handleImageAlbums,
        albumControllers.resizeMultipleImage,
        albumControllers.createAlbum)
    
    
albumRouter.patch('/:id/add', 
        albumControllers.handleImageAlbums,
        albumControllers.resizeMultipleImage,
        albumControllers.addImages
        )
albumRouter.delete('/:id/delete', albumControllers.removeMultipleImage);


albumRouter.get('/:userId/albums', albumControllers.getAlbums)

albumRouter
    .route('/:id')
    .get(albumControllers.getAlbum)
    .patch(albumControllers.updateAlbum)
    .delete(albumControllers.deleteAlbum)


module.exports = { albumRouter }