const dotenv=require('dotenv');
dotenv.config({path:'./config.env'});

const mongoose=require('mongoose');

process.on('uncaughException',err=>{
    console.log(err.name,err.message);
    console.log('Uncaugh Exception!');
    process.exit(1);
   

})
const app=require('./app');
//console.log(process.env)

const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DB_PASSWORD);
//mongoose.connect(process.env.DATABASE_LOCAL,{

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(()=>{
    console.log('DB connected')
});



const port=process.env.PORT||8000;

const server=app.listen(port,()=>{
    console.log(`Server is running on the port ${port}`);
});
//Test
process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log('Unhandled Rejection!');
    server.close(()=>{
        process.exit(1);
    })

})
