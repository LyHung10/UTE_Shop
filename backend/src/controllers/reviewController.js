const { Review, User, Order, OrderItem, Product } = require('../models');

class ReviewController {
    // Tạo review
    static async createReview(req, res) {
        try {
            const userId = req.user.sub;
            const { product_id, rating, text, order_id } = req.body;

            // 1. Kiểm tra user có mua sản phẩm này trong order đó không
            const order = await Order.findOne({
                where: { id: order_id, user_id: userId, status: "COMPLETED" },
                include: [{ model: OrderItem, where: { product_id } }]
            });

            if (!order) {
                return res.status(400).json({ message: "Bạn chưa mua sản phẩm này hoặc đơn chưa hoàn thành." });
            }

            // 2. Kiểm tra đã review cho order này + product này chưa
            const existingReview = await Review.findOne({
                where: { user_id: userId, product_id, order_id }
            });

            if (existingReview) {
                return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi." });
            }

            // 3. Tạo review
            const review = await Review.create({
                product_id,
                user_id: userId,
                order_id,
                rating,
                text
            });

            // 4. Update OrderItem status = COMMENTED
            await OrderItem.update(
                { status: "COMMENTED" },
                { where: { order_id, product_id } }
            );

            // 5. Cộng điểm tích lũy
            const user = await User.findByPk(userId);
            user.loyalty_points += 500;
            await user.save();

            return res.status(201).json({
                message: "Đánh giá thành công, bạn được cộng 500 điểm tích lũy.",
                review,
                user_name: `${user.last_name} ${user.first_name}`,
                loyalty_points: user.loyalty_points
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi server", error: err.message });
        }
    }



    // Lấy danh sách review theo sản phẩm
    static async getReviewsByProduct(req, res) {
        const { productId } = req.params;
        try {
            const reviews = await Review.findAll({
                where: { product_id: productId },
                include: [{ model: User, attributes: ['first_name', 'last_name', 'image'] }]
            });
            return res.json(reviews);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = ReviewController;
