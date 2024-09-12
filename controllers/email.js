const nodemailer=require('nodemailer');

const sendEmail=async options=>{
    //1)Create a transporter : Service 
    const transporter=nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
        //Activate in gmail "less secure app" option
    });
    //2)Define the email options
    const mailOptions={
        from:'Oussama Lamrabet <oussamalamrabet518@gmail.com>',
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    //Send the email
    await transporter.sendMail(mailOptions);
}

module.exports=sendEmail;