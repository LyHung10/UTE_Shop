'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Inventory extends Model {
        static associate(models) {
            Inventory.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    Inventory.init(
        {
            product_id: DataTypes.INTEGER,
            stock: DataTypes.INTEGER,
            reserved: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: 'Inventory',
            tableName: 'inventories',
            underscored: true
        }
    );
    return Inventory;
};
