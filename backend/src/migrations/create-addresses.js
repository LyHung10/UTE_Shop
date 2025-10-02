'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('addresses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            name_order: {
                type: Sequelize.STRING,
                allowNull: false
            },
            phone_order: {
                type: Sequelize.STRING,
                allowNull: false
            },
            address_line: {
                type: Sequelize.STRING,
                allowNull: false
            },

            city: Sequelize.STRING,
            district: Sequelize.STRING,
            ward: Sequelize.STRING,
            postal_code: Sequelize.STRING,
            is_default: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            lat: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            lon: {
                type: Sequelize.FLOAT,
                allowNull: true
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('addresses');
    }
};
