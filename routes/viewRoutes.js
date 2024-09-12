const express=require('express');
const viewRoutes=express.Router();
const viewControllers=require('./../controllers/viewControllers');
const authenControllers=require('./../controllers/authenControllers');

//viewRoutes.use(authenControllers.isLoggedIn);

viewRoutes.get('/',viewControllers.getOverview)

viewRoutes.get('/tour/:slug',viewControllers.getTour)
viewRoutes.get('/login',viewControllers.getLoginForm);

module.exports=viewRoutes;