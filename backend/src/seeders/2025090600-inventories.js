'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('inventories', [
      {
        product_id: 6, // Áo khoác thể dục
        stock: 120,
        reserved: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 7, // Áo trường
        stock: 200,
        reserved: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 10, // Balo UTE
        stock: 150,
        reserved: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 11, // Bút bi
        stock: 1000,
        reserved: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 12, // Combo Nhật kí và Bút
        stock: 300,
        reserved: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 13, // Dây đeo thẻ sinh viên
        stock: 500,
        reserved: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 14, // Dù gấp gọn
        stock: 120,
        reserved: 10,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 15, // Gấu bông teddy
        stock: 80,
        reserved: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 16, // Lót chuột gaming
        stock: 400,
        reserved: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 17, // Móc khóa kim loại
        stock: 600,
        reserved: 40,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        product_id: 18, // Sổ tay
        stock: 250,
        reserved: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('inventories', null, {});
  }
};
