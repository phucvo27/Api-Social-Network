const nodemailer = require('nodemailer');
const crypto = require('crypto');


const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "3c09519a9538d2",
      pass: "e73517db3cc9a2"
    }
  });

async function sendEmail(toEmail, subject, text){
    try{

        await transport.sendMail({
            from: 'Api-Social-Network Application', // sender address
            to: toEmail, // list of receivers
            subject: subject, // Subject line
            text: `${text}`, // plain text body
            
          });
          //html: "<b>Hello world?</b>" // html body
          console.log('Email is sent !!!')
          return true;
    }catch(e){
      console.log(e.message)
        return false;
    }
}

module.exports = { sendEmail }