'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventories', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      product_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      stock: { type: Sequelize.INTEGER, defaultValue: 0 },
      reserved: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('inventories');
  }
};
