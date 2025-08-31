'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('product_images', [
            {
                product_id: 1, // giả sử product_id = 1 (Ví dụ: "Sách giáo trình Cơ khí")
                url: 'https://example.com/images/co-khi-1.jpg',
                alt: 'Giáo trình Cơ khí - Trường Sư phạm Kỹ thuật',
                sort_order: 1,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 1,
                url: 'https://example.com/images/co-khi-2.jpg',
                alt: 'Trang bên trong giáo trình Cơ khí',
                sort_order: 2,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 2, // giả sử product_id = 2 (Ví dụ: "Áo đồng phục SPKT")
                url: 'https://example.com/images/dong-phuc-1.jpg',
                alt: 'Áo đồng phục Trường Sư phạm Kỹ thuật',
                sort_order: 1,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 3, // giả sử product_id = 3 (Ví dụ: "Mô hình thí nghiệm Điện tử")
                url: 'https://example.com/images/mo-hinh-dien-1.jpg',
                alt: 'Mô hình thí nghiệm điện tử - SPKT',
                sort_order: 1,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('product_images', null, {});
    }
};
