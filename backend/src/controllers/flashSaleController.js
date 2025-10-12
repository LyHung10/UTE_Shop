// controllers/flashSaleController.js
const { FlashSale, FlashSaleProduct, Product, ProductImage, Inventory, Review, sequelize, Category } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class FlashSaleController {
    // Lấy flash sale hiện tại và sắp tới
    static async getCurrentFlashSales(req, res) {
        try {
            const now = moment().tz('Asia/Ho_Chi_Minh').toDate();

            const flashSales = await FlashSale.findAll({
                where: {
                    is_active: true,
                    [Op.or]: [
                        {
                            // Active: start_time <= now <= end_time
                            start_time: { [Op.lte]: now },
                            end_time: { [Op.gte]: now }
                        },
                        {
                            // Upcoming: start_time > now
                            start_time: { [Op.gt]: now },
                            end_time: { [Op.gt]: now }
                        }
                    ]
                },
                order: [
                    ['start_time', 'ASC']
                ],
                include: [
                    {
                        model: FlashSaleProduct,
                        as: 'flash_sale_products',
                        where: { is_active: true },
                        required: false,
                        // 🎯 BỎ ORDER Ở ĐÂY VÌ SEQUELIZE KHÔNG ÁP DỤNG TỐT
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'name', 'description', 'slug'],
                                include: [
                                    {
                                        model: ProductImage,
                                        as: 'images',
                                        attributes: ['id', 'url', 'alt', 'sort_order'],
                                        required: false
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            // Tính toán status chính xác cho client
            const flashSalesWithStatus = flashSales.map(flashSale => {
                const startTime = moment(flashSale.start_time).tz('Asia/Ho_Chi_Minh');
                const endTime = moment(flashSale.end_time).tz('Asia/Ho_Chi_Minh');
                const now = moment().tz('Asia/Ho_Chi_Minh');

                let status = 'upcoming';
                if (now.isBetween(startTime, endTime, null, '[]')) {
                    status = 'active';
                } else if (now.isAfter(endTime)) {
                    status = 'ended';
                }

                // 🎯 SẮP XẾP THỦ CÔNG FLASH SALE PRODUCTS THEO sort_order
                const sortedFlashSaleProducts = flashSale.flash_sale_products
                    ?.slice() // Tạo bản copy để không ảnh hưởng đến original array
                    .sort((a, b) => {
                        // Ưu tiên sort_order trước
                        if (a.sort_order !== b.sort_order) {
                            return a.sort_order - b.sort_order;
                        }
                        // Nếu sort_order bằng nhau, sắp xếp theo thời gian tạo
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    }) || [];

                // Transform data để gửi về client
                const transformedFlashSale = {
                    ...flashSale.toJSON(),
                    calculatedStatus: status,
                    // 🎯 DÙNG MẢNG ĐÃ SẮP XẾP
                    products: sortedFlashSaleProducts.map(product => {
                        // Sắp xếp ảnh sản phẩm theo sort_order
                        const sortedProductImages = product.product?.images
                            ?.slice()
                            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];

                        const primaryImage = sortedProductImages[0];

                        return {
                            // Thông tin từ flash_sale_products
                            id: product.id,
                            product_id: product.product_id,
                            flash_price: product.flash_price,
                            original_price: product.original_price,
                            stock_flash_sale: product.stock_flash_sale,
                            limit_per_user: product.limit_per_user,
                            sort_order: product.sort_order,

                            // Thông tin từ product
                            product_name: product.product?.name,
                            product_description: product.product?.description,
                            product_slug: product.product?.slug,

                            // Lấy ảnh từ product
                            product_image: primaryImage?.url || null,
                            product_image_alt: primaryImage?.alt || product.product?.name
                        };
                    })
                };

                return transformedFlashSale;
            });

            return res.json({
                success: true,
                data: flashSalesWithStatus
            });
        } catch (error) {
            console.error('[getCurrentFlashSales] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Service: Cập nhật trạng thái flash sale tự động với timezone VN
    static async updateFlashSaleStatus() {
        try {
            const now = moment().tz('Asia/Ho_Chi_Minh').toDate();

            // Cập nhật flash sale đã kết thúc
            await FlashSale.update(
                { status: 'ended' },
                {
                    where: {
                        status: { [Op.in]: ['upcoming', 'active'] },
                        end_time: { [Op.lt]: now }
                    }
                }
            );

            // Cập nhật flash sale đang active
            await FlashSale.update(
                { status: 'active' },
                {
                    where: {
                        status: 'upcoming',
                        start_time: { [Op.lte]: now },
                        end_time: { [Op.gt]: now }
                    }
                }
            );

            console.log('✅ Đã cập nhật trạng thái flash sale (UTC+7)');
        } catch (error) {
            console.error('❌ Lỗi cập nhật trạng thái flash sale:', error);
        }
    }

    // controllers/flashSaleController.js - Sửa hàm getFlashSaleDetail
    static async getFlashSaleDetail(req, res) {
        try {
            const { id } = req.params;

            const flashSale = await FlashSale.findOne({
                where: {
                    id,
                    is_active: true
                },
                include: [
                    {
                        model: FlashSaleProduct,
                        as: 'flash_sale_products',
                        where: { is_active: true },
                        include: [
                            {
                                model: Product,
                                as: 'product',
                                include: [
                                    {
                                        model: ProductImage,
                                        as: 'images',
                                        attributes: ['id', 'url', 'alt'],
                                        limit: 1
                                    },
                                    {
                                        model: Inventory,
                                        as: 'inventory',
                                        attributes: ['stock', 'reserved']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!flashSale) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy flash sale'
                });
            }

            // Lấy rating riêng để tránh lỗi GROUP BY
            const productIds = flashSale.flash_sale_products.map(fsp => fsp.product_id);

            if (productIds.length > 0) {
                const reviewStats = await Review.findAll({
                    where: { product_id: productIds },
                    attributes: [
                        'product_id',
                        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'review_count']
                    ],
                    group: ['product_id'],
                    raw: true
                });

                // Gán rating vào từng sản phẩm
                flashSale.flash_sale_products.forEach(fsp => {
                    const stats = reviewStats.find(rs => rs.product_id === fsp.product.id);
                    if (stats) {
                        fsp.product.setDataValue('avg_rating', parseFloat(stats.avg_rating) || 0);
                        fsp.product.setDataValue('review_count', parseInt(stats.review_count) || 0);
                    } else {
                        fsp.product.setDataValue('avg_rating', 0);
                        fsp.product.setDataValue('review_count', 0);
                    }
                });
            }

            return res.json({
                success: true,
                data: flashSale
            });
        } catch (error) {
            console.error('[getFlashSaleDetail] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // Sửa cả hàm getFlashSaleProducts
    static async getFlashSaleProducts(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const flashSale = await FlashSale.findOne({
                where: {
                    id,
                    is_active: true,
                    status: { [Op.in]: ['upcoming', 'active'] }
                }
            });

            if (!flashSale) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy flash sale'
                });
            }

            const { count, rows: flashSaleProducts } = await FlashSaleProduct.findAndCountAll({
                where: {
                    flash_sale_id: id,
                    is_active: true
                },
                include: [
                    {
                        model: Product,
                        as: 'product',
                        include: [
                            {
                                model: ProductImage,
                                as: 'images',
                                attributes: ['id', 'url', 'alt'],
                                limit: 1
                            },
                            {
                                model: Inventory,
                                as: 'inventory',
                                attributes: ['stock', 'reserved']
                            }
                        ]
                    }
                ],
                order: [['sort_order', 'ASC']],
                limit: parseInt(limit),
                offset: parseInt(offset),
                distinct: true
            });

            // Lấy rating riêng
            const productIds = flashSaleProducts.map(fsp => fsp.product_id);
            let reviewStats = [];

            if (productIds.length > 0) {
                reviewStats = await Review.findAll({
                    where: { product_id: productIds },
                    attributes: [
                        'product_id',
                        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
                        [sequelize.fn('COUNT', sequelize.col('id')), 'review_count']
                    ],
                    group: ['product_id'],
                    raw: true
                });
            }

            // Gán rating vào từng sản phẩm
            const productsWithRating = flashSaleProducts.map(fsp => {
                const stats = reviewStats.find(rs => rs.product_id === fsp.product.id);
                const productData = fsp.toJSON();

                if (stats) {
                    productData.product.avg_rating = parseFloat(stats.avg_rating) || 0;
                    productData.product.review_count = parseInt(stats.review_count) || 0;
                } else {
                    productData.product.avg_rating = 0;
                    productData.product.review_count = 0;
                }

                return productData;
            });

            return res.json({
                success: true,
                data: {
                    products: productsWithRating,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(count / limit),
                        total_items: count,
                        items_per_page: parseInt(limit)
                    }
                }
            });
        } catch (error) {
            console.error('[getFlashSaleProducts] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // API cho admin - Tạo flash sale
    static async createFlashSale(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { name, description, start_time, end_time, banner_image, products } = req.body;

            // Convert to Vietnam timezone
            const startTimeVN = moment.tz(start_time, 'Asia/Ho_Chi_Minh').toDate();
            const endTimeVN = moment.tz(end_time, 'Asia/Ho_Chi_Minh').toDate();

            // Validate thời gian
            if (startTimeVN >= endTimeVN) {
                return res.status(400).json({
                    success: false,
                    message: 'Thời gian kết thúc phải sau thời gian bắt đầu'
                });
            }

            const now = moment().tz('Asia/Ho_Chi_Minh').toDate();
            let status = 'upcoming';
            if (now >= startTimeVN && now <= endTimeVN) {
                status = 'active';
            } else if (now > endTimeVN) {
                status = 'ended';
            }

            const flashSale = await FlashSale.create({
                name,
                description,
                start_time: startTimeVN,
                end_time: endTimeVN,
                banner_image,
                status
            }, { transaction });

            // Thêm sản phẩm vào flash sale
            if (products && products.length > 0) {
                const flashSaleProducts = products.map(product => ({
                    flash_sale_id: flashSale.id,
                    product_id: product.product_id,
                    flash_price: product.flash_price,
                    original_price: product.original_price,
                    stock_flash_sale: product.stock_flash_sale,
                    limit_per_user: product.limit_per_user || 1,
                    sort_order: product.sort_order || 0
                }));

                await FlashSaleProduct.bulkCreate(flashSaleProducts, { transaction });
            }

            await transaction.commit();

            return res.status(201).json({
                success: true,
                message: 'Tạo flash sale thành công',
                data: flashSale
            });
        } catch (error) {
            await transaction.rollback();
            console.error('[createFlashSale] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // API cho admin - Cập nhật flash sale
    static async updateFlashSale(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const updateData = req.body;

            const flashSale = await FlashSale.findByPk(id);
            if (!flashSale) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy flash sale'
                });
            }

            await flashSale.update(updateData, { transaction });
            await transaction.commit();

            return res.json({
                success: true,
                message: 'Cập nhật flash sale thành công',
                data: flashSale
            });
        } catch (error) {
            await transaction.rollback();
            console.error('[updateFlashSale] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }

    // API cho admin - Thêm sản phẩm vào flash sale
    // controllers/flashSaleController.js - Sửa hàm addProductToFlashSale
    static async addProductToFlashSale(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { products } = req.body;

            const flashSale = await FlashSale.findByPk(id);
            if (!flashSale) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy flash sale'
                });
            }

            const productIds = products.map(p => p.product_id);

            // 🎯 KIỂM TRA TRÙNG SẢN PHẨM TRONG FLASH SALE
            const existingProducts = await FlashSaleProduct.findAll({
                where: {
                    flash_sale_id: id,
                    product_id: productIds
                },
                attributes: ['product_id'],
                raw: true
            });

            const existingProductIds = existingProducts.map(p => p.product_id);
            const duplicateIds = productIds.filter(id => existingProductIds.includes(id));

            if (duplicateIds.length > 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm đã tồn tại trong flash sale: ${duplicateIds.join(', ')}`,
                    duplicate_ids: duplicateIds
                });
            }

            // 🎯 KIỂM TRA SỐ LƯỢNG TỒN KHO THỰC TẾ
            const inventories = await Inventory.findAll({
                where: { product_id: productIds },
                attributes: ['product_id', 'stock', 'reserved'],
                raw: true
            });

            const stockErrors = [];
            for (const product of products) {
                const inventory = inventories.find(inv => inv.product_id === product.product_id);
                if (!inventory) {
                    stockErrors.push(`Sản phẩm ${product.product_id} không tồn tại trong kho`);
                    continue;
                }

                const availableStock = inventory.stock - inventory.reserved;
                if (product.stock_flash_sale > availableStock) {
                    stockErrors.push(`Sản phẩm ${product.product_id}: Số lượng flash sale (${product.stock_flash_sale}) vượt quá tồn kho khả dụng (${availableStock})`);
                }
            }

            if (stockErrors.length > 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Lỗi kiểm tra tồn kho',
                    errors: stockErrors
                });
            }

            // KIỂM TRA SẢN PHẨM CÓ TỒN TẠI
            const existingProductCheck = await Product.findAll({
                where: { id: productIds, is_active: true },
                attributes: ['id'],
                raw: true
            });

            const existingValidIds = existingProductCheck.map(p => p.id);
            const invalidIds = productIds.filter(id => !existingValidIds.includes(id));

            if (invalidIds.length > 0) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Không tìm thấy sản phẩm hoặc sản phẩm không active: ${invalidIds.join(', ')}`,
                    invalid_ids: invalidIds
                });
            }

            const flashSaleProducts = products.map(product => ({
                flash_sale_id: parseInt(id),
                product_id: product.product_id,
                flash_price: product.flash_price,
                original_price: product.original_price,
                stock_flash_sale: product.stock_flash_sale,
                limit_per_user: product.limit_per_user || 1,
                sort_order: product.sort_order || 0
            }));

            await FlashSaleProduct.bulkCreate(flashSaleProducts, { transaction });
            await transaction.commit();

            return res.json({
                success: true,
                message: 'Thêm sản phẩm vào flash sale thành công',
                added_count: products.length
            });
        } catch (error) {
            await transaction.rollback();
            console.error('[addProductToFlashSale] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }
    // API cho admin - Xóa flash sale
    static async deleteFlashSale(req, res) {
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;

            const flashSale = await FlashSale.findByPk(id);
            if (!flashSale) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy flash sale'
                });
            }

            // Xóa các sản phẩm trong flash sale trước
            await FlashSaleProduct.destroy({
                where: { flash_sale_id: id },
                transaction
            });

            // Xóa flash sale
            await flashSale.destroy({ transaction });

            await transaction.commit();

            return res.json({
                success: true,
                message: 'Xóa flash sale thành công'
            });
        } catch (error) {
            await transaction.rollback();
            console.error('[deleteFlashSale] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    }
    // Service: Cập nhật trạng thái flash sale tự động
    static async updateFlashSaleStatus() {
        try {
            const now = new Date();

            // Cập nhật flash sale đã kết thúc
            await FlashSale.update(
                { status: 'ended' },
                {
                    where: {
                        status: { [Op.in]: ['upcoming', 'active'] },
                        end_time: { [Op.lt]: now }
                    }
                }
            );

            // Cập nhật flash sale đang active
            await FlashSale.update(
                { status: 'active' },
                {
                    where: {
                        status: 'upcoming',
                        start_time: { [Op.lte]: now },
                        end_time: { [Op.gt]: now }
                    }
                }
            );

            console.log('✅ Đã cập nhật trạng thái flash sale');
        } catch (error) {
            console.error('❌ Lỗi cập nhật trạng thái flash sale:', error);
        }
    }

    static async searchProducts(req, res) {
        try {
            const { q: searchTerm, limit = 20 } = req.query;

            if (!searchTerm || searchTerm.trim() === '') {
                return res.json({
                    success: true,
                    data: []
                });
            }

            // Build where condition - CHỈ TÌM THEO NAME VÀ ID
            const whereCondition = {
                is_active: true
            };

            // Kiểm tra nếu searchTerm là số (tìm theo ID)
            const searchTermAsNumber = parseInt(searchTerm);
            if (!isNaN(searchTermAsNumber)) {
                // Tìm theo ID
                whereCondition.id = searchTermAsNumber;
            } else {
                // Tìm theo tên
                whereCondition.name = {
                    [Op.like]: `%${searchTerm}%`
                };
            }

            // Tìm kiếm sản phẩm
            const products = await Product.findAll({
                where: whereCondition,
                include: [
                    {
                        model: ProductImage,
                        as: 'images',
                        attributes: ['id', 'url', 'alt', 'sort_order'],
                        required: false
                    },
                    {
                        model: Inventory,
                        as: 'inventory',
                        attributes: ['stock', 'reserved'],
                        required: false
                    },
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['id', 'name'],
                        required: false
                    }
                ],
                attributes: [
                    'id',
                    'name',
                    'price',
                    'description',
                    'slug',
                    'is_active',
                    'featured',
                    'view_count',
                    'sale_count'
                ],
                order: [
                    ['name', 'ASC']
                ],
                limit: parseInt(limit)
            });

            // Transform data
            const transformedProducts = products.map(product => {
                const productJSON = product.toJSON();

                // Lấy ảnh chính (sắp xếp theo sort_order)
                const sortedImages = productJSON.images?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                const primaryImage = sortedImages?.[0];

                return {
                    id: productJSON.id,
                    name: productJSON.name,
                    price: productJSON.price,
                    description: productJSON.description,
                    slug: productJSON.slug,

                    // Thông tin ảnh
                    images: productJSON.images,
                    image: primaryImage?.url || null,
                    image_alt: primaryImage?.alt || productJSON.name,

                    // Thông tin inventory
                    stock: productJSON.inventory?.stock || 0,
                    reserved: productJSON.inventory?.reserved || 0,
                    available_stock: (productJSON.inventory?.stock || 0) - (productJSON.inventory?.reserved || 0),

                    // Thông tin category
                    category: productJSON.category,

                    // Thông tin khác từ product
                    is_active: productJSON.is_active,
                    featured: productJSON.featured,
                    view_count: productJSON.view_count,
                    sale_count: productJSON.sale_count,

                    // Trạng thái tồn kho
                    in_stock: (productJSON.inventory?.stock || 0) > 0
                };
            });

            return res.json({
                success: true,
                data: transformedProducts
            });

        } catch (error) {
            console.error('[searchProducts] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi tìm kiếm sản phẩm',
                error: error.message
            });
        }
    }
}

module.exports = FlashSaleController;