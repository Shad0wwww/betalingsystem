import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_HOST!!,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILGUN_LOGIN!!,
        pass: process.env.MAILGUN_PASSWORD!!,
    },
})


export async function sendEmail(
    to: string,
    subject: string,
    html: string,
){
    await transporter.sendMail({
        from: `"Betalingsystem" <${process.env.MAILGUN_LOGIN!!}>`,
        to: to,
        subject: subject,
        html: html,
    });
}