'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("reviews", "order_id", {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "orders",
                key: "id"
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE"
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("reviews", "order_id");
    }
};
