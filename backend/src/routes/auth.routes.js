// routes/auth.routes.js
import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

// Đăng ký
router.post('/register', authController.register);
// Xác thực OTP
router.post('/verify-otp', authController.verifyOtp);
// Đăng nhập
router.post('/login', authController.login);
// Quên mật khẩu
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
