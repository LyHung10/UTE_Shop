// routes/addressRoutes.js
import express from "express";
import { createAddress, getUserAddresses } from "../controllers/addressController.js";
import { authenticateToken } from "../middleware/auth.js"; 

const router = express.Router();

// POST /addresses (không cần userId trong URL)
router.post("/", authenticateToken, createAddress);

// GET /addresses (không cần userId trong URL)
router.get("/", authenticateToken, getUserAddresses);

export default router;