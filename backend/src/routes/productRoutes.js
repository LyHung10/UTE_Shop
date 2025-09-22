import productController from "../controllers/productController";
import express from "express";
import parser from '../middleware/multerCloudinary.js';

const router = express.Router();

// Thử quần áo 
router.post("/try-on", productController.tryOnClothes);
// Upload sản phẩm (cũng nên để trước /:id)
router.post("/add", parser.array('images', 5), productController.addProduct);

// 1. 8 sản phẩm được xem nhiều nhất
router.get("/most-viewed", productController.getMostViewed);

// 2. 4 sản phẩm khuyến mãi cao nhất
router.get("/top-discount", productController.getTopDiscount);

// 3. Sản phẩm mới nhất
router.get("/newest", productController.getNewestProducts);

// 4. Sản phẩm bán chạy nhất
router.get("/best-selling", productController.getBestSellingProducts);

// Route động theo slug + page
router.get("/:slug/:page", productController.getProductsByCategorySlug);

// Tất cả sản phẩm (phân trang)
router.get("/", productController.getAllProducts);

// Xem chi tiết sản phẩm + tăng view_count
router.get("/:id", productController.getProductById);

export default router;
