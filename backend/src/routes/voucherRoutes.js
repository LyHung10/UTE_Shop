import express from "express";
import voucherController from "../controllers/voucherController";
import {authenticateToken} from "../middleware/auth";


const router = express.Router();

router.use(authenticateToken);
// POST /api/vouchers
router.post("/gift", voucherController.addUserVoucher);
router.get("/my", voucherController.getUserVouchers);

export default router;
