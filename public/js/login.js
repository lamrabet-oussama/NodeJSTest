import axios from "axios";
const login=async (email,password)=>{
   try {
    const response=await axios.post("http://127.0.0.1:8000/api/v2/users/login");
    const result=response.data;
    
    console.log(result);
}catch(err){
    console.log(err);
}}

document.querySelector('.form').addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    login(email,password)
})
