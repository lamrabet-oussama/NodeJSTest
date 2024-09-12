// 1. Modules Node.js intégrés
const fs = require('fs');

// 2. Modules tiers
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 3. Configuration de dotenv
dotenv.config({ path: './config.env' });

// 4. Modules locaux
const Tour = require('../../models/tourModel');

//console.log(process.env)
console.log(process.env.DB_PASSWORD)

const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DB_PASSWORD);

//mongoose.connect(process.env.DATABASE_LOCAL,{
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
}).then(()=>{
    console.log('DB connected')
});

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));

const impportData=async ()=>{
    try{
        await Tour.create(tours,{validateBeforeSave:false});
        console.log('Data successfully loaded!');
        process.exit();

    }catch(err){
        console.log(err);
    }
}

const deleteData=async ()=>{
    try{
        await Tour.deleteMany();
        console.log('Data succcessfully deleted!');
        process.exit();
    }catch(err){
        console.log(err);
    }
}

if(process.argv[2]==='--import'){
    impportData();
}else if(process.argv[2]==='--delete'){
    deleteData();
}