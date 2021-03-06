const userRouter = require('express').Router();
const authController = require('../controllers/authControllers');
const userControllers = require('../controllers/userControllers');

userRouter.post('/signin', authController.signIn)
userRouter.post('/signup', authController.signUp);

userRouter.get('/signout', authController.protect, authController.signOut);


userRouter.post('/forgot-password', authController.forgotPassword)
userRouter.patch('/reset-password/:token', authController.resetPassword);
// after this point , user must be logged in to continous
userRouter.use(authController.protect);

userRouter.patch('/change-password', authController.protect, authController.updatePassword)


userRouter.get('/request-update-email', userControllers.requireUpdateEmail);
userRouter.patch('/update-email', userControllers.updateEmail);

userRouter
    .route('/me')
    .get(userControllers.getUser)
    .patch(userControllers.updateUser)

userRouter.post('/upload-avatar', 
        authController.protect,
        userControllers.handleAvatar,
        userControllers.resizeUserAvatar,
        userControllers.uploadAvatar
        )
userRouter.get('/:id/list-friend/', userControllers.getFriends)

module.exports = { userRouter };