// migrations/YYYYMMDDHHMMSS-create-flash-sale-products.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('flash_sale_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flash_sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'flash_sales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      flash_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      original_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      stock_flash_sale: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sold_flash_sale: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      limit_per_user: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('flash_sale_products', ['flash_sale_id', 'product_id']);
    await queryInterface.addIndex('flash_sale_products', ['is_active']);
    await queryInterface.addIndex('flash_sale_products', ['sort_order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('flash_sale_products');
  }
};