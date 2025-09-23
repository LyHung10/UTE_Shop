import express from "express";
import voucherController from "../controllers/voucherController";


const router = express.Router();

// POST /api/vouchers
router.post("/add", voucherController.addVoucher);

export default router;
