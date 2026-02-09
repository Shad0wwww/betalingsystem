import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!!,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER!!,
        pass: process.env.SMTP_PASSWORD!!,
    },
})


export async function sendEmail(
    to: string,
    subject: string,
    text: string
){
    await transporter.sendMail({
        from: `"Betalingsystem" <${process.env.SMTP_USER!!}>`,
        to: to,
        subject: subject,
        text: text,
    });
}