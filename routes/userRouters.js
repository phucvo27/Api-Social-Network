const userRouter = require('express').Router();
const authController = require('../controllers/authControllers');

userRouter.post('/signin', authController.signIn)
userRouter.post('/signup', authController.signUp);



module.exports = { userRouter };