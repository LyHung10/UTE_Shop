// controllers/productSearchController.js
import elasticClient from '../config/elasticsearch.js';
import { Product, Category, ProductImage, Review } from '../models/index.js';
import { Op, fn, col } from 'sequelize';

class ProductSearchController {
    buildSuggestionLikeBoolQuery(q, opts = {}) {
        const { category } = opts;
        const should = [
            // Ưu tiên cụm đúng trong name
            { match_phrase: { name: { query: q, boost: 5 } } },
            // Mở rộng tiền tố trong name (autocomplete)
            { match_phrase_prefix: { name: { query: q, max_expansions: 20, boost: 3 } } },
            // Thêm 1 match "AND" để nhặt các sắp xếp từ khóa gần nhau
            { match: { name: { query: q, operator: 'and', fuzziness: 0, boost: 1.5 } } },
        ];

        const filter = [{ term: { is_active: true } }];
        if (category) {
            // category_name đã là keyword → KHÔNG dùng .keyword
            filter.push({ term: { category_name: category } });
        }

        return {
            bool: {
                should,
                filter,
                minimum_should_match: 1,
            },
        };
    }
    // Khởi tạo Elasticsearch
    async initElasticsearch() {
        try {
            // Test connection
            await elasticClient.ping();

            // Tạo index
            await this.createProductIndex();

            // Đồng bộ dữ liệu
            await this.syncProductsToElasticsearch();

            return true;
        } catch (error) {
            console.error('initElasticsearch error:', error?.message || error);
            return false;
        }
    }

    // Tạo index với mapping đầy đủ (bao gồm is_active)
    async createProductIndex() {
        try {
            const { body: exists } = await elasticClient.indices.exists({ index: 'products' });
            if (exists) {
                console.log('ℹ️ Index [products] already exists — skipping creation.');
                return;
            }

            await elasticClient.indices.create({
                index: 'products',
                body: {
                    settings: {
                        analysis: {
                            filter: {
                                edge_ngram_filter: {
                                    type: 'edge_ngram',
                                    min_gram: 2,
                                    max_gram: 15
                                }
                            },
                            analyzer: {
                                vn_text: {
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding'] // bỏ dấu + lowercase
                                },
                                vn_edge_ngram: {
                                    tokenizer: 'standard',
                                    filter: ['lowercase', 'asciifolding', 'edge_ngram_filter']
                                }
                            }
                        },
                        index: {
                            number_of_shards: 1,
                            number_of_replicas: 0,
                            refresh_interval: '30s'
                        }
                    },
                    mappings: {
                        properties: {
                            id: { type: 'keyword' },
                            is_active: { type: 'boolean' },
                            name: {
                                type: 'text',
                                analyzer: 'vn_text',
                                search_analyzer: 'vn_text',
                                fields: {
                                    keyword: { type: 'keyword', ignore_above: 256 },
                                    ngram: { type: 'text', analyzer: 'vn_edge_ngram', search_analyzer: 'vn_text' } // cho gợi ý/prefix
                                }
                            },
                            slug: { type: 'keyword' },
                            price: { type: 'float' },
                            original_price: { type: 'float' },
                            discount_percent: { type: 'float' },
                            description: { type: 'text', analyzer: 'vn_text', search_analyzer: 'vn_text' },
                            category_name: { type: 'keyword' },
                            images: { type: 'keyword' }
                        }
                    }
                }
            });

            console.log('✅ Created index [products] with VN analyzers');
        } catch (error) {
            if (error?.meta?.body?.error?.type === 'resource_already_exists_exception') {
                console.log('ℹ️ Index [products] already exists — skipping creation.');
                return;
            }
            console.error('❌ Error creating index:', error.message);
            throw error;
        }
    }

    // Đồng bộ dữ liệu từ MySQL sang Elasticsearch (bulk)
    async syncProductsToElasticsearch() {
        try {
            const products = await Product.findAll({
                where: { is_active: true },
                include: [
                    { model: Category, as: 'category', attributes: ['name'] },
                    { model: ProductImage, as: 'images', attributes: ['url'], limit: 1 },
                ],
            });

            const operations = [];

            for (const product of products) {
                const doc = {
                    id: product.id,
                    is_active: product.is_active === true,
                    name: product.name,
                    slug: product.slug,
                    price: parseFloat(product.price),
                    original_price: parseFloat(product.original_price),
                    discount_percent: parseFloat(product.discount_percent),
                    description: product.description,
                    category_name: product.category?.name,
                    images: product.images?.map((img) => img.url) || [],
                };

                operations.push(
                    { index: { _index: 'products', _id: product.id.toString() } },
                    doc
                );
            }

            if (operations.length > 0) {
                const { body: bulkRes } = await elasticClient.bulk({ refresh: true, operations });
                if (bulkRes?.errors) {
                    const firstErr = bulkRes.items?.find((i) => i.index && i.index.error)?.index?.error;
                    console.error('Bulk indexing had errors:', firstErr || 'Unknown error');
                } else {
                    console.log(`✅ Synced ${products.length} products to Elasticsearch`);
                }
            }
        } catch (error) {
            console.error('Error syncing products:', error.message);
            throw error;
        }
    }

