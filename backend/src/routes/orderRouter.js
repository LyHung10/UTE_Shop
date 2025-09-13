import express from 'express';
import OrderController from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/cart', authenticateToken, OrderController.addToCart);
router.get('/cart', authenticateToken, OrderController.getCart);
router.delete('/cart/:productId', authenticateToken, OrderController.removeItem);

export default router;
