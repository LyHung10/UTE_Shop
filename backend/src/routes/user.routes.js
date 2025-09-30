import express from "express";
import { updateUser, getProfile } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/authController";

const router = express.Router();

router.use(authenticateToken);
// router.put("/update", updateUser);
router.put("/update", updateUser);
router.get("/profile", getProfile);
router.post('/reset-password', authController.resetPassword);
export default router;