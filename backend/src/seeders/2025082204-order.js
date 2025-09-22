'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('orders', [
            {
                user_id: 1, // phải tồn tại trong bảng users
                status: 'PENDING',
                total_amount: 250000.00,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 2, // phải tồn tại trong bảng users
                status: 'COMPLETED',
                total_amount: 750000.00,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 2,
                status: 'CANCELLED',
                total_amount: 120000.00,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.bulkDelete('orders', null, {});
    }
};
