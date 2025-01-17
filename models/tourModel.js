const mongoose=require('mongoose');
const slugify=require('slugify');
const validator=require('validator');
// const User=require('./userModel');

const tourSchema=new mongoose.Schema({
name:{
    type:String,
    required:[true,'A tour must have a name'],
    trim:true,
    unique:true, //not a validator
    maxlength:[40,'A tour name must have less or equal than 40 caracters'],
    minlength:[10,'A tour name must have at least 10 caracters'],
},
duration:{
    type:Number,
    required:[true,'A tour must have a duration']
},
maxGroupSize:{
    type:Number,
    required:[true,'A tour must have a group size']

},
difficulty:{
    type:String,
    required:[true,'A tour must have a difficulty'],
    enum:{
        values:['easy','medium','difficult'],
        message:'Difficulty is either:easy,medium or difficult'
    }
},
ratingsAverage:{
    type:Number,
    default:4.5,
    min:[1,'Rating must be above  1.0'],
    max:[5,'Rating must be below  5.0'],
    sel:val=>Math.random(val*10)/10
    
},
ratingsQuantity:{
    type:Number,
    default:0
},
price:{
    type:Number,
    required:[true,'A tour must have a price']
},
priceDiscount:{
type:Number,
validate:{
    validator:function(val){
        //that's not function on updating
        return val<this.price;
    },
    message:'Discount price ({VALUE}) should be below regular price '
}
},
summary:{
    type:String,
    trim:true ,//Remove white space at the end and at the biggining
    //required:[true,'A tour must have a summary']
},
description:{
    type:String,
    trim:true,
    required:[true,'A tour must have a desciption']

},
secretTour:{
type:Boolean,
default:false
},
imageCover:{
    type:String,
    required:[true,'A tour must have a cover image']

},
images:[String],
createdAt:{
    type:Date,
    default:Date.now(),
    select:false
},
startDates:[Date],
slug:String,
//GeoJson
startLocation:{

type:{
    type:String,
    default:'Point',
    enum:['Point']
},

coordinates:[Number],
address:String,
description:String

},
locations:[
    {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
    }
],
// guides:Array for embedding
guide:[
    {type:mongoose.Schema.ObjectId,ref:'User'}
]

},


{
    toJSON:{virtuals:true}, // lorsque le document est converti en JSON (par exemple, lors d'un appel à res.json() dans une API), les champs virtuels seront inclus dans le JSON produit.
    toObject:{virtuals:true} //orsque le document est converti en un objet JavaScript natif (via la méthode toObject()), les champs virtuels seront inclus dans l'objet produit.
});



//Index
//tourSchema.index({price:1});
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:"2dsphere"});

tourSchema.virtual('durationWeek').get(function(){
    return this.duration/7;
});

//Virtual populate:reviews:null because we don't need to array of reviews growths indefinetly : lilit 16mb on mongooDB
tourSchema.virtual('reviews',{
    ref:'Review', 
    foreignField:'tour',
    localField:'_id'
})

//Documet Middleware
// tourSchema.pre('save',async function(next){
//     const guidesPromises=this.guides.map(async id=>{
//         await User.findById(id);
//     });
//     this.guides=await Promise.all(guidesPromises); //convert promises to user documents
//     next();
// })

tourSchema.pre('save', function(next){
     this.slug=slugify(this.name,{lower:true});
     next();
});

tourSchema.pre('save',function(next){
     console.log('Will save document...');
     next();
});
tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
})

//Query Middleware

tourSchema.pre(/^find/, function(next){
     this.populate(
        {path:'guide',
        select:'-_v,-passwordChangedAt' //do a new query
        });
    
    next();
});

tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}});
    next();
});

//Aggregattion Middleware
// tourSchema.pre('aggregate',function(next){
//     this.pipline().unshift({$match:{secretTour:{$ne:true}}});
//     next();
// })

const Tour=mongoose.model('Tour',tourSchema);
module.exports=Tour;