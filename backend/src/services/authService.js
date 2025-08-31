// services/authService.js
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import { createOtp, verifyOtp } from './otpService';
import { sendOtpMail } from './emailService';
import { signAccessToken, signRefreshToken, persistRefreshToken } from './tokenService';
import OTP_TYPES from '../enums/otpType';

const { User, ResetToken } = db;

export async function registerUser({ email, password, first_name, last_name }) {
  let user = await User.findOne({ where: { email } });

  if (user && user.is_verified) {
    throw { status: 409, message: 'Email đã tồn tại' };
  }

  if (!user) {
    const hashed = await bcrypt.hash(password, 10);

    user = await User.create({
      email,
      password: hashed,
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      is_verified: false,
    });
  }

  const code = await createOtp(user.id, OTP_TYPES.REGISTER);
  await sendOtpMail(email, code, OTP_TYPES.REGISTER);

  return { message: 'Đã gửi OTP tới email' };
}

export async function verifyUserOtp({ email, otp }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 400, message: 'User không tồn tại' };

  const ok = await verifyOtp(user.id, otp, OTP_TYPES.REGISTER);
  if (!ok) throw { status: 400, message: 'OTP không hợp lệ/đã hết hạn' };

  user.is_verified = true;
  await user.save();

  return { message: 'Xác thực thành công' };
}

export async function loginUser({ email, password }, req) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_verified) {
    throw { status: 401, message: 'Sai thông tin hoặc tài khoản chưa xác thực' };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Sai thông tin đăng nhập' };

  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id });
  await persistRefreshToken(user.id, refreshToken, {
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  return {
    accessToken,
    refreshToken,
    user: {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    }
  };
}

export async function forgotPassword({ email }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 404, message: 'User không tồn tại' };

  const code = await createOtp(user.id, OTP_TYPES.FORGOT_PASSWORD);
  await sendOtpMail(email, code, OTP_TYPES.FORGOT_PASSWORD);

  return { message: 'OTP đã được gửi' };
}

export async function resetPassword({ email, otp, newPassword }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { status: 404, message: 'User không tồn tại' };

  const validOtp = await verifyOtp(user.id, otp, OTP_TYPES.FORGOT_PASSWORD);
  if (!validOtp) throw { status: 400, message: 'OTP không hợp lệ/đã hết hạn' };

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return { message: 'Password updated successfully' };
}
