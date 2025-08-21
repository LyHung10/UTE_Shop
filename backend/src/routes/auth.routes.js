const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Đăng ký
router.post('/register', authController.register);
// Xác thực OTP
router.post('/verify-otp', authController.verifyOtp);
// Đăng nhập
router.post('/login', authController.login);
// Quên mật khẩu
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;