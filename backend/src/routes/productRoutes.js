// routes/product.routes.js

// const productController = require("../controllers/productController");
import productController from "../controllers/productController";
import express from "express";
import { authenticateToken } from "../middleware/auth";
const router = express.Router();
// 1. 8 sản phẩm được xem nhiều nhất
router.get("/most-viewed", authenticateToken, productController.getMostViewed);

// 2. 4 sản phẩm khuyến mãi cao nhất
router.get("/top-discount", authenticateToken, productController.getTopDiscount);

// 3. Tất cả sản phẩm (phân trang)
router.get("/", authenticateToken, productController.getAllProducts);

// 4. Xem chi tiết sản phẩm + tăng view_count
router.get("/:id", authenticateToken, productController.getProductById);

export default router;