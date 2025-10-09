// migrations/YYYYMMDDHHMMSS-create-flash-sales.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('flash_sales', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('upcoming', 'active', 'ended', 'cancelled'),
                defaultValue: 'upcoming'
            },
            banner_image: {
                type: Sequelize.STRING,
                allowNull: true
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

        await queryInterface.addIndex('flash_sales', ['status']);
        await queryInterface.addIndex('flash_sales', ['start_time', 'end_time']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('flash_sales');
    }
};