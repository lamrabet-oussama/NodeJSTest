const User=require('./../models/userModel');
const catchAsync=require('../utils/catchAsync');
const handlerFactory=require('./../controllers/handlerFactory');

const AppError = require('../utils/appError');

const filterObjcet=(obj,...allowFields)=>{
    let newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowFields.includes(el)){
            newObj[el]=obj[el];
        }
    })
    return newObj;
}

exports.deleteMe=catchAsync(
    async (req,res,next)=>{
        await User.findById(req.user.id,{activate:false})
        res.status(204).json({
            status:'success',
            data:null
        })
    }
)

exports.updateMe=catchAsync(
    async (req,res,next)=>{
        if(req.body.password,req.body.confirmPassword){
            return next(new AppError('You cannot update password on this route.Use /updatePassword'))
        }
        //if(!user) return next(new AppError('This user does not exist',404));
        user.name=req.body.name;
        user.email=req.body.email;
        //user.photo=req.body.photo;
        const data=filterObjcet(req.body,'name','email')
        const user=await User.findByIdAndUpdate(req.user.id,data,{
            new:true,
            runValidators:true
        });
        res.status(200).json({
            status:'success',
            user
        })

    }
)

exports.getAllUsers=handlerFactory.getAll(User);
exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next();
}
exports.getUser=handlerFactory.getOne(User);

 exports.createUser=(req,res)=>{
    res.status(500).json({
        status:"ERROR",
        message:"This route is not  defined Please use /signup instead!"
    })
}


 exports.deleteUser=handlerFactory.deleteOne(User);
 //Don't update data with this
 exports.updateUser=handlerFactory.updateOne(User);
