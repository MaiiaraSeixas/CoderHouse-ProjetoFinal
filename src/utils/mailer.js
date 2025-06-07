import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro provedor
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendMail = async ({ to, subject, html, attachments }) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
    attachments
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('[MAILER] E-mail enviado:', result.response);
    return result;
  } catch (err) {
    console.error('[MAILER ERROR]', err);
    throw err;
  }
};
