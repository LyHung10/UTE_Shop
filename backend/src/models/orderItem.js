'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        static associate(models) {
            OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
            OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    OrderItem.init(
        {
            order_id: DataTypes.INTEGER,
            product_id: DataTypes.INTEGER,
            qty: DataTypes.INTEGER,
            price: DataTypes.DECIMAL(12, 2),
            color: DataTypes.STRING,
            size: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'OrderItem',
            tableName: 'order_items',
            underscored: true
        }
    );
    return OrderItem;
};
