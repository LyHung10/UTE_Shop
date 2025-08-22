// routes/user.routes.js
import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.js'; // chỉnh lại tên import + thêm .js

const router = express.Router();

// Lấy thông tin profile
router.get('/profile', auth(), userController.getMe);
router.put('/profile', auth(), userController.updateMe);

export default router;
