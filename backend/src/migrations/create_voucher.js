'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('vouchers', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            discount_type: {
                type: Sequelize.ENUM('percent', 'fixed'),
                allowNull: false,
                defaultValue: 'percent'
            },
            discount_value: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            max_discount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true
            },
            min_order_value: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            usage_limit: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0 // 0 = không giới hạn
            },
            used_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('active', 'expired', 'disabled'),
                allowNull: false,
                defaultValue: 'active'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('vouchers');
    }
};
