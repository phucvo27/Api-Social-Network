const postRouter = require('express').Router();
const postControllers = require('../controllers/postControllers');
const authControllers = require('../controllers/authControllers');
const { commentRouters } = require('../routes/commentRouters');

// POST /posts/124gzbsais/comments <=> create a comment for this post
// postRouter
//     .route('/:postId/comments')
//     .post( authControllers.protect, commentControllers.createComment)

postRouter.use('/:postId/comments', commentRouters);

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
