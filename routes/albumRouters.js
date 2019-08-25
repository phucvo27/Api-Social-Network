const albumRouter = require('express').Router();
const authControllers = require('../controllers/authControllers');
const albumControllers = require('../controllers/albumControllers');

albumRouter
    .route('/')
    .post(
        authControllers.protect, 
        albumControllers.handleImageAlbums,
        albumControllers.resizeMultipleImage,
        albumControllers.createAlbum);


module.exports = { albumRouter }