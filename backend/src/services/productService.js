
const { Product } = require("../models");

class ProductService {
    // 1. Lấy 8 sản phẩm có view_count cao nhất
    async getMostViewed(limit = 8) {
        return await Product.findAll({
            order: [["view_count", "DESC"]],
            limit,
        });
    }

    // 2. Lấy 4 sản phẩm có discount cao nhất
    async getTopDiscount(limit = 4) {
        return await Product.findAll({
            order: [["discount_percent", "DESC"]],
            limit,
        });
    }

    // 3. Lấy toàn bộ sản phẩm có phân trang
    async getAllProducts(page = 1, size = 10) {
        const offset = (page - 1) * size;
        const { count, rows } = await Product.findAndCountAll({
            offset,
            limit: size,
            order: [["createdAt", "DESC"]],
        });

        return {
            totalItems: count,
            totalPages: Math.ceil(count / size),
            currentPage: page,
            products: rows,
        };
    }

    // 4. Khi xem chi tiết sản phẩm + tăng view_count
    async getProductById(id) {
        const product = await Product.findByPk(id);
        if (!product) return null;

        // Tăng view_count
        product.view_count += 1;
        await product.save();

        return product;
    }
}

module.exports = new ProductService();
