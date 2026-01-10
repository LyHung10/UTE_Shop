import { Router } from "express";
import {createPayment, checkPayment, checkout, createPayPal} from "../controllers/paymentController.js";

const router = Router();

router.get("/check-payment-vnpay", checkPayment);

router.post("/paypal/create", createPayPal);
router.post("/paypal/checkout", checkout);
export default router;
