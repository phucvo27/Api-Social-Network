const postRouter = require('express').Router();
const postControllers = require('../controllers/postControllers');
const authControllers = require('../controllers/authControllers');

postRouter
    .route('/')
    .get(authControllers.protect, postControllers.getAll)
    .post(authControllers.protect,postControllers.createPost)
    .patch(authControllers.protect, postControllers.updatePost);

postRouter
    .route('/:id')
    .get(postControllers.getPost)
    .delete(postControllers.deletePost);

module.exports = { postRouter };