    // Gợi ý tìm kiếm - tối ưu tốc độ, ưu tiên name
    async getSearchSuggestions(req, res) {
        const startTime = Date.now();
        try {
            const { q } = req.query;

            // Validate nhanh
            if (!q || q.length < 2) {
                return res.json({
                    success: true,
                    suggestions: [],
                    response_time: Date.now() - startTime,
                });
            }

            // Thử Elasticsearch với timeout 300ms
            try {
                const elasticsearchPromise = elasticClient.search({
                    index: 'products',
                    query: {
                        bool: {
                            should: [
                                { match_phrase_prefix: { name: { query: q, max_expansions: 5, boost: 3.0 } } },
                                { match: { name: { query: q, operator: 'and', fuzziness: 0, boost: 1.5 } } },
                            ],
                            filter: [{ term: { is_active: true } }],
                            minimum_should_match: 1,
                        },
                    },
                    size: 6,
                    _source: ['id', 'name', 'slug', 'price', 'images'],
                    track_scores: false,
                    track_total_hits: false,
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Elasticsearch timeout')), 300)
                );

                const { body: result } = await Promise.race([elasticsearchPromise, timeoutPromise]);

                const suggestions = (result.hits?.hits || []).map((hit) => ({
                    id: hit._source.id,
                    name: hit._source.name,
                    slug: hit._source.slug,
                    price: hit._source.price,
                    image: hit._source.images?.[0] || null,
                }));

                return res.json({
                    success: true,
                    suggestions,
                    source: 'elasticsearch',
                    response_time: Date.now() - startTime,
                });
            } catch (esError) {
                // Fallback MySQL
                return this.mysqlSearchSuggestions(req, res, startTime);
            }
        } catch (error) {
            console.error('Search suggestions error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm gợi ý',
                response_time: Date.now() - startTime,
            });
        }
    }

    // MySQL Fallback - TỐI ƯU TỐC ĐỘ
    async mysqlSearchSuggestions(req, res, startTime) {
        try {
            const { q } = req.query;

            const products = await Product.findAll({
                where: {
                    is_active: true,
                    name: { [Op.like]: `${q}%` },
                },
                attributes: ['id', 'name', 'slug', 'price'],
                include: [
                    {
                        model: ProductImage,
                        as: 'images',
                        attributes: ['url'],
                        limit: 1,
                        required: false,
                    },
                ],
                limit: 6,
                order: [['name', 'ASC']],
                subQuery: false,
            });

            const suggestions = products.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                image: p.images?.[0]?.url || null,
            }));

            return res.json({
                success: true,
                suggestions,
                source: 'mysql',
                response_time: Date.now() - startTime,
            });
        } catch (mysqlError) {
            console.error('MySQL fallback failed:', mysqlError);
            return res.json({
                success: true,
                suggestions: [],
                source: 'fallback',
                response_time: Date.now() - startTime,
            });
        }
    }

    // TÌM KIẾM TOÀN DIỆN
// controllers/productSearchController.js
    async searchProducts(req, res) {
        const start = Date.now();
        const { q, page = 1, limit = 20, category } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập từ khóa tìm kiếm' });
        }

        const from = (page - 1) * limit;

        try {
            const { body: result } = await elasticClient.search({
                index: 'products',
                from,
                size: parseInt(limit),
                query: this.buildSuggestionLikeBoolQuery(q, { category }),
                // Giữ sort giống gợi ý: chủ yếu dựa vào _score; sau đó sort name tăng dần
                sort: [{ _score: { order: 'desc' } }, { 'name.keyword': { order: 'asc' } }],
                track_total_hits: true,
                _source: true, // nếu bạn muốn trả full fields từ ES; hoặc chỉ chọn vài field như ở suggestions
            });

            const products = (result.hits?.hits ?? []).map(hit => hit._source);

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
                    source: 'elasticsearch',
                    response_time: Date.now() - start,
                });
            }

            // Nếu ES không có kết quả → fallback MySQL (prefix như suggestions)
            return await this.mysqlSearchProducts(req, res, start);
        } catch (err) {
            console.error('❌ Elasticsearch error:', err?.message || err);
            return await this.mysqlSearchProducts(req, res, start);
        }
    }

