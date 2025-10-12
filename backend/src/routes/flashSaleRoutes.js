// routes/flashSaleRoutes.js
const express = require('express');
const router = express.Router();
const FlashSaleController = require('../controllers/flashSaleController');
const FlashSaleOrderController = require('../controllers/flashSaleOrderController');
import { authenticateToken, authAdmin } from '../middleware/auth.js';

// Public routes
router.get('/current', FlashSaleController.getCurrentFlashSales);
router.get('/:id', FlashSaleController.getFlashSaleDetail);
router.get('/:id/products', FlashSaleController.getFlashSaleProducts);
// User routes
router.post('/order', authenticateToken, FlashSaleOrderController.createFlashSaleOrder);
router.get('/user/orders', authenticateToken, FlashSaleOrderController.getUserFlashSaleOrders);

// Admin routes
router.post('/', authAdmin, FlashSaleController.createFlashSale);
router.put('/:id', authAdmin, FlashSaleController.updateFlashSale);
router.post('/:id/products', authAdmin, FlashSaleController.addProductToFlashSale);
router.delete('/:id', authAdmin, FlashSaleController.deleteFlashSale);
router.get('/products/search', FlashSaleController.searchProducts);

module.exports = router;