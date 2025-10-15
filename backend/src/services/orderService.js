import { sequelize } from "../config/configdb";

const { Order, OrderItem, Product, ProductImage, Inventory, Payment, User, Voucher, Address, FlashSale, FlashSaleProduct } = require('../models');
import paymentService from './paymentService.js';
import voucherService from "./voucherService";
import esult, { implodeEntry } from "nodemailer-express-handlebars/.yarn/releases/yarn-1.22.22";
import { Op } from "sequelize";
class OrderService {
    static async getUserOrders(userId, options = {}) {
        const {
            status,
            from,
            to,
            page = 1,
            pageSize = 10,
            sort = '-created_at'
        } = options;

        const where = {
            user_id: userId,
            ...(status
                    ? { status }
                    : { status: { [Op.ne]: 'PENDING' } }
            )
        };

        if (from || to) {
            where.created_at = {};
            if (from) where.created_at[Op.gte] = new Date(from);
            if (to) where.created_at[Op.lte] = new Date(to);
        }

        const orderBy =
            sort === 'created_at'
                ? [['created_at', 'ASC']]
                : [['created_at', 'DESC']];

        const { rows, count } = await Order.findAndCountAll({
            where,
            order: orderBy,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            distinct: true,
            include: [
                {
                    model: OrderItem,
                    attributes: ['id', 'qty', 'price', 'product_id', 'color', 'size', 'status'],
                    include: [
                        {
                            model: Product,
                            attributes: ['id', 'name', 'price', 'original_price', 'discount_percent'],
                            include: [
                                {
                                    model: ProductImage,
                                    as: 'images',
                                    attributes: ['url'],
                                    separate: true,
                                    limit: 1
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['address_line', 'ward', 'district', 'city', 'postal_code', 'name_order', 'phone_order']
                }
                // ❌ Không join Voucher để khỏi dính lỗi cột `code` không tồn tại
            ]
        });

        // Tính discount cho từng order dựa trên voucher_id (nếu có)
        const data = await Promise.all(rows.map(async (o) => {
            const items = Array.isArray(o?.OrderItems) ? o.OrderItems : [];

            const mappedItems = items.map((it) => {
                const prod = it.Product;
                const firstImage = prod && Array.isArray(prod.images) && prod.images.length > 0
                    ? prod.images[0].url
                    : null;

                return {
                    id: it.id,
                    qty: Number(it.qty) || 0,
                    price: Number(it.price) || 0,
                    color: it.color,
                    size: it.size,
                    status: it.status,
                    product: prod ? {
                        id: prod.id,
                        name: prod.name,
                        price: Number(prod.price) || 0,
                        original_price: prod.original_price != null ? Number(prod.original_price) : null,
                        discount_percent: prod.discount_percent != null ? Number(prod.discount_percent) : null,
                        image: firstImage
                    } : null
                };
            });

            const subtotal = mappedItems.reduce((sum, i) => sum + (i.price * i.qty), 0);

            // Nếu DB đã có total_amount thì ưu tiên dùng; nếu không thì dùng subtotal
            const totalAmount = o.total_amount != null
                ? Number(o.total_amount) || 0
                : Number(subtotal.toFixed(2));

            // 👉 TÍNH DISCOUNT: nếu có voucher_id thì validate dựa trên slug (hoặc code nếu có cột đó)
            let discount = 0;
            if (o.voucher_id) {
                const v = await Voucher.findByPk(o.voucher_id);
                if (v) {
                    const voucherCodeOrSlug = v.slug; // dùng slug an toàn
                    const result = await voucherService.validateVoucher(voucherCodeOrSlug, subtotal);
                    if (result?.valid) {
                        discount = Number(result.discount || 0);
                    }
                }
            }

            const addr = o.address
                ? {
                    text: [
                        o.address.address_line,
                        o.address.ward,
                        o.address.district,
                        o.address.city,
                        o.address.postal_code
                    ].filter(Boolean).join(', '),
                    detail: {
                        address_line: o.address.address_line,
                        ward: o.address.ward,
                        district: o.address.district,
                        city: o.address.city,
                        postal_code: o.address.postal_code,
                        name_order: o.address.name_order,
                        phone_order: o.address.phone_order
                    }
                }
                : null;

            return {
                order: {
                    id: o.id,
                    status: o.status,
                    created_at: o.created_at || o.createdAt,
                    updated_at: o.updated_at || o.updatedAt,
                    total_amount: totalAmount
                },
                address: addr,
                discount,       // 🆕 số tiền giảm (0 nếu không có voucher)
                items: mappedItems
            };
        }));

        return {
            success: true,
            message: "Lấy danh sách đơn hàng thành công",
            pagination: {
                page,
                page_size: pageSize,
                total: count
            },
            data
        };
    }

    static async getDetailOrder(userId, orderId) {
        try {
            const whereClause = userId
                ? { id: orderId, user_id: userId }
                : { id: orderId };
            // === Tìm đơn hàng thuộc user ===
            const order = await Order.findOne({
                where: whereClause,
                include: [
                    {
                        model: OrderItem,
                        include: [
                            {
                                model: Product,
                                attributes: ["id", "name", "price", "original_price", "discount_percent"],
                                include: [
                                    {
                                        model: ProductImage,
                                        as: "images",
                                        attributes: ["url"],
                                        separate: true,
                                        limit: 1
                                    }
                                ]
                            }
                        ]
                    },
                    { model: Payment },
                    { model: Address, as: "address" } // lấy địa chỉ giao hàng
                ]
            });

            if (!order) {
                return { success: false, message: "Không tìm thấy đơn hàng này." };
            }

            // === Tính tổng phụ (subtotal) ===
            const items = Array.isArray(order.OrderItems) ? order.OrderItems : [];
            const subtotal = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

            // === Tính discount nếu có voucher ===
            let discount = 0;
            if (order.voucher_id) {
                const voucher = await Voucher.findByPk(order.voucher_id);
                if (voucher) {
                    if (voucher.discount_type === 'percent') {
                        discount = (subtotal * voucher.discount_value) / 100;
                        if (voucher.max_discount && discount > voucher.max_discount) {
                            discount = voucher.max_discount;
                        }
                    } else if (voucher.discount_type === 'fixed') {
                        discount = voucher.discount_value;
                    }
                }
            }
            console.log(discount);

            // === Format danh sách sản phẩm ===
            const mappedItems = items.map((it) => {
                const prod = it.Product;
                const firstImage = prod && Array.isArray(prod.images) && prod.images.length > 0
                    ? prod.images[0].url
                    : null;

                return {
                    id: it.id,
                    qty: Number(it.qty) || 0,
                    price: Number(it.price) || 0,
                    color: it.color,
                    size: it.size,
                    status: it.status,
                    product: prod ? {
                        id: prod.id,
                        name: prod.name,
                        price: Number(prod.price) || 0,
                        original_price: prod.original_price != null ? Number(prod.original_price) : null,
                        discount_percent: prod.discount_percent != null ? Number(prod.discount_percent) : null,
                        image: firstImage
                    } : null
                };
            });

            // === Gộp địa chỉ giao hàng ===
            const addr = order.address
                ? {
                    text: [
                        order.address.address_line,
                        order.address.ward,
                        order.address.district,
                        order.address.city,
                        order.address.postal_code
                    ].filter(Boolean).join(', '),
                    detail: {
                        address_line: order.address.address_line,
                        ward: order.address.ward,
                        district: order.address.district,
                        city: order.address.city,
                        postal_code: order.address.postal_code,
                        name_order: order.address.name_order,
                        phone_order: order.address.phone_order
                    }
                }
                : null;

            // === Format dữ liệu trả về ===
            const totalAmount = Number(order.total_amount ?? subtotal - discount);

            const data = {
                order: {
                    id: order.id,
                    status: order.status,
                    created_at: order.created_at || order.createdAt,
                    updated_at: order.updated_at || order.updatedAt,
                    total_amount: totalAmount,
                    discount,
                    voucher_id: order.voucher_id ?? null,
                    payment_method: order.Payment?.method || null,
                    payment_status: order.Payment?.status || null
                },
                address: addr,
                items: mappedItems
            };

            return {
                success: true,
                message: "Lấy chi tiết đơn hàng thành công",
                data
            };
        } catch (err) {
            console.error("[getDetailOrder] error:", err);
            return {
                success: false,
                message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng",
                error: err.message
            };
        }
    }

    static async addToCart(userId, productId, qty, color, size) {
        if (qty <= 0) return { success: false, message: 'Số lượng không hợp lệ' };
        if (qty > 10) return { success: false, message: 'Số lượng không vượt quá 10' };

        const product = await Product.findByPk(productId);
        if (!product) return { success: false, message: 'Sản phẩm không tồn tại' };

        const inventory = await Inventory.findOne({ where: { product_id: productId } });
        if (!inventory) {
            return { success: false, message: 'Sản phẩm này hiện chưa có trong kho' };
        }
        if (inventory.stock <= 0) {
            return { success: false, message: 'Sản phẩm đã hết hàng' };
        }
        if (qty > inventory.stock - inventory.reserved) {
            return { success: false, message: `Chỉ còn ${inventory.stock - inventory.reserved} sản phẩm trong kho` };
        }

        if (size && product.sizes && !product.sizes.includes(size)) {
            return { success: false, message: `Kích thước không hợp lệ. Kích thước hợp lệ: ${product.sizes.join(', ')}` };
        }

        if (color && product.colors && product.colors.length > 0) {
            const colorNames = typeof product.colors[0] === 'object'
                ? product.colors.map(c => c.name)
                : product.colors;
            if (!colorNames.some(c => c.toLowerCase() === color.toLowerCase())) {
                return { success: false, message: `Màu không hợp lệ. Màu hợp lệ: ${colorNames.join(', ')}` };
            }
        }

        // Tìm order PENDING
        let order = await Order.findOne({ where: { user_id: userId, status: 'PENDING' } });
        if (!order) {
            order = await Order.create({ user_id: userId, status: 'PENDING', total_amount: 0 });
        }

        const whereCondition = {
            order_id: order.id,
            product_id: productId,
            color: color || null,
            size: size || null
        };

        let item = await OrderItem.findOne({ where: whereCondition });

        if (item) {
            const newQty = item.qty + qty;

            // ✅ Kiểm tra tổng số lượng không vượt quá tồn kho
            if (newQty > inventory.stock - inventory.reserved) {
                return { success: false, message: `Chỉ còn ${inventory.stock - inventory.reserved} sản phẩm trong kho` };
            }

            if (newQty > 10) {
                return { success: false, message: 'Số lượng không vượt quá 10' };
            }

            item.qty = newQty;
            await item.save();
        } else {
            if (qty > inventory.stock - inventory.reserved) {
                return { success: false, message: `Chỉ còn ${inventory.stock - inventory.reserved} sản phẩm trong kho` };
            }

            item = await OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                qty,
                price: product.price,
                color: color || null,
                size: size || null
            });
        }

        // Lấy lại thông tin product kèm ảnh
        const productWithImage = await Product.findByPk(item.product_id, {
            attributes: ['id', 'name', 'price', 'original_price', 'discount_percent', 'colors', 'sizes'],
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['url'],
                    limit: 1
                }
            ]
        });

        return {
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: {
                id: item.id,
                order_id: item.order_id,
                product_id: item.product_id,
                qty: item.qty,
                price: item.price,
                color: item.color,
                size: item.size,
                status: item.status,
                product: {
                    id: productWithImage.id,
                    name: productWithImage.name,
                    price: productWithImage.price,
                    original_price: productWithImage.original_price,
                    discount_percent: productWithImage.discount_percent,
                    image: productWithImage.images.length > 0 ? productWithImage.images[0].url : null
                }
            }
        };
    }