// controllers/productSearchController.js
    async mysqlSearchProducts(req, res, start) {
        const { q, page = 1, limit = 20, category } = req.query;
        const offset = (page - 1) * limit;

        try {
            const include = [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name'],
                    where: category ? { name: { [Op.like]: category } } : undefined,
                },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'url', 'alt', 'sort_order'],
                    separate: true,
                    order: [['sort_order', 'ASC']],
                    limit: 3,
                },
                {
                    model: Review,
                    as: 'reviews',
                    attributes: [],
                },
            ];

            // GIỐNG GỢI Ý: chỉ prefix name, không quét description
            const whereText = {
                name: { [Op.like]: `${q}%` },
            };

            const { count, rows: products } = await Product.findAndCountAll({
                where: {
                    is_active: true,
                    ...whereText,
                },
                attributes: {
                    include: [
                        [fn('ROUND', fn('AVG', col('reviews.rating')), 2), 'avg_rating'],
                        [fn('COUNT', col('reviews.id')), 'review_count'],
                    ],
                },
                include,
                order: [['name', 'ASC']],
                offset,
                limit: +limit,
                subQuery: false,
                group: ['Product.id', 'category.id'],
                distinct: true,
            });

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
                source: 'mysql',
                response_time: Date.now() - start,
            });
        } catch (err) {
            console.error('❌ MySQL search failed:', err?.message || err);
            return res.status(500).json({
                success: false,
                message: 'Không thể tìm kiếm sản phẩm',
                response_time: Date.now() - start,
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
                limit = 20,
            } = req.query;

            const from = (page - 1) * limit;

            try {
                const boolQuery = {
                    must: [],
                    filter: [{ term: { is_active: true } }],
                };

                if (q) {
                    boolQuery.must.push({
                        multi_match: {
                            query: q,
                            fields: ['name^2', 'description'],
                            fuzziness: 'AUTO',
                        },
                    });
                }

                if (category) {
                    // category_name đã là keyword → KHÔNG dùng .keyword
                    boolQuery.filter.push({ term: { category_name: category } });
                }

                if (min_price || max_price) {
                    const priceRange = {};
                    if (min_price) priceRange.gte = parseFloat(min_price);
                    if (max_price) priceRange.lte = parseFloat(max_price);
                    boolQuery.filter.push({ range: { price: priceRange } });
                }

                const esPromise = elasticClient.search({
                    index: 'products',
                    query: { bool: boolQuery },
                    from,
                    size: parseInt(limit),
                    timeout: '1s',
                    track_total_hits: true,
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Elasticsearch timeout')), 1000)
                );

                const { body: result } = await Promise.race([esPromise, timeoutPromise]);

                const products = (result.hits?.hits || []).map((hit) => hit._source);

                return res.json({
                    success: true,
                    data: {
                        products,
                        pagination: {
                            current_page: parseInt(page),
                            total_pages: Math.ceil(result.hits.total.value / limit),
                            total_products: result.hits.total.value,
                        },
                    },
                    source: 'elasticsearch',
                    response_time: Date.now() - startTime,
                });
            } catch (esError) {
                console.log(`❌ ES advanced search failed: ${esError.message}`);
                return this.mysqlAdvancedSearch(req, res, startTime);
            }
        } catch (error) {
            console.error('Advanced search error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm nâng cao',
                response_time: Date.now() - startTime,
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
                limit = 20,
            } = req.query;

            const offset = (page - 1) * limit;

            let whereConditions = { is_active: true };

            if (q) {
                whereConditions[Op.or] = [
                    { name: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } },
                ];
            }

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
                    where: category ? { name: { [Op.like]: `%${category}%` } } : undefined,
                },
                { model: ProductImage, as: 'images', attributes: ['url'], limit: 3 },
            ];

            const { count, rows: products } = await Product.findAndCountAll({
                where: whereConditions,
                attributes: ['id', 'name', 'slug', 'price', 'description'],
                include: include.filter((inc) => !inc.where || (inc.where && Object.keys(inc.where).length > 0)),
                offset,
                limit: parseInt(limit),
            });

            return res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(count / limit),
                        total_products: count,
                    },
                },
                source: 'mysql',
                response_time: Date.now() - startTime,
            });
        } catch (mysqlError) {
            console.error('MySQL advanced search failed:', mysqlError);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm nâng cao',
                response_time: Date.now() - startTime,
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
