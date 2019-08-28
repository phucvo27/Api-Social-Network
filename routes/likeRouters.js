const likeRouters = require('express').Router({mergeParams: true});
const likeControllers = require('../controllers/likeControllers');
const authControllers = require('../controllers/authControllers');

likeRouters.use(authControllers.protect);

likeRouters.get('/like', likeControllers.handleLike);

likeRouters.get('/dislike', likeControllers.dislike, likeControllers.handleLike);

module.exports = { likeRouters };