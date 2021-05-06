const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')
const pug = require('pug')
module.exports = class Email{
    constructor(user, url){
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        // this.from = `Natours <${process.env.EMAIL_FROM}>`
        this.from = 'Natours <indrajith@yahoo.io>'
    }
    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            return 1
        }
        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST,
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        })
    }
    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        })
        const mailOptions = {
            from:this.from,
            to:this.to, 
            subject,
            html,
            text:htmlToText.fromString(html)
        }
        await this.newTransport().sendMail(mailOptions)

    }
    
    async sendWelcome(){
        await this.send('Hola', "Welcome to Natours Family")
    }

    async sendPasswordReset() {
        await this.send(
          'passwordReset',
          'Your password reset token (valid for only 10 minutes)'
        );
      }
}

// const sendEmail = async (options) => {
    // const transporter = nodemailer.createTransport({
    //     host:process.env.EMAIL_HOST,
    //     port:process.env.EMAIL_PORT,
    //     auth:{
    //         user:process.env.EMAIL_USERNAME,
    //         pass:process.env.EMAIL_PASSWORD
    //     }
    // })

//     const mailOptions = {
//         from:'Natours <indrajith@yahoo.io>',
//         to:options.email, 
//         subject:options.subject,
//         text:options.message
//     }
//     try{
//         await transporter.sendMail(mailOptions)
//     }catch(err){
//         console.log(err)
//     }

    
// }

// module.exports = sendEmail