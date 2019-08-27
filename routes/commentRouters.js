const commentRouters = require('express').Router({ mergeParams: true }); // because we used nested route in postRouter
const authControllers = require('../controllers/authControllers');
const commentControllers = require('../controllers/commentControllers');

commentRouters
    .route('/')
    .get()
    .post(authControllers.protect, commentControllers.createComment);

commentRouters
    .route('/:id')
    .get(commentControllers.getComment)
    .patch(authControllers.protect, commentControllers.updateComment)
    .delete(authControllers.protect, commentControllers.deleteComment)

module.exports = { commentRouters };