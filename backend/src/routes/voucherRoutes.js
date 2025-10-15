import express from "express";
import voucherController from "../controllers/voucherController";
import {authAdmin, authenticateToken} from "../middleware/auth";


const router = express.Router();

router.use(authenticateToken);
// POST /api/vouchers
router.post("/gift", voucherController.addUserVoucher);
router.get("/my", voucherController.getUserVouchers);

router.use(authAdmin);
router.get("/", voucherController.listVouchers);
router.post("/", voucherController.createVoucher);
router.put("/:id", voucherController.updateVoucher);
router.delete("/:id", voucherController.deleteVoucher);


export default router;
