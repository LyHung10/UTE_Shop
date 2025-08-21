const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: +process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT == 465, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendOtpMail(to, code, purpose) {
  await transporter.sendMail({
    from: `"UTE Shop" <${process.env.MAIL_USER}>`,
    to,
    subject: `Your OTP for ${purpose}`,
    text: `Your OTP code is ${code}`,
  });
  console.log(`OTP sent to ${to}: ${code}`);
}

module.exports = { sendOtpMail };
