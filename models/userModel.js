const mongoose=require('mongoose');
const crypto=require('crypto');
const validator=require('validator');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'A user must have a username'],

    },
    email:{
        type:String,
        validate:[validator.isEmail,'Invalid Email'],
        required:[true,'A user must have an email'],
        unique:true,
        lowercase:true

    },
    password:{
        type:String,
        required:[true,'A user must have a password'],
        minlength:8,
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'Confirm password is required'],
        //That's worked just in save!!!
        validate:{
            validator:function(el){
                return el===this.password;
            },
            message:'Passwords are not the same!!'
        }

    },
    passwordChangedAt:Date,

    photo:{
        type:String
    },
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    activate:{
        type:Boolean,
        default:true,
        select:false
    }
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password') || this.New) next();
    this.passwordChangedAt=Date.now()-1000;//for ensuring that the password has been created before the token
    next();
})

userSchema.pre('save',async function(next){
    //Only works when the password was actually modified

    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
    next();
})

userSchema.pre(/^find/,async function(next){
    //this the points to the current query
    this.find({activate:{$ne:false}});
    next();
})

userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
};

userSchema.methods.changedPasswordAfter= function(JwtTimestamp){
    if(this.passwordChangedAt){
        const changedAt=parseInt(this.passwordChangedAt/1000,10);
    return JwtTimestamp<changedAt;

    }
    return false; //means not changed
}

userSchema.methods.createPasswordResetToken=function(){

    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires=Date.now()+10*60*1000;

    return resetToken;
}

const User=mongoose.model('User',userSchema);
module.exports=User;