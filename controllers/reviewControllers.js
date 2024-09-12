const Review=require('./../models/reviewModel');
const catchAsync=require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handlerFactory=require('./../controllers/handlerFactory');

exports.setToursAndUsersID=(req,res,next)=>{
    
    if(!req.body.tour) req.body.tour=req.params.tourId
    if(!req.body.user) req.body.user=req.user.id;
    next();
}

exports.createReview=handlerFactory.createOne(Review);


exports.getAllReviews=handlerFactory.getAll(Review);

exports.getReview=handlerFactory.getOne(Review);

exports.deleteReview=handlerFactory.deleteOne(Review);
exports.updateReview=handlerFactory.updateOne(Review);