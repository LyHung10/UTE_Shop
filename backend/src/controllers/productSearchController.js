import elasticClient from '../config/elasticsearch.js';
import { Product, Category, ProductImage, Review } from '../models/index.js';
import { Op, fn, col } from 'sequelize';
class ProductSearchController {

    // Khởi tạo Elasticsearch
    async initElasticsearch() {
        try {
            console.log('🔄 Initializing Elasticsearch...');

            // Test connection
            await elasticClient.ping();
            console.log('✅ Elasticsearch is running');

            // Tạo index
            await this.createProductIndex();

            // Đồng bộ dữ liệu
            await this.syncProductsToElasticsearch();

            return true;
        } catch (error) {
            console.log('❌ Elasticsearch not available - using MySQL fallback');
            return false;
        }
    }

    // Tạo index với cấu hình fuzzy search
    async createProductIndex() {
        try {
            const indexExists = await elasticClient.indices.exists({
                index: 'products'
            });

            if (!indexExists) {
                await elasticClient.indices.create({
                    index: 'products',
                    body: {
                        settings: {
                            index: {
                                number_of_shards: 1,
                                number_of_replicas: 0,
                                refresh_interval: '30s'
                            }
                        },
                        mappings: {
                            properties: {
                                id: { type: 'keyword' },
                                name: {
                                    type: 'text',
                                    fields: {
                                        keyword: {
                                            type: 'keyword',
                                            ignore_above: 256
                                        }
                                    }
                                },
                                slug: { type: 'keyword' },
                                price: { type: 'float' },
                                description: { type: 'text' },
                                category_name: { type: 'keyword' },
                                images: { type: 'keyword' }
                            }
                        }
                    }
                });
                console.log('✅ Created products index with performance optimization');
            }
        } catch (error) {
            console.error('Error creating index:', error.message);
        }
    }

    // Đồng bộ dữ liệu
    async syncProductsToElasticsearch() {
        try {
            const products = await Product.findAll({
                where: { is_active: true },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['name']
                    },
                    {
                        model: ProductImage,
                        as: 'images',
                        attributes: ['url'],
                        limit: 1
                    }
                ]
            });

            const operations = [];

            for (const product of products) {
                const doc = {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: parseFloat(product.price),
                    original_price: parseFloat(product.original_price),
                    discount_percent: parseFloat(product.discount_percent),
                    description: product.description,
                    category_name: product.category?.name,
                    images: product.images?.map(img => img.url) || []
                };

                operations.push(
                    { index: { _index: 'products', _id: product.id.toString() } },
                    doc
                );
            }

