const { Review, User, Order, OrderItem, Product, ProductImage } = require('../models');
import sequelize from '../models/index.js';
class ReviewController {
    // Tạo review
    static async createReview(req, res) {
        try {
            const userId = req.user.sub;
            const { reviews, order_id } = req.body; // reviews là mảng các đánh giá

            // 1. Kiểm tra order có tồn tại và thuộc về user không
            const order = await Order.findOne({
                where: {
                    id: order_id,
                    user_id: userId,
                    status: "COMPLETED"
                },
                include: [{ model: OrderItem }]
            });

            if (!order) {
                return res.status(400).json({
                    success: false,
                    message: "Đơn hàng không tồn tại hoặc chưa hoàn thành."
                });
            }

            // 2. Validate dữ liệu đầu vào
            if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Danh sách đánh giá không hợp lệ."
                });
            }

            const orderItems = order.OrderItems;
            const results = {
                success: [],
                failed: []
            };

            // 3. Duyệt qua từng review và xử lý
            for (const reviewData of reviews) {
                const { product_id, rating, text } = reviewData;

                // Kiểm tra rating hợp lệ
                if (!rating || rating < 1 || rating > 5) {
                    results.failed.push({
                        product_id,
                        message: "Rating phải từ 1 đến 5 sao"
                    });
                    continue;
                }

                // Kiểm tra user có mua sản phẩm này trong order không
                const purchasedItem = orderItems.find(item =>
                    item.product_id === product_id
                );

                if (!purchasedItem) {
                    results.failed.push({
                        product_id,
                        message: "Bạn chưa mua sản phẩm này trong đơn hàng"
                    });
                    continue;
                }

                // Kiểm tra đã review sản phẩm này trong order này chưa
                const existingReview = await Review.findOne({
                    where: {
                        user_id: userId,
                        product_id,
                        order_id
                    }
                });

                if (existingReview) {
                    results.failed.push({
                        product_id,
                        message: "Bạn đã đánh giá sản phẩm này cho đơn hàng này"
                    });
                    continue;
                }

                try {
                    // Tạo review
                    const review = await Review.create({
                        product_id,
                        user_id: userId,
                        order_id,
                        rating,
                        text: text || ""
                    });

                    // Update OrderItem status = COMMENTED
                    await OrderItem.update(
                        { status: "COMMENTED" },
                        { where: { order_id, product_id } }
                    );

                    results.success.push({
                        product_id,
                        review_id: review.id,
                        message: "Đánh giá thành công"
                    });

                } catch (error) {
                    results.failed.push({
                        product_id,
                        message: "Lỗi khi tạo đánh giá: " + error.message
                    });
                }
            }

            // 4. Cộng điểm tích lũy (chỉ cộng 1 lần cho mỗi order)
            if (results.success.length > 0) {
                const user = await User.findByPk(userId);
                const pointsToAdd = 500 * results.success.length;
                user.loyalty_points += pointsToAdd;
                await user.save();

                return res.status(201).json({
                    success: true,
                    message: `Đánh giá thành công ${results.success.length} sản phẩm. Bạn được cộng ${pointsToAdd} điểm tích lũy.`,
                    data: {
                        success: results.success,
                        failed: results.failed
                    },
                    user_name: `${user.last_name} ${user.first_name}`,
                    loyalty_points: user.loyalty_points,
                    points_earned: pointsToAdd
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Không có đánh giá nào được tạo thành công",
                    data: {
                        success: results.success,
                        failed: results.failed
                    }
                });
            }

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Lỗi server",
                error: err.message
            });
        }
    }
    // Lấy danh sách review theo sản phẩm
    static async getReviewsByProduct(req, res) {
        const { productId } = req.params;
        try {
            const reviews = await Review.findAll({
                where: { product_id: productId },
                order: [["created_at", "DESC"]],
                include: [{
                    model: User,
                    attributes: ['first_name', 'last_name', 'image']
                }]
            });
            return res.json(reviews);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error: error.message });
        }
    }
}

module.exports = ReviewController;
