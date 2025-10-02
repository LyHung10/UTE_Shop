// backend/src/routes/userRoutes.js
import express from 'express';
import userController from '../controllers/adminController.js';
import { authenticateToken, authAdmin } from '../middleware/auth.js';

const router = express.Router();

// Tất cả routes đều cần admin
router.use(authenticateToken);
router.use(authAdmin);

// Lấy danh sách users (có search, pagination)
router.get('/users', userController.getUsers);

// Lấy user by ID
router.get('/:id', userController.getUserById);

// Lấy thống kê users
router.get('/stats/summary', userController.getUserStats);

// Cập nhật user
router.put('/:id', userController.updateUser);

export default router;