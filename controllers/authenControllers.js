const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const {promisify}=require('util');
const jwt=require('jsonwebtoken');
const sendEmail=require('./email');
const crypto=require('crypto');

const createSendToken=(user,statusCode,res)=>{
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRES_IN
})
const cookieOptions={
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
     //the cokkie will only be sent on an encrypted connection
    httpOnly:true //the cookie can't be modefied by the browser
}
if(process.env.NODE_ENV==="production") cookieOptions.secure=true;
res.cookie('jwt',token,cookieOptions);
user.password=undefined; //remove the password from yhe output
res.status(statusCode).json({
status:'success',
token,
data:{user}
    
})
}

exports.signup=catchAsync(async (req,res,next)=>{

const newUser=await User.create({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password,
    confirmPassword:req.body.confirmPassword,
    role:req.body.role
});
createSendToken(newUser,201,res);
});

exports.login=catchAsync(async (req,res,next)=>{
    //1)Chech if email and password exist
    const {email,password}=req.body;
        
    if(!email || !password){
    return next(new AppError('Please provide email and password',400));
    }
//2)Check if user exist and password is correct
const user=await User.findOne({email}).select('+password');

if(!user || !(await user.correctPassword(password,user.password)) ){
    return next(new AppError('Incorrect username or password',401));
}
//3)
createSendToken(user,200,res);

}
)

exports.protect=catchAsync(
    async (req,res,next)=>{
        //1)Taken token and check if it is there
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1];
        }else if(req.cookie.jwt){
            token=req.cookies.jwt;
        }
        if(!token) return next(new AppError('You are not logged please log in to access',401));
        //2)Verification token
        const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
        console.log(decoded);

        //3)Chek if user exists
        const freshUser=await User.findById(decoded.id);
        if(!freshUser){
            return next(new AppError('The user beloging to this token does no longer exist!',401));
        }
        //4)Check if the user changed password
        if(freshUser.changedPasswordAfter(decoded.iat)){
            return next(new AppError('User recently changed password .Please log in again!!',401));

        }
        //Grant access to protected route
        req.user=freshUser;
        next();
    }
)

exports.restrictTo=(...roles)=>{
return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return next(new AppError("You don't have the permission",403));
    }
    next();
}
}

exports.forgotPassword=catchAsync(
    async (req,res,next)=>{
        //1) Get user based on Posted email
        const user=await User.findOne({email:req.body.email});
        if(!user) return next(new AppError('There is no user with email address.',404));
        //2) Generate the random reset token
        const resetToken=user.createPasswordResetToken();
        await user.save({validateBeforeSave:false})
        //3)Send
        const resetURL=`${req.protocol}://${req.get('host')}/api/v2/users/resetPassword/${resetToken}`;
        const message=`Forgot your password? Submit a patch request with your new password and passwordConfirm to :${resetURL}.\n If you didn't forgot your password please ignore this email`;

        try{
            await sendEmail({
            email:user.email,
            subject:"Your password reset token (valid for 10 min)",
            message
        });
        }

    catch(err){
        console.log(err);
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError('There was an error sending the email.Try again later!',500));
    }

    res.status(200).json({
            status:'success',
            message:'Token sent to email'
        })
    }
)
exports.resetPassword=catchAsync( async (req,res,next)=>{
//1)Get user based on the token
const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');

const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}//token not expired
});


//2)If token has no expired, and ther is user , set the new password
if(!user) return next(new AppError('Token is invalid or has expired',400))//400:bad request
user.password=req.body.password;
user.confirmPassword=req.body.confirmPassword;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
await user.save(); //we want validate the password

//3) Update changedPasswordAt property for the user

//4) Log the user in ,send JWT
createSendToken(user,200,res);

})

exports.updatePassword=catchAsync(async (req,res,next)=>{
//1)Get user from collection
const user=await User.findById(req.user.id).select('+password');
if(!user) return next(new AppError('This user is not exist',404));
//2)Check if Posted curreent password is correct
//3)If so , update password

if(!(await user.correctPassword(req.body.password,user.password))){
 return next(new AppError('Password is not correct!',401));   
}
user.password=req.body.newPassword;
user.confirmPassword=req.body.confirmPassword;
await user.save();

//4)log user in,send JWT
createSendToken(user,201,res);


})


//Only for renderring pages
exports.isLoggedIn=catchAsync(
    async (req,res,next)=>{
         if(req.cookie.jwt){

        
        //2)Verification token
        const decoded=await promisify(jwt.verify)(req.cookie.jwt,process.env.JWT_SECRET);
        console.log(decoded);

        //3)Chek if user exists
        const freshUser=await User.findById(decoded.id);
        if(!freshUser){
            return next();
        }
        //4)Check if the user changed password
        if(freshUser.changedPasswordAfter(decoded.iat)){
            return next();

        }
        //There is a logged in
        res.locals.user=freshUser
        next();
    }
    next();
    }
)
