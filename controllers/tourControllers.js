const fs=require('fs');
const Tour=require('./../models/tourModel');
const catchAsync=require('../utils/catchAsync');
const AppError = require('../utils/appError');
const handlerFactory=require('./../controllers/handlerFactory');
const APIFeatures=require('./../utils/apifeatures');

// const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));//top level

exports.aliasTopTours=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratinsgAverage,price';
    req.query.fields='name,price,ratingAverage,summary,difficulty';
    next();
}
exports.checkID=(req,res,next,val)=>{

//     console.log(`ID:${val}`);

//       if(req.params.id*1>tours.length) return res.status(404).json({
//     status:"failed",
//     data:{
//         message:"Invalid ID"
//     }
// })

next();
}



 exports.getAllTours=handlerFactory.getAll(Tour);


exports.getTourStatic=catchAsync(async (req,res,next)=>{
        const stats=await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    _id:'$difficulty',
                    numTous:{$sum:1},
                    numRating:{$sum:'$ratingsQuantity'},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'}
                }
            },
            {
                $sort:{avgPrice: 1}
            }
            // ,{
            //     $match: { _id: { $ne:'easy' } }
            // }
        ])
res.status(200).json({
        status:"succes",
        data:{
            stats
        }
    })
   
})

exports.getMonthlyTours= catchAsync(async (req,res,next)=>{
        const year=req.params.year*1;
        const stats=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{

                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
                
            }
            ,{
                $group:{
                    _id:{$month:'$startDates'},
                    numTours:{$sum:1},
                    tour:{$push:'$name'},
                }
            },
            {
                $addFields:{month:'$_id'}
            },
            {
                $project:{
                    _id:0
                }
            },{
                $sort: {numTours:-1}
            }
        ])
        res.status(200).json({
        status:"succes",
        data:{
            stats
        }
    })
   
})

 exports.getTour=handlerFactory.getOne(Tour,{path:'reviews'});


 exports.CreateTour=handlerFactory.createOne(Tour);

 exports.UpdateTour=handlerFactory.updateOne(Tour);

 exports.DeleteTour=handlerFactory.deleteOne(Tour);

 exports.getToursWithin=catchAsync(async (req,res,next)=>{
    const {distance,center,latlng,unit}=req.params;
   const [lat,lng] =latlng.split(',');
   const radius=unit==='mi' ? distance/3963.2 : distance/6378.1;
   if(!lat||!lng) next(new AppError('Please provide  lag,lng',400));
   console.log(distance,lat,lng);

   const tours=await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}})
   res.status(200).json({
    status:'success',
    results:tours.length,
    data:{
        tours
    }
   })
 })

 exports.getDistances=catchAsync(async (req,res,next)=>{
     const {latlng,unit}=req.params;
   const [lat,lng] =latlng.split(',');
   if(!lat||!lng) next(new AppError('Please provide  lag,lng',400));
   console.log(lat,lng);
   const multiplier= unit==='mi' ? 0.000621371:0.001 ;
   const distances=await Tour.aggregate([
    {
        $geoNear: { //It should be the firs in the pipeline !!!! ,only one field contains geospecial index :like tourSchema.index({startLocation:'2dsphere'}); the geoNear uses automatically this field for claculating but if you have multiple fields with geospecial indexex then you should use key parameters /:key
            near:{ //From
                type:'Point',
                coordinates:[lng*1,lat*1]
            },
            distanceField:'distance', //Where we store the calcutation
            distanceMultiplier:multiplier
        } ,
       

    },
     {
            $project:{
                distance:1,
                name:1
            }
        }
   ])
   res.status(200).json({
    status:'success',
    data:{
        distances
    }
   })
 })