
import productController from "../controllers/productController";
import express from "express";
import parser from '../middleware/multerCloudinary.js';
const router = express.Router();
// 1. 8 sản phẩm được xem nhiều nhất
router.get("/most-viewed", productController.getMostViewed);

// 2. 4 sản phẩm khuyến mãi cao nhất
router.get("/top-discount", productController.getTopDiscount);

router.get("/newest", productController.getNewestProducts);

router.get("/best-selling", productController.getBestSellingProducts);

// 3. Tất cả sản phẩm (phân trang)
router.get("/", productController.getAllProducts);

// 4. Xem chi tiết sản phẩm + tăng view_count
router.get("/:id", productController.getProductById);


// upload.array('images', 5) => max 5 ảnh
router.post('/add', parser.array('images', 5), productController.addProduct);
export default router;