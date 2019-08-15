const userRouter = require('express').Router();
const authController = require('../controllers/authControllers');

userRouter.post('/signin', authController.signIn)
userRouter.post('/signup', authController.signUp);
userRouter.patch('/change-password', authController.protect, authController.updatePassword)

userRouter.post('/forgot-password', authController.forgotPassword)
userRouter.patch('/reset-password/:token', authController.resetPassword);

userRouter.get('/signout', authController.protect, authController.signOut);

module.exports = { userRouter };