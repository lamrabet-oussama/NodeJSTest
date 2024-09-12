const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const APIFeatures=require('./../utils/apifeatures');



exports.deleteOne=Model=>catchAsync(async (req,res,next)=>{
   
    const doc=await Model.findByIdAndDelete(req.params.id);
     if(!doc){
        return next(new AppError('No document found with this ID!',404));
    }
     res.status(204).json({
        status:"succes",
        data:null
    })
   
})

exports.updateOne=Model=>catchAsync( async (req,res,next)=>{

const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
    new:true, //return the new document
    runValidators:true
});
 if(!doc){
        return next(new AppError('Cannot find this document',404));
    }
    res.status(200).json({
        status:"succes",
        data:doc
    })

})

exports.createOne=Model=>catchAsync(async (req,res,next)=>{
 
const doc=await  Model.create(req.body);
res.status(201).json({
    status:'succes',
    data:doc
        
    
})

});

exports.getOne=(Model,populateOptions)=>catchAsync(async (req,res,next)=>{
    let query= Model.findById(req.params.id);

    if(populateOptions) query=query.populate(populateOptions);

    const doc = await query;

    if(!doc){
        return next(new AppError('Cannot find this document',404));
    }
        res.status(200).json({
            status:'succes',
            data:{
                doc
            }
        })
   
    
});
exports.getAll=Model=>catchAsync( async (req,res,next)=>{
   
//     console.log(req.params);

//    const id=req.params.id*1;//convertition auto

//     const tour=tours.find(el=>{return el.id===id});
// //     if(!tour) return res.status(404).json({
// //     status:"failed",
// //     data:{
// //         message:"Invalid ID"
// //     }
// // })

// const queryObj={...req.query};
    
    // const excludedFields=['page','sort','limit','fields'];
    // excludedFields.forEach(el=>delete queryObj[el]);

    // let queryStr=JSON.stringify(queryObj);
    // queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`);

    // console.log(queryStr);
    // let query= Tour.find(JSON.parse(queryStr));

    // if(req.query.sort){
    //     const sortBy=req.query.sort.split(',').join(" ");
    //     query=query.sort(sortBy);
    // }else{
    //     query=query.sort('-createdAt')
    // }

    // if(req.query.fields){
    //     const fields=req.query.fields.split(',').join(' ');
    //     query=query.select(fields);
    // }else{
    // query=query.select('-__v');

    // }
    //Pagination
    // const page=req.query.page*1||1;
    // const limit=req.query.limit*1||100;
    // const skip=(page-1)*limit;
    // query=query.skip(skip).limit(limit);
    // if(req.query.page){
    //     const numTours=await Tour.countDocuments();
    //     if(skip>=numTours) throw new Error('This page does not exist!')
    // }
    //for nested routes in reviews
    let filter={};
        if(req.params.tourId) filter={tour:req.params.tourId};
    //Execute the query
    const features=new APIFeatures(Model.find(),req.query).filter().sort().limitFields().paginate();
    const docs=await features.query;
    //console.log(req.query,queryObj);
res.status(200).json({
        status:"succes",
        results:docs.length,
        data:{
            docs
        }
    })

    
});