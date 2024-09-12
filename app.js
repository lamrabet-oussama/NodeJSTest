const express=require('express');
const AppError=require('./utils/appError');
const errorController=require('./controllers/errorController');
const path=require('path');
const app=express();
const morgan=require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const cookieParser=require('cookie-parser');
const tourRoutes=require('./routes/tourRoutes') //vous pouvez définir un ensemble de routes dans un module séparé (par exemple, toursRoutes.js) et ensuite l'importer dans votre fichier principal (par exemple, app.js).
const userRoutes=require('./routes/userRoutes');
const reviewRoutes=require('./routes/reviewRoutes');
const viewRoutes=require('./routes/viewRoutes');
//1)GLOBAL MIDDLEWARES
app.use(helmet()); //secure the http headers

if(process.env.NODE_ENV==='developement'){
app.use(morgan('dev'));

}

const limit=rateLimit({
    max:100,
    windowMs:60*60*1000, //100 res/1hour
    message:'Too many request from this IP , please try again in an hour!'
});

app.use('/api',limit);
//BODY PARSER,Reading data from body to req.body

//Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({limit:'10kb'})); //Middleware
app.use(cookieParser());
app.set('view engine','pug'); //for creating user interface
app.set('views',path.join(__dirname,'views'))
//Data sanitization against NoSQL query injections
app.use(mongoSanitize()); //look at the req.body,req.query,req.params filter all th $ and .

//Data sanitization against XSS
app.use(xss()); //convert all the html symbols

//Prevent Parameters Pollution
app.use(hpp({
    whitelist:'duration,ratingsQuantity,ratingsAverage,maxGroupSize,difficulty,price'
}));

//Test middleware
app.use((req,res,next)=>{
    console.log('Hello from the middleware')
    req.requestTime=new Date().toISOString();
    console.log(req.cookies)
    next();
})


//2)Route Handlers


//3)ROUTES
//Responding to URL parameters
//app.get('/api/v2/tours',getAllTours)

//app.get('/api/v2/tours/:id/:y?',(req,res)=>{

//app.get('/api/v2/tours/:id',getTour);
//app.post('/api/v2/tours',CreateTour);
/*app.use((req,res,next)=>{
    console.log("Hello from thr Middleware!");
    next();
})*/


app.use('/api/v2/tours',tourRoutes);


//Directe
/*
app.route('/api/v2/tours').get(getAllTours).post(CreateTour);
app.route('/api/v2/tours/:id').get(getTour);*/


//app.patch('/api/v2/tours/:id',UpdateTour);
//app.delete('/api/v2/tours/:id',DeleteTour)

//User
app.use('/api/v2/users',userRoutes);

app.use('/api/v2/reviews',reviewRoutes);

app.use('/',viewRoutes)
app.all('*',(req,res,next)=>{
//         res.status(404).json({
//             status:'fail',
//             message:`Can't find this ${req.originalUrl}`

// const err=new Error(`Can't find this ${req.originalUrl}`);
// err.statusCode=404;
// err.status='fail';
next(new AppError(`Can't find this ${req.originalUrl}`,404));
});
//Handling errors
app.use(errorController);




//app.route('/api/v2/tours/:id').get(getTour).patch(UpdateTour).delete(DeleteTour)
//4)Start the server
module.exports=app;