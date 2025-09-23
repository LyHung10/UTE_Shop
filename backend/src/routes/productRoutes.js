import productController from "../controllers/productController";
import express from "express";
import parser from '../middleware/multerCloudinary.js';
import multer from 'multer';

const router = express.Router();



// Thử quần áo
const upload = multer({ dest: 'uploads/tmp/' });

router.post('/try-on', upload.fields([
  { name: 'person', maxCount: 1 },
  { name: 'cloth', maxCount: 1 },
]), productController.tryOnClothes);
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

// Lấy chỉ số tương tác của sản phẩm
router.get("/:id/stats",productController.getProductStats);

// Route động theo slug + page
router.get("/:slug/:page", productController.getProductsByCategorySlug);

// Xem chi tiết sản phẩm + tăng view_count
router.get("/:id", productController.getProductById);

// Tất cả sản phẩm (phân trang)
router.get("/", productController.getAllProducts);

export default router;
