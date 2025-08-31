'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      category_id: { type: Sequelize.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      short_description: Sequelize.STRING,
      description: Sequelize.TEXT,
      price: { type: Sequelize.DECIMAL(12,2), allowNull: false },
      original_price: Sequelize.DECIMAL(12,2),
      discount_percent: { type: Sequelize.INTEGER, defaultValue: 0 },
      view_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      sale_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
  }
};
