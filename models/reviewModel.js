const mongoose=require('mongoose');
const Tour=require('./tourModel');
const reviewSchema=new mongoose.Schema({
review:{type:String,
    required:[true,'Review cannot be empty']
},
rating:{type:Number,
    min:1,
    max:5
},
createdAt:{
    type:Date,
    default:Date.now()
},
user:{type:mongoose.Schema.ObjectId,ref:'User', required:[true,'Review must belong to a user']
},
tour:{type:mongoose.Schema.ObjectId,ref:'Tour',    required:[true,'Review must belong to a tour']
}


},
{
    toJSON:{virtuals:true}, // lorsque le document est converti en JSON (par exemple, lors d'un appel à res.json() dans une API), les champs virtuels seront inclus dans le JSON produit.
    toObject:{virtuals:true} //orsque le document est converti en un objet JavaScript natif (via la méthode toObject()), les champs virtuels seront inclus dans l'objet produit.
});

reviewSchema.index({tour:1,user:1},{unique:true});

//Statistics
reviewSchema.statics.calcAverageRatings=async function(tourId){
    const static=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum: 1 },
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
if(static.length>0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:static[0].nRating,
            ratingsAverage:static[0].avgRating
        })
    }else{
         await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingsAverage:4.5
        })
    }
    console.log(static);


}
//1)For Creating or update document

reviewSchema.post('save',async function(){
    this.constructor.calcAverageRatings(this.tour);
})

//2)Update or Delete :Problem with query middleware : we don't have access to the document

reviewSchema.pre(/^finOneAnd/,async function(next){
    this.rev=await this.findOne(); //this refers to the query, so by findOne we have access to the doc
    next();
})

reviewSchema.post(/^finOneAnd/,async function(){
    //query has already executed
    this.rev.constructor.calcAverageRatings(this.rev.tour);
});

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'-_v'
    })
    next();
});
reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name photo'
    })
    next();
});


const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;