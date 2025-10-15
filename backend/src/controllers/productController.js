import productService from "../services/productService";
import { Op } from "sequelize";
import { Product, Category, ProductImage, Inventory } from "../models";
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

  async getDistinctSizesAndColors(req, res, next) {
    try {
      // Ưu tiên đọc slug từ params nếu có (ví dụ: /categories/:slug/filters)
      // Hoặc từ query (?categorySlug=...)
      const { slug } = req.params;
      const { categorySlug: qsSlug, onlyActive = "true" } = req.query;

      const opts = {
        categorySlug: qsSlug ?? slug ?? null,
        // "false" (string) => false, còn lại true
        onlyActive: String(onlyActive).toLowerCase() !== "false",
      };

      const { sizes, colors } = await productService.getDistinctSizesAndColors(opts);

      res.json({
        success: true,
        sizes,
        colors,
      });
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

      // ====== NEW: price filters ======
      // Hỗ trợ:
      // - ?priceMin=100000&priceMax=300000
      // - ?priceRange=0-200000&priceRange=300000-500000 (nhiều khoảng)
      // - hoặc ?priceRange=0-200000,300000-500000 (dạng CSV)
      const toNumberOrUndef = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      const priceMin = toNumberOrUndef(req.query.priceMin);
      const priceMax = toNumberOrUndef(req.query.priceMax);

      // priceRange có thể là string đơn, CSV, hoặc mảng nhiều giá trị
      const rawPriceRange = req.query.priceRange;
      let priceRange;
      if (Array.isArray(rawPriceRange)) {
        priceRange = rawPriceRange.filter(Boolean).map((s) => s.trim()).filter(Boolean);
        if (!priceRange.length) priceRange = undefined;
      } else if (typeof rawPriceRange === "string" && rawPriceRange.trim()) {
        const arr = rawPriceRange
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        priceRange = arr.length > 1 ? arr : arr[0]; // service chấp nhận string hoặc array
      }
      // ====== END price filters ======

      const data = await productService.getProductsByCategorySlug(slug, page, limit, {
        sizes,
        colors,
        sort,
        ...(priceMin !== undefined ? { priceMin } : {}),
        ...(priceMax !== undefined ? { priceMax } : {}),
        ...(priceRange !== undefined ? { priceRange } : {}),
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

  // Phần cho Admin
  async addProduct(req, res) {
    try {
      // Hàm chuyển đổi color name thành object với class
      const mapColorToObject = (colorName) => {
        const colorMap = {
          'Red': 'bg-gradient-to-br from-red-400 to-red-600',
          'Blue': 'bg-gradient-to-br from-blue-400 to-blue-600',
          'Black': 'bg-gradient-to-br from-gray-800 to-black',
          'Gray': 'bg-gradient-to-br from-gray-400 to-gray-600',
          'Brown': 'bg-gradient-to-br from-yellow-600 to-yellow-800',
          'White': 'bg-gradient-to-br from-gray-100 to-white border border-gray-300',
          'Silver': 'bg-gradient-to-br from-gray-300 to-gray-400',
          'Gold': 'bg-gradient-to-br from-yellow-300 to-yellow-500',
          'Green': 'bg-gradient-to-br from-green-400 to-green-600',
          'Yellow': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          'Orange': 'bg-gradient-to-br from-orange-400 to-orange-600',
          'Purple': 'bg-gradient-to-br from-purple-400 to-purple-600',
          'Pink': 'bg-gradient-to-br from-pink-400 to-pink-600',
        };

        // Mặc định nếu không tìm thấy
        const defaultClass = 'bg-gradient-to-br from-gray-400 to-gray-600';

        return {
          name: colorName,
          class: colorMap[colorName] || defaultClass
        };
      };

      const productData = {
        name: req.body.name,
        slug: req.body.slug,
        short_description: req.body.short_description,
        description: req.body.description,
        price: req.body.price,
        original_price: req.body.original_price,
        discount_percent: req.body.discount_percent,
        is_active: req.body.is_active,
        tryon: req.body.tryon,
        featured: req.body.featured,
        category_id: req.body.category_id,
        // Sửa phần colors ở đây
        colors: req.body.colors ? JSON.parse(req.body.colors).map(color => mapColorToObject(color)) : [],
        sizes: req.body.sizes ? JSON.parse(req.body.sizes) : []
      };

      const inventoryData = {
        stock: req.body.stock || 0,
        reserved: req.body.reserved || 0
      };

      const product = await productService.createProductWithImages(
        productData,
        req.files,
        inventoryData // Truyền inventoryData vào
      );

      res.status(201).json({
        success: true,
        message: 'Thêm sản phẩm thành công',
        data: product
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Thêm sản phẩm thất bại',
        error: error.message
      });
    }
  }
  // Lấy danh sách sản phẩm với phân trang và filter
  async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        category_id,
        is_active,
        featured
      } = req.query;

      const offset = (page - 1) * limit;

      let whereCondition = {};

      // Tìm kiếm theo tên
      if (search) {
        whereCondition.name = { [Op.like]: `%${search}%` };
      }

      // Filter theo category
      if (category_id) {
        whereCondition.category_id = category_id;
      }

      // Filter theo trạng thái
      if (is_active !== undefined) {
        whereCondition.is_active = is_active === 'true';
      }

      if (featured !== undefined) {
        whereCondition.featured = featured === 'true';
      }

      const { count, rows: products } = await Product.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'url', 'alt', 'sort_order']
          },
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['id', 'stock', 'reserved']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(count / limit),
          totalItems: count
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách sản phẩm',
        error: error.message
      });
    }
  };

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      // Hàm chuyển đổi color name thành object với class
      const mapColorToObject = (colorName) => {
        const colorMap = {
          'Red': 'bg-gradient-to-br from-red-400 to-red-600',
          'Blue': 'bg-gradient-to-br from-blue-400 to-blue-600',
          'Black': 'bg-gradient-to-br from-gray-800 to-black',
          'Gray': 'bg-gradient-to-br from-gray-400 to-gray-600',
          'Brown': 'bg-gradient-to-br from-yellow-600 to-yellow-800',
          'White': 'bg-gradient-to-br from-gray-100 to-white border border-gray-300',
          'Silver': 'bg-gradient-to-br from-gray-300 to-gray-400',
          'Gold': 'bg-gradient-to-br from-yellow-300 to-yellow-500',
          'Green': 'bg-gradient-to-br from-green-400 to-green-600',
          'Yellow': 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          'Orange': 'bg-gradient-to-br from-orange-400 to-orange-600',
          'Purple': 'bg-gradient-to-br from-purple-400 to-purple-600',
          'Pink': 'bg-gradient-to-br from-pink-400 to-pink-600',
        };

        const defaultClass = 'bg-gradient-to-br from-gray-400 to-gray-600';

        return {
          name: colorName,
          class: colorMap[colorName] || defaultClass
        };
      };

      // Parse dữ liệu từ form-data
      const productData = {
        name: req.body.name,
        slug: req.body.slug,
        short_description: req.body.short_description,
        description: req.body.description,
        price: req.body.price,
        original_price: req.body.original_price,
        discount_percent: req.body.discount_percent,
        is_active: req.body.is_active,
        tryon: req.body.tryon, // 👈 Sửa từ try_on thành tryon
        featured: req.body.featured,
        category_id: req.body.category_id,
        colors: req.body.colors ? JSON.parse(req.body.colors).map(color => mapColorToObject(color)) : [], // 👈 Thêm mapColorToObject
        sizes: req.body.sizes ? JSON.parse(req.body.sizes) : []
      };

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      await product.update(productData);

      // Cập nhật inventory từ stock và reserved
      if (req.body.stock !== undefined || req.body.reserved !== undefined) {
        const inventoryData = {};

        if (req.body.stock !== undefined) {
          inventoryData.stock = parseInt(req.body.stock);
        }

        if (req.body.reserved !== undefined) {
          inventoryData.reserved = parseInt(req.body.reserved);
        }

        await Inventory.update(inventoryData, {
          where: { product_id: id }
        });
      }

      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: ProductImage, as: 'images' },
          { model: Inventory, as: 'inventory' }
        ]
      });

      res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: updatedProduct
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Cập nhật sản phẩm thất bại',
        error: error.message
      });
    }
  }

  // Xóa sản phẩm
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      await product.destroy();

      res.json({
        success: true,
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Xóa sản phẩm thất bại',
        error: error.message
      });
    }
  };

  // Cập nhật ảnh sản phẩm
  async updateProductImages(req, res) {
    try {
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ít nhất một ảnh'
        });
      }

      // Xóa ảnh cũ
      await ProductImage.destroy({ where: { product_id: id } });

      // Thêm ảnh mới
      const images = req.files.map((file, index) => ({
        product_id: id,
        url: file.path,
        alt: file.originalname,
        sort_order: index + 1,
      }));

      await ProductImage.bulkCreate(images);

      const updatedProduct = await Product.findByPk(id, {
        include: [{ model: ProductImage, as: 'images' }]
      });

      res.json({
        success: true,
        message: 'Cập nhật ảnh sản phẩm thành công',
        data: updatedProduct
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Cập nhật ảnh sản phẩm thất bại',
        error: error.message
      });
    }
  };
}
export default new ProductController();