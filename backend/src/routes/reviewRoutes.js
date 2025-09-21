import express from "express";

import ReviewController from "../controllers/reviewController.js";
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
// Tạo review (yêu cầu đăng nhập)
router.post('/', authenticateToken, ReviewController.createReview);

// Lấy tất cả review của 1 sản phẩm
router.get('/product/:productId', ReviewController.getReviewsByProduct);

export default router;
