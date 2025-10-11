import productService from "../services/productService";

class ProductController {
  async getMostViewed(req, res, next) {
    try {
      const products = await productService.getMostViewed();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  async getSimilar(req, res, next) {
    try {
      const { id } = req.params;
      const limit = Number(req.query.limit || 12);
      const items = await productService.getSimilarProducts(id, limit);
      res.json({ success: true, items });
    } catch (err) {
      next(err);
    }
  }

  async getTopDiscount(req, res, next) {
    try {
      const products = await productService.getTopDiscount();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  async getAllProducts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;

      const data = await productService.getAllProducts(page, size);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async addProduct(req, res) {
    try {
      const productData = {
        name: req.body.name,
        slug: req.body.slug,
        short_description: req.body.short_description,
        description: req.body.description,
        price: req.body.price,
        original_price: req.body.original_price,
        discount_percent: req.body.discount_percent,
        is_active: req.body.is_active,
        try_on: req.body.try_on,
        featured: req.body.featured,
        category_id: req.body.category_id,
      };

      const product = await productService.createProductWithImages(productData, req.files);

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Thêm sản phẩm thất bại', error: error.message });
    }
  };

  async getNewestProducts(req, res, next) {
    try {
      const products = await productService.getNewestProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  // 6. Lấy 6 sản phẩm bán chạy nhất
  async getBestSellingProducts(req, res, next) {
    try {
      const products = await productService.getBestSellingProducts();
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  async getProductsByCategorySlug(req, res, next) {
    try {
      const { slug } = req.params;

      // Backward-compatible: ưu tiên params.page nếu có, nếu không dùng query.page
      const pageFromParams = parseInt(req.params.page, 10);
      const pageFromQuery = parseInt(req.query.page, 10);
      const page = Number.isFinite(pageFromParams)
          ? pageFromParams
          : Number.isFinite(pageFromQuery)
              ? pageFromQuery
              : 1;

      const limitQ = parseInt(req.query.limit, 10);
      const limit = Number.isFinite(limitQ) ? limitQ : 20;

      // Nhận sizes/colors từ query: chấp nhận "M,L" hoặc ?sizes=M&sizes=L
      const toArray = (v) => {
        if (Array.isArray(v)) return v.filter(Boolean);
        if (typeof v === "string") {
          return v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
        }
        return undefined;
      };

      const sizes = toArray(req.query.sizes);
      const colors = toArray(req.query.colors);

      // sort: 'popularity' | 'rating' | 'newest' | 'price_asc' | 'price_desc'
      const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;

      const data = await productService.getProductsByCategorySlug(slug, page, limit, {
        sizes,
        colors,
        sort,
      });

      return res.json({
        success: true,
        message: "Lấy sản phẩm theo danh mục thành công",
        data,
      });
    } catch (err) {
      return next(err);
    }
  }

  async getProductStats(req, res) {
    try {
      const rawId = req.params.id;
      const productId = Number(rawId);

      if (!productId || Number.isNaN(productId)) {
        return res.status(400).json({ error: "productId không hợp lệ" });
      }

      // luôn mặc định chỉ tính các order có trạng thái 'completed'
      const result = await productService.getProductEngagement(productId);

      return res.json({
        product_id: productId,
        ...result,
      });
    } catch (err) {
      console.error("[getProductStats] error:", err);
      return res
        .status(500)
        .json({ error: err.message || "Internal Server Error" });
    }
  }
}
export default new ProductController();