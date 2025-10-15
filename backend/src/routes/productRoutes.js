import productController from "../controllers/productController";
import express from "express";
import parser from '../middleware/multerCloudinary.js';

const router = express.Router();

router.put('/:id', parser.array('images', 10), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.put('/:id/images', parser.array('images', 10), productController.updateProductImages);

// Upload sản phẩm (cũng nên để trước /:id)
router.post("/add", parser.array('images', 10), productController.addProduct);
router.get('/', productController.getProducts);

// 1. 8 sản phẩm được xem nhiều nhất
router.get("/most-viewed", productController.getMostViewed);
router.get("/filters", productController.getDistinctSizesAndColors);
// 2. 4 sản phẩm khuyến mãi cao nhất
router.get("/top-discount", productController.getTopDiscount);

// 3. Sản phẩm mới nhất
router.get("/newest", productController.getNewestProducts);

// 4. Sản phẩm bán chạy nhất
router.get("/best-selling", productController.getBestSellingProducts);

// Lấy chỉ số tương tác của sản phẩm
router.get("/:id/stats",productController.getProductStats);
router.get("/:id/similar", productController.getSimilar);

// Route động theo slug + page
// router.get("/:slug/:page", productController.getProductsByCategorySlug);
router.get("/:slug/:page", productController.getProductsByCategorySlug);


// Xem chi tiết sản phẩm + tăng view_count
router.get("/:id", productController.getProductById);

// Tất cả sản phẩm (phân trang)
router.get("/all", productController.getAllProducts);

export default router;
