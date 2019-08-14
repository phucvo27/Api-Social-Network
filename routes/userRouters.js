const userRouter = require('express').Router();
const authController = require('../controllers/authControllers');

userRouter.post('/signin', authController.signIn)
userRouter.post('/signup', authController.signUp);
userRouter.patch('/change-password', authController.protect, authController.updatePassword)


module.exports = { userRouter };