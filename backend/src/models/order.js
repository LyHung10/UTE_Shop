'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        static associate(models) {
            Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
        }
    }
    Order.init(
        {
            user_id: DataTypes.INTEGER,
            status: DataTypes.STRING,
            total_amount: DataTypes.DECIMAL(12, 2)
        },
        {
            sequelize,
            modelName: 'Order',
            tableName: 'orders',
            underscored: true
        }
    );
    return Order;
};
