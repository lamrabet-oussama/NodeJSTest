const Tour=require('./../models/tourModel');
const catchAsync=require('./../utils/catchAsync');


exports.getOverview=catchAsync(async (req,res)=>{
    //1)get tours Data from collection
    const tours=await Tour.find()
    //2) Build the template

    //3) Render that template
    res.status(200).render('overview',{
        title:'All Tours',
        tours:tours
    }); //Template
})

exports.getTour=catchAsync(async (req,res,next)=>{
    const tour=await Tour.findOne({slug:req.params.slug}).populate(({
        path:'reviews',
        fields:'review  rating user'
    }))

    res.status(200).render('tour',{
        title:tour.name,
        tour
    }); //Template
})

exports.getLoginForm=catchAsync(async (req,res)=>{
    res.status(200).render('login',{
        title:'Login Page'
    })

})