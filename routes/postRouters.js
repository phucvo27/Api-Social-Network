const postRouter = require('express').Router();
const postControllers = require('../controllers/postControllers');
const authControllers = require('../controllers/authControllers');
const { commentRouters } = require('../routes/commentRouters');
const { likeRouters } = require('./likeRouters');

// POST /posts/124gzbsais/comments <=> create a comment for this post
// postRouter
//     .route('/:postId/comments')
//     .post( authControllers.protect, commentControllers.createComment)

postRouter.use('/:postId/comments', commentRouters);
postRouter.use('/:postId/likes', likeRouters);

postRouter.use(authControllers.protect);
postRouter
    .route('/')
    .get(postControllers.getAll)
    .post(postControllers.handleImageInPost, postControllers.resizeImageInPost ,postControllers.createPost);

postRouter
    .route('/:id')
    .get(postControllers.getPost)
    .delete(postControllers.deletePost)
    .patch(postControllers.handleImageInPost, postControllers.resizeImageInPost ,postControllers.updatePost);

postRouter.get('/:id/list-liked', postControllers.getListLiked)

module.exports = { postRouter };
