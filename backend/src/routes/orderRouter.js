import express from 'express';
import OrderController from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/cart', authenticateToken, OrderController.addToCart);
router.get('/cart', authenticateToken, OrderController.getCart);
router.put('/cart', authenticateToken, OrderController.updateQuantity);
router.delete('/cart/:itemId', authenticateToken, OrderController.removeItem);
router.delete('/cart', authenticateToken, OrderController.clearCart);
router.get('/cart/count', authenticateToken, OrderController.getCartCount);
export default router;
