'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy danh sách user để map address theo email
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userA = users.find(u => u.email === 'phuongtrinhdangthuc@gmail.com');
    const userB = users.find(u => u.email === 'lyhung10nctlop95@gmail.com');

    return queryInterface.bulkInsert('addresses', [
      {
        user_id: userA.id,
        address_line: '123 Lê Lợi, Quận 1',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Bến Thành',
        postal_code: '700000',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userA.id,
        address_line: '456 Hai Bà Trưng, Quận 3',
        city: 'Hồ Chí Minh',
        district: 'Quận 3',
        ward: 'Phường 6',
        postal_code: '700000',
        is_default: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: userB.id,
        address_line: '789 Nguyễn Huệ, Quận 1',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Bến Nghé',
        postal_code: '700000',
        is_default: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('addresses', null, {});
  }
};
