'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('reviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'products', key: 'id' },
                onDelete: 'CASCADE'
            },
            user_name: { // nếu chưa login, ta lưu tên thôi
                type: Sequelize.STRING,
                allowNull: false
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            text: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },  
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('reviews');
    }
};