    static async getCart(userId, voucherCode = null) {
        let statusVoucher = true;
        let message = "";
        const order = await Order.findOne({
            where: { user_id: userId, status: 'PENDING' },
            include: [{
                model: OrderItem,
                include: {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'original_price', 'discount_percent'],
                    include: [
                        { model: ProductImage, as: 'images', attributes: ['url'], limit: 1 }
                    ]
                }
            }]
        });

        if (!order) return { items: [], total: 0 };

        const items = order.OrderItems;
        let total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

        let discount = 0;
        let appliedVoucher = null;

        if (voucherCode) {
            const result = await voucherService.validateVoucher(voucherCode, total);
            if (result.valid) {
                discount = result.discount;
                appliedVoucher = result.voucher.slug;
            }
            else
            {
                statusVoucher = result.valid;
                message = result.message;
            }
        }

        const finalTotal = Math.max(total - discount, 0);

        return {
            success: statusVoucher,
            message,
            items,
            total,
            itemCount: items.length,
            discount,
            finalTotal,
            appliedVoucher
        };
    }

    static async removeItem(userId, itemId) {
        const orderItem = await OrderItem.findOne({
            where: { id: itemId },
            include: [{ model: Order, where: { user_id: userId, status: 'PENDING' } }]
        });
        if (!orderItem) throw new Error('Cart item not found');

        const orderId = orderItem.Order.id;
        await orderItem.destroy();

        const remainingItems = await OrderItem.findAll({ where: { order_id: orderId } });
        const order = await Order.findByPk(orderId);

        order.total_amount = remainingItems.length
            ? remainingItems.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0)
            : 0;

        await orderItem.save(); // hoặc destroy
        return await OrderService.getCart(userId);

    }

    static async clearCart(userId) {
        const order = await Order.findOne({ where: { user_id: userId, status: 'PENDING' } });
        if (!order) return { items: [], totalAmount: 0 };

        await OrderItem.destroy({ where: { order_id: order.id } });
        order.total_amount = 0;
        await order.save();

        return { items: [], totalAmount: 0 };
    }

    static async getCartByUser(userId) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'PENDING' },
            include: [{ model: OrderItem, include: Product }]
        });

        if (!order) return { items: [], totalAmount: 0 };

        return {
            items: order.OrderItems,
            totalAmount: order.OrderItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0)
        };
    }

    static async getCartByOrderId(orderId) {
        const cartItems = await OrderItem.findAll({
            where: { order_id: orderId },
            include: [
                { model: Product, attributes: ['id', 'name', 'price', 'image', 'colors', 'sizes'] }
            ],
            order: [['created_at', 'DESC']]
        });

        const totalAmount = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

        return { items: cartItems, totalAmount };
    }

    static async checkoutCOD(userId, voucherCode, addressId, shippingFee) {
        const tax = 40000;
        const fee = Number(shippingFee ?? 0);
        console.log('🚀 Bắt đầu checkout COD');

        // ĐẢM BẢO OP ĐƯỢC IMPORT ĐÚNG
        const { Op } = require('sequelize');

        return await Order.sequelize.transaction(async (t) => {
            const order = await Order.findOne({
                where: { user_id: userId, status: 'PENDING' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order || order.OrderItems.length === 0) return {
                success: false,
                message: "Giỏ hàng trống",
            }

            console.log('📦 Order found:', order.id, 'with items:', order.OrderItems.length);

            if (!addressId) return {
                success: false,
                message: "Vui lòng chọn địa chỉ để thanh toán!",
            }

            const address = await Address.findOne({
                where: { id: addressId, user_id: userId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!address) return {
                success: false,
                message: "Địa chỉ không tồn tại!",
            }
            else {
                order.address_id = addressId;
            }

            // Lấy thời gian hiện tại để kiểm tra flash sale
            const currentTime = new Date();
            console.log('⏰ Current time for flash sale check:', currentTime.toISOString());

            for (const item of order.OrderItems) {
                console.log('\n🔍 Processing item:', {
                    productId: item.product_id,
                    productName: item.Product?.name,
                    quantity: item.qty
                });

                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!inv) return {
                    success: false,
                    message: "Không tìm thấy sản phẩm trong kho!",
                }

                const available = (inv.stock || 0) - (inv.reserved || 0);
                console.log('📊 Inventory check:', {
                    stock: inv.stock,
                    reserved: inv.reserved,
                    available: available,
                    needed: item.qty
                });

                if (item.qty > available) return {
                    success: false,
                    message: `Một số sản phẩm trong giỏ đã hết hàng`
                }

                inv.reserved += item.qty;
                await inv.save({ transaction: t });
                console.log('✅ Inventory updated - reserved:', inv.reserved);

                // 🔥 SỬA LẠI QUERY FLASH SALE VỚI OP ĐÚNG
                console.log('\n🔦 Searching for flash sale...');
                const flashSaleProduct = await FlashSaleProduct.findOne({
                    where: {
                        product_id: item.product_id
                    },
                    include: [{
                        model: FlashSale,
                        as: 'flash_sale',
                        where: {
                            start_time: { [Op.lte]: currentTime },
                            end_time: { [Op.gte]: currentTime },
                            is_active: true
                        }
                    }],
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                console.log('🎯 Flash sale search result:', {
                    found: !!flashSaleProduct,
                    productId: item.product_id,
                    queryConditions: {
                        start_time_lte: currentTime,
                        end_time_gte: currentTime,
                        is_active: true
                    }
                });

                if (flashSaleProduct) {
                    console.log('🎉 FLASH SALE FOUND! Details:', {
                        flashSaleProductId: flashSaleProduct.id,
                        productId: flashSaleProduct.product_id,
                        flashSaleId: flashSaleProduct.flash_sale_id,
                        stock_flash_sale: flashSaleProduct.stock_flash_sale,
                        current_sold_flash_sale: flashSaleProduct.sold_flash_sale,
                        flash_price: flashSaleProduct.flash_price,
                        original_price: flashSaleProduct.original_price,
                        limit_per_user: flashSaleProduct.limit_per_user,
                        flashSale: flashSaleProduct.flash_sale ? {
                            id: flashSaleProduct.flash_sale.id,
                            name: flashSaleProduct.flash_sale.name,
                            start_time: flashSaleProduct.flash_sale.start_time,
                            end_time: flashSaleProduct.flash_sale.end_time,
                            is_active: flashSaleProduct.flash_sale.is_active
                        } : null
                    });

                    // Kiểm tra số lượng mua có vượt quá giới hạn flash sale không
                    const remainingFlashStock = flashSaleProduct.stock_flash_sale - flashSaleProduct.sold_flash_sale;
                    console.log('📦 Flash sale stock check:', {
                        total_stock: flashSaleProduct.stock_flash_sale,
                        already_sold: flashSaleProduct.sold_flash_sale,
                        remaining: remainingFlashStock,
                        buying: item.qty
                    });

                    if (item.qty > remainingFlashStock) {
                        console.log('❌ Not enough flash sale stock');
                        return {
                            success: false,
                            message: `Sản phẩm "${item.Product?.name}" chỉ còn ${remainingFlashStock} sản phẩm trong flash sale`
                        };
                    }

                    // Kiểm tra giới hạn mua mỗi user
                    console.log('👤 Checking user purchase limit...');
                    const userFlashOrders = await Order.findAll({
                        where: {
                            user_id: userId,
                            status: { [Op.notIn]: ['CANCELLED', 'FAILED'] }
                        },
                        include: [{
                            model: OrderItem,
                            where: { product_id: item.product_id }
                        }],
                        transaction: t
                    });

                    const totalUserPurchased = userFlashOrders.reduce((sum, order) => {
                        const orderItem = order.OrderItems.find(oi => oi.product_id === item.product_id);
                        return sum + (orderItem ? orderItem.qty : 0);
                    }, 0);

                    console.log('📊 User purchase history:', {
                        userId: userId,
                        previousOrders: userFlashOrders.length,
                        alreadyPurchased: totalUserPurchased,
                        currentPurchase: item.qty,
                        limit: flashSaleProduct.limit_per_user,
                        totalAfterPurchase: totalUserPurchased + item.qty
                    });

                    if (totalUserPurchased + item.qty > flashSaleProduct.limit_per_user) {
                        console.log('❌ User exceeded purchase limit');
                        return {
                            success: false,
                            message: `Bạn chỉ được mua tối đa ${flashSaleProduct.limit_per_user} sản phẩm "${item.Product?.name}" trong flash sale`
                        };
                    }

                    // 🔥 QUAN TRỌNG: CẬP NHẬT sold_flash_sale NGAY KHI CHECKOUT
                    const oldSold = flashSaleProduct.sold_flash_sale;
                    flashSaleProduct.sold_flash_sale = (flashSaleProduct.sold_flash_sale || 0) + item.qty;
                    await flashSaleProduct.save({ transaction: t });

                    console.log(`✅ SUCCESS: Updated flash sale sold count for product ${item.product_id}: +${item.qty} (${oldSold} → ${flashSaleProduct.sold_flash_sale})`);
                } else {
                    console.log('❌ NO FLASH SALE found for this product');
                    console.log('Có thể do:');
                    console.log('- Không có flash sale cho sản phẩm này');
                    console.log('- Flash sale chưa bắt đầu hoặc đã kết thúc');
                    console.log('- Flash sale không active');

                    // KIỂM TRA THỦ CÔNG TRONG DATABASE
                    console.log('\n🔎 Manual check - run these SQL queries:');
                    console.log(`SELECT * FROM flash_sale_products WHERE product_id = ${item.product_id};`);
                    console.log(`SELECT * FROM flash_sales WHERE is_active = true AND start_time <= '${currentTime.toISOString()}' AND end_time >= '${currentTime.toISOString()}';`);
                }
            }

            const total = order.OrderItems.reduce(
                (sum, i) => sum + parseFloat(i.price) * i.qty,
                0
            );

            console.log('💰 Order total calculation:', {
                subtotal: total,
                tax: tax,
                shipping: fee,
                total: total + tax + fee
            });

            let discount = 0;
            let appliedVoucher = null;

            if (voucherCode) {
                console.log('🎫 Processing voucher:', voucherCode);
                const result = await voucherService.validateVoucher(voucherCode, total, { transaction: t });
                if (!result.valid) return {
                    success: false,
                    message: result.message,
                }
                appliedVoucher = result.voucher;

                discount = result.discount;
                appliedVoucher.usage_limit -= 1;
                appliedVoucher.used_count += 1;
                await appliedVoucher.save({ transaction: t });
                console.log('✅ Voucher applied, discount:', discount);
            }

            order.status = "NEW";
            order.total_amount = total - discount + tax + fee;
            console.log(order.total_amount);
            if (appliedVoucher) {
                order.voucher_id = appliedVoucher.id;
            }
            await order.save({ transaction: t });
            console.log('✅ Order saved with status:', order.status);

            // === 🔎 Kiểm tra xem Payment đã tồn tại chưa ===
            let payment = await Payment.findOne({
                where: { order_id: order.id },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (payment) {
                console.log('🔄 Updating existing payment');
                payment.method = "COD";
                payment.status = "PENDING";
                payment.amount = order.total_amount;
                await payment.save({ transaction: t });
            } else {
                console.log('🆕 Creating new payment');
                payment = await Payment.create({
                    order_id: order.id,
                    method: "COD",
                    status: "PENDING", // chờ shipper thu tiền
                    amount: order.total_amount
                }, { transaction: t });
            }

            console.log('🎉 CHECKOUT COMPLETED SUCCESSFULLY');
            return {
                success: true,
                message: "Checkout COD thành công",
                data: {
                    order,
                    payment,
                }
            };
        });
    }

    static async confirmOrderCompleted(orderId) {
        return await Order.sequelize.transaction(async (t) => {
            const payment = await Payment.findOne({
                where: { order_id: orderId },
                transaction: t
            });
            if (!payment) throw new Error("Payment not found");

            if (payment.method==="COD")
            {
                payment.status = "PAID";
                await payment.save({ transaction: t });
            }
            const order = await Order.findOne({
                where: { id: orderId },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order) throw new Error("Order not found");

            if (["COMPLETED", "canceled"].includes(order.status)) {
                throw new Error(`Order already finalized with status ${order.status}`);
            }

            for (const item of order.OrderItems) {
                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                const product = await Product.findByPk(item.product_id, {
                    transaction: t, lock: t.LOCK.UPDATE
                });
                if (!product) {
                    throw new Error(`Product ${item.product_id} not found`);
                }
                product.sale_count = product.sale_count + item.qty;

                if (!inv) {
                    throw new Error(`Inventory for product ${item.product_id} not found`);
                }

                const need = Number(item.qty) || 0;
                const reserved = Number(inv.reserved) || 0;
                const stock = Number(inv.stock) || 0;

                inv.stock = stock - need;
                inv.reserved = reserved - need;

                await inv.save({ transaction: t });
                await product.save({ transaction: t });
            }

            const user = await User.findByPk(order.user_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (user) {
                const pointsEarned = Math.floor(order.total_amount / 1000);  // mỗi 100k là được 1k
                user.loyalty_points = (user.loyalty_points || 0) + pointsEarned;
                console.log(`User ${order.user_id} earned ${pointsEarned} loyalty points, total now ${user.loyalty_points}`);
                await user.save({ transaction: t });
            }

            if (order.status === "SHIPPING") {
                order.status = "COMPLETED";
            }
            else {
                return {
                    success: false,
                    message: `Đơn hàng có trạng thái ${order.status} không cho phép xác nhận`
                }
            }
            await order.save({ transaction: t });
            return {
                success: true,
                message: "Đơn hàng COD đã thành công",
                data:
                {
                    order,
                    payment,
                }
            };
        });
    }

    static async checkoutVNPay(userId, voucherCode, addressId, shippingFee) {
        const tax = 40000;
        const fee = Number(shippingFee ?? 0);

        // ĐẢM BẢO OP ĐƯỢC IMPORT ĐÚNG (giống COD)
        const { Op } = require('sequelize');

        console.log('🚀 Bắt đầu checkout VNPay');

        return await Order.sequelize.transaction(async (t) => {
            // 1) Lấy order PENDING + items + lock
            const order = await Order.findOne({
                where: { user_id: userId, status: 'PENDING' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order || order.OrderItems.length === 0) {
                return { success: false, message: "Giỏ hàng trống" };
            }

            console.log('📦 Order found:', order.id, 'with items:', order.OrderItems.length);

            // 2) Check địa chỉ (giống COD)
            if (!addressId) {
                return { success: false, message: "Vui lòng chọn địa chỉ để thanh toán!" };
            }

            const address = await Address.findOne({
                where: { id: addressId, user_id: userId },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!address) {
                return { success: false, message: "Địa chỉ không tồn tại!" };
            } else {
                order.address_id = addressId;
            }

            // 3) Kiểm kho + flash sale (y hệt COD)
            const currentTime = new Date();
            console.log('⏰ Current time for flash sale check:', currentTime.toISOString());

            for (const item of order.OrderItems) {
                console.log('\n🔍 Processing item:', {
                    productId: item.product_id,
                    productName: item.Product?.name,
                    quantity: item.qty
                });

                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!inv) {
                    return { success: false, message: "Không tìm thấy sản phẩm trong kho!" };
                }

                const available = (inv.stock || 0) - (inv.reserved || 0);
                console.log('📊 Inventory check:', {
                    stock: inv.stock,
                    reserved: inv.reserved,
                    available: available,
                    needed: item.qty
                });

                if (item.qty > available) {
                    return { success: false, message: `Một số sản phẩm trong giỏ đã hết hàng` };
                }

                inv.reserved += item.qty;
                await inv.save({ transaction: t });
                console.log('✅ Inventory updated - reserved:', inv.reserved);

                // 🔥 Flash sale (giữ nguyên query và logic từ COD)
                console.log('\n🔦 Searching for flash sale...');
                const flashSaleProduct = await FlashSaleProduct.findOne({
                    where: { product_id: item.product_id },
                    include: [{
                        model: FlashSale,
                        as: 'flash_sale',
                        where: {
                            start_time: { [Op.lte]: currentTime },
                            end_time: { [Op.gte]: currentTime },
                            is_active: true
                        }
                    }],
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                console.log('🎯 Flash sale search result:', {
                    found: !!flashSaleProduct,
                    productId: item.product_id,
                    queryConditions: {
                        start_time_lte: currentTime,
                        end_time_gte: currentTime,
                        is_active: true
                    }
                });

                if (flashSaleProduct) {
                    console.log('🎉 FLASH SALE FOUND! Details:', {
                        flashSaleProductId: flashSaleProduct.id,
                        productId: flashSaleProduct.product_id,
                        flashSaleId: flashSaleProduct.flash_sale_id,
                        stock_flash_sale: flashSaleProduct.stock_flash_sale,
                        current_sold_flash_sale: flashSaleProduct.sold_flash_sale,
                        flash_price: flashSaleProduct.flash_price,
                        original_price: flashSaleProduct.original_price,
                        limit_per_user: flashSaleProduct.limit_per_user,
                        flashSale: flashSaleProduct.flash_sale ? {
                            id: flashSaleProduct.flash_sale.id,
                            name: flashSaleProduct.flash_sale.name,
                            start_time: flashSaleProduct.flash_sale.start_time,
                            end_time: flashSaleProduct.flash_sale.end_time,
                            is_active: flashSaleProduct.flash_sale.is_active
                        } : null
                    });

                    const remainingFlashStock = flashSaleProduct.stock_flash_sale - flashSaleProduct.sold_flash_sale;
                    console.log('📦 Flash sale stock check:', {
                        total_stock: flashSaleProduct.stock_flash_sale,
                        already_sold: flashSaleProduct.sold_flash_sale,
                        remaining: remainingFlashStock,
                        buying: item.qty
                    });

                    if (item.qty > remainingFlashStock) {
                        console.log('❌ Not enough flash sale stock');
                        return {
                            success: false,
                            message: `Sản phẩm "${item.Product?.name}" chỉ còn ${remainingFlashStock} sản phẩm trong flash sale`
                        };
                    }

                    // Giới hạn mua theo user (giữ nguyên)
                    console.log('👤 Checking user purchase limit...');
                    const userFlashOrders = await Order.findAll({
                        where: {
                            user_id: userId,
                            status: { [Op.notIn]: ['CANCELLED', 'FAILED'] }
                        },
                        include: [{ model: OrderItem, where: { product_id: item.product_id } }],
                        transaction: t
                    });

                    const totalUserPurchased = userFlashOrders.reduce((sum, o) => {
                        const oi = o.OrderItems.find(oi => oi.product_id === item.product_id);
                        return sum + (oi ? oi.qty : 0);
                    }, 0);

                    console.log('📊 User purchase history:', {
                        userId,
                        previousOrders: userFlashOrders.length,
                        alreadyPurchased: totalUserPurchased,
                        currentPurchase: item.qty,
                        limit: flashSaleProduct.limit_per_user,
                        totalAfterPurchase: totalUserPurchased + item.qty
                    });

                    if (totalUserPurchased + item.qty > flashSaleProduct.limit_per_user) {
                        console.log('❌ User exceeded purchase limit');
                        return {
                            success: false,
                            message: `Bạn chỉ được mua tối đa ${flashSaleProduct.limit_per_user} sản phẩm "${item.Product?.name}" trong flash sale`
                        };
                    }

                    // QUAN TRỌNG: cập nhật sold_flash_sale ngay khi khởi tạo thanh toán (giống COD)
                    const oldSold = flashSaleProduct.sold_flash_sale || 0;
                    flashSaleProduct.sold_flash_sale = oldSold + item.qty;
                    await flashSaleProduct.save({ transaction: t });
                    console.log(`✅ SUCCESS: Updated flash sale sold count for product ${item.product_id}: +${item.qty} (${oldSold} → ${flashSaleProduct.sold_flash_sale})`);
                } else {
                    console.log('❌ NO FLASH SALE found for this product');
                    console.log('- Không có flash sale / chưa bắt đầu / đã kết thúc / không active');
                    console.log('\n🔎 Manual check SQL:');
                    console.log(`SELECT * FROM flash_sale_products WHERE product_id = ${item.product_id};`);
                    console.log(`SELECT * FROM flash_sales WHERE is_active = true AND start_time <= '${currentTime.toISOString()}' AND end_time >= '${currentTime.toISOString()}';`);
                }
            }

            // 4) Tính tổng, thuế/phí, voucher (y hệt COD)
            const subtotal = order.OrderItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);
            console.log('💰 Order total calculation:', {
                subtotal,
                tax,
                shipping: fee,
                total: subtotal + tax + fee
            });

            let discount = 0;
            let appliedVoucher = null;

            if (voucherCode) {
                console.log('🎫 Processing voucher:', voucherCode);
                const result = await voucherService.validateVoucher(voucherCode, subtotal, { transaction: t });
                if (!result.valid) {
                    return { success: false, message: result.message };
                }
                appliedVoucher = result.voucher;
                discount = result.discount;

                appliedVoucher.usage_limit -= 1;
                appliedVoucher.used_count += 1;
                await appliedVoucher.save({ transaction: t });

                console.log('✅ Voucher applied, discount:', discount);
            }

            order.total_amount = subtotal - discount + tax + fee;
            if (appliedVoucher) {
                order.voucher_id = appliedVoucher.id;
            }
            await order.save({ transaction: t });
            console.log('✅ Order saved with status:', order.status, 'total_amount:', order.total_amount);

            // 6) Tạo/Update Payment (method VNPay, status PENDING) — khác COD ở chỗ tạo paymentUrl
            let payment = await Payment.findOne({
                where: { order_id: order.id },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (payment) {
                console.log('🔄 Updating existing payment to VNPay');
                payment.method = "VNPay";
                payment.status = "PENDING";
                payment.amount = order.total_amount;
                await payment.save({ transaction: t });
            } else {
                console.log('🆕 Creating new VNPay payment');
                payment = await Payment.create({
                    order_id: order.id,
                    method: "VNPay",
                    status: "PENDING", // chờ user thanh toán trên cổng
                    amount: order.total_amount
                }, { transaction: t });
            }

            // 7) Tạo paymentUrl từ paymentService (giống cách bạn đang làm, nhưng KHÔNG set PAID/COMPLETED ở đây)
            const paymentUrl = await paymentService.createPayment({
                id: order.id,
                amount: order.total_amount,
                description: `Thanh toán đơn hàng UteShop #${order.id}`,
                ip: "127.0.0.1" // tuỳ bạn truyền IP thực tế
            });

            // 8) Trả về dữ liệu
            return {
                success: true,
                message: "Khởi tạo thanh toán VNPay thành công",
                data: {
                    order,
                    payment,
                    paymentUrl
                }
            };
        });
    }

    static async confirmVNPayPayment(orderId) {
        return await Order.sequelize.transaction(async (t) => {
            try {
                const payment = await Payment.findOne({
                    where: { order_id: orderId },
                    transaction: t
                });
                const order = await Order.findByPk(orderId, {
                    include: [OrderItem],
                    transaction: t
                });
                payment.status = "PAID";
                await payment.save({ transaction: t });
                order.status = "NEW";
                await order.save({ transaction: t });
                return {
                    success: true,
                    message: "Thanh toán vnpay thành công",
                };
            } catch (error) {
                throw error;
            }
        });
    }

    static async getAllOrders() {
        const orders = await Order.findAll({
            where: {
                status: { [Op.ne]: 'PENDING' } // Loại bỏ đơn hàng PENDING
            },
            include: [
                {
                    model: User,
                    attributes: ['first_name', 'last_name']
                },
                {
                    model: Address,
                    as: 'address',
                    attributes: ['address_line', 'ward', 'district', 'city', 'postal_code']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return orders.map(o => {
            const userName = `${o.User?.first_name || ''} ${o.User?.last_name || ''}`.trim();

            const addr = o.address
                ? [
                    o.address.address_line,
                    o.address.ward,
                    o.address.district,
                    o.address.city,
                    o.address.postal_code
                ].filter(Boolean).join(', ')
                : null;

            return {
                orderId: o.id,
                userName,
                totalAmount: Number(o.total_amount || 0),
                address: addr,
                status: o.status
            };
        });
    }

    static async updateOrderPackingStatus(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }
        if (order.status === "NEW") {
            order.status = "PACKING"
            await order.save();
        }
        else {
            return {
                success: false,
                message: "Đơn đã được xác nhận trước đó!"
            }
        }

        return {
            success: true,
            message: `Xác nhận đơn hàng ${order.id} thành công!`
        }
    }

    static async updateOrderShippingStatus(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }
        if (order.status === "PACKING") {
            order.status = "SHIPPING"
            await order.save();
        }
        else {
            return {
                success: false,
                message: "Đơn hàng hàng đã được giao trước đó"
            }
        }
        console.log(order.status);
        return {
            success: true,
            message: `Đang vận chuyển đơn hàng ${order.id}!`
        }
    }

    static async cancelOrder(userId, orderId) {
        return await Order.sequelize.transaction(async (t) => {
            // 1) Tìm order thuộc user và khóa ghi
            const order = await Order.findOne({
                where: { id: orderId, user_id: userId },
                include: [
                    { model: OrderItem, include: [Product] },
                    { model: Payment }
                ],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order) {
                return { success: false, message: "Không tìm thấy đơn hàng." };
            }

            if (order.status !== "NEW") {
                return { success: false, message: "Chỉ có thể hủy đơn hàng mới tạo." };
            }

            // 3) Kiểm tra thời gian: chỉ cho phép hủy trước 30 phút sau khi đặt
            const createdAt = order.updatedAt;
            const now = new Date();
            const diffMs = now - new Date(createdAt);
            const diffMinutes = Math.floor(diffMs / (60 * 1000));

            if (diffMinutes > 30) {
                return { success: false, message: "Đơn hàng chỉ được hủy trong vòng 30 phút sau khi đặt." };
            }

            for (const item of order.OrderItems || []) {
                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                // Có thể đơn hàng chưa từng reserve (tùy flow), nhưng theo checkoutCOD bạn đã reserve
                if (inv) {
                    const currReserved = Number(inv.reserved) || 0;
                    const qty = Number(item.qty) || 0;
                    inv.reserved = Math.max(currReserved - qty, 0);
                    await inv.save({ transaction: t });
                }
            }

            // 5) Hoàn tác voucher usage nếu có
            if (order.voucher_id) {
                const v = await Voucher.findByPk(order.voucher_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                if (v) {
                    v.usage_limit = (Number(v.usage_limit) || 0) + 1;
                    v.used_count = Math.max((Number(v.used_count) || 0) - 1, 0);
                    await v.save({ transaction: t });
                }
            }

            const payment = order.Payment;
            if (payment) {
                const method = payment.method
                const pstatus = payment.status

                if (method === "COD" && pstatus.toUpperCase() === "PENDING") {
                    payment.status = "CANCELLED";
                    await payment.save({ transaction: t });
                } else if (method === "VNPay'" && pstatus === "PAID") {
                    payment.status = "REFUND_PENDING";
                    await payment.save({ transaction: t });
                }
            }
            order.status = "CANCELLED";
            await order.save({ transaction: t });

            return {
                success: true,
                message: `Đã hủy đơn hàng #${order.id} thành công.`,
            };
        });
    }

    static async cancelAdminOrder(orderId) {
        return await Order.sequelize.transaction(async (t) => {
            // 1) Tìm order thuộc user và khóa ghi
            const order = await Order.findOne({
                where: { id: orderId },
                include: [
                    { model: OrderItem, include: [Product] },
                    { model: Payment }
                ],
                transaction: t,
                lock: t.LOCK.UPDATE
            });
            if (order.status !== "NEW" && order.status !== "PACKING" && order.status !== "PENDING") {
                return { success: false, message: "Chỉ có thể hủy đơn hàng mới tạo hoặc đang được đóng gói." };
            }

            for (const item of order.OrderItems || []) {
                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                // Có thể đơn hàng chưa từng reserve (tùy flow), nhưng theo checkoutCOD bạn đã reserve
                if (inv) {
                    const currReserved = Number(inv.reserved) || 0;
                    const qty = Number(item.qty) || 0;
                    inv.reserved = Math.max(currReserved - qty, 0);
                    await inv.save({ transaction: t });
                }
            }

            if (order.voucher_id) {
                const v = await Voucher.findByPk(order.voucher_id, {
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });
                if (v) {
                    v.usage_limit = (Number(v.usage_limit) || 0) + 1;
                    v.used_count = Math.max((Number(v.used_count) || 0) - 1, 0);
                    await v.save({ transaction: t });
                }
            }

            const payment = order.Payment;
            order.status = "CANCELLED";
            if (payment) {
                const method = payment.method
                const pstatus = payment.status
                console.log(method,pstatus);
                if (method === "COD" && pstatus.toUpperCase() === "PENDING") {
                    payment.status = "CANCELLED";
                    await payment.save({ transaction: t });
                } else if (method === "VNPay" && pstatus === "PAID") {
                    payment.status = "REFUND_PENDING";
                    await payment.save({ transaction: t });
                }else if (method === "VNPay" && pstatus === "PENDING") {
                    order.status = "PENDING";
                    await payment.save({ transaction: t });
                }
            }
            console.log(order.status);
            await order.save({ transaction: t });

            return {
                success: true,
                message: `Đã hủy đơn hàng #${order.id} thành công.`,
            };
        });
    }

    static async updateQuantity(userId, itemId, qty) {
        if (!itemId || qty < 1) throw new Error('Invalid itemId or quantity');

        // Cập nhật qty
        const orderItem = await OrderItem.findOne({
            where: { id: itemId },
            include: [
                { model: Order, where: { user_id: userId, status: 'pending' } }
            ]
        });

        if (!orderItem) throw new Error('Cart item not found');

        orderItem.qty = qty;
        await orderItem.save();

        // Lấy lại toàn bộ cart với Product + images + tính tiền
        const cart = await OrderService.getCart(userId);

        return cart;
    }

    static async checkHasNewOrders() {
        try {
            // Kiểm tra xem có ít nhất 1 đơn hàng ở trạng thái NEW hay không
            const existingNewOrder = await Order.findOne({
                where: { status: 'NEW' },
                attributes: ['id'], // chỉ cần id để tối ưu
            });

            return {
                success: true,
                hasNewOrder: !!existingNewOrder
            };
        } catch (error) {
            console.error("❌ Lỗi khi kiểm tra đơn hàng NEW:", error);
            return {
                success: false,
                message: "Lỗi khi kiểm tra đơn hàng NEW"
            };
        }
    }
}
export default OrderService;