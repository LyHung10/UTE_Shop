'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        email: 'a@example.com',
        password: '123456', // lưu hash cho chuẩn nha
        first_name: 'Nguyễn',
        last_name: 'Văn A',
        address: 'Hà Nội',
        phone_number: '0123456789',
        gender: true,
        image: null,
        is_verified: true,
        role_id: 'admin',
        position_id: 'manager',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'b@example.com',
        password: '123456',
        first_name: 'Trần',
        last_name: 'Thị B',
        address: 'Đà Nẵng',
        phone_number: '0987654321',
        gender: false,
        image: null,
        is_verified: false,
        role_id: 'user',
        position_id: 'staff',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
