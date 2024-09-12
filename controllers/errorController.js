const AppError=require('./../utils/appError');
const handleCastError=(err)=>{
    return new AppError(`Invalid path:${err.path} value:${err.value} `,400);
}

const handleDuplicateFieldsDB=(err)=>{
    const value=err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
    return new AppError(`Duplicate value of ${value}`,400);
}

const handleValidationErrorsDB=(err)=>{
    const errors=Object.values(err.errors).map(el=>el.message);
    return new AppError(`Invalid Input data ${errors.join(". ")}`,400);
}

const handleJwtError=()=>new AppError('Invalid token.Please log in again!',401);

const handleTokenExpiredError=()=>new AppError(' Your Token has expired.Please log in again!',401);



const sendErrorProduction=(err,res)=>{
    if(err.isOperational){
 res.status(err.statusCode).json({
        status:err.status,
        message:err.message
    })
    //Programming Error
}else{
     res.status(500).json({
        status:'error',
        message:'Something went wrong!'
    })
}
}

const sendErrorDev=(err,res)=>{

 res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    })
}

module.exports=(err,req,res,next)=>{
    //console.log(err.stack);
    err.statusCode=err.statusCode||500;
    err.status=err.status||'error';
    if(process.env.NODE_ENV==='developement'){
       sendErrorDev(err,res);
    }else if(process.env.NODE_ENV==='production'){
        let error={...err};
        if(err.name==='CastError'){
           error= handleCastError(err);
        }
        if(err.Code===11000) error=handleDuplicateFieldsDB(error);
        if(err.name==='ValidationError') error=handleValidationErrorsDB(error);
        if(err.name==="JsonWebTokenError") error=handleJwtError();
        if(err.name==="TokenExpiredError") error=handleTokenExpiredError();

       sendErrorProduction(error,res);
    }
}