'use strict';
const { hashPassword } = require('../utils/password'); // điều chỉnh path cho đúng

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        email: 'phuongtrinhdangthuc@gmail.com',
        password: await hashPassword('103204'), // 🔒 hash password bằng hàm custom
        first_name: 'Nguyễn',
        last_name: 'Văn A',
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
        email: 'lyhung10nctlop95@gmail.com',
        password: await hashPassword('103204'), // 🔒 hash password bằng hàm custom
        first_name: 'Trần',
        last_name: 'Thị B',
        phone_number: '0987654321',
        gender: false,
        image: "https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg",
        is_verified: true,
        role_id: 'user',
        position_id: 'staff',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
