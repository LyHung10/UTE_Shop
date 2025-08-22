import express from "express";
import { updateUser } from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.put("/update", updateUser);

export default router;