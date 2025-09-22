'use strict';

module.exports = {
    async up(queryInterface) {
        const reviewsToSeed = [];

        // Data gốc
        const originalReviews = [
            {
                product_id: 1,
                user_id: 1,
                order_id: 1,
                rating: 5,
                text: 'Sản phẩm chất lượng, rất hài lòng!',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 1,
                user_id: 2,
                order_id: 2,
                rating: 4,
                text: 'Hơi nhỏ nhưng vẫn đẹp, giao hàng nhanh.',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 2,
                user_id: 2,
                order_id: 1,
                rating: 3,
                text: 'Bình thường, không có gì đặc biệt.',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        // Lặp 10 lần để tạo 10 bản sao của dữ liệu gốc
        for (let i = 0; i < 10; i++) {
            originalReviews.forEach(review => {
                reviewsToSeed.push({
                    ...review, // Sao chép tất cả các thuộc tính của bản ghi gốc
                    // Có thể thêm logic để thay đổi dữ liệu nếu cần, ví dụ như rating hoặc text
                    // Ví dụ: rating: Math.floor(Math.random() * 5) + 1,
                    created_at: new Date(), // Cập nhật thời gian mới cho mỗi bản ghi
                    updated_at: new Date(),
                });
            });
        }

        await queryInterface.bulkInsert('reviews', reviewsToSeed);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('reviews', null, {});
    }
};