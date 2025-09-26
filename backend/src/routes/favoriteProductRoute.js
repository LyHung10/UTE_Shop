// routes/favoriteProductRoute.js
import express from 'express';
const router = express.Router();
import favoriteController from '../controllers/favoriteProductController.js';
import { authenticateToken } from '../middleware/auth';
const authMiddleware = authenticateToken;
// tất cả route đều cần auth
router.use(authMiddleware);

// thêm sản phẩm yêu thích
router.post('/add', favoriteController.add);

// bỏ sản phẩm yêu thích
router.post('/remove', favoriteController.remove);

// danh sách sản phẩm yêu thích của user
router.get('/list', favoriteController.list);

// kiểm tra product có trong wishlist không
router.get('/check', favoriteController.check);

export default router;
