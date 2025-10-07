import express from "express";

import ReviewController from "../controllers/reviewController.js";
import { authenticateToken } from '../middleware/auth';
const router = express.Router();
router.post('/', authenticateToken, ReviewController.createReview);
router.get('/product/:productId', ReviewController.getReviewsByProduct);

export default router;
