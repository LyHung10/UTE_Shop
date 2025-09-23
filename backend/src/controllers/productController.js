import productService from "../services/productService";
import fs from 'fs';
import path from 'path';
import { generateText } from 'ai';

class ProductController {
  async tryOnClothes(req, res) {
    try {
      const personFile = req.files?.person?.[0];
      const clothFile = req.files?.cloth?.[0];

      if (!personFile || !clothFile) {
        return res.status(400).json({ error: "Thiếu file ảnh người hoặc quần áo" });
      }

      const promptText = 'Apply the cloth to the person realistically, keeping perspective and folds.';

      const result = await generateText({
        model: 'google/gemini-2.5-flash-image-preview',
        providerOptions: {
          google: { responseModalities: ['TEXT', 'IMAGE'] }, // ✅ Không cần API key
        },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'file', mediaType: personFile.mimetype, data: fs.readFileSync(personFile.path) },
              { type: 'file', mediaType: clothFile.mimetype, data: fs.readFileSync(clothFile.path) },
            ],
          },
        ],
      });

      // Lấy ảnh đầu tiên trả về
      const imageFile = result.files.find(f => f.mediaType?.startsWith('image/'));
      if (!imageFile) return res.status(500).json({ error: "Không có ảnh nào được tạo" });

      // Lưu ra file output
      const outputDir = path.join(process.cwd(), 'uploads', 'tryon');
      fs.mkdirSync(outputDir, { recursive: true });
      const filename = `tryon-${Date.now()}.png`;
      const filepath = path.join(outputDir, filename);
      await fs.promises.writeFile(filepath, imageFile.uint8Array);

      res.json({
        message: 'Ảnh try-on đã tạo',
        url: `/uploads/tryon/${filename}`,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
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