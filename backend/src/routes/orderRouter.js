import express from 'express';
import OrderController from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', OrderController.getUserOrders);
router.get('/:orderId/detail', OrderController.getDetailOrder);
router.post('/cart',OrderController.addToCart);
router.get('/cart',OrderController.getCart);
router.put('/cart',OrderController.updateQuantity);
router.delete('/cart/:itemId',OrderController.removeItem);
router.delete('/cart',OrderController.clearCart);
router.post("/checkout/cod",OrderController.checkoutCOD);
router.put("/:orderId/confirm-cod",OrderController.confirmCODPayment);
router.post("/checkout/vnpay",OrderController.checkoutVNPay);
router.put("/:orderId/confirm-vnpay",OrderController.confirmVNPay);
export default router;
