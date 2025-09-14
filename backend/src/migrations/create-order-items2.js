// Migration file: add-color-size-to-orderitem.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('order_items', 'color', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn('order_items', 'size', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('order_items', 'color');
        await queryInterface.removeColumn('order_items', 'size');
    }
};

// Hoặc nếu bạn dùng raw SQL:
/*
ALTER TABLE OrderItems ADD COLUMN color VARCHAR(255) NULL;
ALTER TABLE OrderItems ADD COLUMN size VARCHAR(255) NULL;
*/