import { OrderItem, Product, ProductImage, Inventory, Review, Category, Order } from "../models/index.js";
import { Op, fn, col } from "sequelize";

class ProductService {
    async getProductEngagement(productId) {
        // 1. Lấy danh sách user_id đã mua sản phẩm trong các order "completed"
        const buyerRows = await Order.findAll({
            where: { status: "completed" }, // chỉ lấy đơn hoàn thành
            include: [
                {
                    model: OrderItem,
                    where: { product_id: productId },
                    attributes: [],
                },
            ],
            attributes: ["user_id"],
            group: ["Order.user_id"], // group để loại trùng user
            raw: true,
        });

        const buyersCount = buyerRows.length; // số khách mua duy nhất

        // 2. Đếm tất cả các review (số dòng) cho sản phẩm
        const reviewsCount = await Review.count({
            where: { product_id: productId },
        });

        return {
            buyersCount,
            reviewsCount,
        };
    }

    // 1. Lấy 8 sản phẩm có view_count cao nhất

    async getMostViewed(limit = 8) {
        return await Product.findAll({
            attributes: {
                include: [
                    // trung bình rating
                    [fn("AVG", col("reviews.rating")), "avg_rating"],
                    // tổng số review
                    [fn("COUNT", col("reviews.id")), "review_count"],
                ],
            },
            order: [["view_count", "DESC"]],
            limit,
            include: [
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    separate: true, // để order trong include không bị lỗi khi group
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: Review,
                    as: "reviews",
                    attributes: [], // không lấy toàn bộ review, chỉ dùng để tính toán
                },
            ],
            group: ["Product.id"], // phải group theo Product.id để AVG, COUNT hoạt động
            subQuery: false,
        });
    }

    // 2. Lấy 6 sản phẩm có discount_percent cao nhất
    async getTopDiscount(limit = 6) {
        return await Product.findAll({
            attributes: {
                include: [
                    [fn("AVG", col("reviews.rating")), "avg_rating"],    // trung bình rating
                    [fn("COUNT", col("reviews.id")), "review_count"],   // số lượt review
                ],
            },
            order: [["discount_percent", "DESC"]],
            limit,
            include: [
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    separate: true, // tránh lỗi group khi có nhiều ảnh
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: Review,
                    as: "reviews",
                    attributes: [], // chỉ dùng để tính toán
                },
            ],
            group: ["Product.id"],
            subQuery: false,
        });
    }
    // 3. Lấy toàn bộ sản phẩm có phân trang
    async getAllProducts(page = 1, size = 10) {
        const offset = (page - 1) * size;
        const { count, rows } = await Product.findAndCountAll({
            offset,
            limit: size,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    order: [["sort_order", "ASC"]],
                },
                { model: Review, as: "reviews", attributes: [] },

            ],

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
        const product = await Product.findByPk(id, {
            attributes: {
                include: ['colors', 'sizes'] // đảm bảo Sequelize lấy 2 cột này
            },
            include: [
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: Inventory,
                    as: "inventory",
                    attributes: ["stock", "reserved"],
                },
                {
                    model: Review,
                    as: "reviews",
                    attributes: [],
                },
            ],
        });
        if (!product) return null;

        // Tăng view_count
        product.view_count += 1;
        await product.save();

        return product;
    }

    async getNewestProducts(limit = 8) {
        return await Product.findAll({
            attributes: {
                include: [
                    [fn("AVG", col("reviews.rating")), "avg_rating"],    // trung bình rating
                    [fn("COUNT", col("reviews.id")), "review_count"],   // số lượt review
                ],
            },
            order: [["created_at", "DESC"]],
            limit,
            include: [
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    separate: true,
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: Review,
                    as: "reviews",
                    attributes: [],
                },
            ],
            group: ["Product.id"],
            subQuery: false,
        });
    }


    async getBestSellingProducts(limit = 6) {
        return await Product.findAll({
            attributes: {
                include: [
                    [fn("AVG", col("reviews.rating")), "avg_rating"],
                    [fn("COUNT", col("reviews.id")), "review_count"],
                ],
            },
            order: [["sale_count", "DESC"]],
            limit,
            include: [
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    separate: true,
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: Review,
                    as: "reviews",
                    attributes: [],
                },
            ],
            group: ["Product.id"],
            subQuery: false,
        });
    }

    // 5. Thêm sản phẩm + ảnh cloud
    async createProductWithImages(productData, files = []) {
        // 1. Tạo product
        const product = await Product.create(productData);

        // 2. Lưu hình ảnh (nếu có)
        if (files.length) {
            const images = files.map((file, index) => ({
                product_id: product.id,
                url: file.path, // multer-cloudinary trả về path là URL Cloudinary
                alt: file.originalname,
                sort_order: index + 1,
            }));
            await ProductImage.bulkCreate(images);
        }

        // 3. Trả về product kèm images
        return await Product.findByPk(product.id, {
            include: [{ model: ProductImage, as: "images" }],
        });
    }

    async getProductsByCategorySlug(slug, page, limit = 3) {
        const offset = (page - 1) * limit;

        // lấy dữ liệu + tổng số sản phẩm để tính totalPages
        const { rows: products, count: totalItems } = await Product.findAndCountAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name", "slug"],
                    where: { slug }, // lọc theo slug
                },
                {
                    model: ProductImage,
                    as: "images",
                    attributes: ["id", "url", "alt", "sort_order"],
                    order: [["sort_order", "ASC"]],
                },
                {
                    model: Inventory,
                    as: "inventory",
                    attributes: ["stock", "reserved"],
                },
                {
                    model: Review,
                    as: "reviews",
                    attributes: ["id", "rating", "text", "created_at"],
                },
            ],
            limit,
            offset,
            distinct: true, // tránh bị count sai khi join nhiều bảng
        });

        return {
            products,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                pageSize: limit,
            },
        };
    }

    async getSimilarProducts(productId, limit = 12) {
        const id = Number(productId);
        if (!Number.isFinite(id)) return [];

        // 1) Lấy sản phẩm gốc
        const base = await Product.findByPk(id, {
            attributes: [
                "id", "category_id", "price", "original_price", "discount_percent", "colors", "sizes", "is_active", "featured",
                "sale_count", "view_count"
            ],
            include: [{ model: Category, as: "category", attributes: ["id", "name", "slug"] }],
        });
        if (!base || !base.is_active) return [];

        // 2) Dải giá ±20% (tối thiểu 50k)
        const basePrice = Number(base.price || 0);
        const delta = Math.max(50000, Math.floor(basePrice * 0.2));
        const minPrice = Math.max(0, basePrice - delta);
        const maxPrice = basePrice + delta;

        // 3) Ứng viên: cùng danh mục, gần giá, active, exclude chính nó
        const candidates = await Product.findAll({
            where: {
                id: { [Op.ne]: base.id },
                is_active: true,
                category_id: base.category_id,
                price: { [Op.between]: [minPrice, maxPrice] },
            },
            attributes: [
                "id", "name", "slug", "price", "original_price", "discount_percent", "colors", "sizes", "featured", "sale_count", "view_count"
            ],
            include: [{ model: ProductImage, as: "images", attributes: ["id", "url"], required: false }],

            order: [
                ["featured", "DESC"],
                ["sale_count", "DESC"],
                ["view_count", "DESC"],
            ],
            limit: limit * 3, // lấy rộng hơn để chấm điểm
        });

        // 4) Chấm điểm nhẹ theo trùng màu/size + gần giá
        const baseColors = Array.isArray(base.colors) ? base.colors : [];
        const baseSizes = Array.isArray(base.sizes) ? base.sizes : [];

        const scored = candidates.map(p => {
            const colors = Array.isArray(p.colors) ? p.colors : [];
            const sizes = Array.isArray(p.sizes) ? p.sizes : [];
            const overlapColors = colors.filter(c => baseColors.includes(c)).length;
            const overlapSizes = sizes.filter(s => baseSizes.includes(s)).length;
            const priceDiff = Math.abs(Number(p.price || 0) - basePrice);

            const score =
                overlapColors * 3 +
                overlapSizes * 2 +
                (p.featured ? 1 : 0) +
                Math.max(0, 2 - Math.floor(priceDiff / Math.max(1, basePrice * 0.1)));

            return { item: p, score, priceDiff };
        });

        scored.sort((a, b) => b.score - a.score || a.priceDiff - b.priceDiff);

        let result = scored.slice(0, limit).map(x => x.item);

        // 5) Fallback: nếu chưa đủ, nới lỏng bỏ điều kiện giá (1 lần)
        if (result.length < limit) {
            const need = limit - result.length;
            const widen = await Product.findAll({
                where: {
                    id: { [Op.notIn]: [base.id, ...result.map(r => r.id)] },
                    is_active: true,
                    category_id: base.category_id,
                },
                attributes: ["id", "name", "slug", "price", "original_price", "discount_percent", "colors", "sizes", "featured", "sale_count", "view_count"],
                include: [{ model: ProductImage, as: "images", attributes: ["id", "url"], required: false }],
                order: [
                    ["featured", "DESC"],
                    ["sale_count", "DESC"],
                    ["view_count", "DESC"],
                ],
                limit: need,
            });
            result = result.concat(widen);
        }

        return result;
    }
}

export default new ProductService();
