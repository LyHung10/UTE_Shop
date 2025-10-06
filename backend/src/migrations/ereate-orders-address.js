'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'address_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // cho phép null để không phá dữ liệu cũ
      references: {
        model: 'addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // hoặc 'CASCADE' nếu bạn muốn xóa đơn hàng khi xóa địa chỉ
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'address_id');
  }
};
