const { Order, OrderItem, Product, ProductImage } = require('../models');

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
}
export default OrderService;