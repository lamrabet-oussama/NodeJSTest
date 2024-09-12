const express=require('express');
const reviewControllers=require('./../controllers/reviewControllers');
const authenControllers=require('./../controllers/authenControllers');
const router=express.Router({mergeParams:true});

router.use(authenControllers.protect);

router.route('/').get(reviewControllers.getAllReviews).post(authenControllers.restrictTo('user'),reviewControllers.setToursAndUsersID,reviewControllers.createReview);

router.route('/:id').get(reviewControllers.getReview).delete(authenControllers.restrictTo('user','admin'), reviewControllers.deleteReview).patch(authenControllers.protect,authenControllers.restrictTo('user','admin'), reviewControllers.updateReview);

module.exports=router;