const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from:'Natours <indrajith@yahoo.io>',
        to:options.email, 
        subject:options.subject,
        text:options.message
    }
    try{
        await transporter.sendMail(mailOptions)
    }catch(err){
        console.log(err)
    }

    
}

module.exports = sendEmail