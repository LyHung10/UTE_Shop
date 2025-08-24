import express from "express";
import { updateUser, getProfile } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// router.put("/update", updateUser);
router.put("/update", authenticateToken, updateUser);
router.get("/profile", authenticateToken, getProfile);

export default router;