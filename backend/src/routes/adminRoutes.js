// backend/src/routes/userRoutes.js
import express from 'express';
import OrderController from '../controllers/orderController';
import userController from '../controllers/adminController.js';
import { authenticateToken, authAdmin } from '../middleware/auth.js';
import voucherController from "../controllers/voucherController";
import * as adminDashboardController from '../controllers/adminDashboardController.';
import {statistics} from "../controllers/adminDashboardController.";
const router = express.Router();


// Lấy danh sách users (có search, pagination)
router.get('/users', userController.getUsers);
// Tất cả routes đều cần admin
router.use(authenticateToken);
router.use(authAdmin);
router.get('/dashboard/metrics', adminDashboardController.getMetrics)
router.get('/dashboard/monthly-sales', adminDashboardController.monthlySales);
router.get('/dashboard/monthly-target', adminDashboardController.monthlyTarget);
router.get('/dashboard/statistics', adminDashboardController.statistics);

router.put('/confirm-order', OrderController.confirmOrder);
router.get('/check-neworder', OrderController.checkHasNewOrders);
router.post('/order/cancel-order', OrderController.cancelAdminOrder);
router.get('/order/:orderId/detail',OrderController.getAdminDetailOrder);
router.put('/shipping-order', OrderController.confirmShippingOrder);
router.get('/orders', OrderController.getAllOrders);
// Lấy user by ID
router.get('/:id', userController.getUserById);
router.post('/add', voucherController.addVoucher);
// Lấy thống kê users
router.get('/stats/summary', userController.getUserStats);

// Cập nhật user
router.put('/:id', userController.updateUser);

export default router;