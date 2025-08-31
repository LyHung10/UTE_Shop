'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('product_images', {
            id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
            product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
            url: { type: Sequelize.STRING, allowNull: false },
            alt: Sequelize.STRING,
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('product_images');
    }
};
