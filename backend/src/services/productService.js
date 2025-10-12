import { OrderItem, Product, ProductImage, Inventory, Review, Category, Order, User } from "../models/index.js";
import { Op, fn, col, literal } from "sequelize";

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
        // Lấy thông tin product cơ bản
        const product = await Product.findByPk(id, {
            attributes: {
                include: ['colors', 'sizes']
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
                    model: Category,
                    as: "category",
                    attributes: ["name","slug"]
                }
            ],
        });

        if (!product) return null;

        // Query riêng để lấy thống kê reviews - SỬA LỖI Ở ĐÂY
        const reviewStats = await Review.findOne({
            where: { product_id: id },
            attributes: [
                [fn("AVG", col("rating")), "avg_rating"],
                [fn("COUNT", col("id")), "review_count"]
            ],
            raw: true
        });

        // Tăng view_count
        product.view_count += 1;
        await product.save();

        // Thêm thống kê reviews vào product
        // Nên format avg_rating thành số và làm tròn
        const avgRating = parseFloat(reviewStats?.avg_rating) || 0;
        product.setDataValue('avg_rating', Number(avgRating.toFixed(2))); // Làm tròn 1 chữ số
        product.setDataValue('review_count', reviewStats?.review_count || 0);

        // Thêm reviews chi tiết vào product
        // product.setDataValue('reviews', reviews);

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
    async getProductsByCategorySlug(
        slug,
        page = 1,
        limit = 20,
        opts = {} // { sizes, colors, sort, priceMin, priceMax, priceRange }
    ) {
        const offset = (page - 1) * limit;

        const toArray = (v) =>
            Array.isArray(v)
                ? v
                : typeof v === "string"
                    ? v.split(",").map((s) => s.trim()).filter(Boolean)
                    : undefined;

        const sizesArr = toArray(opts.sizes);
        const colorsArr = toArray(opts.colors);
        const sortKey = opts.sort; // 'popularity' | 'rating' | 'newest' | 'price_asc' | 'price_desc'

        // ==== [A] Build điều kiện WHERE cho MySQL JSON ====
        // gom các điều kiện vào AND
        const andConds = [];

        // SIZES: mảng JSON các chuỗi
        if (sizesArr?.length) {
            // JSON_OVERLAPS(sizes, ['S','M']) — nếu không khả dụng sẽ fallback OR JSON_CONTAINS phía dưới
            andConds.push(
                fn(
                    "IF",
                    fn(
                        "COALESCE",
                        fn(
                            "JSON_OVERLAPS",
                            col("sizes"),
                            literal(`CAST('${JSON.stringify(sizesArr)}' AS JSON)`)
                        ),
                        null
                    ),
                    1,
                    1
                )
            );

            // Fallback: (JSON_CONTAINS(sizes, '"S"') OR JSON_CONTAINS(sizes, '"M"') ...)
            const sizeOr = {
                [Op.or]: sizesArr.map((s) => ({
                    [Op.and]: [
                        literal(`JSON_CONTAINS(sizes, ${JSON.stringify(JSON.stringify(s))}) = 1`)
                    ]
                })),
            };
            andConds.push(sizeOr);
        }

        // COLORS: mảng JSON các object { name, class }
        if (colorsArr?.length) {
            // JSON_SEARCH(colors, 'one', 'Red', NULL, '$[*].name') IS NOT NULL
            const colorOr = {
                [Op.or]: colorsArr.map((c) => ({
                    [Op.and]: [
                        literal(`JSON_SEARCH(colors, 'one', ${JSON.stringify(c)}, NULL, '$[*].name') IS NOT NULL`)
                    ]
                })),
            };
            andConds.push(colorOr);
        }

        // ==== [A.3] PRICE FILTER (trên field `price`) ====
        const sanitizeNumber = (v) => {
            const n = Number(v);
            return Number.isFinite(n) && n >= 0 ? n : null;
        };

        // Hỗ trợ:
        // - opts.priceMin / opts.priceMax (số)
        // - opts.priceRange: "min-max" hoặc ["min-max", "min-max", ...]
        let priceCond = null;

        if (opts?.priceRange) {
            const toRanges = (val) => Array.isArray(val) ? val : [val];
            const ranges = toRanges(opts.priceRange)
                .map((r) => {
                    if (typeof r !== "string") return null;
                    const [a, b] = r.split("-").map((x) => sanitizeNumber(x?.trim()));
                    if (a === null && b === null) return null;
                    // Chuẩn hóa min/max
                    let min = a ?? 0;
                    let max = b ?? Number.MAX_SAFE_INTEGER;
                    if (min > max) [min, max] = [max, min];
                    return { min, max };
                })
                .filter(Boolean);

            if (ranges.length) {
                // (price BETWEEN min AND max) OR ...
                priceCond = {
                    [Op.or]: ranges.map(({ min, max }) => ({
                        price: { [Op.between]: [min, max] }
                    })),
                };
            }
        } else if (opts?.priceMin != null || opts?.priceMax != null) {
            let min = sanitizeNumber(opts.priceMin);
            let max = sanitizeNumber(opts.priceMax);
            if (!(min === null && max === null)) {
                if (min === null) min = 0;
                if (max === null) max = Number.MAX_SAFE_INTEGER;
                if (min > max) [min, max] = [max, min];
                priceCond = { price: { [Op.between]: [min, max] } };
            }
        }

        if (priceCond) andConds.push(priceCond);

        // ==== END PRICE FILTER ====

        const productWhere = andConds.length ? { [Op.and]: andConds } : {};

        // ==== [B] Map sort → order ====
        let order = [];
        let useRatingGroup = false;
        switch (sortKey) {
            case "price_asc":
                order = [["price", "ASC"]];
                break;
            case "price_desc":
                order = [["price", "DESC"]];
                break;
            case "newest":
                order = [["created_at", "DESC"]];
                break;
            default:
                order = [["sale_count", "DESC"]];
                break;
        }

        const categoryInclude = {
            model: Category,
            as: "category",
            attributes: ["id", "name", "slug"],
        };

// Chỉ filter khi slug có giá trị thực sự và KHÔNG phải 'all'
        if (slug && slug !== "all") {
            categoryInclude.where = { slug };
            categoryInclude.required = true; // inner join khi lọc theo danh mục
        }

        const baseIncludes = [
            categoryInclude,
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
        ];

        if (useRatingGroup) {
            const { rows: products, count } = await Product.findAndCountAll({
                where: productWhere,
                include: [
                    ...baseIncludes,
                    { model: Review, as: "reviews", attributes: [] },
                ],
                attributes: {
                    include: [
                        [fn("AVG", col("reviews.rating")), "avg_rating"],
                        [fn("COUNT", col("reviews.id")), "review_count"],
                    ],
                },
                group: ["Product.id"],
                order: [[fn("AVG", col("reviews.rating")), "DESC"], ["created_at", "DESC"]],
                limit,
                offset,
                subQuery: false,
                distinct: true,
            });
            const totalItems = Array.isArray(count) ? count.length : count;
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

        const { rows: products, count: totalItems } = await Product.findAndCountAll({
            where: productWhere,
            include: [
                ...baseIncludes,
                { model: Review, as: "reviews", attributes: ["id", "rating", "text", "created_at"] },
            ],
            order,
            limit,
            offset,
            distinct: true,
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

    async getDistinctSizesAndColors(opts = {}) {
        const { categorySlug = null, onlyActive = true } = opts;

        const where = {};
        if (onlyActive) where.is_active = true;

        const include = [];
        if (categorySlug && categorySlug !== "all") {
            include.push({
                model: Category,
                as: "category",
                attributes: ["id", "name", "slug"],
                where: { slug: categorySlug },
            });
        }

        // Chỉ lấy 2 field cần thiết để nhẹ query
        const rows = await Product.findAll({
            where,
            include,
            attributes: ["sizes", "colors"],
            raw: true,
        });

        // Helpers
        const parseMaybeJSON = (v) => {
            if (v == null) return null;
            if (typeof v === "string") {
                try { return JSON.parse(v); } catch { return null; }
            }
            return v; // đã là JSON
        };

        // Thu thập & khử trùng lặp
        const sizeSet = new Set();
        const colorMap = new Map(); // key: `${name}|${cls}` (lowercase) → value: {name, class}

        for (const r of rows) {
            const sizes = parseMaybeJSON(r.sizes) ?? r.sizes;
            if (Array.isArray(sizes)) {
                for (const s of sizes) {
                    if (typeof s === "string") {
                        const key = s.trim();
                        if (key) sizeSet.add(key);
                    }
                }
            }

            const colors = parseMaybeJSON(r.colors) ?? r.colors;
            if (Array.isArray(colors)) {
                for (let c of colors) {
                    if (!c) continue;
                    if (typeof c === "string") {
                        try { c = JSON.parse(c); } catch { continue; }
                    }
                    const name = (c.name ?? "").trim();
                    const cls  = (c.class ?? c.className ?? "").trim();
                    if (!name) continue;
                    const k = `${name}|${cls}`.toLowerCase();
                    if (!colorMap.has(k)) colorMap.set(k, { name, class: cls });
                }
            }
        }

        // Sắp xếp đẹp mắt
        const preferredSizeOrder = ["XXS","XS","S","M","L","XL","2XL","3XL","4XL","One Size"];
        const sizes = [...sizeSet].sort((a, b) => {
            const ia = preferredSizeOrder.indexOf(a);
            const ib = preferredSizeOrder.indexOf(b);
            if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            // nếu không thuộc order ưu tiên → sort chữ cái/ số tự nhiên
            return a.localeCompare(b, "vi", { numeric: true, sensitivity: "base" });
        });

        const colors = [...colorMap.values()].sort((a, b) =>
            a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
        );

        return { sizes, colors };
    }

}

export default new ProductService();