            if (operations.length > 0) {
                await elasticClient.bulk({
                    refresh: true,
                    operations
                });
                console.log(`✅ Synced ${products.length} products`);
            }

        } catch (error) {
            console.error('Error syncing products:', error.message);
        }
    }

    // Gợi ý tìm kiếm - TỐI ƯU TỐC ĐỘ
    async getSearchSuggestions(req, res) {
        const startTime = Date.now();

        try {
            const { q } = req.query;

            // Validate nhanh
            if (!q || q.length < 2) {
                return res.json({
                    success: true,
                    suggestions: [],
                    response_time: Date.now() - startTime
                });
            }

            console.log(`🔍 Search suggestions for: "${q}"`);

            // ƯU TIÊN: Elasticsearch với timeout
            try {
                const elasticsearchPromise = elasticClient.search({
                    index: 'products',
                    body: {
                        query: {
                            bool: {
                                should: [
                                    // 1. Prefix match - nhanh nhất
                                    {
                                        prefix: {
                                            "name.keyword": {
                                                value: q.toLowerCase(),
                                                boost: 3.0
                                            }
                                        }
                                    },
                                    // 2. Match phrase prefix - nhanh
                                    {
                                        match_phrase_prefix: {
                                            "name": {
                                                query: q,
                                                max_expansions: 5,
                                                boost: 2.0
                                            }
                                        }
                                    }
                                ],
                                minimum_should_match: 1
                            }
                        },
                        size: 6,
                        _source: ['id', 'name', 'slug', 'price', 'images'],
                        track_scores: false,
                        track_total_hits: false
                    }
                });

                // Timeout cho Elasticsearch: 300ms
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Elasticsearch timeout')), 300);
                });

                const result = await Promise.race([elasticsearchPromise, timeoutPromise]);

                const suggestions = result.hits.hits.map(hit => ({
                    id: hit._source.id,
                    name: hit._source.name,
                    slug: hit._source.slug,
                    price: hit._source.price,
                    image: hit._source.images?.[0] || null
                }));

                const responseTime = Date.now() - startTime;
                console.log(`✅ ES suggestions: ${responseTime}ms`);

                return res.json({
                    success: true,
                    suggestions,
                    source: 'elasticsearch',
                    response_time: responseTime
                });

            } catch (esError) {
                console.log(`❌ ES failed: ${esError.message}, using MySQL`);
                return this.mysqlSearchSuggestions(req, res, startTime);
            }

        } catch (error) {
            console.error('Search suggestions error:', error);
            const responseTime = Date.now() - startTime;

            res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm gợi ý',
                response_time: responseTime
            });
        }
    }

    // MySQL Fallback - TỐI ƯU TỐC ĐỘ
    async mysqlSearchSuggestions(req, res, startTime) {
        try {
            const { q } = req.query;

            const { Op } = await import('sequelize');

            // Query đơn giản và nhanh
            const products = await Product.findAll({
                where: {
                    is_active: true,
                    name: {
                        [Op.like]: `${q}%`
                    }
                },
                attributes: ['id', 'name', 'slug', 'price'],
                include: [
                    {
                        model: ProductImage,
                        as: 'images',
                        attributes: ['url'],
                        limit: 1,
                        required: false
                    }
                ],
                limit: 6,
                order: [['name', 'ASC']],
                subQuery: false
            });

            const suggestions = products.map(product => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image: product.images?.[0]?.url || null
            }));

            const responseTime = Date.now() - startTime;
            console.log(`✅ MySQL suggestions: ${responseTime}ms`);

            res.json({
                success: true,
                suggestions,
                source: 'mysql',
                response_time: responseTime
            });

        } catch (mysqlError) {
            const responseTime = Date.now() - startTime;
            console.error('MySQL fallback failed:', mysqlError);

            // Trả về kết quả rỗng thay vì lỗi
            res.json({
                success: true,
                suggestions: [],
                source: 'fallback',
                response_time: responseTime
            });
        }
    }

    // TÌM KIẾM TOÀN DIỆN - CHỈ MỘT PHƯƠNG THỨC DUY NHẤT
    async searchProducts(req, res) {
        const start = Date.now();
        const { q, page = 1, limit = 20, fuzzy = "true" } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập từ khóa tìm kiếm",
            });
        }

        const from = (page - 1) * limit;

        try {
            // ✅ Query Elasticsearch
            const query = {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: q,
                                fields: ["name^2", "description"],
                                fuzziness: fuzzy === "true" ? "AUTO" : 0,
                                operator: "or",
                            },
                        },
                    ],
                    filter: [{ term: { is_active: true } }],
                },
            };

            const result = await elasticClient.search({
                index: "products",
                from,
                size: parseInt(limit),
                query,
                sort: [
                    { _score: { order: "desc" } },
                    { "name.keyword": { order: "asc" } },
                ],
                track_total_hits: true,
            });

            const products = result.hits.hits.map((hit) => hit._source);

            const responseTime = Date.now() - start;
            console.log(`✅ Elasticsearch search in ${responseTime}ms, found ${products.length}`);

            // Nếu Elasticsearch có kết quả
            if (products.length > 0) {
                return res.json({
                    success: true,
                    data: {
                        products,
                        pagination: {
                            current_page: +page,
                            total_pages: Math.ceil(result.hits.total.value / limit),
                            total_products: result.hits.total.value,
                        },
                    },
                    source: "elasticsearch",
                    response_time: responseTime,
                });
            }

            // Nếu ES không có kết quả → fallback MySQL
            console.log("⚠️ Không tìm thấy trong Elasticsearch, fallback MySQL...");
            return await this.mysqlSearchProducts(req, res, start);
        } catch (err) {
            console.error("❌ Elasticsearch error:", err.message);
            return await this.mysqlSearchProducts(req, res, start);
        }
    }


    async mysqlSearchProducts(req, res, start) {
        const { q, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        try {
            const { count, rows: products } = await Product.findAndCountAll({
                where: {
                    is_active: true,
                    [Op.or]: [
                        { name: { [Op.like]: `%${q}%` } },
                        { description: { [Op.like]: `%${q}%` } },
                    ],
                },
                attributes: {
                    include: [
                        // ⭐ Trung bình rating
                        [fn("ROUND", fn("AVG", col("reviews.rating")), 2), "avg_rating"],
                        // ⭐ Tổng số lượt đánh giá
                        [fn("COUNT", col("reviews.id")), "review_count"],
                    ],
                },
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "name"],
                    },
                    {
                        model: ProductImage,
                        as: "images",
                        attributes: ["id", "url", "alt", "sort_order"],
                        separate: true, // cần thiết khi có group
                        order: [["sort_order", "ASC"]],
                        limit: 3,
                    },
                    {
                        model: Review,
                        as: "reviews",
                        attributes: [], // chỉ dùng để tính trung bình, không lấy chi tiết
                    },
                ],
                order: [["name", "ASC"]],
                offset,
                limit: +limit,
                subQuery: false,
                group: ["Product.id", "category.id"], // quan trọng để tránh lỗi COUNT sai
                distinct: true,
            });

            const responseTime = Date.now() - start;
            console.log(`✅ MySQL search in ${responseTime}ms, found ${products.length}`);

            return res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        current_page: +page,
                        total_pages: Math.ceil(count / limit),
                        total_products: count,
                    },
                },
                source: "mysql",
                response_time: responseTime,
            });
        } catch (err) {
            const responseTime = Date.now() - start;
            console.error("❌ MySQL search failed:", err.message);

            return res.status(500).json({
                success: false,
                message: "Không thể tìm kiếm sản phẩm",
                response_time: responseTime,
            });
        }

    }
    // Tìm kiếm nâng cao
    async advancedSearch(req, res) {
        const startTime = Date.now();

        try {
            const {
                q,
                category,
                min_price,
                max_price,
                page = 1,
                limit = 20
            } = req.query;

            const from = (page - 1) * limit;

            // Thử Elasticsearch
            try {
                const boolQuery = {
                    must: [],
                    filter: [{ term: { is_active: true } }]
                };

                // Text search
                if (q) {
                    boolQuery.must.push({
                        multi_match: {
                            query: q,
                            fields: ['name^2', 'description'],
                            fuzziness: 'AUTO'
                        }
                    });
                }

                // Category filter
                if (category) {
                    boolQuery.filter.push({
                        term: { 'category_name.keyword': category }
                    });
                }

                // Price range filter
                if (min_price || max_price) {
                    const priceRange = {};
                    if (min_price) priceRange.gte = parseFloat(min_price);
                    if (max_price) priceRange.lte = parseFloat(max_price);

                    boolQuery.filter.push({
                        range: { price: priceRange }
                    });
                }

                const elasticsearchPromise = elasticClient.search({
                    index: 'products',
                    body: {
                        query: {
                            bool: boolQuery
                        },
                        from,
                        size: parseInt(limit),
                        timeout: '1s'
                    }
                });

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Elasticsearch timeout')), 1000);
                });

                const result = await Promise.race([elasticsearchPromise, timeoutPromise]);

                const products = result.hits.hits.map(hit => hit._source);

                const responseTime = Date.now() - startTime;
                console.log(`✅ ES advanced search: ${responseTime}ms`);

                return res.json({
                    success: true,
                    data: {
                        products,
                        pagination: {
                            current_page: parseInt(page),
                            total_pages: Math.ceil(result.hits.total.value / limit),
                            total_products: result.hits.total.value
                        }
                    },
                    source: 'elasticsearch',
                    response_time: responseTime
                });

            } catch (esError) {
                console.log(`❌ ES advanced search failed: ${esError.message}`);
                return this.mysqlAdvancedSearch(req, res, startTime);
            }

        } catch (error) {
            const responseTime = Date.now() - startTime;
            console.error('Advanced search error:', error);

            res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm nâng cao',
                response_time: responseTime
            });
        }
    }

    // MySQL Advanced Search Fallback
    async mysqlAdvancedSearch(req, res, startTime) {
        try {
            const {
                q,
                category,
                min_price,
                max_price,
                page = 1,
                limit = 20
            } = req.query;

            const { Op } = await import('sequelize');
            const offset = (page - 1) * limit;

            let whereConditions = {
                is_active: true
            };

            // Text search
            if (q) {
                whereConditions[Op.or] = [
                    { name: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } }
                ];
            }

            // Price range
            if (min_price || max_price) {
                whereConditions.price = {};
                if (min_price) whereConditions.price[Op.gte] = parseFloat(min_price);
                if (max_price) whereConditions.price[Op.lte] = parseFloat(max_price);
            }

            const include = [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'],
                    where: category ? { name: { [Op.like]: `%${category}%` } } : undefined
                },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['url'],
                    limit: 3
                }
            ];

            const { count, rows: products } = await Product.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'name', 'slug', 'price', 'description'],
                include: include.filter(inc => !inc.where || (inc.where && Object.keys(inc.where).length > 0)),
                offset,
                limit: parseInt(limit)
            });

            const responseTime = Date.now() - startTime;
            console.log(`✅ MySQL advanced search: ${responseTime}ms`);

            res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(count / limit),
                        total_products: count
                    }
                },
                source: 'mysql',
                response_time: responseTime
            });

        } catch (mysqlError) {
            const responseTime = Date.now() - startTime;
            console.error('MySQL advanced search failed:', mysqlError);

            res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm nâng cao',
                response_time: responseTime
            });
        }
    }
}


const controller = new ProductSearchController();

// Bind tất cả các hàm có dùng "this"
controller.searchProducts = controller.searchProducts.bind(controller);
controller.getSearchSuggestions = controller.getSearchSuggestions.bind(controller);
controller.advancedSearch = controller.advancedSearch.bind(controller);

export default controller;
