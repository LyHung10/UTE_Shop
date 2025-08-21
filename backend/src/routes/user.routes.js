const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middleware/auth'); // Sửa lại tên import

// Lấy thông tin profile
router.get('/profile', auth(), userController.getMe); // Sửa lại thành auth()
router.put('/profile', auth(), userController.updateMe);

module.exports = router;
