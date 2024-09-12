const express=require('express');
const tourControllers=require('./../controllers/tourControllers');
const authenControllers=require('./../controllers/authenControllers');
const reviewRouter=require('./reviewRoutes');
const tourRoutes=express.Router();//vous pouvez définir un ensemble de routes dans un module séparé (par exemple, toursRoutes.js) et ensuite l'importer dans votre fichier principal (par exemple, app.js).

tourRoutes.route('/top-5-cheap').get(tourControllers.aliasTopTours,tourControllers.getAllTours);

tourRoutes.param('id',tourControllers.checkID);

tourRoutes.route('/tour-stats').get(tourControllers.getTourStatic);

tourRoutes.route('/monthly-tours/:year').get(authenControllers.protect,authenControllers.restrictTo('admin','lead-guide','guides') ,tourControllers.getMonthlyTours);

tourRoutes.route('/').get(tourControllers.getAllTours).post(authenControllers.protect,authenControllers.restrictTo('admin'),tourControllers.CreateTour);

tourRoutes.route('/:id').get(authenControllers.protect,authenControllers.restrictTo('admin','lead-guide') ,tourControllers.getTour).patch(authenControllers.protect,authenControllers.restrictTo('admin','lead-guide') ,tourControllers.UpdateTour).delete(authenControllers.protect,authenControllers.restrictTo('admin','lead-guide') , tourControllers.DeleteTour);

tourRoutes.use('/:tourId/reviews',reviewRouter); //Nested Route : the reviewRouter doesn't have access to the tourId so we should use the mergeParams in this route

tourRoutes.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourControllers.getToursWithin);

tourRoutes.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

module.exports=tourRoutes;