// controllers/flashSaleController.js
const { FlashSale, FlashSaleProduct, Product, ProductImage, Inventory, Review, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

class FlashSaleController {
    // Lấy flash sale hiện tại và sắp tới
    static async getCurrentFlashSales(req, res) {
        try {
            const now = moment().tz('Asia/Ho_Chi_Minh').toDate(); // Sử dụng timezone VN

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
                        required: false
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

                return {
                    ...flashSale.toJSON(),
                    calculatedStatus: status // Thêm status tính toán
                };
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

            const flashSaleProducts = products.map(product => ({
                flash_sale_id: parseInt(id),
                product_id: product.product_id,
                flash_price: product.flash_price,
                original_price: product.original_price,
                stock_flash_sale: product.stock_flash_sale,
                limit_per_user: product.limit_per_user || 1,
                sort_order: product.sort_order || 0
            }));

            await FlashSaleProduct.bulkCreate(flashSaleProducts, {
                transaction,
                updateOnDuplicate: ['flash_price', 'original_price', 'stock_flash_sale', 'limit_per_user', 'sort_order', 'updated_at']
            });

            await transaction.commit();

            return res.json({
                success: true,
                message: 'Thêm sản phẩm vào flash sale thành công'
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
}

module.exports = FlashSaleController;