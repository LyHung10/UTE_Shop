'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('payments', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            order_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'orders',   // tên bảng orders
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            method: {
                type: Sequelize.STRING, // 'COD', 'E_WALLET', 'CARD', ...
                allowNull: false
            },
            status: {
                type: Sequelize.STRING, // 'pending', 'paid', 'failed'
                allowNull: false,
                defaultValue: 'pending'
            },
            amount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false
            },
            meta: {
                type: Sequelize.JSON,
                allowNull: true
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
        await queryInterface.dropTable('payments');
    }
};
