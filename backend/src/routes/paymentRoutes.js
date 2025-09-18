import { Router } from "express";
import { createPayment, checkPayment } from "../controllers/paymentController.js";
import OrderController from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post("/create", createPayment);
// router.get("/return", checkPayment);

router.get("/check-payment-vnpay", checkPayment);

export default router;
