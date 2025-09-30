// routes/shippingRoutes.js
import express from 'express';
import { getShippingFee } from '../controllers/shippingController.js';
import { authenticateToken } from "../middleware/auth.js"; 

const router = express.Router();

router.get('/:addressId', authenticateToken, getShippingFee);

export default router;
