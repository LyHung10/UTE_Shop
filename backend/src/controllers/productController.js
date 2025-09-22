import productService from "../services/productService";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

class ProductController {
  async tryOnClothes(req, res) {
    try {
      console.log(">>> TryOn API hit");
      res.json({ msg: "TryOn API working", body: req.body });
      const { personUrl, clothUrl } = req.body;

      if (!personUrl || !clothUrl) {
        return res.status(400).json({ error: "Thiếu ảnh người hoặc quần áo" });
      }

      // gọi model Replicate
      const output = await replicate.run(
        "viktorfa/oot_diffusion:9f8fa4956970dde99689af7488157a30aa152e23953526a605df1d77598343d7",
        {
          input: {
            person_image: personUrl,
            garment_image: clothUrl,
          },
        }
      );

      // output là array chứa ảnh
      res.json({
        success: true,
        result: output, // mảng link ảnh
      });
    } catch (err) {
      console.error("❌ Lỗi thử quần áo:", err);
      res.status(500).json({ error: "Có lỗi xảy ra khi thử quần áo" });
    }
  };
  async getMostViewed(req, res, next) {
    try {
      const products = await productService.getMostViewed();
      res.json(products);
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
      const page = parseInt(req.params.page, 10); // nếu không có thì mặc định = 1

      const data = await productService.getProductsByCategorySlug(slug, page);

      res.json({
        success: true,
        message: "Lấy sản phẩm theo danh mục thành công",
        data,
      });
    } catch (err) {
      next(err);
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