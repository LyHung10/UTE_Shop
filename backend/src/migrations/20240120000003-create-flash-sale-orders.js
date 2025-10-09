// migrations/YYYYMMDDHHMMSS-create-flash-sale-orders.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('flash_sale_orders', {
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
            flash_sale_product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'flash_sale_products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            flash_price: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            total_amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
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

        await queryInterface.addIndex('flash_sale_orders', ['user_id', 'flash_sale_id', 'flash_sale_product_id']);
        await queryInterface.addIndex('flash_sale_orders', ['order_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('flash_sale_orders');
    }
};