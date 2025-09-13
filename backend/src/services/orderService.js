const { Order, OrderItem, Product } = require('../models');

class OrderService {
    // Thêm sản phẩm vào giỏ hàng (tạo order nếu chưa có)
    static async addToCart(userId, productId, qty) {
        if (qty <= 0) throw new Error('Quantity must be greater than 0');

        // Tìm order đang pending
        let order = await Order.findOne({ where: { user_id: userId, status: 'pending' } });
        if (!order) {
            order = await Order.create({ user_id: userId, status: 'pending', total_amount: 0 });
        }

        // Lấy thông tin product
        const product = await Product.findByPk(productId);
        if (!product) throw new Error('Product not found');

        // Kiểm tra item
        let item = await OrderItem.findOne({ where: { order_id: order.id, product_id: productId } });
        if (item) {
            item.qty += qty;
            if (item.qty <= 0) {
                await item.destroy();
            } else {
                await item.save();
            }
        } else {
            await OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                qty,
                price: product.price
            });
        }

        // Cập nhật tổng tiền
        const items = await OrderItem.findAll({ where: { order_id: order.id } });
        order.total_amount = items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);
        await order.save();

        // Trả về giỏ hàng đầy đủ
        return await Order.findOne({
            where: { id: order.id },
            include: [{ model: OrderItem, include: Product }]
        });
    }

    // Lấy giỏ hàng
    static async getCart(userId) {
        const order = await Order.findOne({
            where: { user_id: userId, status: 'pending' },
            include: [{ model: OrderItem, include: Product }]
        });

        if (!order) return [];

        return order.OrderItems; // chỉ trả về mảng item
    }

    // Xóa item
    static async removeItem(userId, productId) {
        const order = await Order.findOne({ where: { user_id: userId, status: 'pending' } });
        if (!order) return null;

        await OrderItem.destroy({ where: { order_id: order.id, product_id: productId } });

        const items = await OrderItem.findAll({ where: { order_id: order.id } });
        order.total_amount = items.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);
        await order.save();

        return await Order.findOne({
            where: { id: order.id },
            include: [{ model: OrderItem, include: Product }]
        });
    }
}
export default OrderService;