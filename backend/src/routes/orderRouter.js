import express from 'express';
import OrderController from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, OrderController.getUserOrders);
router.get('/:orderId/detail', authenticateToken, OrderController.getDetailOrder);
router.post('/cart', authenticateToken, OrderController.addToCart);
router.get('/cart', authenticateToken, OrderController.getCart);
router.put('/cart', authenticateToken, OrderController.updateQuantity);
router.delete('/cart/:itemId', authenticateToken, OrderController.removeItem);
router.delete('/cart', authenticateToken, OrderController.clearCart);
router.get('/cart/count', authenticateToken, OrderController.getCartCount);

router.post("/checkout/cod", authenticateToken, OrderController.checkoutCOD);
router.put("/:orderId/confirm-cod", authenticateToken, OrderController.confirmCODPayment);


router.post("/checkout/vnpay", authenticateToken, OrderController.checkoutVNPay);
router.put("/:orderId/confirm-vnpay", authenticateToken, OrderController.confirmVNPay);
export default router;
