const { validationResult } = require('express-validator');
const db = require('../models');
const User = db.User;
const { hashPassword, comparePassword } = require('../utils/password');
const { createOtp, verifyOtp } = require('../services/otpService');
const { sendOtpMail } = require('../services/emailService');
const { signAccessToken, signRefreshToken, persistRefreshToken } = require('../services/tokenService');
import bcrypt from 'bcryptjs';

// -------- Register --------
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Kiểm tra user đã tồn tại
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const passwordHash = await hashPassword(password);
      user = await User.create({
        email,
        password: passwordHash,   // phải khớp với cột "password"
        first_name: firstName || null, // match với snake_case trong DB
        last_name: lastName || null,
      });
    }

    if (user.isVerified) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    // Tạo OTP và gửi mail
    const code = await createOtp(user.id);
    await sendOtpMail(email, code);

    res.json({ message: 'Đã gửi OTP tới email' });
  } catch (err) {
    next(err);
  }
};

// -------- Verify OTP --------
const verifyOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'User không tồn tại' });

    const ok = await verifyOtp(user.id, otp); 
    if (!ok) return res.status(400).json({ message: 'OTP không hợp lệ/đã hết hạn' });

    user.is_verified = true;
    await user.save();

    res.json({ message: 'Xác thực thành công' });
  } catch (err) {
    next(err);
  }
};

// -------- Login --------
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_verified) return res.status(401).json({ message: 'Sai thông tin hoặc tài khoản chưa xác thực' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ message: 'Sai thông tin đăng nhập' });

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = signRefreshToken({ sub: user.id });
    await persistRefreshToken(user.id, refreshToken, { userAgent: req.headers['user-agent'], ip: req.ip });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// -------- Forgot Password --------
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.json({ message: 'OTP đã được gửi' });

    const code = await createOtp(user.id); // không cần purpose
    await sendOtpMail(email, code);

    res.json({ message: 'OTP đã được gửi' });
  } catch (err) {
    next(err);
  }
};

// -------- Reset Password --------
async function resetPassword(req, res) {
  const { email, token, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // TODO: kiểm tra token ở bảng ResetToken hoặc RefreshToken

    // Hash password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  register,
  verifyOtp: verifyOtpController,
  login,
  forgotPassword,
  resetPassword
};
