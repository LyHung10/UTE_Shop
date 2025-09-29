import express from "express";
import voucherController from "../controllers/voucherController";
import {authenticateToken} from "../middleware/auth";


const router = express.Router();

router.use(authenticateToken);
// POST /api/vouchers
router.post("/add", voucherController.addVoucher);

export default router;
