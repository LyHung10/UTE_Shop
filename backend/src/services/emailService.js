import nodemailer from "nodemailer";
import { renderTemplate } from "../templates/emailTemplate"; // helper đọc & render template

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: +process.env.MAIL_PORT,
  secure: +process.env.MAIL_PORT === 465, // port 465 -> secure
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Gửi OTP qua email (có template HTML đẹp)
 * @param {string} to - email người nhận
 * @param {string} code - mã OTP
 * @param {string} purpose - mục đích (Register, Reset password...)
 */
export async function sendOtpMail(to, code, purpose) {
  // render template với data
  const htmlContent = renderTemplate("otp", { code, purpose });

  await transporter.sendMail({
    from: `"UTE Shop" <${process.env.MAIL_USER}>`,
    to,
    subject: `Mã OTP cho ${purpose}`,
    html: htmlContent, // ⚡ dùng html thay vì text
  });

  console.log(`✅ OTP sent to ${to}: ${code}`);
}
