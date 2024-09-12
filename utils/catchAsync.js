   module.exports=fct=>{
   return(req,res,next)=>{
        fct(req,res,next).catch(next);
    };
}
