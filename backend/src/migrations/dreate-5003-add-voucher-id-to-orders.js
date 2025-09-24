'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột voucher_id
    await queryInterface.addColumn('orders', 'voucher_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Thêm constraint khóa ngoại
    await queryInterface.addConstraint('orders', {
      fields: ['voucher_id'],
      type: 'foreign key',
      name: 'fk_orders_voucher_id',
      references: {
        table: 'vouchers',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('orders', 'fk_orders_voucher_id');
    await queryInterface.removeColumn('orders', 'voucher_id');
  }
};
