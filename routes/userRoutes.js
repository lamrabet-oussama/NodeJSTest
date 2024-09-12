
const express=require('express');
const userRoutes=express.Router();
const userControllers=require('./../controllers/userControllers');
const authenControllers=require('./../controllers/authenControllers');
const reviewControllers=require('./../controllers/reviewControllers');

userRoutes.post('/signup',authenControllers.signup);
userRoutes.post('/login',authenControllers.login);
//Protect all the routes after this point because middlewares are in sequence so that is a global middleware for this route
userRoutes.use(authenControllers.protect);

userRoutes.get('/me',userControllers.getMe,userControllers.getUser);
userRoutes.post('/forgotPassword',authenControllers.forgotPassword);
userRoutes.patch('/resetPassword/:token',authenControllers.resetPassword);
userRoutes.patch('/updatePassword',authenControllers.updatePassword);
userRoutes.patch('/updateMe',userControllers.updateMe);
userRoutes.patch('/deleteMe',userControllers.deleteMe);

userRoutes.use(authenControllers.restrictTo('admin'));

userRoutes.route('/').get(userControllers.getAllUsers).post(userControllers.createUser);
userRoutes.route('/:id').get(userControllers.getUser).patch(userControllers.updateUser).delete(userControllers.deleteUser);
module.exports=userRoutes;