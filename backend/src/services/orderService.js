import {sequelize} from "../config/configdb";

const { Order, OrderItem, Product, ProductImage, Inventory, Payment, User, Voucher,Address } = require('../models');
import paymentService from './paymentService.js';
import voucherService from "./voucherService";

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

        const where = { user_id: userId };
        if (status) {
            where.status = status;
        }
        // Lọc khoảng thời gian theo created_at nếu truyền from/to
        if (from || to) {
            where.created_at = {};
            if (from) where.created_at[Op.gte] = new Date(from);
            if (to)   where.created_at[Op.lte] = new Date(to);
        }
        // Sắp xếp
        const orderBy =
            sort === 'created_at'
                ? [['created_at', 'ASC']]
                : [['created_at', 'DESC']];
        // Lấy dữ liệu
        const { rows, count } = await Order.findAndCountAll({
            where,
            order: orderBy,
            limit: pageSize,
            offset: (page - 1) * pageSize,
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            attributes: [
                                'id',
                                'name',
                                'price',
                                'original_price',
                                'discount_percent',
                            ],
                            include: [
                                {
                                    model: ProductImage,
                                    as: 'images',
                                    attributes: ['url'],
                                    separate: true,     // để limit hoạt động chính xác
                                    limit: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        // Chuẩn hoá response + tính tổng
        const data = rows.map((order) => {
            const items = (order.OrderItems || []).map((it) => {
                const prod = it.Product;
                const firstImage = prod && Array.isArray(prod.images) && prod.images.length > 0
                    ? prod.images[0].url
                    : null;

                return {
                    qty: it.qty,
                    price: Number(it.price),   // DECIMAL → Number để tính
                    color: it.color,
                    size: it.size,
                    status: it.status,
                    product: prod
                        ? {
                            id: prod.id,
                            name: prod.name,
                            price: Number(prod.price),
                            original_price: prod.original_price != null ? Number(prod.original_price) : null,
                            discount_percent: prod.discount_percent != null ? Number(prod.discount_percent) : null,
                            image: firstImage
                        }
                        : null
                };
            });

            const totalAmount = items.reduce((sum, i) => sum + i.price * i.qty, 0);

            return {
                id: order.id,
                status: order.status,
                created_at: order.created_at || order.createdAt,
                updated_at: order.updated_at || order.updatedAt,
                total_amount: Number(totalAmount.toFixed(2)),
                items
            };
        });

        return {
            page,
            page_size: pageSize,
            total: count,
            data
        };
    }

    static async getDetailOrder(userId, orderId = {}) {
        return await Order.findOne({
            where: {
                id: orderId,
                user_id: userId
            },
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Product,
                            attributes: ["id", "name", "price", "original_price", "discount_percent"
                            ],
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
                {
                    model: Payment
                }
            ]
        });
    }

    static async addToCart(userId, productId, qty, color, size) {
        if (qty <= 0) throw new Error('Quantity must be greater than 0');

        const product = await Product.findByPk(productId);
        if (!product) throw new Error('Product not found');

        // Kiểm tra size
        if (size && product.sizes && !product.sizes.includes(size)) {
            throw new Error(`Invalid size selected. Available sizes: ${product.sizes.join(', ')}`);
        }

        // Kiểm tra color
        if (color && product.colors && product.colors.length > 0) {
            const colorNames = typeof product.colors[0] === 'object'
                ? product.colors.map(c => c.name)
                : product.colors;

            if (!colorNames.some(c => c.toLowerCase() === color.toLowerCase())) {
                throw new Error(`Invalid color selected. Available colors: ${colorNames.join(', ')}`);
            }
        }
        // Tìm order pending
        let order = await Order.findOne({ where: { user_id: userId, status: 'pending' } });
        if (!order) {
            order = await Order.create({ user_id: userId, status: 'pending', total_amount: 0 });
        }

        // Kiểm tra item đã tồn tại chưa
        const whereCondition = {
            order_id: order.id,
            product_id: productId,
            color: color || null,
            size: size || null
        };

        let item = await OrderItem.findOne({ where: whereCondition });

        if (item) {
            item.qty += qty;
            await item.save();
        } else {
            item = await OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                qty,
                price: product.price,
                color: color || null,
                size: size || null
            });
        }

        // Trả về item vừa thêm kèm product info
        const productWithImage = await Product.findByPk(item.product_id, {
            attributes: ['id', 'name', 'price', 'original_price', 'discount_percent', 'colors', 'sizes'],
            include: [
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['url'],
                    limit: 1 // lấy 1 ảnh đầu tiên
                }
            ]
        });

        return {
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
        };

    }

    static async getCart(userId, voucherCode = null) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
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
        }

        const finalTotal = Math.max(total - discount, 0);

        return {
            items,
            total,
            itemCount: items.length,
            discount,
            finalTotal,
            appliedVoucher
        };
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


    static async removeItem(userId, itemId) {
        const orderItem = await OrderItem.findOne({
            where: { id: itemId },
            include: [{ model: Order, where: { user_id: userId, status: 'pending' } }]
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
        const order = await Order.findOne({ where: { user_id: userId, status: 'pending' } });
        if (!order) return { items: [], totalAmount: 0 };

        await OrderItem.destroy({ where: { order_id: order.id } });
        order.total_amount = 0;
        await order.save();

        return { items: [], totalAmount: 0 };
    }

    static async getCartByUser(userId) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
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

    static async checkoutCOD(userId, voucherCode, addressId) {
        return await Order.sequelize.transaction(async (t) => {
            // Lấy giỏ hàng pending
            const order = await Order.findOne({
                where: { user_id: userId, status: 'pending' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order || order.OrderItems.length === 0) {
                throw new Error("Cart is empty");
            }

            // Kiểm tra tồn kho
            for (const item of order.OrderItems) {
                const inv = await Inventory.findOne({
                    where: { product_id: item.product_id },
                    transaction: t,
                    lock: t.LOCK.UPDATE
                });

                if (!inv || inv.stock < item.qty) {
                    throw new Error(`Product ${item.product_id} out of stock`);
                }

                inv.stock -= item.qty;
                inv.reserved += item.qty;
                await inv.save({ transaction: t });
            }

            const total = order.OrderItems.reduce(
                (sum, i) => sum + parseFloat(i.price) * i.qty,
                0
            );

            let discount = 0;
            let appliedVoucher = null;

            // Validate voucher nếu có
            if (voucherCode) {
                const result = await voucherService.validateVoucher(voucherCode, total, { transaction: t });
                if (!result.valid) {
                    throw new Error(result.message || "Mã giảm giá không hợp lệ.");
                }
                appliedVoucher = result.voucher;
                discount = result.discount;
                appliedVoucher.usage_limit -= 1;
                appliedVoucher.used_count += 1;
                await appliedVoucher.save({ transaction: t });
            }

            // Cập nhật status order
            order.status = "NEW"; // chờ giao hàng
            order.total_amount = total - discount;

            if (appliedVoucher) {
                order.voucher_id = appliedVoucher.id;
            }
            if (addressId) {
                order.address_id = addressId;
            }
            await order.save({ transaction: t });

            // Tạo payment COD
            const payment = await Payment.create({
                order_id: order.id,
                method: "COD",
                status: "PENDING", // chờ shipper thu tiền
                amount: order.total_amount
            }, { transaction: t });

            return {
                order,
                payment,
            };
        });
    }


    static async confirmCODPayment(orderId) {
        return await Order.sequelize.transaction(async (t) => {
            const payment = await Payment.findOne({
                where: { order_id: orderId },
                transaction: t
            });
            if (!payment) throw new Error("Payment not found");

            payment.status = "PAID";
            await payment.save({ transaction: t });

            const order = await Order.findByPk(orderId, { transaction: t });
            order.status = "COMPLETED";
            await order.save({ transaction: t });

            return { order, payment };
        });
    }


    //////////////

    static async checkoutVNPay(userId) {
        return await Order.sequelize.transaction(async (t) => {
            const order = await Order.findOne({
                where: { user_id: userId, status: 'PENDING' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order || order.OrderItems.length === 0) {
                throw new Error("Cart is empty");
            }

            // Tính tổng tiền
            const totalAmount = order.OrderItems.reduce((sum, item) => {
                return sum + (parseFloat(item.price) * parseInt(item.qty));
            }, 0);

            const roundedAmount = Math.round(totalAmount) / 100;

            order.status = "COMPLETED";
            order.total_amount = roundedAmount;
            await order.save({ transaction: t });

            //Payment cũng cho là đã PAID
            const payment = await Payment.create({
                order_id: order.id,
                method: "VNPay",
                status: "PAID",
                amount: roundedAmount
            }, { transaction: t });

            console.log("Creating VNPay payment (mock) for order:", {
                orderId: order.id,
                amount: roundedAmount,
                itemCount: order.OrderItems.length
            });

            // Cộng điểm tích lũy cho user
            const user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
            if (user) {
                const pointsEarned = Math.floor(roundedAmount / 100);  // mỗi 100k là được 1k
                user.loyalty_points = (user.loyalty_points || 0) + pointsEarned;
                console.log(`User ${userId} earned ${pointsEarned} loyalty points, total now ${user.loyalty_points}`);
                await user.save({ transaction: t });
            }
            // Vẫn build URL cho đẹp, nhưng thực tế order đã COMPLETED
            const paymentUrl = await paymentService.createPayment({
                id: order.id,
                amount: roundedAmount,
                description: `Thanh toán đơn hàng UteShop #${order.id}`,
                ip: "127.0.0.1"
            });

            return { order, payment, paymentUrl };
        });
    }


    // Updated VNPay confirmation method
    static async confirmVNPayPayment(orderId, query) {
        return await Order.sequelize.transaction(async (t) => {
            console.log("Confirming VNPay payment for order:", orderId);
            console.log("Query parameters received:", query);

            try {
                const result = await paymentService.verifyPayment(query);

                if (!result || result.responseCode !== '00') {
                    console.error("VNPay payment verification failed:", result);
                    throw new Error(`Payment failed: ${result?.responseCode || 'Unknown error'}`);
                }

                const payment = await Payment.findOne({
                    where: { order_id: orderId },
                    transaction: t
                });
                if (!payment) throw new Error("Payment not found");

                const order = await Order.findByPk(orderId, {
                    include: [OrderItem],
                    transaction: t
                });
                if (!order) throw new Error("Order not found");

                // Verify the amount matches (convert from VND cents back to VND)
                const queryAmount = parseInt(query.vnp_Amount) / 100;
                const orderAmount = parseFloat(payment.amount);

                if (Math.abs(queryAmount - orderAmount) > 0.01) {
                    throw new Error(`Amount mismatch: expected ${orderAmount}, got ${queryAmount}`);
                }

                // Only deduct stock when payment is CONFIRMED
                for (const item of order.OrderItems) {
                    const inv = await Inventory.findOne({
                        where: { product_id: item.product_id },
                        transaction: t,
                        lock: t.LOCK.UPDATE
                    });
                    if (!inv || inv.stock < item.qty) {
                        throw new Error(`Product ${item.product_id} out of stock`);
                    }
                    inv.stock -= item.qty;
                    await inv.save({ transaction: t });
                }

                payment.status = "PAID";
                await payment.save({ transaction: t });

                order.status = "COMPLETED";
                await order.save({ transaction: t });

                console.log("VNPay payment CONFIRMED successfully for order:", orderId);
                return { order, payment };

            } catch (error) {
                console.error("Error confirming VNPay payment:", error);
                throw error;
            }
        });
    }

    static async getAllOrders() {
        const orders = await Order.findAll({
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

    static async updateOrderStatus(orderId) {
        const order = await Order.findByPk(orderId);
        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }
        order.status = "PACKING";
        await order.save();

        return order; // trả về order sau khi update
    }
}
export default OrderService;