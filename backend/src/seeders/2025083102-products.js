'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', [
      {
        category_id: 1,
        name: 'Áo thun UTE',
        slug: 'ao-thun-ute',
        short_description: 'Áo thun đồng phục UTE chất liệu cotton',
        description: 'Áo thun chất liệu cotton 100%, thoáng mát, phù hợp cho sinh viên trường ĐH Sư phạm Kỹ thuật.',
        price: 120000,
        original_price: 150000,
        discount_percent: 20,
        view_count: 50,
        sale_count: 10,
        is_active: true,
        featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 1,
        name: 'Áo khoác UTE',
        slug: 'ao-khoac-ute',
        short_description: 'Áo khoác logo UTE chính thức',
        description: 'Áo khoác vải nỉ, in logo trường ĐH Sư phạm Kỹ thuật. Giữ ấm tốt, phong cách năng động.',
        price: 250000,
        original_price: 300000,
        discount_percent: 15,
        view_count: 80,
        sale_count: 25,
        is_active: true,
        featured: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        name: 'Sổ tay UTE',
        slug: 'so-tay-ute',
        short_description: 'Sổ tay sinh viên UTE bìa cứng',
        description: 'Sổ tay tiện dụng cho sinh viên, bìa in logo UTE, giấy 100 trang kẻ ngang.',
        price: 35000,
        original_price: 50000,
        discount_percent: 30,
        view_count: 120,
        sale_count: 40,
        is_active: true,
        featured: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 2,
        name: 'Ly giữ nhiệt UTE',
        slug: 'ly-giu-nhiet-ute',
        short_description: 'Ly giữ nhiệt inox khắc logo UTE',
        description: 'Ly giữ nhiệt dung tích 500ml, giữ lạnh/giữ nóng tốt, khắc laser logo UTE.',
        price: 150000,
        original_price: 200000,
        discount_percent: 25,
        view_count: 200,
        sale_count: 60,
        is_active: true,
        featured: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        category_id: 3,
        name: 'Balo UTE',
        slug: 'balo-ute',
        short_description: 'Balo UTE tiện dụng, nhiều ngăn',
        description: 'Balo chống nước, nhiều ngăn, in logo UTE. Phù hợp cho sinh viên đi học và đi chơi.',
        price: 300000,
        original_price: 400000,
        discount_percent: 25,
        view_count: 180,
        sale_count: 70,
        is_active: true,
        featured: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
