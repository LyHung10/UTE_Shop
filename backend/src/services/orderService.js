const { Order, OrderItem, Product, ProductImage, Inventory, Payment } = require('../models');
import paymentService from './paymentService.js';
class OrderService {
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

    static async getCart(userId) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
            include: [{
                model: OrderItem, include: {
                    model: Product,
                    attributes: ['id', 'name', 'price', 'original_price', 'discount_percent',],
                    include: [{ model: ProductImage, as: 'images', attributes: ['url'], limit: 1 }]
                }
            }]
        });

        if (!order) return { items: [], total: 0 };

        const items = order.OrderItems;

        // Tính tổng tiền
        const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

        return { items, total };
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

    static async getCartCount(userId) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
            include: [{ model: OrderItem }]
        });

        if (!order) return 0;

        return order.OrderItems.reduce((sum, item) => sum + item.qty, 0);
    }

    static async checkoutCOD(userId) {
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

            // Cập nhật status order
            order.status = "confirmed"; // chờ giao hàng
            order.total_amount = order.OrderItems.reduce(
                (sum, i) => sum + parseFloat(i.price) * i.qty,
                0
            );
            await order.save({ transaction: t });

            // Tạo payment COD
            const payment = await Payment.create({
                order_id: order.id,
                method: "COD",
                status: "pending", // chờ shipper thu tiền
                amount: order.total_amount
            }, { transaction: t });

            return { order, payment };
        });
    }

    static async confirmCODPayment(orderId) {
        return await Order.sequelize.transaction(async (t) => {
            const payment = await Payment.findOne({
                where: { order_id: orderId },
                transaction: t
            });
            if (!payment) throw new Error("Payment not found");

            payment.status = "paid";
            await payment.save({ transaction: t });

            const order = await Order.findByPk(orderId, { transaction: t });
            order.status = "completed";
            await order.save({ transaction: t });

            return { order, payment };
        });
    }


    //////////////

    // checkout VNPay
    static async checkoutVNPay(userId) {
        return await Order.sequelize.transaction(async (t) => {
            const order = await Order.findOne({
                where: { user_id: userId, status: 'pending' },
                include: [{ model: OrderItem, include: [Product] }],
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!order || order.OrderItems.length === 0) {
                throw new Error("Cart is empty");
            }

            // ❌ Không trừ stock, không update order thành confirmed ở đây
            order.total_amount = order.OrderItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);
            await order.save({ transaction: t });

            const payment = await Payment.create({
                order_id: order.id,
                method: "VNPay",
                status: "pending",
                amount: order.total_amount
            }, { transaction: t });

            const paymentUrl = await paymentService.createPayment({
                id: order.id,
                amount: order.total_amount,
                description: "Thanh toán đơn hàng UteShop",
                ip: "127.0.0.1"
            });

            return { order, payment, paymentUrl };
        });
    }


    // callback confirm từ VNPay
    static async confirmVNPayPayment(orderId, query) {
        return await Order.sequelize.transaction(async (t) => {
            const result = await paymentService.verifyPayment(query);
            if (!result || result.responseCode !== '00') {
                throw new Error("Payment failed or invalid");
            }

            const payment = await Payment.findOne({ where: { order_id: orderId }, transaction: t });
            if (!payment) throw new Error("Payment not found");

            const order = await Order.findByPk(orderId, { include: [OrderItem], transaction: t });
            if (!order) throw new Error("Order not found");

            // ✅ Chỉ trừ stock ở bước confirm này
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

            payment.status = "paid";
            await payment.save({ transaction: t });

            order.status = "completed";
            await order.save({ transaction: t });

            return { order, payment };
        });
    }


}
export default OrderService;